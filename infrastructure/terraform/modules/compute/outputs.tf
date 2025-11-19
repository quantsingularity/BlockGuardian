output "launch_template_id" {
  description = "Launch template ID"
  value       = aws_launch_template.app.id
}

output "launch_template_arn" {
  description = "Launch template ARN"
  value       = aws_launch_template.app.arn
}

output "launch_template_latest_version" {
  description = "Launch template latest version"
  value       = aws_launch_template.app.latest_version
}

output "autoscaling_group_id" {
  description = "Auto Scaling Group ID"
  value       = aws_autoscaling_group.app.id
}

output "autoscaling_group_arn" {
  description = "Auto Scaling Group ARN"
  value       = aws_autoscaling_group.app.arn
}

output "autoscaling_group_name" {
  description = "Auto Scaling Group name"
  value       = aws_autoscaling_group.app.name
}

output "autoscaling_group_min_size" {
  description = "Auto Scaling Group minimum size"
  value       = aws_autoscaling_group.app.min_size
}

output "autoscaling_group_max_size" {
  description = "Auto Scaling Group maximum size"
  value       = aws_autoscaling_group.app.max_size
}

output "autoscaling_group_desired_capacity" {
  description = "Auto Scaling Group desired capacity"
  value       = aws_autoscaling_group.app.desired_capacity
}

output "load_balancer_id" {
  description = "Application Load Balancer ID"
  value       = aws_lb.app.id
}

output "load_balancer_arn" {
  description = "Application Load Balancer ARN"
  value       = aws_lb.app.arn
}

output "load_balancer_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = aws_lb.app.dns_name
}

output "load_balancer_zone_id" {
  description = "Application Load Balancer zone ID"
  value       = aws_lb.app.zone_id
}

output "load_balancer_hosted_zone_id" {
  description = "Application Load Balancer hosted zone ID"
  value       = aws_lb.app.zone_id
}

output "target_group_id" {
  description = "Target group ID"
  value       = aws_lb_target_group.app.id
}

output "target_group_arn" {
  description = "Target group ARN"
  value       = aws_lb_target_group.app.arn
}

output "target_group_name" {
  description = "Target group name"
  value       = aws_lb_target_group.app.name
}

output "https_listener_arn" {
  description = "HTTPS listener ARN"
  value       = aws_lb_listener.https.arn
}

output "http_redirect_listener_arn" {
  description = "HTTP redirect listener ARN"
  value       = aws_lb_listener.http_redirect.arn
}

output "scale_up_policy_arn" {
  description = "Scale up policy ARN"
  value       = aws_autoscaling_policy.scale_up.arn
}

output "scale_down_policy_arn" {
  description = "Scale down policy ARN"
  value       = aws_autoscaling_policy.scale_down.arn
}

output "cpu_high_alarm_arn" {
  description = "CPU high alarm ARN"
  value       = aws_cloudwatch_metric_alarm.cpu_high.arn
}

output "cpu_low_alarm_arn" {
  description = "CPU low alarm ARN"
  value       = aws_cloudwatch_metric_alarm.cpu_low.arn
}

output "cloudwatch_log_group_name" {
  description = "CloudWatch log group name"
  value       = aws_cloudwatch_log_group.app_logs.name
}

output "cloudwatch_log_group_arn" {
  description = "CloudWatch log group ARN"
  value       = aws_cloudwatch_log_group.app_logs.arn
}

output "ami_id" {
  description = "AMI ID used for instances"
  value       = var.custom_ami_id != null ? var.custom_ami_id : data.aws_ami.hardened_ami.id
}

output "instance_type" {
  description = "Instance type used"
  value       = var.instance_type
}

output "key_name" {
  description = "Key pair name used"
  value       = var.key_name
}

output "security_group_ids" {
  description = "Security group IDs used for instances"
  value       = var.security_group_ids
}

output "alb_security_group_ids" {
  description = "Security group IDs used for ALB"
  value       = var.alb_security_group_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs used"
  value       = var.private_subnet_ids
}

output "public_subnet_ids" {
  description = "Public subnet IDs used"
  value       = var.public_subnet_ids
}

output "waf_association_id" {
  description = "WAF association ID (if WAF is enabled)"
  value       = var.waf_web_acl_arn != null ? aws_wafv2_web_acl_association.app[0].id : null
}

output "load_balancer_url" {
  description = "Load balancer URL"
  value       = "https://${aws_lb.app.dns_name}"
}

output "health_check_configuration" {
  description = "Health check configuration"
  value = {
    path                = var.health_check_path
    protocol            = var.health_check_protocol
    interval            = var.health_check_interval
    timeout             = var.health_check_timeout
    healthy_threshold   = var.healthy_threshold
    unhealthy_threshold = var.unhealthy_threshold
    matcher             = var.health_check_matcher
  }
}

output "auto_scaling_configuration" {
  description = "Auto scaling configuration"
  value = {
    min_size                    = var.min_size
    max_size                    = var.max_size
    desired_capacity            = var.desired_capacity
    health_check_grace_period   = var.health_check_grace_period
    default_cooldown           = var.default_cooldown
    cpu_high_threshold         = var.cpu_high_threshold
    cpu_low_threshold          = var.cpu_low_threshold
    scale_up_adjustment        = var.scale_up_adjustment
    scale_down_adjustment      = var.scale_down_adjustment
  }
}

output "storage_configuration" {
  description = "Storage configuration"
  value = {
    root_volume_type       = var.root_volume_type
    root_volume_size       = var.root_volume_size
    root_volume_iops       = var.root_volume_iops
    root_volume_throughput = var.root_volume_throughput
    data_volume_size       = var.data_volume_size
    data_volume_type       = var.data_volume_type
    data_volume_iops       = var.data_volume_iops
    data_volume_throughput = var.data_volume_throughput
  }
}

output "compliance_tags" {
  description = "Compliance tags applied to resources"
  value       = var.compliance_tags
}
