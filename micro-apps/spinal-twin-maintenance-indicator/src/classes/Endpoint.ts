export class Endpoint {
  readonly dynamicId: number;
  readonly name: string;
  readonly currentValue: number;

  constructor(dynamicId: number, name: string, currentValue: number) {
    this.dynamicId = dynamicId;
    this.name = name;
    this.currentValue = currentValue;
  }
}
