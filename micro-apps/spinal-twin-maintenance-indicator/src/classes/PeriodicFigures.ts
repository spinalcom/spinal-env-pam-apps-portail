import {
  calendar,
  sameDecade,
  sameMonth,
  sameWeek,
  sameYear,
} from "../date-comparison";

const today = new Date();

export class PeriodicFigures {
  [key: string]: any;

  private decade: {
    loaded: boolean;
    values: any[];
  };
  private year: {
    loaded: boolean;
    values: any[];
  };
  private month: {
    loaded: boolean;
    values: any[];
  };
  private week: {
    loaded: boolean;
    values: any[];
  };

  constructor() {
    this.decade = {
      loaded: false,
      values: <any[]>[],
    };
    this.year = {
      loaded: false,
      values: <any[]>[],
    };
    this.month = {
      loaded: false,
      values: <any[]>[],
    };
    this.week = {
      loaded: false,
      values: <any[]>[],
    };
  }

  public getData(period: string): number[] {
    return this[period].values;
  }

  public isLoaded(period: string): boolean {
    return this[period].loaded;
  }

  public setData(
    period: string,
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    switch (period) {
      case "week":
        this.setWeek(series);
        break;
      case "month":
        this.setMonth(series);
        break;
      case "year":
        this.setYear(series);
        break;
      case "decade":
        this.setDecade(series, index);
        break;
    }
    this[period].loaded = true;
  }

  public setLineData(
    period: string,
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    switch (period) {
      case "week":
        this.setLineWeek(series);
        break;
      case "month":
        this.setLineMonth(series);
        break;
      case "year":
        this.setLineYear(series);
        break;
      case "decade":
        this.setLineDecade(series, index);
        break;
    }
    this[period].loaded = true;
  }

  public setDataAVG(
    period: string,
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    switch (period) {
      case "week":
        this.setWeekAVG(series);
        break;
      case "month":
        this.setMonthAVG(series);
        break;
      case "year":
        this.setYearAVG(series);
        break;
      case "decade":
        this.setDecadeAVG(series, index);
        break;
    }
    this[period].loaded = true;
  }

  private setWeek(series: { date: number; value: number }[]): void {
    this.week.values = [];
    for (const c of calendar.week) {
      const found = series.filter((e) => new Date(e.date).getDay() === c);
      this.week.values.push(found.reduce((e1, e2) => e1 + e2.value, 0));
    }
  }

  private setLineWeek(series: { date: number; value: number }[]): void {
    this.week.values = [];
    for (const c of calendar.week) {
      this.week.values.push(
        series.filter((e) => new Date(e.date).getDay() === c)
      );
    }
  }

  private setWeekAVG(series: { date: number; value: number }[]): void {
    this.week.values = [];
    for (const c of calendar.week) {
      const found = series.filter((e) => new Date(e.date).getDay() === c);
      this.week.values.push(
        found.length > 0
          ? Math.floor(
              found.map((e) => e.value).reduce((e1, e2) => e1 + e2, 0) /
                found.length
            )
          : -1
      );
    }
  }

  private setMonth(series: { date: number; value: number }[]): void {
    this.month.values = [];
    for (const c of calendar.month) {
      const found = series.filter((e) => new Date(e.date).getDate() === c);
      this.month.values.push(found.reduce((e1, e2) => e1 + e2.value, 0));
    }
  }

  private setLineMonth(series: { date: number; value: number }[]): void {
    this.month.values = [];
    for (const c of calendar.month) {
      this.month.values.push(
        series.filter((e) => new Date(e.date).getDate() === c)
      );
    }
  }

  private setMonthAVG(series: { date: number; value: number }[]): void {
    this.month.values = [];
    for (const c of calendar.month) {
      const found = series.filter((e) => new Date(e.date).getDate() === c);
      this.month.values.push(
        found.length > 0
          ? Math.floor(
              found.map((e) => e.value).reduce((e1, e2) => e1 + e2, 0) /
                found.length
            )
          : -1
      );
    }
  }

  private setYear(series: { date: number; value: number }[]): void {
    this.year.values = [];
    for (const c of calendar.year) {
      this.year.values.push(
        series
          .filter((e) => new Date(e.date).getMonth() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
  }

  private setLineYear(series: { date: number; value: number }[]): void {
    this.year.values = [];
    for (const c of calendar.year) {
      this.year.values.push(
        series.filter((e) => new Date(e.date).getMonth() === c)
      );
    }
  }

  private setYearAVG(series: { date: number; value: number }[]): void {
    this.year.values = [];
    for (const c of calendar.year) {
      const found = series.filter((e) => new Date(e.date).getMonth() === c);
      this.year.values.push(
        found.length > 0
          ? Math.floor(
              found.map((e) => e.value).reduce((e1, e2) => e1 + e2, 0) /
                found.length
            )
          : -1
      );
    }
  }

  private setDecade(
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    this.decade.values = [];
    for (const c of calendar.decade) {
      this.decade.values.push(
        series
          .filter((e) => new Date(e.date).getFullYear() === c - 10 * index)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
  }

  private setLineDecade(
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    this.decade.values = [];
    for (const c of calendar.decade) {
      this.decade.values.push(
        series.filter((e) => new Date(e.date).getFullYear() === c - 10 * index)
      );
    }
  }

  private setDecadeAVG(
    series: { date: number; value: number }[],
    index: number = 0
  ): void {
    this.decade.values = [];
    for (const c of calendar.decade) {
      const found = series.filter(
        (e) => new Date(e.date).getFullYear() === c - 10 * index
      );
      this.decade.values.push(
        found.length > 0
          ? Math.floor(
              found
                .map((e) => e.value)
                .reduce((e1, e2) => Math.floor(e1 + e2), 0) / found.length
            )
          : -1
      );
    }
  }
}
