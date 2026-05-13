# EC2 のパブリック IP アドレス
output "ec2_public_ip" {
  description = "EC2 インスタンスのパブリック IP アドレス"
  value       = aws_instance.web.public_ip
}

# ブラウザでアクセスする URL
output "app_url" {
  description = "アプリケーション URL（RDS 接続後に動作確認）"
  value       = "http://${aws_instance.web.public_ip}"
}

# SSH 接続コマンド（コピーしてそのまま使える）
output "ssh_command" {
  description = "EC2 への SSH 接続コマンド"
  value       = "ssh -i ~/.ssh/id_ed25519 ec2-user@${aws_instance.web.public_ip}"
}

# RDS エンドポイント（EC2 の .env に設定する）
output "rds_endpoint" {
  description = "RDS MySQL エンドポイント（ホスト名）"
  value       = aws_db_instance.mysql.address
}

# DB パスワード（terraform output -raw db_password で表示）
output "db_password" {
  description = "RDS MySQL パスワード（自動生成）"
  value       = random_password.db.result
  sensitive   = true
}

# DATABASE_URL（EC2 の .env にそのまま貼り付けられる）
output "database_url" {
  description = "EC2 の .env に設定する DATABASE_URL"
  value       = "mysql://${var.db_username}:${random_password.db.result}@${aws_db_instance.mysql.address}:3306/${var.db_name}"
  sensitive   = true
}
