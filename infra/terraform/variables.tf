variable "do_token" {
  description = "DigitalOcean API Token"
  type        = string
  sensitive   = true
}

variable "cloudflare_api_token" {
  description = "Cloudflare API Token with DNS edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_zone_id" {
  description = "Cloudflare Zone ID for the domain"
  type        = string
}

variable "cloudflare_account_id" {
  description = "Cloudflare Account ID (Required for R2)"
  type        = string
}

variable "droplet_name" {
  description = "Name of the Droplet"
  type        = string
  default     = "directus-cms-v2"
}

variable "droplet_image" {
  description = "Droplet image slug"
  type        = string
  default     = "ubuntu-22-04-x64"
}

variable "droplet_size" {
  description = "Droplet size slug"
  type        = string
  default     = "s-1vcpu-1gb" # Lowest cost ($6/mo) - relies on Swap for stability
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "nyc1"
}

variable "ssh_fingerprints" {
  description = "List of SSH key fingerprints to inject into the Droplet"
  type        = list(string)
  default     = []
}

variable "ssh_public_key" {
  description = "SSH public key for deploy user"
  type        = string
  default     = ""
}

variable "domain_name" {
  description = "Base domain name"
  type        = string
  default     = "geralddagher.com"
}

variable "cms_subdomain" {
  description = "Subdomain for the CMS"
  type        = string
  default     = "cms"
}

variable "r2_bucket_name" {
  description = "Name of the R2 bucket"
  type        = string
  default     = "cms-assets"
}

# --- Secrets for Injection ---

variable "db_password" {
  description = "Password for the Postgres database"
  type        = string
  sensitive   = true
}

variable "directus_key" {
  description = "Directus Project Key"
  type        = string
  sensitive   = true
}

variable "directus_secret" {
  description = "Directus Project Secret"
  type        = string
  sensitive   = true
}

variable "admin_email" {
  description = "Directus Admin Email"
  type        = string
}

variable "admin_password" {
  description = "Directus Admin Password"
  type        = string
  sensitive   = true
}

variable "r2_access_key" {
  description = "R2 Access Key (S3 compatible)"
  type        = string
  sensitive   = true
}

variable "r2_secret_key" {
  description = "R2 Secret Key (S3 compatible)"
  type        = string
  sensitive   = true
}
