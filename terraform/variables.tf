variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "frontend_domain" {
  description = "Frontend domain for CORS configuration"
  type        = string
  default     = ""
}
