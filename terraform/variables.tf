variable "environment" {
  type        = string
  default     = "dev"
  description = "Environment name (dev, staging, prod)"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "AWS region for resources"
}

variable "project_name" {
  type        = string
  default     = "french-tutor"
  description = "Project name used for resource naming"
}

variable "backend_container_port" {
  type        = number
  default     = 8000
  description = "Port the backend container listens on"
}

variable "backend_cpu" {
  type        = number
  default     = 256
  description = "CPU units for ECS task (256 = 0.25 vCPU)"
}

variable "backend_memory" {
  type        = number
  default     = 512
  description = "Memory in MB for ECS task"
}
