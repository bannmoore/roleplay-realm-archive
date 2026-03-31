resource "digitalocean_spaces_bucket" "rra" {
  name   = "roleplay-realm-archive-storage"
  region = var.do_region
}

# resource "digitalocean_spaces_bucket_cors_configuration" "rra_dev" {
#   bucket = digitalocean_spaces_bucket.rra.id
#   region = var.do_region

#   cors_rule {
#     allowed_headers = ["*"]
#     allowed_methods = ["GET", "PUT"]
#     allowed_origins = ["http://localhost:3000"]
#     max_age_seconds = 3000
#   }
# }

resource "digitalocean_spaces_bucket_cors_configuration" "rra" {
  bucket = digitalocean_spaces_bucket.rra.id
  region = var.do_region

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT"]
    allowed_origins = ["https://${digitalocean_domain.roleplay_realm_archive_com.name}"]
    max_age_seconds = 3000
  }
}

resource "digitalocean_spaces_key" "rra_app" {
  name = "rra-app"
  grant {
    bucket     = digitalocean_spaces_bucket.rra.name
    permission = "readwrite"
  }
}
