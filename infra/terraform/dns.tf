resource "cloudflare_record" "cms" {
  zone_id = var.cloudflare_zone_id
  name    = var.cms_subdomain
  value   = digitalocean_droplet.cms.ipv4_address
  type    = "A"
  proxied = true # Cloudflare Proxy enabled
  comment = "Directus CMS v2 (Managed by Terraform)"
}

resource "cloudflare_record" "cms_production" {
  zone_id = var.cloudflare_zone_id
  name    = "cms"
  value   = digitalocean_droplet.cms.ipv4_address
  type    = "A"
  proxied = true
  comment = "Directus CMS v2 Production (Managed by Terraform)"
}
