variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where security groups will be created"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block of the VPC"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "allowed_cidr_blocks" {
  description = "CIDR blocks allowed to access the application"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "management_cidr_blocks" {
  description = "CIDR blocks for management access (SSH, DB admin)"
  type        = list(string)
  default     = ["10.0.0.0/8", "172.16.0.0/12", "192.168.0.0/16"]
}

variable "app_port" {
  description = "Application port"
  type        = number
  default     = 443
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 3306
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for Network ACL"
  type        = list(string)
  default     = []
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 90
}

variable "waf_rate_limit" {
  description = "WAF rate limit per IP (requests per 5-minute period)"
  type        = number
  default     = 2000
}

variable "enable_vpc_flow_logs" {
  description = "Enable VPC Flow Logs"
  type        = bool
  default     = true
}

variable "enable_waf" {
  description = "Enable Web Application Firewall"
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

variable "enable_key_rotation" {
  description = "Enable automatic KMS key rotation"
  type        = bool
  default     = true
}

variable "compliance_tags" {
  description = "Additional tags for compliance tracking"
  type        = map(string)
  default = {
    Compliance = "PCI-DSS,SOC2,ISO27001"
    DataClass  = "Confidential"
  }
}

