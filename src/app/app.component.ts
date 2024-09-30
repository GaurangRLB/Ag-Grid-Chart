import { Component } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  ChartToolPanelsDef,
  ChartType,
  ColDef,
  ColGroupDef,
  FirstDataRenderedEvent,
  GridApi,
  GridOptions,
  GridReadyEvent,
  SelectionOptions,
  ValueFormatterParams,
  createGrid,
} from "ag-grid-community";
import { getData } from "./data";
import "ag-grid-charts-enterprise";
import { formatCurrency } from "@angular/common";
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

@Component({
  selector: "my-app",
  standalone: true,
  imports: [AgGridAngular, MatCardModule, MatButtonModule],
  template: `<label>Switch Axis to: </label>
    <button id="axisBtn" (click)="updateChart()" value="time">Category</button>
    <div id="myChart" class="ag-theme-quartz my-chart"></div>
    <div class="wrapper">
      <ag-grid-angular
        style="width: 100%; height: 100%;"
        [columnDefs]="columnDefs"
        [defaultColDef]="defaultColDef"
        [selection]="selection"
        [enableCharts]="true"
        [chartThemeOverrides]="chartThemeOverrides"
        [chartToolPanelsDef]="chartToolPanelsDef"
        [rowData]="rowData"
        [class]="themeClass"
        (firstDataRendered)="onFirstDataRendered($event)"
        (gridReady)="onGridReady($event)"
      />
    </div>
    `,
})
export class AppComponent {
  private gridApi!: GridApi;

  public columnDefs: any[] = getColumnDefs();
  public defaultColDef: ColDef = { flex: 1 };
  public selection: SelectionOptions = { mode: "cell" };
  public chartThemeOverrides: any = {
    line: {
      title: {
        enabled: true,
        text: "Cash Flow",
      },
      navigator: {
        enabled: true,
        height: 20,
        spacing: 25,
      },
      axes: {
        time: {
          label: {
            rotation: 0,
            format: "%d %b",
          },
        },
        category: {
          label: {
            rotation: 0,
            formatter: (params: any) => {
              // charts typings
              return formatDate(params.value);
            },
          },
        },
        number: {
          label: {
            formatter: (params: any) => {
              // charts typings
              return _formatCurrency(params.value);
            },
          },
        },
      },
      series: {
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return {
              content: `${formatDate(datum[xKey])}: ${_formatCurrency(datum[yKey])}`,
            };
          },
        },
      },
    },
  };
  public chartToolPanelsDef: ChartToolPanelsDef = {
    panels: ["data", "format"],
  };
  public rowData!: any[];
  public themeClass: string =
    "ag-theme-quartz";

  onFirstDataRendered(params: FirstDataRenderedEvent) {
    if (currentChartRef) {
      currentChartRef.destroyChart();
    }
    currentChartRef = params.api.createRangeChart({
      chartContainer: document.querySelector("#myChart") as HTMLElement,
      cellRange: {
        columns: ["date", "baseline", "actual", "forecast", "contractorForecast"],
      },
      seriesChartTypes: [
        {
          colId: "baseline",
          chartType: "bar"
        },
        {
          colId: "actual",
          chartType: "bar"
        },
        {
          colId: "forecast",
          chartType: "bar"
        },
        {
          colId: "contractorForecast",
          chartType: "line"
        }
      ],
      suppressChartRanges: true,
      chartType: "line",
    });
  }

  toggleAxis() {
    const axisBtn = document.querySelector("#axisBtn") as any;
    axisBtn.textContent = axisBtn.value;
    axisBtn.value = axisBtn.value === "time" ? "category" : "time";
    const columnDefs: any[] = getColumnDefs();
    columnDefs.forEach((colDef) => {
      if (colDef.field === "date") {
        colDef.chartDataType = axisBtn.value;
      }
    });
    this.gridApi.setGridOption("columnDefs", columnDefs);
  }

  onGridReady(params: GridReadyEvent) {
    
    this.gridApi = params.api;
    
    getData().then((rowData) => params.api.setGridOption("rowData", rowData));
  }

  updateChart() {
    this.gridApi.updateChart({
      type: "rangeChartUpdate",
      chartId: `${currentChartRef.chartId}`,
      chartType: 'line',
      
    });
  }
}

let currentChartRef: any;
function getColumnDefs() {
  return [
    { field: "date", valueFormatter: dateFormatter, chartDataType: "category" },
    { field: "baseline"},
    { field: "actual" },
    { field: "forecast" },
    { field: "contractorForecast", chartDataType: "series"  },
  ];
}
function dateFormatter(params: ValueFormatterParams) {
  return formatDate(params.value);
}
function formatDate(date: Date | number) {
  return Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function _formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}
