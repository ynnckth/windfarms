import {Client, MQTTError, Message} from 'paho-mqtt';
import uuid from 'uuid';
import {Subject, Observable} from 'rxjs';
import {WindfarmTelemetry} from '../types/WindfarmTelemetry';
import ConfigurationService from './ConfigurationService';
import StateService from './StateService';


class WindfarmTelemetryService {

  private readonly CONNECTION_KEEP_ALIVE_INTERVAL = 20000;
  private readonly CLIENT_CONNECTION_ID: string;

  private client: Client | undefined;
  private readonly telemetry$: Subject<WindfarmTelemetry>;

  constructor(private configurationService: ConfigurationService, private stateService: StateService) {
    this.CLIENT_CONNECTION_ID = uuid.v1().toString();
    this.telemetry$ = new Subject<WindfarmTelemetry>();

    this.handleMessageArrived = this.handleMessageArrived.bind(this);
    this.subscribe = this.subscribe.bind(this);
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

  subscribe(windfarmId: string): void {
    if (!this.client) {
      console.log('Cannot subscribe to windfarm telemetry because client is undefined');
      return;
    }
    if (!this.client.isConnected()) {
      console.log('Cannot subscribe to windfarm telemetry while client is not connected');
      return;
    }
    if (this.stateService.selectedWindfarm?.id) {
      this.client?.unsubscribe(`${this.stateService.selectedWindfarm.id}/telemetry`);
      console.log('Unsubscribed telemetry of windfarm ', this.stateService.selectedWindfarm.id);
    }
    this.client?.subscribe(`${windfarmId}/telemetry`);
    console.log('Subscribed to telemetry of windfarm ', windfarmId);
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