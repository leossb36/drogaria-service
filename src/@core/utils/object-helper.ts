export class ObjectHelper {
  static changeKey(obj: any, newKey: string, oldKey: string) {
    obj[newKey] = obj[oldKey];
    delete obj[oldKey];

    return obj;
  }
}
