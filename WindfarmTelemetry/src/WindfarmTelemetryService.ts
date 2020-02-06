import {Socket} from 'socket.io';
import {WindfarmTelemetry} from 'WindfarmTelemetry';
import {config} from './Config';
import * as faker from 'faker';


class WindfarmTelemetryService {

  constructor(private io: Socket) {
    this.sendWindfarmTelemetry = this.sendWindfarmTelemetry.bind(this);
  }

  public sendWindfarmTelemetry() {
    this.io.emit('windfarm_telemetry', this.collectWindfarmTelemetry());
  }

  private collectWindfarmTelemetry(): WindfarmTelemetry {
    return {
      windfarmId: config.windfarm.id,
      speed: faker.random.number({'min': config.minSpeed, 'max': config.maxSpeed}),
      temperature: faker.random.number({'min': config.minTemperature, 'max': config.maxTemperature}),
    }
  }
}
export default WindfarmTelemetryService;