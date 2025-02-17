import { Injectable, Injector, ApplicationRef, ComponentFactoryResolver, EmbeddedViewRef } from '@angular/core';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { TimePickerConfig, IDialogResult } from './definitions';

// We need to import like this, because of backward compatibility of angular
/* tslint:disable */
import { Subject } from 'rxjs';
/* tslint:enable */
import { Preference } from './preferences';

@Injectable()
export class AmazingTimePickerService {

  constructor(
    private resolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector
  ) {}

  open(pickerConfig?: TimePickerConfig): IDialogResult {
    const thems = ['light', 'dark', 'material-red', 'material-green', 'material-blue', 'material-purple', 'material-orange'];
    let config: TimePickerConfig = pickerConfig || {};
    config = {
      time: config.time || '00:00',
      theme: thems.indexOf(config.theme) > 0 ? config.theme : 'light' || config.theme || 'light',
      rangeTime: config.rangeTime || {start: '0:0', end: '24:0'},
      arrowStyle: config.arrowStyle || {},
      locale: config.locale || 'en',
      changeToMinutes: config.changeToMinutes,
      animation: (config.animation == null || config.animation === 'fade') ? 'fade' : (config.animation === 'rotate') ? 'rotate' : false,
      preference: config.preference || null,
      minuteGap: Math.min(60, Math.max(1, config.minuteGap || 1)),
      onlyHour: config.onlyHour,
      onlyMinute: config.onlyMinute,
      onlyAM: config.onlyAM,
      onlyPM: config.onlyPM,
      only12h: config.only12h,
      closeWhenSelected: config.closeWhenSelected,
    } as TimePickerConfig;
    config.rangeTime = {
      start: config.rangeTime.start || '0:0',
      end: config.rangeTime.end || '24:0',
    };
    config.arrowStyle = {
      background: (config.arrowStyle.background) ?
        config.arrowStyle.background : config.theme !== undefined ?
          config.theme === 'dark' ? 'rgb(128, 203, 196)' : '' : '',
      color: config.arrowStyle.color || ''
    };
    const componentRef = this.resolver.resolveComponentFactory(TimePickerComponent);
    const tsc = componentRef.create(this.injector);
    this.appRef.attachView(tsc.hostView);
    const domElem = (tsc.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);
    tsc.instance.valueChange = new Subject<string>();
    tsc.instance._ref = tsc;
    tsc.instance.appRef = this.appRef;
    tsc.instance.config = config;
    if (config.preference) {
      tsc.instance.preference = config.preference;
    } else {
      tsc.instance.preference = Preference(config.locale);
    }
    tsc.instance.ParseStringToTime(config.time);
    return {
      afterClose: function() {
        return tsc.instance.valueChange.asObservable();
      }
    };
  }
}
