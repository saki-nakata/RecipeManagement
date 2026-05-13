variable "aws_region" {
  description = "デプロイ先 AWS リージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "プロジェクト識別名（リソース名のプレフィックスに使われる）"
  type        = string
  default     = "recipe-management"
}

variable "github_repo_url" {
  description = "GitHub パブリックリポジトリの HTTPS URL（例: https://github.com/your-name/RecipeManagement.git）"
  type        = string
}

variable "ssh_public_key_path" {
  description = "EC2 に登録する SSH 公開鍵ファイルのパス"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "db_username" {
  description = "RDS MySQL ユーザー名"
  type        = string
  default     = "recipe_user"
}

variable "db_name" {
  description = "RDS MySQL データベース名"
  type        = string
  default     = "recipe_db"
}
