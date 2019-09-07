import { Observable } from 'rxjs';

export interface TimePickerConfig {
  time?: string;
  theme?:
    | 'dark'
    | 'light'
    | 'material-red'
    | 'material-green'
    | 'material-blue'
    | 'material-purple'
    | 'material-orange';
  rangeTime?: RangeTime;
  arrowStyle?: Pallete;
  locale?: string;
  preference?: IDisplayPreference;
  changeToMinutes?: boolean;
  animation?: 'fade' | 'rotate' | false;
  minuteGap?: number;
  onlyHour?: boolean;
  onlyMinute?: boolean;
  onlyAM?: boolean;
  onlyPM?: boolean;
  only12h?: boolean;
  closeWhenSelected?: boolean;
}

export interface RangeTime {
  start: string;
  end: string;
}

export interface Pallete {
  background?: string;
  color?: string;
}

export interface IDialogResult {
  afterClose(): Observable<string>;
}

export interface IClockNumber {
  time: String;
  left: string;
  top: string;
  type: String;
}

export interface IDisplayPreference {
  minute?: Function;
  hour?: Function;
  separator?: string;
  labels?: {
    ok?: string;
    cancel?: string;
  };

  period?(period: 'AM' | 'PM');

  clockMinute?(minute: any);

  clockHour?(hour: any);
}

export interface TimeObject {
  minute: number;
  hour: number; // 1 ~ 12
  ampm: 'AM' | 'PM';
  time?: string; // 00:00 ~ 23:59
}
