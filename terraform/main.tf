# terraform/main.tf — Infrastructure as Code foundation
provider "aws" {
  region = var.aws_region
}

# 1. VPC for the Gemini Clone
resource "aws_vpc" "gemini_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "gemini-pro-vpc"
  }
}

# 2. Public Subnet
resource "aws_subnet" "public_subnet" {
  vpc_id                  = aws_vpc.gemini_vpc.id
  cidr_block              = "10.0.1.0/24"
  map_public_ip_on_launch = true
  availability_zone       = "${var.aws_region}a"

  tags = {
    Name = "gemini-public-subnet"
  }
}

# 3. Security Group for Node.js App
resource "aws_security_group" "app_sg" {
  name        = "gemini-app-sg"
  description = "Allow inbound traffic for Gemini Clone"
  vpc_id      = aws_vpc.gemini_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5000
    to_port     = 5000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 4. EC2 Instance (Minimal for demo)
resource "aws_instance" "gemini_server" {
  ami           = "ami-0c55b159cbfafe1f0" # Ubuntu 22.04 LTS (Region specific)
  instance_type = "t3.small"
  subnet_id     = aws_subnet.public_subnet.id
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = <<-EOF
              #!/bin/bash
              curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
              sudo apt-get install -y nodejs git docker.io docker-compose
              git clone https://github.com/yourusername/gemini-clone.git
              cd gemini-clone
              docker-compose up -d
              EOF

  tags = {
    Name = "Gemini-Pro-Server"
  }
}
