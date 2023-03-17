export class ValidationClientHelper {
  static validatePhone(phone: string): string {
    return phone.replaceAll(/\s/g, '');
  }

  static validateGender(gender: string): string {
    return gender.toLowerCase() === 'm' ? 'Masculino' : 'Feminino';
  }

  static validateDate(date: string): string {
    const formatedDate = date.split('T');
    return formatedDate[0];
  }
}
