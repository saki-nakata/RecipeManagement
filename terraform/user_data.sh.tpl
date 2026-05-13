#!/bin/bash
# EC2 初回起動時に root 権限で自動実行されるセットアップスクリプト
# Terraform の templatefile() により ${github_repo} が実際の URL に置換される
#
# 実行ログの確認方法:
#   ssh ec2-user@<EC2_IP> "sudo tail -f /var/log/user-data.log"

set -euxo pipefail
exec > >(tee /var/log/user-data.log | logger -t user-data -s 2>/dev/console) 2>&1

echo "===== セットアップ開始: $(date) ====="

# ============================================================
# スワップ領域 1GB 作成（t2.micro は RAM 1GB のため Next.js ビルドで不足する場合がある）
# ============================================================
dd if=/dev/zero of=/swapfile bs=128M count=8
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile swap swap defaults 0 0' >> /etc/fstab
echo "スワップ作成完了"

# ============================================================
# システム更新（Amazon Linux 2023 は dnf を使用）
# ============================================================
dnf update -y

# ============================================================
# Node.js 20 インストール（NodeSource リポジトリ経由）
# Amazon Linux 2023 は glibc 2.34 のため Node.js 20 に対応
# ============================================================
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs git

echo "Node.js バージョン: $(node --version)"
echo "npm バージョン: $(npm --version)"

# ============================================================
# pnpm・PM2 グローバルインストール
# pnpm: このプロジェクトのパッケージマネージャー
# PM2: Node.js プロセスを管理し、クラッシュ時に自動再起動する
# ============================================================
npm install -g pnpm pm2
echo "pnpm バージョン: $(pnpm --version)"
echo "PM2 バージョン: $(pm2 --version)"

# ============================================================
# nginx インストール（Amazon Linux 2023 は dnf で直接インストール可能）
# ============================================================
dnf install -y nginx
systemctl enable nginx
echo "nginx インストール完了"

# ============================================================
# リポジトリのクローン
# ${github_repo} は Terraform が実際の GitHub URL に置換する
# ============================================================
APP_DIR="/home/ec2-user/app"
git clone ${github_repo} $APP_DIR
chown -R ec2-user:ec2-user $APP_DIR
echo "git clone 完了: $APP_DIR"

# ============================================================
# .env ファイル作成
# DATABASE_URL は現時点でプレースホルダー
# RDS 構築後に SSH で接続して実際の値に書き換える
# ============================================================
cat > $APP_DIR/web/.env << 'ENVEOF'
NODE_ENV=production
DATABASE_URL=mysql://placeholder:placeholder@localhost:3306/recipe_db
ENVEOF
chown ec2-user:ec2-user $APP_DIR/web/.env
echo ".env ファイル作成完了（DB は後で設定）"

# ============================================================
# アプリケーションのインストール・ビルド・起動（ec2-user として実行）
# ============================================================
sudo -u ec2-user bash << 'APPEOF'
set -euxo pipefail
export PATH=$PATH:/usr/local/bin
cd /home/ec2-user/app/web

echo "--- pnpm install 開始 ---"
pnpm install --frozen-lockfile

echo "--- Prisma クライアント生成（DB 接続不要）---"
pnpm run db:generate

echo "--- Next.js ビルド開始（数分かかります）---"
pnpm run build

echo "--- PM2 でアプリ起動 ---"
pm2 start "pnpm run start" --name "recipe-app" --cwd /home/ec2-user/app/web
pm2 save

echo "--- アプリ起動完了 ---"
APPEOF

# ============================================================
# PM2 自動起動設定（EC2 再起動後もアプリを自動で復旧）
# ============================================================
env PATH=$PATH:/usr/bin /usr/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user
systemctl enable pm2-ec2-user
echo "PM2 自動起動設定完了"

# ============================================================
# nginx 設定
# デフォルト設定を上書きして port 80 → localhost:3000 にプロキシ
# ============================================================
cat > /etc/nginx/nginx.conf << 'MAINEOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log;
pid /run/nginx.pid;
include /usr/share/nginx/modules/*.conf;

events {
    worker_connections 1024;
}

http {
    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;
    sendfile        on;
    tcp_nopush      on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    include         /etc/nginx/mime.types;
    default_type    application/octet-stream;

    include /etc/nginx/conf.d/*.conf;
}
MAINEOF

# /home/ec2-user/ に nginx ユーザーの通過権限を付与（uploads 配信に必要）
chmod o+x /home/ec2-user

# リバースプロキシ設定（port 80 → Next.js 3000）
# /uploads/ は nginx が直接配信（Next.js 本番モードは public/ の動的ファイルを配信しないため）
cat > /etc/nginx/conf.d/recipe.conf << 'NGINXEOF'
server {
    listen 80 default_server;
    server_name _;

    client_max_body_size 10M;

    location /uploads/ {
        alias /home/ec2-user/app/web/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    location / {
        proxy_pass         http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

nginx -t
systemctl start nginx
echo "nginx 起動完了"

echo "===== セットアップ完了: $(date) ====="
echo "次のステップ: RDS を構築して .env の DATABASE_URL を更新してください"
