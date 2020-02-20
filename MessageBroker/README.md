# RabbitMQ Message Broker
*Message broker of the windfarm IoT platform*

### Local development 

Start local rabbitmq docker container:
> `$ docker run -it --rm --name rabbitmq -p 5672:5672 -p 15672:15672 -p 15675:15675 -v $PWD/config/enabled_plugins:/etc/rabbitmq/enabled_plugins rabbitmq:3-management`

Management UI:
> http://localhost:15672/#/

Default credentials: guest/guest


To test pub/sub go to broker management UI and check for an exchange called `amq.topic`.
From there you can publish messages using the routing key: `<windfarm id>.telemetry` which gets translated into a topic `<windfarm id>/telemetry`.