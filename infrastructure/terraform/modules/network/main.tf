# Network Module for Financial Standards Compliance
# This module implements secure networking with VPC Flow Logs, NACLs, and enhanced monitoring

resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-vpc"
    Environment = var.environment
    Purpose     = "Main VPC for financial application"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Public subnets for load balancers and NAT gateways
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false # Disable auto-assign public IP for security

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-public-subnet-${count.index + 1}"
    Environment = var.environment
    Tier        = "Public"
    AZ          = var.availability_zones[count.index]
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Private subnets for application and database tiers
resource "aws_subnet" "private" {
  count             = length(var.private_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.private_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-private-subnet-${count.index + 1}"
    Environment = var.environment
    Tier        = "Private"
    AZ          = var.availability_zones[count.index]
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Database subnets (isolated from application subnets)
resource "aws_subnet" "database" {
  count             = length(var.database_subnet_cidrs)
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.database_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-database-subnet-${count.index + 1}"
    Environment = var.environment
    Tier        = "Database"
    AZ          = var.availability_zones[count.index]
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Management subnet for bastion/jump hosts
resource "aws_subnet" "management" {
  count             = var.enable_management_subnet ? length(var.management_subnet_cidrs) : 0
  vpc_id            = aws_vpc.main.id
  cidr_block        = var.management_subnet_cidrs[count.index]
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-management-subnet-${count.index + 1}"
    Environment = var.environment
    Tier        = "Management"
    AZ          = var.availability_zones[count.index]
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-igw"
    Environment = var.environment
    Purpose     = "Internet Gateway"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Elastic IPs for NAT Gateways
resource "aws_eip" "nat" {
  count  = length(var.public_subnet_cidrs)
  domain = "vpc"

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-nat-eip-${count.index + 1}"
    Environment = var.environment
    Purpose     = "NAT Gateway EIP"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })

  depends_on = [aws_internet_gateway.main]
}

# NAT Gateways for outbound internet access from private subnets
resource "aws_nat_gateway" "main" {
  count         = length(var.public_subnet_cidrs)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-nat-gateway-${count.index + 1}"
    Environment = var.environment
    Purpose     = "NAT Gateway"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })

  depends_on = [aws_internet_gateway.main]
}

# Route table for public subnets
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-public-route-table"
    Environment = var.environment
    Purpose     = "Public subnet routing"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Route tables for private subnets
resource "aws_route_table" "private" {
  count  = length(var.private_subnet_cidrs)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-private-route-table-${count.index + 1}"
    Environment = var.environment
    Purpose     = "Private subnet routing"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Route tables for database subnets (no internet access)
resource "aws_route_table" "database" {
  count  = length(var.database_subnet_cidrs)
  vpc_id = aws_vpc.main.id

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-database-route-table-${count.index + 1}"
    Environment = var.environment
    Purpose     = "Database subnet routing (isolated)"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Route table for management subnets
resource "aws_route_table" "management" {
  count  = var.enable_management_subnet ? length(var.management_subnet_cidrs) : 0
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-management-route-table-${count.index + 1}"
    Environment = var.environment
    Purpose     = "Management subnet routing"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Route table associations
resource "aws_route_table_association" "public" {
  count          = length(var.public_subnet_cidrs)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "private" {
  count          = length(var.private_subnet_cidrs)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

resource "aws_route_table_association" "database" {
  count          = length(var.database_subnet_cidrs)
  subnet_id      = aws_subnet.database[count.index].id
  route_table_id = aws_route_table.database[count.index].id
}

resource "aws_route_table_association" "management" {
  count          = var.enable_management_subnet ? length(var.management_subnet_cidrs) : 0
  subnet_id      = aws_subnet.management[count.index].id
  route_table_id = aws_route_table.management[count.index].id
}

# Network ACL for public subnets
resource "aws_network_acl" "public" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.public[*].id

  # Allow inbound HTTPS
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    from_port  = 443
    to_port    = 443
    cidr_block = "0.0.0.0/0"
  }

  # Allow inbound HTTP (for redirect to HTTPS)
  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    from_port  = 80
    to_port    = 80
    cidr_block = "0.0.0.0/0"
  }

  # Allow ephemeral ports for return traffic
  ingress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    from_port  = 1024
    to_port    = 65535
    cidr_block = "0.0.0.0/0"
  }

  # Allow outbound traffic to private subnets
  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    from_port  = 0
    to_port    = 0
    cidr_block = var.vpc_cidr
  }

  # Allow outbound HTTPS
  egress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    from_port  = 443
    to_port    = 443
    cidr_block = "0.0.0.0/0"
  }

  # Allow outbound HTTP
  egress {
    rule_no    = 120
    protocol   = "tcp"
    action     = "allow"
    from_port  = 80
    to_port    = 80
    cidr_block = "0.0.0.0/0"
  }

  # Allow ephemeral ports outbound
  egress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    from_port  = 1024
    to_port    = 65535
    cidr_block = "0.0.0.0/0"
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-public-nacl"
    Environment = var.environment
    Purpose     = "Public subnet network ACL"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Network ACL for database subnets (most restrictive)
resource "aws_network_acl" "database" {
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.database[*].id

  # Allow inbound database traffic from private subnets only
  ingress {
    rule_no    = 100
    protocol   = "tcp"
    action     = "allow"
    from_port  = 3306
    to_port    = 3306
    cidr_block = var.vpc_cidr
  }

  ingress {
    rule_no    = 110
    protocol   = "tcp"
    action     = "allow"
    from_port  = 5432
    to_port    = 5432
    cidr_block = var.vpc_cidr
  }

  # Allow ephemeral ports for return traffic
  ingress {
    rule_no    = 200
    protocol   = "tcp"
    action     = "allow"
    from_port  = 1024
    to_port    = 65535
    cidr_block = var.vpc_cidr
  }

  # Allow outbound traffic within VPC only
  egress {
    rule_no    = 100
    protocol   = "-1"
    action     = "allow"
    from_port  = 0
    to_port    = 0
    cidr_block = var.vpc_cidr
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-database-nacl"
    Environment = var.environment
    Purpose     = "Database subnet network ACL"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# DB Subnet Group for RDS
resource "aws_db_subnet_group" "main" {
  name       = "${var.environment}-db-subnet-group"
  subnet_ids = aws_subnet.database[*].id

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-db-subnet-group"
    Environment = var.environment
    Purpose     = "Database subnet group"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# VPC Endpoints for AWS services (to avoid internet routing)
resource "aws_vpc_endpoint" "s3" {
  count           = var.enable_vpc_endpoints ? 1 : 0
  vpc_id          = aws_vpc.main.id
  service_name    = "com.amazonaws.${data.aws_region.current.name}.s3"
  route_table_ids = concat(aws_route_table.private[*].id, aws_route_table.database[*].id)

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-s3-endpoint"
    Environment = var.environment
    Purpose     = "S3 VPC Endpoint"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_vpc_endpoint" "dynamodb" {
  count           = var.enable_vpc_endpoints ? 1 : 0
  vpc_id          = aws_vpc.main.id
  service_name    = "com.amazonaws.${data.aws_region.current.name}.dynamodb"
  route_table_ids = concat(aws_route_table.private[*].id, aws_route_table.database[*].id)

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-dynamodb-endpoint"
    Environment = var.environment
    Purpose     = "DynamoDB VPC Endpoint"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Interface endpoints for other AWS services
resource "aws_vpc_endpoint" "ec2" {
  count               = var.enable_vpc_endpoints ? 1 : 0
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.ec2"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints[0].id]
  private_dns_enabled = true

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-ec2-endpoint"
    Environment = var.environment
    Purpose     = "EC2 VPC Endpoint"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_vpc_endpoint" "secretsmanager" {
  count               = var.enable_vpc_endpoints ? 1 : 0
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${data.aws_region.current.name}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  subnet_ids          = aws_subnet.private[*].id
  security_group_ids  = [aws_security_group.vpc_endpoints[0].id]
  private_dns_enabled = true

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-secretsmanager-endpoint"
    Environment = var.environment
    Purpose     = "Secrets Manager VPC Endpoint"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Security group for VPC endpoints
resource "aws_security_group" "vpc_endpoints" {
  count       = var.enable_vpc_endpoints ? 1 : 0
  name        = "${var.environment}-vpc-endpoints-sg"
  description = "Security group for VPC endpoints"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
    description = "HTTPS from VPC"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound traffic"
  }

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-vpc-endpoints-sg"
    Environment = var.environment
    Purpose     = "VPC Endpoints security group"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Data source for current AWS region
data "aws_region" "current" {}

# DHCP Options Set for enhanced DNS security
resource "aws_vpc_dhcp_options" "main" {
  domain_name_servers = ["AmazonProvidedDNS"]
  domain_name         = data.aws_region.current.name == "us-east-1" ? "ec2.internal" : "${data.aws_region.current.name}.compute.internal"

  tags = merge(var.default_tags, {
    Name        = "${var.environment}-dhcp-options"
    Environment = var.environment
    Purpose     = "VPC DHCP options"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_vpc_dhcp_options_association" "main" {
  vpc_id          = aws_vpc.main.id
  dhcp_options_id = aws_vpc_dhcp_options.main.id
}
