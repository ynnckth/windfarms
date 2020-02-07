# Windfarm Dashboard

**Dashboard providing information about windfarms in the inventory** 

Build:
> `$ docker build -t windfarm-dashboard .`

Run:
> `$ docker run -p 5001:5001 -e WINDFARM_ID=... -e INVENTORY_URL=... -e TELEMETRY_URL=... windfarm-dashboard`
> http://localhost:5001