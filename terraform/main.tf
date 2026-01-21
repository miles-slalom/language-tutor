terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

locals {
  # NOTE: project_name is kept as "french-tutor" for AWS resource naming continuity.
  # This identifier is used for S3 buckets, Lambda functions, DynamoDB tables, Cognito,
  # and API Gateway resources. Changing it would create new resources and orphan existing
  # deployed infrastructure. User-facing branding has been updated to "Language Tutor"
  # in application code and Terraform descriptions - this value is NOT user-facing.
  project_name = "french-tutor"
  common_tags = {
    Project     = local.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}
