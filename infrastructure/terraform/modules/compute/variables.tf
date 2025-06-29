variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "private_subnet_ids" {
  description = "List of private subnet IDs for instances"
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "List of public subnet IDs for load balancer"
  type        = list(string)
  default     = []
}

variable "security_group_ids" {
  description = "List of security group IDs for instances"
  type        = list(string)
}

variable "alb_security_group_ids" {
  description = "List of security group IDs for ALB"
  type        = list(string)
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "EC2 Key Pair name"
  type        = string
  default     = null
}

variable "instance_profile_name" {
  description = "IAM instance profile name"
  type        = string
}

variable "custom_ami_id" {
  description = "Custom AMI ID (if null, will use latest hardened AMI)"
  type        = string
  default     = null
}

variable "ami_owners" {
  description = "List of AMI owners to search"
  type        = list(string)
  default     = ["amazon"]
}

variable "ami_name_filters" {
  description = "List of AMI name filters"
  type        = list(string)
  default     = ["amzn2-ami-hvm-*-x86_64-gp2"]
}

# Auto Scaling Configuration
variable "min_size" {
  description = "Minimum number of instances in ASG"
  type        = number
  default     = 2
}

variable "max_size" {
  description = "Maximum number of instances in ASG"
  type        = number
  default     = 10
}

variable "desired_capacity" {
  description = "Desired number of instances in ASG"
  type        = number
  default     = 2
}

variable "health_check_grace_period" {
  description = "Health check grace period in seconds"
  type        = number
  default     = 300
}

variable "default_cooldown" {
  description = "Default cooldown period in seconds"
  type        = number
  default     = 300
}

variable "instance_warmup" {
  description = "Instance warmup period in seconds"
  type        = number
  default     = 300
}

# Storage Configuration
variable "root_volume_type" {
  description = "Root volume type"
  type        = string
  default     = "gp3"
}

variable "root_volume_size" {
  description = "Root volume size in GB"
  type        = number
  default     = 20
}

variable "root_volume_iops" {
  description = "Root volume IOPS (for gp3)"
  type        = number
  default     = 3000
}

variable "root_volume_throughput" {
  description = "Root volume throughput in MB/s (for gp3)"
  type        = number
  default     = 125
}

variable "data_volume_size" {
  description = "Data volume size in GB (0 to disable)"
  type        = number
  default     = 0
}

variable "data_volume_type" {
  description = "Data volume type"
  type        = string
  default     = "gp3"
}

variable "data_volume_iops" {
  description = "Data volume IOPS (for gp3)"
  type        = number
  default     = 3000
}

variable "data_volume_throughput" {
  description = "Data volume throughput in MB/s (for gp3)"
  type        = number
  default     = 125
}

# Load Balancer Configuration
variable "internal_load_balancer" {
  description = "Create internal load balancer"
  type        = bool
  default     = false
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for ALB"
  type        = bool
  default     = true
}

variable "certificate_arn" {
  description = "SSL certificate ARN for HTTPS listener"
  type        = string
}

variable "ssl_policy" {
  description = "SSL policy for HTTPS listener"
  type        = string
  default     = "ELBSecurityPolicy-TLS-1-2-2017-01"
}

# Application Configuration
variable "app_port" {
  description = "Application port"
  type        = number
  default     = 8080
}

variable "app_protocol" {
  description = "Application protocol"
  type        = string
  default     = "HTTP"
}

# Health Check Configuration
variable "health_check_path" {
  description = "Health check path"
  type        = string
  default     = "/health"
}

variable "health_check_protocol" {
  description = "Health check protocol"
  type        = string
  default     = "HTTP"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "healthy_threshold" {
  description = "Healthy threshold count"
  type        = number
  default     = 2
}

variable "unhealthy_threshold" {
  description = "Unhealthy threshold count"
  type        = number
  default     = 3
}

variable "health_check_matcher" {
  description = "Health check response matcher"
  type        = string
  default     = "200"
}

# Stickiness Configuration
variable "enable_stickiness" {
  description = "Enable session stickiness"
  type        = bool
  default     = false
}

variable "stickiness_duration" {
  description = "Stickiness duration in seconds"
  type        = number
  default     = 86400
}

# Auto Scaling Policies
variable "scale_up_adjustment" {
  description = "Scale up adjustment"
  type        = number
  default     = 1
}

variable "scale_down_adjustment" {
  description = "Scale down adjustment"
  type        = number
  default     = -1
}

variable "scale_up_cooldown" {
  description = "Scale up cooldown in seconds"
  type        = number
  default     = 300
}

variable "scale_down_cooldown" {
  description = "Scale down cooldown in seconds"
  type        = number
  default     = 300
}

variable "cpu_high_threshold" {
  description = "CPU high threshold for scaling up"
  type        = number
  default     = 70
}

variable "cpu_low_threshold" {
  description = "CPU low threshold for scaling down"
  type        = number
  default     = 20
}

# Security Configuration
variable "kms_key_id" {
  description = "KMS key ID for encryption"
  type        = string
}

variable "secrets_manager_arn" {
  description = "Secrets Manager ARN for application secrets"
  type        = string
}

variable "waf_web_acl_arn" {
  description = "WAF Web ACL ARN (optional)"
  type        = string
  default     = null
}

# Monitoring Configuration
variable "enable_detailed_monitoring" {
  description = "Enable detailed monitoring"
  type        = bool
  default     = true
}

variable "enable_cloudwatch_agent" {
  description = "Enable CloudWatch Agent"
  type        = bool
  default     = true
}

variable "enable_ssm_agent" {
  description = "Enable SSM Agent"
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 90
}

variable "log_group_name" {
  description = "CloudWatch log group name"
  type        = string
  default     = ""
}

# Access Logs Configuration
variable "enable_access_logs" {
  description = "Enable ALB access logs"
  type        = bool
  default     = true
}

variable "access_logs_bucket" {
  description = "S3 bucket for ALB access logs"
  type        = string
  default     = ""
}

# Compliance Configuration
variable "compliance_mode" {
  description = "Compliance mode (PCI-DSS, SOC2, ISO27001)"
  type        = string
  default     = "PCI-DSS,SOC2,ISO27001"
}

variable "default_tags" {
  description = "Default tags to apply to all resources"
  type        = map(string)
  default     = {}
}

variable "compliance_tags" {
  description = "Additional tags for compliance tracking"
  type        = map(string)
  default = {
    Compliance = "PCI-DSS,SOC2,ISO27001"
    DataClass  = "Confidential"
  }
}

