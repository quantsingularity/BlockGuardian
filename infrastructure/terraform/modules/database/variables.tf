variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "db_name" {
  description = "Database name"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "db_instance_class" {
  description = "Database instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "engine" {
  description = "Database engine"
  type        = string
  default     = "mysql"
  validation {
    condition     = contains(["mysql", "postgres"], var.engine)
    error_message = "Engine must be either 'mysql' or 'postgres'."
  }
}

variable "engine_version" {
  description = "Database engine version"
  type        = string
  default     = "8.0"
}

variable "major_engine_version" {
  description = "Major engine version for option group"
  type        = string
  default     = "8.0"
}

variable "db_family" {
  description = "Database parameter group family"
  type        = string
  default     = "mysql8.0"
}

variable "allocated_storage" {
  description = "Initial allocated storage in GB"
  type        = number
  default     = 20
}

variable "max_allocated_storage" {
  description = "Maximum allocated storage for autoscaling"
  type        = number
  default     = 100
}

variable "storage_type" {
  description = "Storage type"
  type        = string
  default     = "gp3"
}

variable "storage_encrypted" {
  description = "Enable storage encryption"
  type        = bool
  default     = true
}

variable "kms_key_id" {
  description = "KMS key ID for encryption (if null, a new key will be created)"
  type        = string
  default     = null
}

variable "db_subnet_group_name" {
  description = "Database subnet group name"
  type        = string
}

variable "security_group_ids" {
  description = "List of security group IDs"
  type        = list(string)
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 3306
}

variable "backup_retention_period" {
  description = "Backup retention period in days"
  type        = number
  default     = 7
}

variable "backup_window" {
  description = "Backup window"
  type        = string
  default     = "03:00-04:00"
}

variable "maintenance_window" {
  description = "Maintenance window"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

variable "multi_az" {
  description = "Enable Multi-AZ deployment"
  type        = bool
  default     = true
}

variable "availability_zone" {
  description = "Availability zone (only used if multi_az is false)"
  type        = string
  default     = null
}

variable "publicly_accessible" {
  description = "Make database publicly accessible"
  type        = bool
  default     = false
}

variable "auto_minor_version_upgrade" {
  description = "Enable automatic minor version upgrades"
  type        = bool
  default     = true
}

variable "apply_immediately" {
  description = "Apply changes immediately"
  type        = bool
  default     = false
}

variable "skip_final_snapshot" {
  description = "Skip final snapshot when deleting"
  type        = bool
  default     = false
}

variable "deletion_protection" {
  description = "Enable deletion protection"
  type        = bool
  default     = true
}

variable "monitoring_interval" {
  description = "Enhanced monitoring interval in seconds (0, 1, 5, 10, 15, 30, 60)"
  type        = number
  default     = 60
  validation {
    condition     = contains([0, 1, 5, 10, 15, 30, 60], var.monitoring_interval)
    error_message = "Monitoring interval must be one of: 0, 1, 5, 10, 15, 30, 60."
  }
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights"
  type        = bool
  default     = true
}

variable "performance_insights_retention_period" {
  description = "Performance Insights retention period in days"
  type        = number
  default     = 7
}

variable "enabled_cloudwatch_logs_exports" {
  description = "List of log types to export to CloudWatch"
  type        = list(string)
  default     = ["error", "general", "slow-query"]
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 90
}

variable "ca_cert_identifier" {
  description = "CA certificate identifier"
  type        = string
  default     = "rds-ca-rsa2048-g1"
}

variable "create_read_replica" {
  description = "Create a read replica"
  type        = bool
  default     = false
}

variable "read_replica_instance_class" {
  description = "Read replica instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "create_initial_snapshot" {
  description = "Create an initial snapshot after database creation"
  type        = bool
  default     = true
}

variable "kms_key_deletion_window" {
  description = "KMS key deletion window in days"
  type        = number
  default     = 7
}

variable "secrets_recovery_window" {
  description = "Secrets Manager recovery window in days"
  type        = number
  default     = 7
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default     = {}
}

# CloudWatch alarm thresholds
variable "cpu_alarm_threshold" {
  description = "CPU utilization alarm threshold (percentage)"
  type        = number
  default     = 80
}

variable "connection_alarm_threshold" {
  description = "Database connections alarm threshold"
  type        = number
  default     = 80
}

variable "memory_alarm_threshold" {
  description = "Freeable memory alarm threshold (bytes)"
  type        = number
  default     = 268435456 # 256 MB
}

variable "alarm_actions" {
  description = "List of ARNs to notify when alarm triggers"
  type        = list(string)
  default     = []
}

# Security parameters for MySQL
variable "mysql_security_parameters" {
  description = "Security parameters for MySQL"
  type        = map(string)
  default = {
    "general_log"                   = "1"
    "slow_query_log"                = "1"
    "log_queries_not_using_indexes" = "1"
    "log_slow_admin_statements"     = "1"
    "log_slow_slave_statements"     = "1"
    "server_audit_logging"          = "1"
    "server_audit_events"           = "CONNECT,QUERY,TABLE"
    "innodb_file_per_table"         = "1"
    "innodb_encrypt_tables"         = "ON"
    "require_secure_transport"      = "ON"
    "tls_version"                   = "TLSv1.2,TLSv1.3"
  }
}

# Security parameters for PostgreSQL
variable "postgres_security_parameters" {
  description = "Security parameters for PostgreSQL"
  type        = map(string)
  default = {
    "log_statement"              = "all"
    "log_min_duration_statement" = "1000"
    "log_connections"            = "1"
    "log_disconnections"         = "1"
    "log_checkpoints"            = "1"
    "log_lock_waits"             = "1"
    "log_temp_files"             = "0"
    "shared_preload_libraries"   = "pg_stat_statements"
    "ssl"                        = "1"
    "ssl_min_protocol_version"   = "TLSv1.2"
  }
}

variable "compliance_tags" {
  description = "Additional tags for compliance tracking"
  type        = map(string)
  default = {
    Compliance = "PCI-DSS,SOC2,ISO27001"
    DataClass  = "Confidential"
  }
}
