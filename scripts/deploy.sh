#!/bin/bash
# ローカルから EC2 へのデプロイスクリプト（rsync 版）
#
# 使い方: bash scripts/deploy.sh
# Git Bash / WSL / Mac どこからでも実行可能

set -euo pipefail

# ============================================================
# Git Bash（Windows）の場合は WSL で再実行
# rsync の Linux 互換性のため WSL に処理を委譲する
# ============================================================
if [[ "$(uname -s)" == MINGW* ]] || [[ "$(uname -s)" == MSYS* ]]; then
  SCRIPT_WSL="$(echo "$(cd "$(dirname "$0")" && pwd)/$(basename "$0")" | sed 's|^/\([a-zA-Z]\)/|/mnt/\1/|')"
  echo "Git Bash を検出 → WSL (Ubuntu) で実行します..."
  # MSYS_NO_PATHCONV=1 で Git Bash のパス自動変換を無効化して WSL に渡す
  MSYS_NO_PATHCONV=1 exec wsl -d Ubuntu bash "$SCRIPT_WSL"
fi

# ============================================================
# 設定（以下、WSL または Mac/Linux として実行される）
# ============================================================
EC2_IP="43.207.98.207"
EC2_USER="ec2-user"
REMOTE_DIR="/home/ec2-user/app/web"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOCAL_DIR="$(cd "$SCRIPT_DIR/.." && pwd)/web"

# ============================================================
# SSH 鍵の設定
# WSL 環境では Windows の鍵（EC2 に登録済み）を使う
# Windows の鍵は WSL から /mnt/c/Users/<user>/.ssh/ でアクセスできるが
# パーミッションが SSH の要件を満たさないため一時コピーを作成する
# ============================================================
SSH_KEY=""
TMPKEY=""

# WSL 内から Windows ユーザー名を取得
WIN_USER=$(cmd.exe /c "echo %USERNAME%" 2>/dev/null | tr -d '\r\n' || echo "")
WIN_KEY="/mnt/c/Users/$WIN_USER/.ssh/id_ed25519"

if [ -n "$WIN_USER" ] && [ -f "$WIN_KEY" ]; then
  TMPKEY=$(mktemp /tmp/deploy_key_XXXXXX)
  cp "$WIN_KEY" "$TMPKEY"
  chmod 600 "$TMPKEY"
  SSH_KEY="$TMPKEY"
  trap "rm -f $TMPKEY" EXIT
elif [ -f "$HOME/.ssh/id_ed25519" ]; then
  SSH_KEY="$HOME/.ssh/id_ed25519"
fi

if [ -z "$SSH_KEY" ]; then
  echo "エラー: SSH 鍵 id_ed25519 が見つかりません。"
  exit 1
fi

# ============================================================
# 事前チェック
# ============================================================
if ! command -v rsync &>/dev/null; then
  echo "エラー: rsync が見つかりません。"
  exit 1
fi

if [ ! -d "$LOCAL_DIR" ]; then
  echo "エラー: web ディレクトリが見つかりません: $LOCAL_DIR"
  exit 1
fi

echo "===== デプロイ開始: $(date) ====="
echo "転送先: $EC2_USER@$EC2_IP:$REMOTE_DIR"

# ============================================================
# Step 1: rsync でソースファイルを EC2 に転送
# node_modules / .next / .env / uploads は転送しない
# ============================================================
echo ""
echo "--- Step 1: ソースファイル転送（rsync）---"
rsync -avz --progress \
  --exclude 'node_modules/' \
  --exclude '.next/' \
  --exclude '.env' \
  --exclude 'public/uploads/' \
  -e "ssh -i $SSH_KEY -o StrictHostKeyChecking=no" \
  "$LOCAL_DIR/" \
  "$EC2_USER@$EC2_IP:$REMOTE_DIR/"

echo "転送完了"

# ============================================================
# Step 2: EC2 上でインストール・ビルド・PM2 再起動
# ============================================================
echo ""
echo "--- Step 2: EC2 上でビルド・再起動 ---"
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" << 'SSHEOF'
set -euo pipefail
cd /home/ec2-user/app/web

echo "pnpm install..."
pnpm install --frozen-lockfile

echo "Prisma クライアント生成..."
pnpm run db:generate

echo "Next.js ビルド..."
pnpm run build

echo "PM2 再起動..."
pm2 restart recipe-app --update-env
SSHEOF

echo ""
echo "===== デプロイ完了: $(date) ====="
echo "アプリURL: http://$EC2_IP"
