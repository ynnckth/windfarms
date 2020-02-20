# Terraform Azure Infrastructure

The Terraform state is managed in Terraform Cloud:
https://app.terraform.io/

Login with Azure CLI:
> `$ az login`

Make sure you selected the right account and subscription.

Setup terraform cloud config:
```
.terraformrc

credentials "app.terraform.io" {
  token = "..."
}
```

> `export TF_CLI_CONFIG_FILE=/.../windfarm/Infrastructure/.terraformrc`

Initialize workspace:
> `$ terraform init`

Plan run:
> `$ terraform plan`

Apply run:
> `$ terraform apply`