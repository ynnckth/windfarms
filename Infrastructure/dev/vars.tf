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

variable broker_vm {
  default = {
    credentials = {
      username = null
      password = null
    }

    rabbitmq = {
      username = null
      password = null
    }
  }
}