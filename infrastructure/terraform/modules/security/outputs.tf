output "app_security_group_id" {
  description = "ID of the application security group"
  value       = aws_security_group.app.id
}

output "db_security_group_id" {
  description = "ID of the database security group"
  value       = aws_security_group.db.id
}

output "alb_security_group_id" {
  description = "ID of the Application Load Balancer security group"
  value       = aws_security_group.alb.id
}

output "management_security_group_id" {
  description = "ID of the management security group"
  value       = aws_security_group.management.id
}

output "kms_key_id" {
  description = "ID of the KMS key for encryption"
  value       = aws_kms_key.main.id
}

output "kms_key_arn" {
  description = "ARN of the KMS key for encryption"
  value       = aws_kms_key.main.arn
}

output "kms_alias_name" {
  description = "Name of the KMS key alias"
  value       = aws_kms_alias.main.name
}

output "ec2_instance_profile_name" {
  description = "Name of the EC2 instance profile"
  value       = aws_iam_instance_profile.ec2_profile.name
}

output "ec2_role_arn" {
  description = "ARN of the EC2 IAM role"
  value       = aws_iam_role.ec2_role.arn
}

output "secrets_manager_secret_arn" {
  description = "ARN of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.arn
}

output "secrets_manager_secret_name" {
  description = "Name of the Secrets Manager secret"
  value       = aws_secretsmanager_secret.app_secrets.name
}

output "waf_web_acl_arn" {
  description = "ARN of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].arn : null
}

output "waf_web_acl_id" {
  description = "ID of the WAF Web ACL"
  value       = var.enable_waf ? aws_wafv2_web_acl.main[0].id : null
}

output "security_log_group_name" {
  description = "Name of the security CloudWatch log group"
  value       = aws_cloudwatch_log_group.security_logs.name
}

output "vpc_flow_log_group_name" {
  description = "Name of the VPC flow logs CloudWatch log group"
  value       = var.enable_vpc_flow_logs ? aws_cloudwatch_log_group.vpc_flow_logs[0].name : null
}

output "private_network_acl_id" {
  description = "ID of the private network ACL"
  value       = aws_network_acl.private.id
}

output "compliance_tags" {
  description = "Standard compliance tags applied to resources"
  value       = var.compliance_tags
}
