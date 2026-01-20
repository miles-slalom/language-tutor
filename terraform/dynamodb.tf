# DynamoDB Table for User Profiles
resource "aws_dynamodb_table" "users" {
  name         = "${local.project_name}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }

  tags = local.common_tags
}
