# プロジェクト品質チェックガイドライン

## アプリケーション（web/）

```bash
cd web
pnpm typecheck   # TypeScript 型チェック
pnpm lint        # ESLint
pnpm build       # ビルドエラー確認
```

## Terraform（terraform/）

### フォーマットチェック
```bash
cd terraform
terraform fmt -check -recursive
```
差分がある場合は `terraform fmt -recursive` で自動修正する。

### 構文・設定バリデーション
```bash
terraform validate
```
`Success! The configuration is valid.` が出ることを確認する。

### セキュリティチェック観点（手動確認）

| 項目 | 確認内容 |
|------|---------|
| セキュリティグループ | インバウンドルールが必要最小限か（0.0.0.0/0 の開放範囲） |
| RDS アクセス | `publicly_accessible = false` になっているか |
| 機密情報 | `terraform.tfvars` と `terraform.tfstate` が `.gitignore` に含まれているか |
| パスワード | ハードコードされた平文パスワードがないか（`random_password` を使用しているか） |
| SSH | キーペアが公開鍵認証のみか |

### 差分確認
```bash
terraform plan
```
意図しないリソースの変更・削除がないかを確認する。

## デプロイスクリプト（scripts/）

```bash
bash scripts/deploy.sh --dry-run  # ※ dry-run オプションは未実装のため手動確認
```

確認観点：
- `--exclude` で `.env` と `public/uploads/` が除外されているか
- EC2 上の `.env`（DATABASE_URL）を上書きしていないか
