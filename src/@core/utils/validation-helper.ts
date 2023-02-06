export class ValidationHelper {
  static isOk(statusCode: number): boolean {
    return statusCode === 200;
  }

  static isCreated(statusCode: number): boolean {
    return statusCode === 201;
  }
}
