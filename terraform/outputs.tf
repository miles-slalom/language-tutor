output "cloudfront_distribution_url" {
  description = "CloudFront distribution URL to access the app"
  value       = "https://${aws_cloudfront_distribution.main.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID for cache invalidation"
  value       = aws_cloudfront_distribution.main.id
}

output "alb_dns_name" {
  description = "ALB DNS name for debugging"
  value       = aws_lb.main.dns_name
}

output "ecr_repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = aws_ecr_repository.backend.repository_url
}

output "s3_bucket_name" {
  description = "S3 bucket name for uploading frontend files"
  value       = aws_s3_bucket.frontend.id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.backend.name
}
