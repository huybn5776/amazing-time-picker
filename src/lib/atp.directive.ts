import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AmazingTimePickerService } from './atp-time-picker.service';
import { IDisplayPreference, TimeObject, Pallete, RangeTime, TimePickerConfig } from './definitions';
import { AtpCoreService } from './atp-core.service';

@Directive({
  selector: 'input[amzTimePicker]',
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: AtpDirective,
    multi: true
  }]
})
export class AtpDirective implements ControlValueAccessor {

  @Input() time: string;
  @Input() theme: 'dark' | 'light' | 'material-red' | 'material-green' | 'material-blue' | 'material-purple' | 'material-orange';
  @Input() timeStart: string;
  @Input() timeEnd: string;
  @Input() rangeTime: RangeTime;
  @Input() arrowStyle: Pallete;
  @Input() locale: string;
  @Input() preference: IDisplayPreference;
  @Input() changeToMinutes: boolean;
  @Input() animation: 'fade' | 'rotate' | false;
  @Input() minuteGap: number;
  @Input() onlyHour: boolean;
  @Input() onlyMinute: boolean;
  @Input() onlyAM: boolean;
  @Input() onlyPM: boolean;
  @Input() only12h: boolean;
  @Input() closeWhenSelected: boolean;
  @Input() displayIn24h: boolean;

  timeObject: TimeObject;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly timePickerService: AmazingTimePickerService,
    private readonly coreService: AtpCoreService,
  ) { }

  @HostListener('click')
  onClick() {
    const config: TimePickerConfig = {
      time: this.time || this.elementRef.nativeElement.value,
      theme: this.theme,
      rangeTime: this.rangeTime || {start: this.timeStart, end: this.timeEnd},
      arrowStyle: this.arrowStyle,
      locale: this.locale,
      changeToMinutes: this.changeToMinutes === undefined ? true : this.changeToMinutes,
      animation: this.animation,
      minuteGap: this.minuteGap,
      onlyHour: this.onlyHour,
      onlyMinute: this.onlyMinute,
      onlyAM: this.onlyAM,
      onlyPM: this.onlyPM,
      only12h: this.only12h,
      closeWhenSelected: this.closeWhenSelected,
      preference: this.preference,
    };
    this.timePickerService.open(config)
      .afterClose()
      .subscribe(retTime => {
        this.writeValue(retTime);
        this.onChange(retTime); // update the form value (if there's a form)
      });
  }

  @HostListener('input')
  onInput() {
    this.resolveTime(this.elementRef.nativeElement.value);
  }

  writeValue(value: string) {
    this.resolveTime(value);
    if (this.elementRef) {
      this.elementRef.nativeElement.value = this.getDisplayTime(this.timeObject);
    }
  }

  registerOnChange(fn) {
    this.onChange = fn;
  }

  registerOnTouched(fn) { }

  private resolveTime(value: string) {
    const timeObject = this.coreService.stringToTime(value);
    if (timeObject) {
      this.timeObject = timeObject;
      this.onChange(timeObject.time);
    }
  }

  private getDisplayTime(timeObject: TimeObject) {
    let displayHour = timeObject.hour;
    let suffix: string;
    if (this.displayIn24h) {
      displayHour += timeObject.ampm === 'PM' ? 12 : 0;
    } else if (!this.only12h) {
      suffix = timeObject.ampm;
    }
    const hourStr = displayHour.toString().padStart(2, '0');
    const minuteStr = timeObject.minute.toString().padStart(2, '0');
    return `${hourStr}:${minuteStr}` + (suffix ? ' ' + suffix : '');
  }

  private onChange = (_): void => {};
}
