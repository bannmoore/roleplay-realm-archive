variable "auth_secret" {
  description = "The secret key for the auth service"
  type        = string
  sensitive   = true
}

variable "do_region" {
  type    = string
  default = "sfo3"
}

# app expects a slightly different slug
variable "do_app_region" {
  type    = string
  default = "sfo"
}

variable "do_token" {
  description = "Digital Ocean token"
  type        = string
  sensitive   = true
}

variable "do_spaces_access_id" {
  description = "Digital Ocean Spaces key access id"
  type        = string
  sensitive   = true
}

variable "do_spaces_secret_key" {
  description = "Digital Ocean Spaces key secret key"
  type        = string
  sensitive   = true
}

variable "jump_server_ssh_key" {
  description = "The public SSH key used to access the Jump Server"
  type        = string
  sensitive   = true
}

variable "jump_server_ssh_key_path" {
  description = "Path to the public SSH key used to access the Jump Server"
  type        = string
  default     = "~/.ssh/id_rsa_do_rra"
}

variable "jump_server_volume_name" {
  type    = string
  default = "rra-jump-server-volume"
}

variable "discord_client_id" {
  description = "Discord Client ID"
  type        = string
  sensitive   = true
}

variable "discord_client_secret" {
  description = "Discord Client Secret"
  type        = string
  sensitive   = true
}

variable "discord_state" {
  description = "Discord state string"
  type        = string
  sensitive   = true
}

variable "discord_bot_token" {
  description = "Discord Bot Access Token"
  type        = string
  sensitive   = true
}

variable "discord_core_server_id" {
  description = "Membership in the server with this id is required to authenticate"
  type        = string
  sensitive   = true
}
