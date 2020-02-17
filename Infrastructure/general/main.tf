terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "Windfarm"

    workspaces {
      name = "windfarm-general"
    }
  }
}

provider "azurerm" {
  version = "1.31.0"
}

resource "azurerm_resource_group" "rg" {
  name = "WINDFARM_GENERAL"
  location = "westeurope"
}

resource "azurerm_container_registry" "azure-container-registry" {
  name = "windfarmacr"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  sku = "Standard"
  admin_enabled = true
}
