import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgxEchartsModule } from 'ngx-echarts';
import { AppComponent } from './app.component';
import { Services } from './services/services';
import { ChartComponent } from './chart-component/chart-component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [BrowserModule, HttpClientModule, FormsModule, NgxEchartsModule],
  providers: [Services],
  declarations: [AppComponent, ChartComponent],
  bootstrap: [AppComponent],
  entryComponents: [ChartComponent]
})
export class AppModule {}
