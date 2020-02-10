variable "stage" {
  default = "DEV"
}

variable "prefix" {
  default = "windfarm"
}

variable "default_tags" {
  default = {
    environment = "dev"
    contact     = "yannick.streit@zuehlke.com"
    autodeploy  = true
  }
}
