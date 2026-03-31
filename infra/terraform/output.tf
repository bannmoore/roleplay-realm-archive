output "database_url" {
  sensitive = true
  value     = digitalocean_database_cluster.rra_postgres.uri
}

output "do_token" {
  sensitive = true
  value     = var.do_token
}

output "jump_server_ssh_key_path" {
  value = var.jump_server_ssh_key_path
}

output "jump_server_volume_path" {
  value = "/mnt/${replace(var.jump_server_volume_name, "-", "_")}"
}

output "jump_server_droplet_name" {
  value = digitalocean_droplet.rra_jump_server.name
}

output "jump_server_address" {
  value = digitalocean_droplet.rra_jump_server.ipv4_address
}
