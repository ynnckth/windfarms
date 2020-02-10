# Windfarm

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

```
export WINDFARM_ACR_USERNAME=...
export WINDFARM_ACR_URL=...
```

Login to windfarm Azure container registry:
> `$ docker login -u $WINDFARM_ACR_USERNAME $WINDFARM_ACR_URL`

Build and push images for each component:
> `$ docker build -t $WINDFARM_ACR_URL/windfarm/<dashboard | inventory | telemetry>:latest <WindfarmDashboard | WindfarmInventory | WindfarmTelemetry>/`

> `$ docker push $WINDFARM_ACR_URL/windfarm/<dashboard | inventory | telemetry>:latest`