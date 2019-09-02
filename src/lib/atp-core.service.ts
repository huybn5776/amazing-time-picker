import { Injectable } from '@angular/core';

import { ITime } from './definitions';
import { ClockObject } from './entity/clock-object';

@Injectable()
export class AtpCoreService {

  constructor() { }

  public getAllowedTimes(min, max): string[] {
    const allTimes = [];
    const nowMinHour = +min.split(':')[0];
    const nowMaxHour = +max.split(':')[0];
    const nowMinMin = +min.split(':')[1];
    const nowMaxMin = +max.split(':')[1];
    for (let i = nowMinHour; i <= nowMaxHour; i++) {
      let j = 0,
        jDest = 59;
      if (i === nowMinHour) {
        j = nowMinMin;
      } else if (i === nowMaxHour) {
        jDest = nowMaxMin;
      }
      for (j; j <= jDest; j++) {
        const hour = i <= 12 ? i : i - 12;
        const minute = j;
        const ampm = i < 12 ? 'AM' : 'PM';
        allTimes.push(hour + ':' + minute + ' ' + ampm);
      }
    }
    return allTimes;
  }

  public clockMaker(type: 'minute' | 'hour'): ClockObject[] {
    const items: ClockObject[] = [];
    const timeVal = (type === 'minute') ? 60 : 12;
    const timeStep = (type === 'minute') ? 5 : 1;
    const timeStart = (type === 'minute') ? 0 : 1;
    const r = 124;
    const j = r - 25;

    for (let min = timeStart; min <= timeVal; min += timeStep) {
      if (min !== 60) {
        const str = String(min);
        const x = j * Math.sin(Math.PI * 2 * (min / timeVal));
        const y = j * Math.cos(Math.PI * 2 * (min / timeVal));

        items.push({
          time: str,
          left: (x + r - 17) + 'px',
          top: (-y + r - 17) + 'px',
          type
        });
      }
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
