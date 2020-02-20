import {Client, MQTTError, Message} from 'paho-mqtt';
import uuid from 'uuid';
import {Subject, Observable} from 'rxjs';
import {WindfarmTelemetry} from '../types/WindfarmTelemetry';


class WindfarmTelemetryService {

  private client: Client | undefined;
  private readonly telemetry$: Subject<WindfarmTelemetry>;

  constructor() {
    this.telemetry$ = new Subject<WindfarmTelemetry>();
    this.handleMessageArrived = this.handleMessageArrived.bind(this);
    this.subscribeToWindfarmTelemetry = this.subscribeToWindfarmTelemetry.bind(this);
  }

  async connect(): Promise<void> {
    // TODO: set environment specific broker URL
    this.client = new Client('127.0.0.1', 15675, '/ws', uuid.v1().toString());
    this.client.onMessageArrived = this.handleMessageArrived;
    this.client.onConnectionLost = (error: MQTTError) => console.log('Lost connection to message broker: ', JSON.stringify(error));

    this.client.connect({
      keepAliveInterval: 1800 * 2, // TODO: fix overriding default of 60s without activity to 1h (probably on broker configuration side)
      onSuccess: () => {
        console.log('Connected to message broker');
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
}
export default WindfarmTelemetryService;