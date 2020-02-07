import {Configuration} from '../types/Configuration';


class ConfigurationService {

  private configuration: Configuration | undefined;

  async getConfiguration(): Promise<Configuration> {
    if (this.configuration === undefined) {
      const response = await fetch(`${this.getServerUrl()}/config`);
      this.configuration = await response.json();
    }
    return this.configuration!;
  }

  getServerUrl(): string {
    const localServerUrl = 'http://localhost:5001';
    return process.env.REACT_APP_ENV === 'dev' ? localServerUrl : '';
  }
}
export default ConfigurationService;