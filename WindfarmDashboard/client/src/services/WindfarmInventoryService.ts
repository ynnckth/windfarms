import {Windfarm} from '../types/Windfarm';
import ConfigurationService from './ConfigurationService';


class WindfarmInventoryService {

  constructor(private configurationService: ConfigurationService) {
  }

  async getWindfarms(): Promise<Windfarm[]> {
    const config = await this.configurationService.getConfiguration();
    const response = await fetch(`${config.windfarmInventory.baseUrl}/api/windfarms`);
    return await response.json();
  }

  async getWindfarm(id: string): Promise<Windfarm> {
    const config = await this.configurationService.getConfiguration();
    const response = await fetch(`${config.windfarmInventory.baseUrl}/api/windfarms/${id}`);
    return await response.json();
  }
}
export default WindfarmInventoryService;


