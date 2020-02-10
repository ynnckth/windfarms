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
  name = "winfarmacr"
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

resource "azurerm_application_insights" "app_insights" {
  name = "${local.stagedname}-app-insights"
  location = azurerm_resource_group.rg.location
  resource_group_name = azurerm_resource_group.rg.name
  application_type = "Web"
}