// This is a sample demo. Real project get data from backend system (about 100.000 data).

import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  AfterContentInit
} from '@angular/core';
import { VariableLectures } from './variableLectures';
import { RangeModel } from './range.model';
import { Services } from '../services/services';
import { ChangeDetectorRef } from '@angular/core';
import { Utils } from '../utils/utils';
import { timer } from 'rxjs';
import { EChartOption } from 'echarts';

@Component({
  selector: 'app-charts',
  templateUrl: './chart.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChartComponent implements OnInit, OnDestroy, AfterContentInit {
  private _chartOption: EChartOption;
  public get chartOption(): EChartOption {
    return this._chartOption;
  }
  public set chartOption(value: EChartOption) {
    this._chartOption = value;
  }
  private _echartsInstance: any;
  public get echartsInstance(): any {
    return this._echartsInstance;
  }
  public set echartsInstance(value: any) {
    this._echartsInstance = value;
  }
  private _ranges: Array<RangeModel> = new Array<RangeModel>();
  public get ranges(): Array<RangeModel> {
    return this._ranges;
  }
  public set ranges(value: Array<RangeModel>) {
    this._ranges = value;
  }
  private _selectedVariable: any = -1;
  public get selectedVariable(): any {
    return this._selectedVariable;
  }
  public set selectedVariable(value: any) {
    this._selectedVariable = value;
  }
  private _subscriptionTimer: any;
  public get subscriptionTimer(): any {
    return this._subscriptionTimer;
  }
  public set subscriptionTimer(value: any) {
    this._subscriptionTimer = value;
  }
  private _variableMap: Map<number, VariableLectures> = new Map<
    number,
    VariableLectures
  >();
  public get variableMap(): Map<number, VariableLectures> {
    return this._variableMap;
  }
  public set variableMap(value: Map<number, VariableLectures>) {
    this._variableMap = value;
  }
  private _timeValuesE: number[] = new Array<number>();
  public get timeValuesE(): number[] {
    return this._timeValuesE;
  }
  public set timeValuesE(value: number[]) {
    this._timeValuesE = value;
  }
  private _variableValuesE: Map<number, number[]> = new Map<number, number[]>();
  public get variableValuesE(): Map<number, number[]> {
    return this._variableValuesE;
  }
  public set variableValuesE(value: Map<number, number[]>) {
    this._variableValuesE = value;
  }

  private _zoomStart: number;
  public get zoomStart(): number {
    return this._zoomStart;
  }
  public set zoomStart(value: number) {
    this._zoomStart = value;
  }
  private _zoomEnd: number;
  public get zoomEnd(): number {
    return this._zoomEnd;
  }
  public set zoomEnd(value: number) {
    this._zoomEnd = value;
  }
  constructor(
    private graphicService: Services,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.getVariableChartConfiguration();
    this.getRangeChartConfiguration();
  }

  ngAfterContentInit(): void {
    this.loadLectures();
  }

  ngOnDestroy() {
    console.info('Destroy view');
    if (this.subscriptionTimer != null) {
      this.subscriptionTimer.unsubscribe();
    }
    if (this.changeDetectorRef != null) {
      this.changeDetectorRef.detach();
    }
    if (this.echartsInstance != null) {
      this.echartsInstance.dispose();
      this.echartsInstance = null;
    }
    this.markProperties();
  }

  buildChart = () => {
    // Force gargabe collection
    let myWindow: any = window;
    try {
      myWindow.gc();
    } catch (e) {}

    let offsetL = 40;
    let offsetR = 40;
    let yAxis: Array<EChartOption.YAxis> = new Array<EChartOption.YAxis>();
    let series: Array<EChartOption.Series> = new Array<EChartOption.Series>();
    let iter: IterableIterator<
      [number, VariableLectures]
    > = this.variableMap.entries();
    let result = iter.next();
    let index = 0;
    let varId: number = null;
    let varName: string = null;
    while (!result.done) {
      let variable: VariableLectures = result.value[1];
      varId = variable.variableId;
      varName = variable.name;

      if (!variable.isEnabled) {
        result = iter.next();
        continue;
      }

      if (variable.isActive) {
        variable.yAxisIndex = index;
        let offset = 0;
        if (variable.position === 'left') {
          offset = offsetL;
          offsetL += 65;
        } else {
          offset = offsetR;
          offsetR += 65;
        }

        let range: RangeModel = this.getRangeById(varId);
        let max = 0;
        let min = 0;
        if (range !== undefined) {
          max = range.max;
          min = range.min;
        }
        range = null;
        let grosor = 2;
        let color;
        if (variable.yAxisIndex === this.selectedVariable) {
          color = '#000000';
          grosor = 4;
        } else {
          color = variable.color;
        }

        const element: EChartOption.YAxis = {
          name: varName + ' ' + variable.units,
          type: 'value',
          max: max,
          min: min,
          position: variable.position as any,
          offset: offset,
          nameLocation: 'middle',
          nameGap: -15,
          nameTextStyle: {
            color: '#FFFFFF',
            backgroundColor: variable.color,
            padding: 3
          },
          axisTick: {
            show: false
          },
          axisLine: {
            lineStyle: {
              color: variable.color,
              width: 2
            }
          },
          splitLine: {
            show: false
          },
          splitArea: {
            show: false
          },
          axisLabel: {
            color: '#666666',
            padding: [15, 15, 15, 0]
          },
          triggerEvent: true
        };

        yAxis.push(element);

        if (this.variableValuesE.get(varId)) {
          let serie: EChartOption.Series = {
            name: varName,
            type: 'line',
            yAxisIndex: variable.yAxisIndex,
            stack: '',
            animation: false,
            itemStyle: { normal: { color: color, opacity: 0 } },
            data: this.timeValuesE.map((e, i) => [
              e,
              this.variableValuesE.get(varId)[i]
            ])
          };
          series.push(serie);
        }
        index++;
      }
      result = iter.next();
      variable = null;
    }

    iter = null;
    result = null;
    varId = null;

    let options: EChartOption = {
      grid: {
        bottom: 155,
        left: offsetL,
        right: offsetR
      },
      dataZoom: [
        {
          type: 'slider',
          show: true,
          realtime: false,
          start: this.zoomStart,
          end: this.zoomEnd,
          bottom: 50,
          handleIcon:
            'path://M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
          handleSize: '100%',
          showDetail: false
        }
      ],
      tooltip: {
        show: true,
        showDelay: 30,
        renderMode: 'html',
        triggerOn: 'click',
        formatter: function(params: any, ticket: any, callback: any) {
          let res = '';
          if (params != null && params.length > 0) {
            res += '<ul>';
            res = params[0].axisValueLabel;
            for (let param of params) {
              if (param.seriesName !== 'a') {
                res +=
                  '<br/><span style="color:' +
                  param.color +
                  '">&#9679;</span>&nbsp;&nbsp;';
                res +=
                  '<span style="color:white;">' +
                  param.seriesName +
                  ':&nbsp;' +
                  param.data[1] +
                  '</span>';
              }
            }
            res += '</ul>';
          }
          callback(ticket, res);
          return res;
        }
      },

      toolbox: {
        show: true,
        showTitle: true,
        itemSize: 30,
        feature: {
          dataZoom: {
            yAxisIndex: 'none',
            title: {
              zoom: 'Zoom',
              back: 'Back'
            }
          },
          restore: {
            title: 'Restore'
          }
        }
      },
      xAxis: [
        {
          type: 'time',
          axisPointer: {
            show: true,
            handle: {
              show: true,
              color: '#a9b7ca'
            },
            label: {
              show: false,
              formatter: function(params: any) {
                return Utils.formateDate2(new Date(params.value));
              }
            }
          },
          boundaryGap: false,
          axisLine: { onZero: false },
          axisLabel: {
            formatter: function(value: any) {
              return Utils.formateDate2(new Date(value));
            }
          }
        }
      ],
      yAxis: yAxis,
      series: series
    };

    yAxis = null;
    series = null;
    offsetR = null;
    offsetL = null;
    return options;
  };

  onChartInit(ec: any) {
    this.echartsInstance = ec;
  }

  onChartRestore($event: any) {
    if (this.subscriptionTimer.isStopped) {
      this.loadLectures();
      console.debug('Pause timer is deactivated.');
    }
  }

  onChartDataZoom($event: any) {
    let zoomStart = 0;
    let zoomEnd = 0;

    if ($event.end !== undefined && $event.start !== undefined) {
      // Check if has dataZoom from slider
      zoomStart = $event.start;
      zoomEnd = $event.end;
    } else if (
      $event.batch[0].startValue !== undefined &&
      $event.batch[0].endValue !== undefined
    ) {
      // Check if has dataZoom from toolboox
      let startTimeToolboxValue = Math.min(
        $event.batch[0].startValue,
        $event.batch[0].endValue
      );
      let endTimeToolboxValue = Math.max(
        $event.batch[0].startValue,
        $event.batch[0].endValue
      );

      this.zoomEnd = zoomEnd;
      this.zoomStart = zoomStart;
    }

    if (zoomEnd !== 100) {
      this.subscriptionTimer.unsubscribe();
      console.debug('Pause timer was activated.');
    } else {
      if (this.subscriptionTimer.isStopped) {
        this.zoomEnd = 100;
        this.zoomStart = 0;
        this.loadLectures();
        console.debug('Pause timer was deactivated from back button.');
      }
    }

    this.zoomEnd = zoomEnd;
    this.zoomStart = zoomStart;
  }

  private loadDataLectures = async (initTime: number, endTime: string) => {
    try {
      // Real project take result from backend
      /*const responseMessage: any = await this.graphicService
        .getLectures(initTime, endTime, null, 1)
        .toPromise();*/
      const responseMessage: any = await this.graphicService.getLectures(
        initTime,
        endTime,
        null,
        1
      );
      return this.processGraphicsResponse(responseMessage);
    } catch (e) {
      console.error(e);
    }
  };

  processGraphicsResponse(responseMessage: any) {
    // timeValues and variableValues are setting null on destroy component. Check it.
    if (this.timeValuesE !== null && this.variableValuesE !== null) {
      this.timeValuesE = [];
      this.variableValuesE.clear();
      responseMessage.payload.lecturesTimes.forEach(element => {
        this.timeValuesE.push(element);
      });
      responseMessage.payload.variableLectures.forEach(lecture => {
        this.variableValuesE.set(Number(lecture.variableId), lecture.values);
      });
    }
    return this.buildChart();
  }

  private loadLectures = () => {
    this.subscriptionTimer = timer(0, 30000).subscribe(() => {
      const initTime = 0;
      const endTime = new Date().toISOString();
      console.debug(
        'launchTime, loading from initTime ' + initTime + ' to now'
      );
      this.loadDataLectures(initTime, endTime).then(chartOption => {
        this.chartOption = chartOption;
        this.setOptionProtected();
        this.detectChangesProtected();
        console.debug('Request has finished');
      });
    });
  };

  getVariableChartConfiguration() {
    // Real project take result from backend
    /*this.graphicService.getGraphicConfiguration(1).subscribe(response => {
      // Set variable index for print on chart.
      response.payload.forEach(variable => {
        this.variableMap.set(variable.variableId, variable);
      });
    });*/
    let response = this.graphicService.getGraphicConfiguration(1);
    // Set variable index for print on chart.
    response.payload.forEach(variable => {
      this.variableMap.set(variable.variableId, variable);
    });
  }

  getRangeChartConfiguration() {
    // Real project take result from backend
    /*this.graphicService.getGraphicRanges(1).subscribe(response => {
      response.payload.forEach(range => {
        this.ranges.push(range);
      });
    });*/
    let response = this.graphicService.getGraphicRanges(1);
    // Set variable index for print on chart.
    response.payload.forEach(range => {
      this.ranges.push(range);
    });
  }

  private detectChangesProtected() {
    if (!this.changeDetectorRef['destroyed']) {
      this.changeDetectorRef.detectChanges();
    }
  }

  private setOptionProtected() {
    try {
      setTimeout(() => {
        if (!this.echartsInstance.isDisposed()) {
          this.echartsInstance.setOption(this.chartOption);
          this.chartOption = null;
        }
      }, 500);
    } catch (e) {}
  }

  getRangeById(indice: number): RangeModel {
    try {
      let range: RangeModel = new RangeModel();
      range = this.ranges.find(range => range.variableId === indice);
      return range;
    } catch (e) {
      console.error('An error has occurred at getRange' + e);
    }
  }

  private markProperties() {
    this.chartOption = null;
    this.echartsInstance = null;
    this.ranges = null;
    this.selectedVariable = null;
    this.subscriptionTimer = null;
    this.variableMap = null;
    this.timeValuesE = null;
    this.variableValuesE = null;
    this.variableMap = null;
  }
}
