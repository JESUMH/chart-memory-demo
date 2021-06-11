import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Configuration } from '../mock/configuration';
import lectures from '../mock/lectures_json.json';

@Injectable()
export class Services {
  constructor(private http: HttpClient) {}
  getGraphicConfiguration(id: number): any {
    return Configuration.configuration;
  }
  getGraphicRanges(id: number): any {
    return Configuration.ranges;
  }
  getLectures(
    initDate: number,
    endDate: string,
    batchId: number,
    serie: number
  ): any {
    return lectures;
  }
}
