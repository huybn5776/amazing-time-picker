import { Injectable } from '@angular/core';

import { TimeObject, TimePickerConfig } from './definitions';
import { ClockObject } from './entity/clock-object';

@Injectable()
export class AtpCoreService {

  public getAllowedTimes(config: TimePickerConfig): string[] {
    const minTime = config.rangeTime.start;
    const maxTime = config.rangeTime.end;
    const allowedTimes = [];
    const nowMinHour = +minTime.split(':')[0];
    const nowMaxHour = +maxTime.split(':')[0];
    const nowMinMin = +minTime.split(':')[1];
    const nowMaxMin = +maxTime.split(':')[1];

    for (let hour = nowMinHour; hour <= nowMaxHour; hour++) {
      const minuteFrom = hour === nowMinHour ? nowMinMin : 0;
      const minuteTo = hour === nowMaxHour ? nowMaxMin : 59;
      for (let minute = minuteFrom; minute <= minuteTo; minute += config.minuteGap) {
        const ampm = hour < 12 ? 'AM' : 'PM';
        allowedTimes.push((hour <= 12 ? hour : hour - 12) + ':' + minute + ' ' + ampm);
      }
    }
    return allowedTimes;
  }

  public clockMaker(type: 'minute' | 'hour', hour: number, ampm: 'AM' | 'PM', allowedTimes: string[]): ClockObject[] {
    const items: ClockObject[] = [];
    const timeVal = (type === 'minute') ? 60 : 12;
    const timeStep = (type === 'minute') ? 5 : 1;
    const timeStart = (type === 'minute') ? 0 : 1;
    const radius = 124;
    const innerRadius = radius - 25;
    const fontSize = 17;

    for (let sign = timeStart; sign <= timeVal && sign !== 60; sign += timeStep) {
      const x = innerRadius * Math.sin(Math.PI * 2 * (sign / timeVal));
      const y = innerRadius * Math.cos(Math.PI * 2 * (sign / timeVal));

      let disabled = false;
      if (type === 'minute') {
        const realHour = ampm === 'AM' && hour === 12 ? 0 : hour;
        const time = `${realHour}:${sign} ${ampm}`;
        disabled = !allowedTimes.includes(time);
      } else {
        const realHour = ampm === 'AM' && sign === 12 ? 0 : sign;
        const allowedHours = allowedTimes.reduce((set, allowedTime) => set.add(+allowedTime.split(':')[0]), new Set());
        disabled = !allowedHours.has(realHour);
      }
      items.push({
        time: sign.toString(),
        left: (x + radius - fontSize) + 'px',
        top: (-y + radius - fontSize) + 'px',
        type,
        disabled,
      });
    }
    return items;
  }


  /**
   * Converts 00:00 format to TimeObject object
   */
  public stringToTime(time: string): TimeObject {
    const match = /(\d+)\s*:\s*(\d+)/g.exec(time);
    if (!(match && match[1] && match[2])) {
      return null;
    }
    let hour: number;
    let minute: number;
    hour = +match[1];
    minute = +match[2];
    hour = Math.min(23, hour);
    minute = Math.min(59, minute);
    const ampm = hour >= 12 || time.trim().toLowerCase().endsWith('pm') ? 'PM' : 'AM';
    const timeObject: TimeObject = {
      hour: hour === 12 ? 12 : hour % 12,
      minute,
      ampm
    };
    timeObject.time = this.timeToString(timeObject);
    return timeObject;
  }

  public timeToString(timeObject: TimeObject) {
    const hour = timeObject.hour + (timeObject.ampm === 'PM' ? 12 : 0);
    return `${hour.toString().padStart(2, '0')}:${timeObject.minute.toString().padStart(2, '0')}`;
  }

  /**
   * @experimental
   */
  public calcDegrees(event: MouseEvent, parentRect: ClientRect, step: number): number {
    const clock = {
      width: (<HTMLElement> event.currentTarget).offsetWidth,
      height: (<HTMLElement> event.currentTarget).offsetHeight,
    };
    const targetX = clock.width / 2;
    const targetY = clock.height / 2;
    const Vx = Math.round((event.clientX - parentRect.left) - targetX);
    const Vy = Math.round(targetY - (event.clientY - parentRect.top));
    let radians = -Math.atan2(Vy, Vx);
    radians += 2.5 * Math.PI;

    let degrees = Math.round(radians * 180 / Math.PI);
    const degMod = degrees % step;
    if (degMod === 0) {
      return degrees;
    } else if (degMod >= step / 2) {
      degrees = degrees + (step - degMod);
    } else if (degMod < step / 2) {
      degrees = degrees - degMod;
    }
    return degrees;
  }
}
