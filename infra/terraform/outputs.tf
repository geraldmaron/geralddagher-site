output "droplet_ip" {
  value = digitalocean_droplet.cms.ipv4_address
}

output "cms_staging_url" {
  value = "https://${var.cms_subdomain}.${var.domain_name}"
}

output "cms_production_url" {
  value = "https://cms.${var.domain_name}"
}

output "ssh_command" {
  value = "ssh deploy@${digitalocean_droplet.cms.ipv4_address}"
}
