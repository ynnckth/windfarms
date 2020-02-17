terraform {
  backend "remote" {
    hostname = "app.terraform.io"
    organization = "Windfarm"

    workspaces {
      name = "windfarm-dev"
    }
  }
}

provider "azurerm" {
  version = "1.35.0"
}

locals {
  stagedname = lower("${var.prefix}-${var.stage}")
  location = "westeurope"
}

data "azurerm_container_registry" "azure-container-registry" {
  name = "windfarmacr"
  resource_group_name = "WINDFARM_GENERAL"
}

resource "azurerm_resource_group" "rg" {
  name = "WINDFARM_DEV"
  location = local.location
}


resource "azurerm_app_service_plan" "webapp_service_plan" {
  name = "${local.stagedname}-webapp-serviceplan"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  kind = "Linux"
  reserved = true

  sku {
    tier = "Standard"
    size = "S1"
  }
}

resource "azurerm_app_service" "telemetry" {
  name = "${local.stagedname}-telemetry"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.webapp_service_plan.id
  https_only = true

  site_config {
    app_command_line = ""
    linux_fx_version = "DOCKER|${data.azurerm_container_registry.azure-container-registry.login_server}/windfarm/telemetry:latest"
    always_on = "true"
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    WEBSITE_HTTPLOGGING_RETENTION_DAYS = 5

    DOCKER_REGISTRY_SERVER_URL = data.azurerm_container_registry.azure-container-registry.login_server
    DOCKER_REGISTRY_SERVER_USERNAME = data.azurerm_container_registry.azure-container-registry.admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD = data.azurerm_container_registry.azure-container-registry.admin_password

    WINDFARM_ID="windfarm-001-11e9-8bad-9b1deb4d3b7d"
  }

  # ignore lifecyle
  lifecycle {
    ignore_changes = [
      "app_settings.DOCKER_CUSTOM_IMAGE_NAME",
      "site_config[0].linux_fx_version",
      "site_config[0].scm_type",
    ]
  }
}

resource "azurerm_app_service" "inventory" {
  name = "${local.stagedname}-inventory"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.webapp_service_plan.id
  https_only = true

  site_config {
    app_command_line = ""
    linux_fx_version = "DOCKER|${data.azurerm_container_registry.azure-container-registry.login_server}/windfarm/inventory:latest"
    always_on = "true"
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    WEBSITE_HTTPLOGGING_RETENTION_DAYS = 5

    DOCKER_REGISTRY_SERVER_URL = data.azurerm_container_registry.azure-container-registry.login_server
    DOCKER_REGISTRY_SERVER_USERNAME = data.azurerm_container_registry.azure-container-registry.admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD = data.azurerm_container_registry.azure-container-registry.admin_password
  }

  # ignore lifecyle
  lifecycle {
    ignore_changes = [
      "app_settings.DOCKER_CUSTOM_IMAGE_NAME",
      "site_config[0].linux_fx_version",
      "site_config[0].scm_type",
    ]
  }
}

resource "azurerm_app_service" "dashboard" {
  name = "${local.stagedname}-dashboard"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  app_service_plan_id = azurerm_app_service_plan.webapp_service_plan.id
  https_only = true

  site_config {
    app_command_line = ""
    linux_fx_version = "DOCKER|${data.azurerm_container_registry.azure-container-registry.login_server}/windfarm/dashboard:latest"
    always_on = "true"
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
    WEBSITE_HTTPLOGGING_RETENTION_DAYS = 5

    DOCKER_REGISTRY_SERVER_URL = data.azurerm_container_registry.azure-container-registry.login_server
    DOCKER_REGISTRY_SERVER_USERNAME = data.azurerm_container_registry.azure-container-registry.admin_username
    DOCKER_REGISTRY_SERVER_PASSWORD = data.azurerm_container_registry.azure-container-registry.admin_password

    WINDFARM_ID="windfarm-001-11e9-8bad-9b1deb4d3b7d"
    INVENTORY_URL="https://${azurerm_app_service.inventory.default_site_hostname}"
    TELEMETRY_URL="https://${azurerm_app_service.telemetry.default_site_hostname}"
  }

  # ignore lifecyle
  lifecycle {
    ignore_changes = [
      "app_settings.DOCKER_CUSTOM_IMAGE_NAME",
      "site_config[0].linux_fx_version",
      "site_config[0].scm_type",
    ]
  }
}

resource "azurerm_storage_account" "storage_account" {
  name = "windfarmstorage"
  resource_group_name = azurerm_resource_group.rg.name
  location = azurerm_resource_group.rg.location
  account_tier = "Standard"
  account_kind = "StorageV2"
  account_replication_type = "LRS"
  enable_https_traffic_only = true

  # TODO: setup static website hosting for storage account including storage container
//  provisioner "local-exec" {
//    command = "az storage blob service-properties update --account-name ${azurerm_storage_account.storage_account.name} --static-website  --index-document index.html --404-document 404.html"
//  }
}

resource "azurerm_cdn_profile" "cdn_profile" {
  name                = "${local.stagedname}-cdn-profile"
  location            = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  sku                 = "Standard_Microsoft"
}

# TODO: add and setup CDN endpoint to point to the contents of the blob storage
//resource "azurerm_cdn_endpoint" "cdn_endpoint" {
//  name                = "${local.stagedname}-cdn-endpoint"
//  profile_name        = azurerm_cdn_profile.cdn_profile.name
//  location            = azurerm_resource_group.rg.location
//  resource_group_name = azurerm_resource_group.rg.name
//
//  origin {
//    name      = "windframStorageEndpoint"
//    host_name = "windfarmstorage.blob.core.windows.net"
//  }
//}