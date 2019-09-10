import { ApplicationRef, Component, ComponentRef, HostListener, OnInit } from '@angular/core';
import { Subject } from 'rxjs';

import { IClockNumber, IDisplayPreference, TimeObject, TimePickerConfig } from '../definitions';
import { AtpCoreService } from '../atp-core.service';
import { ClockObject } from '../entity/clock-object';

@Component({
  selector: 'atp-time-picker',
  templateUrl: './time-picker.component.html',
  styleUrls: ['./time-picker.component.scss']
})
export class TimePickerComponent implements OnInit {

  _ref: ComponentRef<TimePickerComponent>;
  public valueChange: Subject<string>;
  public activeModal = false;
  public clockObject: ClockObject[];
  public isClicked: boolean;
  public clockType: 'minute' | 'hour' = 'hour';
  public timeObject: TimeObject = {
    ampm: 'AM',
    minute: 0,
    hour: 12,
    time: '12:00',
  };
  public nowTime: number = this.timeObject.hour;
  public degree: number;
  public config: TimePickerConfig;
  public appRef: ApplicationRef;
  public isPopup = true;
  public allowedTimes: string[];
  public preference: IDisplayPreference;
  public changeToMin: boolean;

  private animationTime = 0;

  constructor(
    private core: AtpCoreService
  ) { }

  public ParseStringToTime(time: string): void {
    const newTime = (time === '' || time === undefined || time === null) ? this.timeObject.hour + ':' + this.timeObject.minute : time;
    this.timeObject = this.core.stringToTime(newTime);
  }

  clockMaker() {
    const type = this.clockType;
    this.clockObject = this.core.clockMaker(type, this.getHour(), this.timeObject.ampm, this.allowedTimes);
    this.setArrow();
  }

  setActiveTime() {
    this.nowTime = (this.clockType === 'minute' ? this.timeObject.minute : this.timeObject.hour);
  }

  setArrow() {
    const step = (this.clockType === 'minute') ? 6 : 30;
    const time = (this.clockType === 'minute') ? this.timeObject.minute : this.timeObject.hour;
    const degrees = time * step;
    this.rotationClass(degrees);
    this.setActiveTime();
  }

  rotationClass(degrees: number) {
    this.degree = degrees;
  }

  onTimeSelect() {
    this.isClicked = false;
    if (this.config.closeWhenSelected && (this.config.onlyHour || this.clockType === 'minute')) {
      this.getTimeAndClose();
    } else if (this.config.changeToMinutes && !this.config.onlyHour && this.clockType === 'hour') {
      this.changeAnimation('minute');
    }
  }

  getDegree(event: MouseEvent | TouchEvent) {
    const step = this.clockType === 'minute' ? 6 * this.config.minuteGap : 30;
    const parentRect = (<HTMLElement> event.currentTarget).getBoundingClientRect();
    if (this.isClicked && (event.currentTarget === event.target || (<HTMLElement> event.target).nodeName === 'BUTTON')) {
      const x = event instanceof MouseEvent ? event.clientX : event.changedTouches[0].clientX;
      const y = event instanceof MouseEvent ? event.clientY : event.changedTouches[0].clientY;
      const degrees = this.core.calcDegrees(<HTMLElement> event.currentTarget, x, y, parentRect, step);
      let hour = this.timeObject.hour;
      let minute = this.timeObject.minute;

      if (this.clockType === 'hour') {
        hour = (degrees / step);
        hour = (hour > 12) ? hour - 12 : hour;
      } else if (this.clockType === 'minute') {
        minute = (degrees / step) * this.config.minuteGap;
        minute = (minute > 59) ? minute - 60 : minute;
      }
      hour = this.timeObject.ampm === 'AM' && hour === 12 ? 0 : hour;

      const min = this.config.rangeTime.start;
      const max = this.config.rangeTime.end;

      const nowMinHour = +min.split(':')[0] < 12 ? +min.split(':')[0] : +min.split(':')[0] - 12;
      const nowMaxHour = +max.split(':')[0] < 12 ? +max.split(':')[0] : +max.split(':')[0] - 12;
      const nowMinMin = +min.split(':')[1];
      const nowMaxMin = +max.split(':')[1];

      const nowTime = this.getTimeString(hour, minute, this.timeObject.ampm);
      if (this.allowedTimes.includes(nowTime)) {
        this.timeObject.hour = hour;
        this.timeObject.minute = minute;
        this.rotationClass(degrees);
        this.setActiveTime();
      } else if (this.clockType === 'hour' && (hour === nowMinHour && minute <= nowMinMin)) {
        this.timeObject.hour = nowMinHour;
        this.timeObject.minute = nowMinMin;
      } else if (this.clockType === 'hour' && (hour === nowMaxHour && minute >= nowMaxMin)) {
        this.timeObject.hour = nowMaxHour;
        this.timeObject.minute = nowMaxMin;
      }
    }
  }

  checkBet() {
    const nowTime = this.getTimeString(this.timeObject.hour, this.timeObject.minute, this.timeObject.ampm);
    if (this.allowedTimes.indexOf(nowTime) === -1) {
      this.ParseStringToTime(this.config.rangeTime.start);
      this.setArrow();
      this.setActiveTime();
    }
  }

  modalAnimation() {
    setTimeout(() => {
      this.activeModal = true;
    }, 1);
  }

  ngOnInit() {
    this.allowedTimes = this.core.getAllowedTimes(this.config);
    if (this.config && this.config.onlyMinute) {
      this.clockType = 'minute';
    }
    if (this.config) {
      if (this.config.onlyPM) {
        this.timeObject.ampm = 'PM';
      } else if (this.config.onlyAM) {
        this.timeObject.ampm = 'AM';
      }
    }
    this.clockMaker();
    this.modalAnimation();
  }

  public minuteTabClick() {
    /**
     * We are not permitting user to select the minute.
     * but anyway, it will return the standard time, if provided the default time.
     */
    if (this.config && this.config.onlyHour) {
      return false;
    }

    this.changeAnimation('minute');
  }

  public hourTabClick() {
    /**
     * We are not permitting user to select the minute.
     * but anyway, it will return the standard time, if provided the default time.
     */
    if (this.config && this.config.onlyMinute) {
      return false;
    }
    this.changeAnimation('hour');
  }

  changeAnimation(type: 'minute' | 'hour') {
    if (this.clockType !== type) {
      if (this.config.animation === 'fade') {
        this.changeToMin = true;
        setTimeout(() => {
          this.changeToMin = false;
          this.clockType = type;
          this.clockMaker();
        }, 200);
      } else if (this.config.animation === 'rotate') {
        this.animationTime = 0.4;
        this.clockType = type;
        this.clockMaker();
      } else {
        this.clockType = type;
        this.clockMaker();
      }
    }
  }

  setAM() {
    if (this.config && this.config.onlyPM) {
      return false;
    }
    this.timeObject.ampm = 'AM';
    this.checkBet();
  }

  setPM() {
    if (this.config && this.config.onlyAM) {
      return false;
    }
    this.timeObject.ampm = 'PM';
    this.checkBet();
  }

  getTimeAndClose(event?: MouseEvent) {
    this.timeObject.time = this.core.timeToString(this.timeObject);
    this.valueChange.next(this.timeObject.time);
    this.close(event);
  }

  close(event?: MouseEvent) {
    if (event && event.target !== event.currentTarget) {
      return;
    }
    this.closePopup();
  }

  @HostListener('document:keydown.escape', ['$event'])
  closePopup() {
    if (this.isPopup) {
      this.activeModal = false;
      setTimeout(() => {
        this.appRef.detachView(this._ref.hostView);
        this._ref.destroy();
      }, 400);
    }
  }

  getClockArrowStyle() {
    let arrowStyle = {};
    if (this.config.animation === 'rotate') {
      arrowStyle = {
        transform: 'rotate(' + this.degree + 'deg)',
        '-webkit-transform': 'rotate(' + this.degree + 'deg)',
        background: this.config.arrowStyle.background,
        '-webkit-transition': 'transform ' + this.getAnimationTime(),
        transition: 'transform ' + +this.getAnimationTime()
      };
    } else {
      arrowStyle = {
        transform: 'rotate(' + this.degree + 'deg)',
        '-webkit-transform': 'rotate(' + this.degree + 'deg)',
        background: this.config.arrowStyle.background,
      };
    }
    return arrowStyle;
  }

  getAnimationTime() {
    return this.animationTime + 's';
  }

  /**
   * Event on clock mouse click down
   * @param event - captured event
   */
  updateClockDown(event: MouseEvent | TouchEvent) {
    this.isClicked = true;
    this.animationTime = 0;
    this.getDegree(event);
  }

  public getSeparator() {
    if (this.preference && this.preference.separator) {
      return this.preference.separator;
    }
    return ':';
  }

  public getPeriod(period: 'AM' | 'PM') {
    if (this.preference && this.preference.period) {
      return this.preference.period(period);
    }
    return period;
  }

  public getMinute() {
    if (this.preference && this.preference.minute) {
      return this.preference.minute(this.timeObject.minute);
    }
    let min: string = this.timeObject.minute.toString();
    if (+min < 10) {
      min = '0' + min;
    }
    return min;
  }

  public getHour() {
    if (this.preference && this.preference.hour) {
      return this.preference.hour(this.timeObject.hour);
    }
    return this.timeObject.hour;
  }

  public getClockTime(clock: IClockNumber) {
    if (!this.preference) {
      return clock.time;
    }
    if (this.clockType === 'hour' && this.preference.clockHour) {
      return this.preference.clockHour(clock.time);
    }
    if (this.clockType === 'minute' && this.preference.clockMinute) {
      return this.preference.clockMinute(clock.time);
    }
    return clock.time;
  }

  public getLabel(key: string) {
    const defaults = {
      'ok': 'Ok',
      'cancel': 'Cancel'
    };
    if ((this.preference && this.preference.labels && this.preference.labels.ok)) {
      defaults.ok = this.preference.labels.ok;
    }
    if ((this.preference && this.preference.labels && this.preference.labels.cancel)) {
      defaults.cancel = this.preference.labels.cancel;
    }
    return defaults[key];
  }

  private getTimeString(hour: number, minute: number, ampm: 'AM' | 'PM'): string {
    return `${hour}:${minute} ${ampm}`;
  }

// tslint:disable-next-line:max-file-line-count
}
