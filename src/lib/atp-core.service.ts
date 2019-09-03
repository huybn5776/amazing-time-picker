import { Injectable } from '@angular/core';

import { ITime } from './definitions';
import { ClockObject } from './entity/clock-object';

@Injectable()
export class AtpCoreService {

  public getAllowedTimes(minTime: string, maxTime: string): string[] {
    const allowedTimes = [];
    const nowMinHour = +minTime.split(':')[0];
    const nowMaxHour = +maxTime.split(':')[0];
    const nowMinMin = +minTime.split(':')[1];
    const nowMaxMin = +maxTime.split(':')[1];

    for (let hour = nowMinHour; hour <= nowMaxHour; hour++) {
      const minuteFrom = hour === nowMinHour ? nowMinMin : 0;
      const minuteTo = hour === nowMaxHour ? nowMaxMin : 59;
      for (let minute = minuteFrom; minute <= minuteTo; minute++) {
        const ampm = hour < 12 ? 'AM' : 'PM';
        allowedTimes.push((hour <= 12 ? hour : hour - 12) + ':' + minute + ' ' + ampm);
      }
    }
    return allowedTimes;
  }

  public clockMaker(type: 'minute' | 'hour'): ClockObject[] {
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

      items.push({
        time: sign.toString(),
        left: (x + radius - fontSize) + 'px',
        top: (-y + radius - fontSize) + 'px',
        type,
      });
    }
    return items;
  }

  public timeToString(time: ITime): string {
    const {ampm, minute, hour} = time;
    let hh = ampm === 'PM' ? +hour + 12 : +hour;
    if (ampm === 'AM' && hh === 12) {
      hh = 0;
    }
    if (hh === 24) {
      hh = 12;
    }
    const hhStr = hh.toString().padStart(2, '0');
    const mmStr = minute.toString().padStart(2, '0');
    return `${hhStr}:${mmStr}`;
  }

  /**
   * Converts 00:00 format to ITime object
   */
  public stringToTime(time: string): ITime {
    const [h, m] = time.split(':');
    let hour = +h > 12 ? +h - 12 : +h;
    hour = hour === 0 ? 12 : hour;
    const ampm = +h >= 12 ? 'PM' : 'AM';
    return {
      ampm, minute: +m, hour
    };
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
