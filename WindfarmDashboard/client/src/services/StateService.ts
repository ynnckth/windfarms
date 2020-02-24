import {Windfarm} from '../types/Windfarm';
import {Subject, Observable} from 'rxjs';


class StateService {

  private readonly selectedWindfarm$: Subject<Windfarm>;
  private _selectedWindfarm: Windfarm | undefined;

  constructor() {
    this.selectedWindfarm$ = new Subject<Windfarm>();
  }

  get selectedWindfarm(): Windfarm | undefined {
    return this._selectedWindfarm;
  }

  set selectedWindfarm(windfarm: Windfarm | undefined) {
    this.selectedWindfarm$.next(windfarm);
    this._selectedWindfarm = windfarm;
  }

  onSelectedWindfarm(): Observable<Windfarm> {
    return this.selectedWindfarm$.asObservable();
  }
}
export default StateService;