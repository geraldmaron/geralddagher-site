resource "digitalocean_droplet" "cms" {
  image    = var.droplet_image
  name     = var.droplet_name
  region   = var.region
  size     = var.droplet_size
  ssh_keys = var.ssh_fingerprints
  
  # Monitoring ensures we can track CPU/Review usage
  monitoring = true

  # Prevent droplet replacement when config files change
  # Config updates should be deployed via SSH, not by recreating the droplet
  lifecycle {
    ignore_changes = [user_data]
  }

  user_data = templatefile("${path.module}/cloud-init.yaml", {
    docker_compose_content = file("${path.module}/../../ops/compose/docker-compose.yml")
    caddyfile_content      = file("${path.module}/../../ops/compose/Caddyfile")
    ssh_public_key         = var.ssh_public_key
    env_content            = <<EOT
DB_USER=directus
DB_PASSWORD=${var.db_password}
DB_DATABASE=directus
KEY=${var.directus_key}
SECRET=${var.directus_secret}
ADMIN_EMAIL=${var.admin_email}
ADMIN_PASSWORD=${var.admin_password}
R2_ACCESS_KEY=${var.r2_access_key}
R2_SECRET_KEY=${var.r2_secret_key}
R2_BUCKET=${var.r2_bucket_name}
R2_ENDPOINT=https://${var.cloudflare_account_id}.r2.cloudflarestorage.com
CMS_DOMAIN=${var.cms_subdomain}.${var.domain_name}
CORS_ORIGIN=https://${var.domain_name}
EOT
  })
}

resource "digitalocean_firewall" "cms" {
  name = "${var.droplet_name}-fw"
  droplet_ids = [digitalocean_droplet.cms.id]

  # Inbound rules - only allow necessary ports
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Outbound rules - allow all (DigitalOcean best practice)
  # Required for apt updates, Docker pulls, R2 access, etc.
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

resource "digitalocean_project" "cms_project" {
  name        = "Directus CMS v2"
  description = "CMS resource group"
  purpose     = "Web Application"
  environment = "Production"
  resources   = [digitalocean_droplet.cms.urn]
}
