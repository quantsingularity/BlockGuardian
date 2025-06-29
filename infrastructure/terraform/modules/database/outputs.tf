output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.main.id
}

output "db_instance_arn" {
  description = "RDS instance ARN"
  value       = aws_db_instance.main.arn
}

output "db_instance_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "db_instance_hosted_zone_id" {
  description = "RDS instance hosted zone ID"
  value       = aws_db_instance.main.hosted_zone_id
}

output "db_instance_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "db_instance_name" {
  description = "RDS instance database name"
  value       = aws_db_instance.main.db_name
}

output "db_instance_username" {
  description = "RDS instance master username"
  value       = aws_db_instance.main.username
  sensitive   = true
}

output "db_instance_engine" {
  description = "RDS instance engine"
  value       = aws_db_instance.main.engine
}

output "db_instance_engine_version" {
  description = "RDS instance engine version"
  value       = aws_db_instance.main.engine_version
}

output "db_instance_class" {
  description = "RDS instance class"
  value       = aws_db_instance.main.instance_class
}

output "db_instance_status" {
  description = "RDS instance status"
  value       = aws_db_instance.main.status
}

output "db_instance_availability_zone" {
  description = "RDS instance availability zone"
  value       = aws_db_instance.main.availability_zone
}

output "db_instance_multi_az" {
  description = "RDS instance Multi-AZ status"
  value       = aws_db_instance.main.multi_az
}

output "db_instance_backup_retention_period" {
  description = "RDS instance backup retention period"
  value       = aws_db_instance.main.backup_retention_period
}

output "db_instance_backup_window" {
  description = "RDS instance backup window"
  value       = aws_db_instance.main.backup_window
}

output "db_instance_maintenance_window" {
  description = "RDS instance maintenance window"
  value       = aws_db_instance.main.maintenance_window
}

output "db_parameter_group_name" {
  description = "Database parameter group name"
  value       = aws_db_parameter_group.main.name
}

output "db_parameter_group_arn" {
  description = "Database parameter group ARN"
  value       = aws_db_parameter_group.main.arn
}

output "db_option_group_name" {
  description = "Database option group name"
  value       = var.engine == "mysql" ? aws_db_option_group.main[0].name : null
}

output "db_option_group_arn" {
  description = "Database option group ARN"
  value       = var.engine == "mysql" ? aws_db_option_group.main[0].arn : null
}

output "kms_key_id" {
  description = "KMS key ID used for encryption"
  value       = var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].id
}

output "kms_key_arn" {
  description = "KMS key ARN used for encryption"
  value       = var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn
}

output "kms_alias_name" {
  description = "KMS key alias name"
  value       = var.kms_key_id == null ? aws_kms_alias.db_encryption[0].name : null
}

output "secrets_manager_secret_arn" {
  description = "Secrets Manager secret ARN for database credentials"
  value       = aws_secretsmanager_secret.db_credentials.arn
}

output "secrets_manager_secret_name" {
  description = "Secrets Manager secret name for database credentials"
  value       = aws_secretsmanager_secret.db_credentials.name
}

output "read_replica_id" {
  description = "Read replica instance ID"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].id : null
}

output "read_replica_endpoint" {
  description = "Read replica endpoint"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].endpoint : null
}

output "read_replica_arn" {
  description = "Read replica ARN"
  value       = var.create_read_replica ? aws_db_instance.read_replica[0].arn : null
}

output "initial_snapshot_id" {
  description = "Initial database snapshot ID"
  value       = var.create_initial_snapshot ? aws_db_snapshot.initial_snapshot[0].id : null
}

output "initial_snapshot_arn" {
  description = "Initial database snapshot ARN"
  value       = var.create_initial_snapshot ? aws_db_snapshot.initial_snapshot[0].db_snapshot_arn : null
}

output "monitoring_role_arn" {
  description = "Enhanced monitoring IAM role ARN"
  value       = var.monitoring_interval > 0 ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names"
  value       = { for log_type in var.enabled_cloudwatch_logs_exports : log_type => aws_cloudwatch_log_group.db_logs[log_type].name }
}

output "cloudwatch_alarms" {
  description = "CloudWatch alarm names"
  value = {
    cpu_alarm         = aws_cloudwatch_metric_alarm.database_cpu.alarm_name
    connections_alarm = aws_cloudwatch_metric_alarm.database_connections.alarm_name
    memory_alarm      = aws_cloudwatch_metric_alarm.database_freeable_memory.alarm_name
  }
}

output "db_connection_string" {
  description = "Database connection string (without password)"
  value       = "${var.engine}://${var.db_username}@${aws_db_instance.main.endpoint}:${aws_db_instance.main.port}/${var.db_name}"
  sensitive   = true
}

output "performance_insights_enabled" {
  description = "Performance Insights status"
  value       = aws_db_instance.main.performance_insights_enabled
}

output "storage_encrypted" {
  description = "Storage encryption status"
  value       = aws_db_instance.main.storage_encrypted
}

output "ca_cert_identifier" {
  description = "CA certificate identifier"
  value       = aws_db_instance.main.ca_cert_identifier
}

output "compliance_tags" {
  description = "Compliance tags applied to resources"
  value       = var.compliance_tags
}

