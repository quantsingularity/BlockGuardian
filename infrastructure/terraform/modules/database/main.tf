# Enhanced Database Module for Financial Standards Compliance
# This module implements secure database configurations with encryption, monitoring, and compliance features

# KMS key for database encryption (if not provided)
resource "aws_kms_key" "db_encryption" {
  count                   = var.kms_key_id == null ? 1 : 0
  description             = "KMS key for ${var.db_name} database encryption in ${var.environment}"
  deletion_window_in_days = var.kms_key_deletion_window
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Enable IAM User Permissions"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action   = "kms:*"
        Resource = "*"
      },
      {
        Sid    = "Allow RDS Service"
        Effect = "Allow"
        Principal = {
          Service = "rds.amazonaws.com"
        }
        Action = [
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:CreateGrant"
        ]
        Resource = "*"
      }
    ]
  })

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-db-kms-key"
    Environment = var.environment
    Purpose     = "Database encryption"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_kms_alias" "db_encryption" {
  count         = var.kms_key_id == null ? 1 : 0
  name          = "alias/${var.db_name}-${var.environment}-db-key"
  target_key_id = aws_kms_key.db_encryption[0].key_id
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Enhanced DB Parameter Group with security configurations
resource "aws_db_parameter_group" "main" {
  family = var.db_family
  name   = "${var.db_name}-${var.environment}-params"

  # Security parameters for MySQL
  dynamic "parameter" {
    for_each = var.engine == "mysql" ? var.mysql_security_parameters : {}
    content {
      name  = parameter.key
      value = parameter.value
    }
  }

  # Security parameters for PostgreSQL
  dynamic "parameter" {
    for_each = var.engine == "postgres" ? var.postgres_security_parameters : {}
    content {
      name  = parameter.key
      value = parameter.value
    }
  }

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-params"
    Environment = var.environment
    Purpose     = "Database parameter group"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Enhanced DB Option Group (for MySQL)
resource "aws_db_option_group" "main" {
  count                    = var.engine == "mysql" ? 1 : 0
  name                     = "${var.db_name}-${var.environment}-options"
  option_group_description = "Option group for ${var.db_name} in ${var.environment}"
  engine_name              = var.engine
  major_engine_version     = var.major_engine_version

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-options"
    Environment = var.environment
    Purpose     = "Database option group"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# Secrets Manager for database credentials
resource "aws_secretsmanager_secret" "db_credentials" {
  name                    = "${var.db_name}/${var.environment}/credentials"
  description             = "Database credentials for ${var.db_name} in ${var.environment}"
  kms_key_id             = var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn
  recovery_window_in_days = var.secrets_recovery_window

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-credentials"
    Environment = var.environment
    Purpose     = "Database credentials"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_secretsmanager_secret_version" "db_credentials" {
  secret_id = aws_secretsmanager_secret.db_credentials.id
  secret_string = jsonencode({
    username = var.db_username
    password = var.db_password
    engine   = var.engine
    host     = aws_db_instance.main.endpoint
    port     = aws_db_instance.main.port
    dbname   = var.db_name
  })

  depends_on = [aws_db_instance.main]
}

# Enhanced RDS Instance with comprehensive security
resource "aws_db_instance" "main" {
  identifier = "${var.db_name}-${var.environment}"

  # Engine configuration
  engine                = var.engine
  engine_version        = var.engine_version
  instance_class        = var.db_instance_class
  allocated_storage     = var.allocated_storage
  max_allocated_storage = var.max_allocated_storage
  storage_type          = var.storage_type
  storage_encrypted     = true
  kms_key_id           = var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn

  # Database configuration
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  # Network configuration
  db_subnet_group_name   = var.db_subnet_group_name
  vpc_security_group_ids = var.security_group_ids
  publicly_accessible    = false
  port                   = var.db_port

  # Parameter and option groups
  parameter_group_name = aws_db_parameter_group.main.name
  option_group_name    = var.engine == "mysql" ? aws_db_option_group.main[0].name : null

  # Backup and maintenance
  backup_retention_period   = var.backup_retention_period
  backup_window            = var.backup_window
  maintenance_window       = var.maintenance_window
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  apply_immediately        = var.apply_immediately

  # High availability and disaster recovery
  multi_az               = var.multi_az
  availability_zone      = var.multi_az ? null : var.availability_zone
  copy_tags_to_snapshot  = true
  skip_final_snapshot    = var.skip_final_snapshot
  final_snapshot_identifier = var.skip_final_snapshot ? null : "${var.db_name}-${var.environment}-final-snapshot-${formatdate("YYYY-MM-DD-hhmm", timestamp())}"

  # Monitoring and logging
  monitoring_interval = var.monitoring_interval
  monitoring_role_arn = var.monitoring_interval > 0 ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  enabled_cloudwatch_logs_exports = var.enabled_cloudwatch_logs_exports
  performance_insights_enabled    = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_enabled ? (var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn) : null
  performance_insights_retention_period = var.performance_insights_retention_period

  # Security
  deletion_protection = var.deletion_protection
  
  # CA certificate
  ca_cert_identifier = var.ca_cert_identifier

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}"
    Environment = var.environment
    Purpose     = "Primary database"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
    BackupRetention = tostring(var.backup_retention_period)
  })

  depends_on = [
    aws_db_parameter_group.main,
    aws_cloudwatch_log_group.db_logs
  ]
}

# Read replica for disaster recovery and read scaling
resource "aws_db_instance" "read_replica" {
  count = var.create_read_replica ? 1 : 0

  identifier = "${var.db_name}-${var.environment}-read-replica"
  
  # Replica configuration
  replicate_source_db = aws_db_instance.main.identifier
  instance_class      = var.read_replica_instance_class
  
  # Network configuration
  publicly_accessible    = false
  vpc_security_group_ids = var.security_group_ids
  
  # Monitoring
  monitoring_interval = var.monitoring_interval
  monitoring_role_arn = var.monitoring_interval > 0 ? aws_iam_role.rds_enhanced_monitoring[0].arn : null
  
  performance_insights_enabled = var.performance_insights_enabled
  performance_insights_kms_key_id = var.performance_insights_enabled ? (var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn) : null
  
  # Security
  deletion_protection = var.deletion_protection
  
  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-read-replica"
    Environment = var.environment
    Purpose     = "Read replica"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# IAM role for RDS Enhanced Monitoring
resource "aws_iam_role" "rds_enhanced_monitoring" {
  count = var.monitoring_interval > 0 ? 1 : 0
  name  = "${var.db_name}-${var.environment}-rds-monitoring-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "monitoring.rds.amazonaws.com"
        }
      }
    ]
  })

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-rds-monitoring-role"
    Environment = var.environment
    Purpose     = "RDS Enhanced Monitoring"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_iam_role_policy_attachment" "rds_enhanced_monitoring" {
  count      = var.monitoring_interval > 0 ? 1 : 0
  role       = aws_iam_role.rds_enhanced_monitoring[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonRDSEnhancedMonitoringRole"
}

# CloudWatch Log Groups for database logs
resource "aws_cloudwatch_log_group" "db_logs" {
  for_each = toset(var.enabled_cloudwatch_logs_exports)
  
  name              = "/aws/rds/instance/${var.db_name}-${var.environment}/${each.value}"
  retention_in_days = var.log_retention_days
  kms_key_id        = var.kms_key_id != null ? var.kms_key_id : aws_kms_key.db_encryption[0].arn

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-${each.value}-logs"
    Environment = var.environment
    Purpose     = "Database ${each.value} logs"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

# DB Snapshot for point-in-time recovery
resource "aws_db_snapshot" "initial_snapshot" {
  count                  = var.create_initial_snapshot ? 1 : 0
  db_instance_identifier = aws_db_instance.main.id
  db_snapshot_identifier = "${var.db_name}-${var.environment}-initial-snapshot"

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-initial-snapshot"
    Environment = var.environment
    Purpose     = "Initial database snapshot"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })

  depends_on = [aws_db_instance.main]
}

# CloudWatch Alarms for database monitoring
resource "aws_cloudwatch_metric_alarm" "database_cpu" {
  alarm_name          = "${var.db_name}-${var.environment}-high-cpu"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_alarm_threshold
  alarm_description   = "This metric monitors RDS CPU utilization"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-cpu-alarm"
    Environment = var.environment
    Purpose     = "Database CPU monitoring"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_cloudwatch_metric_alarm" "database_connections" {
  alarm_name          = "${var.db_name}-${var.environment}-high-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseConnections"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.connection_alarm_threshold
  alarm_description   = "This metric monitors RDS connection count"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-connections-alarm"
    Environment = var.environment
    Purpose     = "Database connection monitoring"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

resource "aws_cloudwatch_metric_alarm" "database_freeable_memory" {
  alarm_name          = "${var.db_name}-${var.environment}-low-memory"
  comparison_operator = "LessThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "FreeableMemory"
  namespace           = "AWS/RDS"
  period              = "300"
  statistic           = "Average"
  threshold           = var.memory_alarm_threshold
  alarm_description   = "This metric monitors RDS freeable memory"
  alarm_actions       = var.alarm_actions

  dimensions = {
    DBInstanceIdentifier = aws_db_instance.main.id
  }

  tags = merge(var.default_tags, {
    Name        = "${var.db_name}-${var.environment}-memory-alarm"
    Environment = var.environment
    Purpose     = "Database memory monitoring"
    Compliance  = "PCI-DSS,SOC2,ISO27001"
  })
}

