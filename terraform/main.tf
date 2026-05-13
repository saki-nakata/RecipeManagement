# ============================================================
# VPC（仮想ネットワーク）
# ============================================================
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true # RDS エンドポイントの名前解決に必要（後で使用）
  enable_dns_support   = true

  tags = { Name = "${var.project_name}-vpc" }
}

# ============================================================
# インターネットゲートウェイ（VPC をインターネットに接続）
# ============================================================
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.project_name}-igw" }
}

# ============================================================
# サブネット
# ============================================================

# パブリックサブネット（EC2 を配置。外部からアクセス可能）
resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true # EC2 にパブリック IP を自動付与

  tags = { Name = "${var.project_name}-public-subnet" }
}

# プライベートサブネット x2（RDS 用に事前作成。RDS は 2 AZ 必須）
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "${var.aws_region}a"

  tags = { Name = "${var.project_name}-private-subnet-a" }
}

resource "aws_subnet" "private_c" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "${var.aws_region}c"

  tags = { Name = "${var.project_name}-private-subnet-c" }
}

# ============================================================
# ルートテーブル（パブリックサブネットのトラフィックを IGW へ向ける）
# ============================================================
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.project_name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ============================================================
# セキュリティグループ（EC2 用：SSH と HTTP を外部に公開）
# ============================================================
resource "aws_security_group" "ec2_sg" {
  name        = "${var.project_name}-ec2-sg"
  description = "Security group for EC2 instance"
  vpc_id      = aws_vpc.main.id

  # SSH アクセス（EC2 に接続して作業するため）
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP アクセス（nginx 経由でアプリを公開）
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # アウトバウンド全許可（パッケージ取得・RDS 接続・外部 API 等）
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-ec2-sg" }
}

# ============================================================
# SSH キーペア（EC2 へのログインに使用）
# ============================================================
resource "aws_key_pair" "ec2_key" {
  key_name   = "${var.project_name}-key"
  public_key = file(var.ssh_public_key_path)
}

# ============================================================
# Amazon Linux 2023 の最新 AMI を動的に取得
# Amazon Linux 2 は 2025 年 6 月サポート終了 / Node.js 20 非対応のため 2023 を使用
# ============================================================
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }
}

# ============================================================
# EC2 インスタンス（t2.micro：無料枠）
# ============================================================
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.public.id
  key_name      = aws_key_pair.ec2_key.key_name

  vpc_security_group_ids = [aws_security_group.ec2_sg.id]

  # 起動時に自動実行されるセットアップスクリプト
  user_data = templatefile("${path.module}/user_data.sh.tpl", {
    github_repo = var.github_repo_url
  })

  # ルートボリューム 20GB（Next.js ビルド成果物分を確保）
  root_block_device {
    volume_size = 20
    volume_type = "gp2"
  }

  tags = { Name = "${var.project_name}-web" }
}

# ============================================================
# EC2 自動回復（CloudWatch アラーム）
# ハードウェア障害を検知して自動復旧。永続無料（10 アラームまで）
# ============================================================
resource "aws_cloudwatch_metric_alarm" "ec2_auto_recover" {
  alarm_name          = "${var.project_name}-ec2-auto-recover"
  namespace           = "AWS/EC2"
  metric_name         = "StatusCheckFailed_System" # ハードウェア障害を検知
  comparison_operator = "GreaterThanThreshold"
  threshold           = "0"
  period              = "60" # 1 分ごとにチェック
  evaluation_periods  = "2"  # 2 回連続で失敗したら発火
  statistic           = "Maximum"
  alarm_actions       = ["arn:aws:automate:${var.aws_region}:ec2:recover"]

  dimensions = {
    InstanceId = aws_instance.web.id
  }
}

# ============================================================
# DB パスワード自動生成（terraform.tfstate に保存される）
# ============================================================
resource "random_password" "db" {
  length           = 20
  special          = true
  override_special = "!#$%&*()-_=+[]{}?" # MySQL で問題になる @ / ' を除外
}

# ============================================================
# RDS セキュリティグループ（EC2 からの 3306 のみ許可）
# ============================================================
resource "aws_security_group" "rds_sg" {
  name        = "${var.project_name}-rds-sg"
  description = "Security group for RDS MySQL"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from EC2"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id] # EC2 SG からのみ許可
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.project_name}-rds-sg" }
}

# ============================================================
# RDS サブネットグループ（2 AZ のプライベートサブネットを使用）
# RDS は可用性のため複数 AZ への配置が必要
# ============================================================
resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-db-subnet-group"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_c.id]

  tags = { Name = "${var.project_name}-db-subnet-group" }
}

# ============================================================
# RDS MySQL インスタンス（db.t3.micro：無料枠）
# ============================================================
resource "aws_db_instance" "mysql" {
  identifier        = "${var.project_name}-mysql"
  engine            = "mysql"
  engine_version    = "8.0"
  instance_class    = "db.t3.micro"
  allocated_storage = 20 # 無料枠 20GB

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  publicly_accessible     = false         # EC2 経由のみアクセス可能
  multi_az                = false         # 無料枠（単一 AZ）
  skip_final_snapshot     = true          # terraform destroy 時にスナップショット不要
  backup_retention_period = 7             # 自動バックアップ 7 日間保持（無料枠内）
  backup_window           = "18:00-19:00" # JST 03:00〜04:00（深夜）

  tags = { Name = "${var.project_name}-mysql" }
}
