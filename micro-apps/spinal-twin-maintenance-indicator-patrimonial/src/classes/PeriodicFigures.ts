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
    values: number[];
  };
  private year: {
    loaded: boolean;
    values: number[];
  };
  private month: {
    loaded: boolean;
    values: number[];
  };
  private week: {
    loaded: boolean;
    values: number[];
  };

  constructor() {
    this.decade = {
      loaded: false,
      values: <number[]>[],
    };
    this.year = {
      loaded: false,
      values: <number[]>[],
    };
    this.month = {
      loaded: false,
      values: <number[]>[],
    };
    this.week = {
      loaded: false,
      values: <number[]>[],
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
    series: { date: number; value: number }[]
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
        this.setDecade(series);
        break;
    }
    this[period].loaded = true;
  }

  public setDataAVG(
    period: string,
    series: { date: number; value: number }[]
  ): void {
    switch (period) {
      case "week":
        this.setWeek(series);
        break;
      case "month":
        this.setMonth(series);
        break;
      case "year":
        this.setYearAVG(series);
        break;
      case "decade":
        this.setDecadeAVG(series);
        break;
    }
    this[period].loaded = true;
  }

  private setWeek(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameWeek(new Date(bts.date), today)
    );
    for (const c of calendar.week) {
      const found = filtered.find((e) => new Date(e.date).getDay() === c);
      this.week.values.push(found ? found.value : 0);
    }
  }

  private setMonth(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameMonth(new Date(bts.date), today)
    );
    for (const c of calendar.month) {
      const found = filtered.find((e) => new Date(e.date).getDate() === c);
      this.month.values.push(found ? found.value : 0);
    }
  }

  private setYear(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameYear(new Date(bts.date), today)
    );
    for (const c of calendar.year) {
      this.year.values.push(
        filtered
          .filter((e) => new Date(e.date).getMonth() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
  }

  private setYearAVG(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameYear(new Date(bts.date), today)
    );
    for (const c of calendar.year) {
      const found = filtered.filter((e) => new Date(e.date).getMonth() === c);
      this.year.values.push(
        found.length > 0
          ? Math.floor(
              found.map((e) => e.value).reduce((e1, e2) => e1 + e2, 0) /
                found.length
            )
          : 0
      );
    }
  }

  private setDecade(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameDecade(new Date(bts.date), today)
    );
    for (const c of calendar.decade) {
      this.decade.values.push(
        filtered
          .filter((e) => new Date(e.date).getFullYear() === c)
          .map((e) => e.value)
          .reduce((e1, e2) => Math.floor(e1 + e2), 0)
      );
    }
  }

  private setDecadeAVG(series: { date: number; value: number }[]): void {
    const filtered = series.filter((bts) =>
      sameDecade(new Date(bts.date), today)
    );
    for (const c of calendar.decade) {
      const found = filtered.filter(
        (e) => new Date(e.date).getFullYear() === c
      );
      this.decade.values.push(
        found.length > 0
          ? Math.floor(
              found
                .map((e) => e.value)
                .reduce((e1, e2) => Math.floor(e1 + e2), 0) / found.length
            )
          : 0
      );
    }
  }
}
