import {Client, MQTTError, Message} from 'paho-mqtt';
import uuid from 'uuid';
import {Subject, Observable} from 'rxjs';
import {WindfarmTelemetry} from '../types/WindfarmTelemetry';
import ConfigurationService from './ConfigurationService';


class WindfarmTelemetryService {

  private readonly CONNECTION_KEEP_ALIVE_INTERVAL = 20000;
  private readonly CLIENT_CONNECTION_ID: string;

  private client: Client | undefined;
  private readonly telemetry$: Subject<WindfarmTelemetry>;

  constructor(private configurationService: ConfigurationService) {
    this.CLIENT_CONNECTION_ID = uuid.v1().toString();
    this.telemetry$ = new Subject<WindfarmTelemetry>();
    this.handleMessageArrived = this.handleMessageArrived.bind(this);
    this.subscribeToWindfarmTelemetry = this.subscribeToWindfarmTelemetry.bind(this);
    this.sendConnectionKeepAliveMessage = this.sendConnectionKeepAliveMessage.bind(this);
  }

  async connect(): Promise<void> {
    const config = await this.configurationService.getConfiguration();
    this.client = new Client(config.messageBroker.host, config.messageBroker.port, '/ws', this.CLIENT_CONNECTION_ID);
    this.client.onMessageArrived = this.handleMessageArrived;
    this.client.onConnectionLost = (error: MQTTError) => console.log('Lost connection to message broker: ', JSON.stringify(error));

    this.client.connect({
      keepAliveInterval: 1800 * 2,
      onSuccess: () => {
        console.log('Connected to message broker');
        setInterval(() => {
          this.sendConnectionKeepAliveMessage();
        }, this.CONNECTION_KEEP_ALIVE_INTERVAL)
      }
    });
  }

  subscribeToWindfarmTelemetry(windfarmId: string): void {
    if (!this.client) {
      console.log('Error, cannot subscribe since client is undefined');
      return;
    }
    if (!this.client.isConnected()) {
      console.log('Cannot subscribe while client is not connected');
      // TODO: return or throw error
    }

    // TODO: remove timeout and provide fallback (retry)
    setTimeout(() => {
      if (this.client?.isConnected()) {
        this.client?.subscribe(`${windfarmId}/telemetry`);
        console.log('Subscribed to telemetry of windfarm ', windfarmId);
      }
    }, 3000);
  }

  onTelemetryMessage(): Observable<WindfarmTelemetry> {
    return this.telemetry$.asObservable();
  }

  private handleMessageArrived(message: Message): void {
    this.telemetry$.next(JSON.parse(message.payloadString) as WindfarmTelemetry);
  }

  private sendConnectionKeepAliveMessage(): void {
    const pingMessage = new Message(`keep alive client connection ${this.CLIENT_CONNECTION_ID}`);
    pingMessage.destinationName = 'keep_alive';
    this.client?.send(pingMessage);
    console.log('Sent connection keep alive message');
  }
}
export default WindfarmTelemetryService;