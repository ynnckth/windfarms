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
    MESSAGE_BROKER_CONNECTION_STRING="amqp://${var.broker_vm.rabbitmq.username}:${var.broker_vm.rabbitmq.password}@${azurerm_public_ip.vm_public_ip.domain_name_label}.${azurerm_public_ip.vm_public_ip.location}.cloudapp.azure.com:5672",
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
  https_only = false  # TODO: only set to false because no SSL configured in rabbit

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

    INVENTORY_URL = "https://${azurerm_app_service.inventory.default_site_hostname}"
    MESSAGE_BROKER_HOST = "${azurerm_public_ip.vm_public_ip.domain_name_label}.${azurerm_public_ip.vm_public_ip.location}.cloudapp.azure.com"
    MESSAGE_BROKER_USERNAME = var.broker_vm.rabbitmq.username
    MESSAGE_BROKER_PASSWORD = var.broker_vm.rabbitmq.password
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
  enable_https_traffic_only = false   # TODO: only set to false because no SSL configured in rabbit

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


# Virtual machine running RabbitMQ broker
# TODO: extract into separate terraform module
resource "azurerm_virtual_network" "vnet" {
  name                = "${local.stagedname}-vnet"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name
  address_space       = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "subnet" {
  name                 = "${local.stagedname}-subnet"
  resource_group_name  = azurerm_resource_group.rg.name
  virtual_network_name = azurerm_virtual_network.vnet.name
  address_prefix       = "10.0.1.0/24"
}

resource "azurerm_public_ip" "vm_public_ip" {
  name                = "${local.stagedname}-brokervm-public-ip"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name
  allocation_method   = "Dynamic"
  domain_name_label   = "${local.stagedname}-brokervm"
}

resource "azurerm_network_security_group" "broker_nsg" {
  name                = "${local.stagedname}-brokervm-nsg"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name

  security_rule {
    name                       = "AllowInboundWebapp"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "443"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowInboundRabbitMQ"
    priority                   = 110
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "5672"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowInboundRabbitMQMgmtUI"
    priority                   = 120
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "15672"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }

  security_rule {
    name                       = "AllowInboundRabbitMQmqttoverws"
    priority                   = 130
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "15675"
    source_address_prefix      = "*"
    destination_address_prefix = "*"
  }
}

resource "azurerm_network_interface" "broker_netwok_interface" {
  name                = "${local.stagedname}-brokervm-network-interface"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name

  ip_configuration {
    name                          = "${local.stagedname}-brokervm-ipconfig"
    subnet_id                     = azurerm_subnet.subnet.id
    private_ip_address_allocation = "Dynamic"
    public_ip_address_id          = azurerm_public_ip.vm_public_ip.id
  }

  network_security_group_id = azurerm_network_security_group.broker_nsg.id
}

resource "azurerm_virtual_machine" "broker_vm" {
  name="${local.stagedname}-brokervm"
  location            = local.location
  resource_group_name = azurerm_resource_group.rg.name
  vm_size = "Standard_B2s" # see https://azure.microsoft.com/en-us/pricing/details/virtual-machines/linux/
  network_interface_ids = [azurerm_network_interface.broker_netwok_interface.id]

  delete_data_disks_on_termination = false
  delete_os_disk_on_termination    = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  storage_os_disk {
    name              = "${local.stagedname}-brokervm-disk"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Premium_LRS"
  }

  os_profile {
    computer_name  = "${local.stagedname}-brokervm"
    admin_username = var.broker_vm.credentials.username
    admin_password = var.broker_vm.credentials.password

    custom_data    = templatefile("${path.module}/cloud-init.tmpl", {
      vm_username = var.broker_vm.credentials.username
    })
  }

  os_profile_linux_config {
    disable_password_authentication = false
  }

  # necessary for serial console
  boot_diagnostics {
    enabled     = true
    storage_uri = azurerm_storage_account.storage_account.primary_blob_endpoint
  }
}