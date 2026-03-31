# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/project
resource "digitalocean_project" "rra_project" {
  name        = "roleplay-realm-archive"
  description = "Roleplay Realm Archive"
  environment = "development"
  purpose     = "Web Application"
  resources = [
    digitalocean_app.rra_app.urn,
    digitalocean_database_cluster.rra_postgres.urn,
    digitalocean_droplet.rra_jump_server.urn,
    digitalocean_volume.rra_jump_server_volume.urn,
    digitalocean_domain.roleplay_realm_archive_com.urn,
    digitalocean_spaces_bucket.rra.urn
  ]
}
