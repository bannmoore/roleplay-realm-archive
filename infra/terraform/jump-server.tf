# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/data-sources/ssh_key
resource "digitalocean_ssh_key" "rra_jump_server_ssh_key" {
  name       = "rra-jump-server-ssh-key"
  public_key = var.jump_server_ssh_key
}

# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/droplet
resource "digitalocean_droplet" "rra_jump_server" {
  name     = "rra-jump-server"
  image    = "ubuntu-25-04-x64" # https://docs.digitalocean.com/products/droplets/details/images/
  region   = var.do_region
  size     = "s-1vcpu-512mb-10gb"
  ssh_keys = [digitalocean_ssh_key.rra_jump_server_ssh_key.fingerprint]
  vpc_uuid = digitalocean_vpc.rra_vpc.id
}

# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/volume
# This volume will be available on the jump_server at /mnt/rra_jump_server_volume/ 
resource "digitalocean_volume" "rra_jump_server_volume" {
  name                    = var.jump_server_volume_name
  region                  = var.do_region
  size                    = 10
  initial_filesystem_type = "ext4"
  description             = "Jump server for database management"
}

# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/volume_attachment
resource "digitalocean_volume_attachment" "rra_jump_volume_attachment" {
  droplet_id = digitalocean_droplet.rra_jump_server.id
  volume_id  = digitalocean_volume.rra_jump_server_volume.id
}
