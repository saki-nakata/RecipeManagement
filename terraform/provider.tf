terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

# AWS プロバイダー設定
# 認証情報は aws configure で設定済みの ~/.aws/credentials を使用
provider "aws" {
  region = var.aws_region
}
