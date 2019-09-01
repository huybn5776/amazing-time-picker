import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimePickerComponent } from './time-picker/time-picker.component';
import { AmazingTimePickerService } from './atp-time-picker.service';
import { AtpDirective } from './atp.directive';
import { AtpCoreService } from './atp-core.service';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    TimePickerComponent,
    AtpDirective
  ],
  providers: [
    AmazingTimePickerService,
    AtpCoreService
  ],
  entryComponents: [TimePickerComponent],
  exports: [
    TimePickerComponent,
    AtpDirective
  ]
})
export class AmazingTimePickerModule { }
