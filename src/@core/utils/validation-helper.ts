import { StatusEnum } from '@core/common/enum/status.enum';
import { WoocommerceStatusEnum } from '@core/common/enum/woocommerce-status.enum';

export class ValidationHelper {
  static isOk(statusCode: number): boolean {
    return statusCode === 200;
  }

  static isCreated(statusCode: number): boolean {
    return statusCode === 201;
  }

  static setStatus(order: any, id: number) {
    switch (order.situacao) {
      case StatusEnum.NOT_FOUND:
        return {
          id,
          status: WoocommerceStatusEnum.FAILED,
        };
      case StatusEnum.PENDING:
        return {
          id,
          status: WoocommerceStatusEnum.PROCESSING,
        };
      case StatusEnum.ON_SEPARATE:
        return {
          id,
          status: WoocommerceStatusEnum.ON_HOLD,
        };
      case StatusEnum.CONFERENCE:
        return {
          id,
          status: WoocommerceStatusEnum.ON_HOLD,
        };
      case StatusEnum.FATURED:
        return {
          id,
          status: WoocommerceStatusEnum.ON_HOLD,
        };
      case StatusEnum.DISPACH:
        return {
          id,
          status: WoocommerceStatusEnum.ON_HOLD,
        };
      case StatusEnum.RECEIVED:
        return {
          id,
          status: WoocommerceStatusEnum.COMPLETED,
        };
      case StatusEnum.NOT_DONE:
        return {
          id,
          status: WoocommerceStatusEnum.FAILED,
        };
      case StatusEnum.CANCELED:
        return {
          id,
          status: WoocommerceStatusEnum.CANCELLED,
        };
      case StatusEnum.SEND_BACK:
        return {
          id,
          status: WoocommerceStatusEnum.REFUNDED,
        };
      default:
        return;
    }
  }
}
