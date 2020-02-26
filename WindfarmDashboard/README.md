# Windfarm Dashboard

**Dashboard providing information about windfarms in the inventory** 

Build:
> `$ docker build -t windfarm-dashboard .`

Run:
> `$ docker run -p 5001:5001 
>   -e INVENTORY_URL=... 
>   -e MESSAGE_BROKER_HOST=...
>   -e MESSAGE_BROKER_USERNAME=... 
>   -e MESSAGE_BROKER_PASSWORD=... 
> windfarm-dashboard`
>
> http://localhost:5001