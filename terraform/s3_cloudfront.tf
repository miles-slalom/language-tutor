# S3 Bucket for Frontend Static Files
resource "aws_s3_bucket" "frontend" {
  bucket_prefix = "${local.project_name}-frontend-"
  force_destroy = true

  tags = local.common_tags
}

# Block all public access to S3 bucket
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Origin Access Control
resource "aws_cloudfront_origin_access_control" "frontend" {
  name                              = "${local.project_name}-frontend-oac"
  description                       = "OAC for French Tutor Frontend"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "frontend" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  comment             = "French Tutor Frontend Distribution"

  origin {
    domain_name              = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.frontend.id
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # SPA routing: redirect 403s to index.html
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  # SPA routing: redirect 404s to index.html
  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }

  tags = local.common_tags
}

# S3 Bucket Policy to allow CloudFront access
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontServicePrincipal"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
        Condition = {
          StringEquals = {
            "AWS:SourceArn" = aws_cloudfront_distribution.frontend.arn
          }
        }
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.frontend]
}

# Upload index.html to S3
resource "aws_s3_object" "frontend_index" {
  bucket       = aws_s3_bucket.frontend.id
  key          = "index.html"
  source       = "${path.module}/../frontend/dist/index.html"
  content_type = "text/html"
  etag         = filemd5("${path.module}/../frontend/dist/index.html")

  depends_on = [aws_s3_bucket_policy.frontend]
}

# Upload CSS assets to S3
resource "aws_s3_object" "frontend_css" {
  for_each = fileset("${path.module}/../frontend/dist/assets", "*.css")

  bucket       = aws_s3_bucket.frontend.id
  key          = "assets/${each.value}"
  source       = "${path.module}/../frontend/dist/assets/${each.value}"
  content_type = "text/css"
  etag         = filemd5("${path.module}/../frontend/dist/assets/${each.value}")

  depends_on = [aws_s3_bucket_policy.frontend]
}

# Upload JS assets to S3
resource "aws_s3_object" "frontend_js" {
  for_each = fileset("${path.module}/../frontend/dist/assets", "*.js")

  bucket       = aws_s3_bucket.frontend.id
  key          = "assets/${each.value}"
  source       = "${path.module}/../frontend/dist/assets/${each.value}"
  content_type = "application/javascript"
  etag         = filemd5("${path.module}/../frontend/dist/assets/${each.value}")

  depends_on = [aws_s3_bucket_policy.frontend]
}

# CloudFront Cache Invalidation
resource "terraform_data" "cloudfront_invalidation" {
  triggers_replace = {
    index_etag = aws_s3_object.frontend_index.etag
    css_etags  = join(",", [for obj in aws_s3_object.frontend_css : obj.etag])
    js_etags   = join(",", [for obj in aws_s3_object.frontend_js : obj.etag])
  }

  provisioner "local-exec" {
    command = "aws cloudfront create-invalidation --distribution-id ${aws_cloudfront_distribution.frontend.id} --paths '/*' --region us-east-1"
  }

  depends_on = [
    aws_s3_object.frontend_index,
    aws_s3_object.frontend_css,
    aws_s3_object.frontend_js
  ]
}
