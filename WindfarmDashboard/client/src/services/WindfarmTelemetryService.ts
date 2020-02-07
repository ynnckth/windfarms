import io from 'socket.io-client';
import ConfigurationService from './ConfigurationService';

class WindfarmTelemetryService {

  private _telemetryStream: SocketIOClient.Socket | undefined;

  constructor(private configurationService: ConfigurationService) {
  }

  async connect() {
    const config = await this.configurationService.getConfiguration();
    this._telemetryStream = io(config.windfarmTelemetry.baseUrl, {transports: ['websocket'], upgrade: false});
  }

  get telemetryStream(): SocketIOClient.Socket | undefined {
    return this._telemetryStream;
  }
}
export default WindfarmTelemetryService;