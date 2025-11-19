terraform {
  # backend "s3" { # Example for S3 backend
  #   bucket         = "your-terraform-state-bucket-name"
  #   key            = "blockguardian/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   # dynamodb_table = "your-terraform-lock-table" # Optional for state locking
  # }

  # For local state, which is the default if no backend block is present:
  # No configuration needed here, Terraform will create a local terraform.tfstate file.
  # It's highly recommended to use a remote backend for collaborative projects.
}
