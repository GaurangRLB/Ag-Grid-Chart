import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CombinationChartComponent } from './app/combination-chart/combination-chart.component';

bootstrapApplication(CombinationChartComponent, appConfig)
  .catch((err) => console.error(err));
