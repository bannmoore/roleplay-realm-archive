# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/domain
resource "digitalocean_domain" "roleplay_realm_archive_com" {
  name = "roleplay-realm-archive.com"
}

# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/app
resource "digitalocean_app" "rra_app" {
  spec {
    name   = "roleplay-realm-archive"
    region = var.do_app_region

    alert {
      rule = "DEPLOYMENT_FAILED"
    }

    domain {
      name = digitalocean_domain.roleplay_realm_archive_com.name
      type = "PRIMARY"
      zone = digitalocean_domain.roleplay_realm_archive_com.name
    }

    service {
      name               = "app"
      http_port          = 80
      instance_count     = 1
      instance_size_slug = "basic-xxs"

      image {
        registry_type = "DOCR"
        repository    = "roleplay-realm-archive"
        tag           = "latest"
        deploy_on_push {
          enabled = true
        }
      }


      env {
        key   = "NODE_ENV"
        value = "production"
      }

      env {
        key   = "BASE_URL"
        value = "https://${digitalocean_domain.roleplay_realm_archive_com.name}"
      }

      // Ref: https://authjs.dev/getting-started/deployment#auth_url
      env {
        key   = "AUTH_URL"
        value = "https://${digitalocean_domain.roleplay_realm_archive_com.name}"
      }

      // Ref: https://authjs.dev/getting-started/deployment#auth_secret
      env {
        key   = "AUTH_SECRET"
        value = var.auth_secret
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_API_URL"
        value = "https://discord.com/api/v10"
      }

      env {
        key   = "DATABASE_URL"
        value = digitalocean_database_cluster.rra_postgres.uri
        type  = "SECRET"
      }

      env {
        key   = "DATABASE_CERT"
        value = "$${rra-database.CA_CERT}"
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_CLIENT_ID"
        value = var.discord_client_id
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_CLIENT_SECRET"
        value = var.discord_client_secret
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_STATE"
        value = var.discord_state
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_BOT_TOKEN"
        value = var.discord_bot_token
        type  = "SECRET"
      }

      env {
        key   = "DISCORD_CORE_SERVER_ID"
        value = var.discord_core_server_id
        type  = "SECRET"
      }

      env {
        key   = "DO_SPACES_SECRET_KEY"
        value = digitalocean_spaces_key.rra_app.secret_key
        type  = "SECRET"
      }

      env {
        key   = "DO_SPACES_ACCESS_ID"
        value = digitalocean_spaces_key.rra_app.access_key
        type  = "SECRET"
      }

      env {
        key   = "DO_SPACES_BUCKET_NAME"
        value = digitalocean_spaces_bucket.rra.name
        type  = "SECRET"
      }

      env {
        key   = "DO_SPACES_ENDPOINT"
        value = digitalocean_spaces_bucket.rra.endpoint
        type  = "SECRET"
      }
    }

    database {
      name         = "rra-database"
      cluster_name = digitalocean_database_cluster.rra_postgres.name
      db_name      = "defaultdb"
      db_user      = "doadmin"
      engine       = "PG"
      production   = true
    }
  }
}
