import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { AmazingTimePickerService } from './atp-time-picker.service';
import { IDisplayPreference, Pallete, RangeTime, TimePickerConfig } from './definitions';

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
  @Input() start: string;
  @Input() end: string;
  @Input() rangeTime: RangeTime;
  @Input() arrowStyle: Pallete;
  @Input() locale: string;
  @Input() preference: IDisplayPreference;
  @Input() changeToMinutes: boolean;
  @Input() animation: 'fade' | 'rotate' | false;
  @Input() onlyHour: boolean;
  @Input() onlyMinute: boolean;
  @Input() onlyAM: boolean;
  @Input() onlyPM: boolean;

  constructor(
    private readonly elementRef: ElementRef,
    private readonly atp: AmazingTimePickerService,
  ) { }

  @HostListener('click')
  onClick() {
    const config: TimePickerConfig = {
      time: this.time || this.elementRef.nativeElement.value,
      theme: this.theme,
      rangeTime: this.rangeTime || {start: this.start, end: this.end},
      arrowStyle: this.arrowStyle,
      locale: this.locale,
      changeToMinutes: this.changeToMinutes === undefined ? true : this.changeToMinutes,
      animation: this.animation,
      onlyHour: this.onlyHour,
      onlyMinute: this.onlyMinute,
      onlyAM: this.onlyAM,
      onlyPM: this.onlyPM,
      preference: this.preference,
    };
    this.atp.open(config)
      .afterClose()
      .subscribe(retTime => {
        this.writeValue(retTime); // update the native element
        this.onChange(retTime); // update the form value (if there's a form)
      });
  }

  @HostListener('input', ['$event'])
  onInput(event) {
    this.onChange(event.target.value);
  }

  writeValue(value: any) {
    if (this.elementRef) {
      this.elementRef.nativeElement.value = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChange = fn;
  }

  registerOnTouched(fn) { }

  private onChange = (_): void => {};
}
