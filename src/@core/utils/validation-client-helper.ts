export class ValidationClientHelper {
  static validatePhone(phone: string): string {
    return phone.replaceAll(/\s/g, '');
  }

  static validateGender(gender: string): string {
    return gender.toLowerCase() === 'm' ? 'Masculino' : 'Feminino';
  }

  static validateDate(date: string): string {
    return date.replaceAll('/', '-').split('-').reverse().join('-').toString();
  }
}
