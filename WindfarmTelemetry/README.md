# Windfarm Telemetry

**Edge gateway of a single windfarm installation gathering and providing telemetry data** 

Install: 
> `$ npm install`

Run: 
> `$ WINDFARM_ID=... npm start`
> => http://localhost:5000

Docker build:
> `$ docker build -t windfarm-telemetry .`

Docker run:
> `$ docker run -p 5000:5000 -e WINDFARM_ID=... -e MESSAGE_BROKER_CONNECTION_STRING="" windfarm-telemetry`
> => http://localhost:5000