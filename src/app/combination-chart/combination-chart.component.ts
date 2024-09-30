import { Component } from "@angular/core";
import { AgGridAngular } from "ag-grid-angular";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import {
  ChartToolPanelsDef,
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
import { AgAxisCaptionFormatterParams } from "ag-charts-community";
import "ag-grid-charts-enterprise";
import { deepMerge, getData } from "../data";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { MatGridListModule } from "@angular/material/grid-list";

@Component({
  selector: "app-combination-chart",

  standalone: true,
  imports: [AgGridAngular, MatCardModule, MatButtonModule, MatGridListModule],
  template: `<div class="wrapper">
    <div class="card-container">
      <mat-card>
        <mat-card-header class="card-header">
          <mat-card-title>Budget</mat-card-title>
        </mat-card-header>
        <mat-card-content class="card-content">
          <h1>$200,000.00</h1>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header class="card-header">
          <mat-card-title color='warm'>Total Paid to Date</mat-card-title>
        </mat-card-header>
        <mat-card-content class="card-content">
        <h1>$75,000.00</h1>
        </mat-card-content>
      </mat-card>

      <mat-card>
        <mat-card-header class="card-header">
          <mat-card-title>Cost To Complete</mat-card-title>
        </mat-card-header>
        <mat-card-content class="card-content">
        <h1>$125,000.00</h1>
        </mat-card-content>
      </mat-card>
    </div>
    <!-- <button id="axisBtn" (click)="updateChart()" value="time">Category</button> -->
    <div id="myChart" class="ag-theme-quartz"></div>
    <ag-grid-angular
      style="width: 100%; height: 100%;"
      [columnDefs]="columnDefs"
      [defaultColDef]="defaultColDef"
      [selection]="selection"
      [enableCharts]="true"
      [popupParent]="popupParent"
      [chartThemes]="chartThemes"
      [customChartThemes]="customChartThemes"
      [chartThemeOverrides]="chartThemeOverrides"
      [chartToolPanelsDef]="chartToolPanelsDef"
      [rowData]="rowData"
      [class]="themeClass"
      (firstDataRendered)="onFirstDataRendered($event)"
      (gridReady)="onGridReady($event)"
    />
  </div> `,
})
export class CombinationChartComponent {
  public chartToolPanelsDef: ChartToolPanelsDef = {
    panels: ["data", "format"],
  };
  public columnDefs: ColDef[] = [
    { field: "date", maxWidth: 120, chartDataType: "category" },

    { field: "baseline", chartDataType: "series" },
    { field: "actual", chartDataType: "series" },
    { field: "forecast", chartDataType: "series" },
    {
      field: "contractorForecast",
      headerName: "ABC Builder Forecast",
      chartDataType: "series",
    },
    { field: "actualMonthly", chartDataType: "series" },
    { field: "forecastMonthly", chartDataType: "series" },
  ];
  public defaultColDef: ColDef = {
    flex: 1,
    minWidth: 100,
    editable: true,
    filter: true,
    floatingFilter: true,
  };
  public selection: SelectionOptions = { mode: "cell" };
  public popupParent: HTMLElement | null = document.body;
  public chartThemes: string[] = ["my-custom-theme-light"];
  public currentChartRef: any;
  public customChartThemes: {
    [name: string]: any;
  } = {
    "my-custom-theme-light": myCustomThemeLight,
  };
  public chartThemeOverrides: any = {
    common: {
      // title: {
      //   enabled: true,
      //   text: "Greenfield Estates",
      //   color: '#00245D',
      //   fontWeight:'bold',
      // },
      legend: {
        item: {
          label: {
            color: "#00245D",
            fontWeight: "bold",
          },
        },
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
            color: "#5F6062",
            rotation: 0,
            formatter: (params: any) => {
              // charts typings
              return formatDateAxis(params.value);
            },
          },
        },
        number: {
          label: {
            color: "#5F6062",
            formatter: (params: any) => {
              // charts typings
              return _formatCurrencyAxis(params.value);
            },
          },
        },
      },
    },
    bar: {
      series: {
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            console.log(datum);
            return {
              content: `${formatDate(datum[xKey])}: ${_formatCurrency(
                datum[yKey]
              )}`,
            };
          },
        },
      },
    },
    line: {
      navigator: {
        enabled: true,
        height: 20,
        spacing: 25,
      },
      series: {
        tooltip: {
          renderer: ({ datum, xKey, yKey }: any) => {
            return {
              content: `${formatDate(datum[xKey])}: ${_formatCurrency(
                datum[yKey]
              )}`,
            };
          },
        },
      },
    },
  };

  public rowData!: any[];
  public themeClass: string = "ag-theme-quartz";

  public api!: GridApi;
  onFirstDataRendered(params: FirstDataRenderedEvent) {
    this.api = params.api;
    this.createChart();
  }

  createChart() {
    if (this.currentChartRef) {
      this.currentChartRef.destroyChart();
    }
    this.currentChartRef = this.api.createRangeChart({
      chartType: "customCombo",
      cellRange: {
        columns: [
          "date",
          "baseline",
          "actual",
          "forecast",
          "contractorForecast",
          "actualMonthly",
          "forecastMonthly",
        ],
      },
      seriesChartTypes: [
        { colId: "baseline", chartType: "line", secondaryAxis: false },
        { colId: "actual", chartType: "line", secondaryAxis: false },
        { colId: "forecast", chartType: "line", secondaryAxis: false },
        {
          colId: "contractorForecast",
          chartType: "line",
          secondaryAxis: false,
        },
        {
          colId: "actualMonthly",
          chartType: "groupedColumn",
          secondaryAxis: false,
        },
        {
          colId: "forecastMonthly",
          chartType: "groupedColumn",
          secondaryAxis: false,
        },
      ],
      suppressChartRanges: true,
      chartContainer: document.querySelector("#myChart") as any,
    });
  }
  onGridReady(params: GridReadyEvent) {
    getData().then((rowData) => params.api.setGridOption("rowData", rowData));
  }

  updateChart() {
    myCustomThemeLight.palette.fills = [
      "#00245D",
      "#5F6062",
      "#CD0E2C",
      "#0072BD",
      "#CBD32B",
      "#00245D",
    ];
    this.createChart();
  }
}

function formatDate(date: Date | number) {
  return Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateAxis(date: Date | number) {
  return Intl.DateTimeFormat("en-GB", {
    day: undefined,
    month: "short",
    year: "2-digit",
  }).format(new Date(date));
}

function _formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function _formatCurrencyAxis(amount: number) {
  let formattedAmount: string;

  if (amount >= 1_000_000_000) {
    formattedAmount = (amount / 1_000_000_000).toFixed(1) + "B"; // Billions
  } else if (amount >= 1_000_000) {
    formattedAmount = (amount / 1_000_000).toFixed(1) + "M"; // Millions
  } else if (amount >= 1_000) {
    formattedAmount = (amount / 1_000).toFixed(1) + "K"; // Thousands
  } else {
    formattedAmount = amount.toFixed(2); // Standard format for amounts below 1000
  }

  return (
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(Number(formattedAmount.replace(/[KMB]/g, ""))) +
    formattedAmount.slice(-1)
  );
}

const myCustomThemeLight = {
  palette: {
    fills: ["#00245D", "#5F6062", "#CD0E2C", "#0072BD", "#CBD32B", "#00245D"],
    strokes: ["#00245D", "#5F6062", "#CD0E2C", "#0072BD", "#CBD32B", "#00245D"],
  },
};
