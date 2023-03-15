export class BadRequestError {
  message: string;
  field: string;
  constructor(value) {
    this.message = `${value} is not correct`;
    this.field = value;
  }
}
