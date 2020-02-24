import React from 'react';
import './Header.css';
import {FormControl, InputLabel, MenuItem, Select, Theme, WithStyles, withStyles} from '@material-ui/core';
import {Windfarm} from '../../types/Windfarm';
import StateService from '../../services/StateService';
import logo from '../../assets/wind_mill_icon.png';


interface IProps extends WithStyles {
  windfarms?: Windfarm[];
  stateService: StateService;
}

const styles = (theme: Theme) => ({
  select: {
    color: 'white',
    width: '200px',
  },
});

const Header: React.FC<IProps> = (props: IProps) => {

  const {windfarms, stateService, classes} = props;
  const {selectedWindfarm} = stateService;

  const onSelectedWindfarm = (selectedWindfarmEvent: any) => {
    if (!windfarms) {
      console.log('Cannot select windfarms, no windfarms available');
      return;
    }
    const windfarm = windfarms.find(w => w.id === selectedWindfarmEvent.target.value);
    if (!windfarm) {
      console.log('Selected windfarm not found');
      return;
    }
    stateService.selectedWindfarm = windfarm;
  };

  return (
    <div className="header">
      <div className="left-header-content">
        <div className="title">Windfarm Dashboard</div>
        {windfarms &&
        <FormControl>
          {selectedWindfarm
            ? <InputLabel className={classes.select} id="select-label">Windfarm</InputLabel>
            : <InputLabel className={classes.select} id="select-label">Select windfarm</InputLabel>}

          <Select
            className={classes.select}
            style={{
              minWidth: '100px',
              maxWidth: '300px',
              color: 'white',
            }}
            labelId="select-label"
            value={selectedWindfarm?.id || ''}
            onChange={onSelectedWindfarm}>
            {windfarms.map(w => <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>)}
          </Select>
        </FormControl>}
      </div>
      <img src={logo} className="logo" alt="Logo"/>
    </div>
  );
};
export default withStyles(styles)(Header);