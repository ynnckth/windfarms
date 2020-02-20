import {WindfarmTelemetry} from 'WindfarmTelemetry';
import {config} from './Config';
import * as faker from 'faker';
import {Channel, connect, Connection} from 'amqplib';


class WindfarmTelemetryService {

  private readonly EXCHANGE: string = 'amq.topic';
  private connection: Connection | undefined;
  private messageChannel: Channel | undefined;

  constructor() {
    this.sendTelemetry = this.sendTelemetry.bind(this);
  }

  public async connectToMessageBroker(): Promise<void> {
    this.connection = await connect(process.env.MESSAGE_BROKER_CONNECTION_STRING);
    this.messageChannel = await this.connection.createChannel();
  }

  public sendTelemetry(): void {
    const currentTelemetry = this.collectWindfarmTelemetry();
    this.messageChannel.publish(this.EXCHANGE, `${config.windfarm.id}.telemetry`, Buffer.from(JSON.stringify(currentTelemetry)));
    console.log('Sending telemetry', currentTelemetry);
  }

  private collectWindfarmTelemetry(): WindfarmTelemetry {
    return {
      windfarmId: config.windfarm.id,
      avgSpeed: faker.random.number({'min': config.minSpeed, 'max': config.maxSpeed}),
      avgTemperature: faker.random.number({'min': config.minTemperature, 'max': config.maxTemperature}),
    }
  }
}
export default WindfarmTelemetryService;