output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of the public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "IDs of the private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "IDs of the database subnets"
  value       = aws_subnet.database[*].id
}

output "management_subnet_ids" {
  description = "IDs of the management subnets"
  value       = var.enable_management_subnet ? aws_subnet.management[*].id : []
}

output "db_subnet_group_name" {
  description = "Name of the database subnet group"
  value       = aws_db_subnet_group.main.name
}

output "db_subnet_group_id" {
  description = "ID of the database subnet group"
  value       = aws_db_subnet_group.main.id
}

output "internet_gateway_id" {
  description = "ID of the Internet Gateway"
  value       = aws_internet_gateway.main.id
}

output "nat_gateway_ids" {
  description = "IDs of the NAT Gateways"
  value       = aws_nat_gateway.main[*].id
}

output "nat_gateway_public_ips" {
  description = "Public IPs of the NAT Gateways"
  value       = aws_eip.nat[*].public_ip
}

output "public_route_table_id" {
  description = "ID of the public route table"
  value       = aws_route_table.public.id
}

output "private_route_table_ids" {
  description = "IDs of the private route tables"
  value       = aws_route_table.private[*].id
}

output "database_route_table_ids" {
  description = "IDs of the database route tables"
  value       = aws_route_table.database[*].id
}

output "management_route_table_ids" {
  description = "IDs of the management route tables"
  value       = var.enable_management_subnet ? aws_route_table.management[*].id : []
}

output "public_network_acl_id" {
  description = "ID of the public network ACL"
  value       = var.enable_network_acls ? aws_network_acl.public.id : null
}

output "database_network_acl_id" {
  description = "ID of the database network ACL"
  value       = var.enable_network_acls ? aws_network_acl.database.id : null
}

output "vpc_endpoints" {
  description = "VPC Endpoint information"
  value = var.enable_vpc_endpoints ? {
    s3_endpoint_id            = aws_vpc_endpoint.s3[0].id
    dynamodb_endpoint_id      = aws_vpc_endpoint.dynamodb[0].id
    ec2_endpoint_id           = aws_vpc_endpoint.ec2[0].id
    secretsmanager_endpoint_id = aws_vpc_endpoint.secretsmanager[0].id
  } : {}
}

output "vpc_endpoints_security_group_id" {
  description = "Security group ID for VPC endpoints"
  value       = var.enable_vpc_endpoints ? aws_security_group.vpc_endpoints[0].id : null
}

output "availability_zones" {
  description = "List of availability zones used"
  value       = var.availability_zones
}

output "public_subnet_cidrs" {
  description = "CIDR blocks of public subnets"
  value       = var.public_subnet_cidrs
}

output "private_subnet_cidrs" {
  description = "CIDR blocks of private subnets"
  value       = var.private_subnet_cidrs
}

output "database_subnet_cidrs" {
  description = "CIDR blocks of database subnets"
  value       = var.database_subnet_cidrs
}

output "management_subnet_cidrs" {
  description = "CIDR blocks of management subnets"
  value       = var.management_subnet_cidrs
}

output "dhcp_options_id" {
  description = "ID of the DHCP options set"
  value       = aws_vpc_dhcp_options.main.id
}
