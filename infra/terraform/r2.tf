# R2 Bucket - Manually created via Cloudflare dashboard
# R2 API permissions are not available through standard Cloudflare API tokens
# Bucket name: cms-assets
# Location: WNAM (Western North America)
# Managed outside of Terraform

# resource "cloudflare_r2_bucket" "media_bucket" {
#   account_id = var.cloudflare_account_id
#   name       = var.r2_bucket_name
#   location   = "WNAM"
# }

output "r2_bucket_endpoint" {
  value = "https://${var.cloudflare_account_id}.r2.cloudflarestorage.com"
}

output "r2_bucket_name" {
  value = var.r2_bucket_name
  description = "R2 bucket name (manually managed)"
}
