export class ValidationHelper {
  static isOk(statusCode: number): boolean {
    return statusCode === 200;
  }
}
