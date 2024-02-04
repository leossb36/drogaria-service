export class OperationHelper {
  static reduce(attr: number[]): number {
    return attr.reduce((acc, current) => acc + (current || 0), 0);
  }
}
