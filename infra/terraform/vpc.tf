# https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs/resources/vpc
resource "digitalocean_vpc" "rra_vpc" {
  name   = "rra-network"
  region = var.do_region
}
