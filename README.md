# Windfarms

*Microservices playground based on a wind farm example*

Start all services:
> `$ docker-compose up`

### Development

Install all three projects:
- WindfarmDashboard
- WindfarmInventory
- WindfarmTelemetry

Check each project's README for how to proceed.


## Deployment

Get the windfarm Azure container registry parameters from the Azure portal.

```shell script
export WINDFARM_ACR_USERNAME=...
export WINDFARM_ACR_URL=...
```

```shell script
# Login to windfarm Azure container registry
$ docker login -u $WINDFARM_ACR_USERNAME $WINDFARM_ACR_URL

# Build and push the docker images for each component
$ docker build -t $WINDFARM_ACR_URL/windfarm/<dashboard | inventory | telemetry>:latest <WindfarmDashboard | WindfarmInventory | WindfarmTelemetry>/

# Example: 
$ docker build -t $WINDFARM_ACR_URL/windfarm/dashboard:latest WindfarmDashboard

# Push to container registry:
$ docker push $WINDFARM_ACR_URL/windfarm/<dashboard | inventory | telemetry>:latest

# Tag and push RabbitMQ broker
$ docker tag rabbitmq:3-management $WINDFARM_ACR_URL/windfarm/broker:latest
$ docker push $WINDFARM_ACR_URL/windfarm/broker:latest 



# Example: 
$ docker push $WINDFARM_ACR_URL/windfarm/dashboard:latest
```

### Static website hosting for Dashboard SPA

Enable static website hosting on the storage account.
This will create a storage container called *$web*.

Upload your static frontend files (output of build task and a config file) into the storage container and access it through the configured endpoint of the storage account.

```
$ cd WindfarmDashboard/client

$ npm run build
```