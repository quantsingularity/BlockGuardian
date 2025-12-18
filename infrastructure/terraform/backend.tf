# Terraform Backend Configuration
# 
# LOCAL BACKEND (Development/Testing):
# By default, Terraform uses local state (terraform.tfstate in current directory)
# This is suitable for local testing and development.
# The backend block below is commented out to use local state.
#
# REMOTE BACKEND (Production/Team):
# For production and team collaboration, uncomment and configure the S3 backend below.
# You'll need:
# 1. An S3 bucket for state storage
# 2. (Optional) A DynamoDB table for state locking
# 3. Appropriate IAM permissions
#
# To use remote backend:
# 1. Create S3 bucket: aws s3 mb s3://your-terraform-state-bucket
# 2. Enable versioning: aws s3api put-bucket-versioning --bucket your-terraform-state-bucket --versioning-configuration Status=Enabled
# 3. Enable encryption: aws s3api put-bucket-encryption --bucket your-terraform-state-bucket --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'
# 4. (Optional) Create DynamoDB table for locking: aws dynamodb create-table --table-name terraform-state-lock --attribute-definitions AttributeName=LockID,AttributeType=S --key-schema AttributeName=LockID,KeyType=HASH --billing-mode PAY_PER_REQUEST
# 5. Uncomment the backend block below and update with your values
# 6. Run: terraform init -migrate-state

terraform {
  # Uncomment for remote S3 backend:
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket-name"  # Change this!
  #   key            = "blockguardian/terraform.tfstate"
  #   region         = "us-east-1"                         # Change to your region
  #   encrypt        = true
  #   dynamodb_table = "terraform-state-lock"              # Optional: for state locking
  # }
}
