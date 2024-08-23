import { ErrorResponse } from '@app/modules/shared/model-view/error.mv'
import { GetOrderModelView } from '../model-views/get-order.mv'
import { ApiResponseOptions } from '@nestjs/swagger'
import { HttpStatus } from '@nestjs/common'

export const createOrderResponse: { [key: string]: ApiResponseOptions } = {
  success: {
    status: HttpStatus.OK,
    description: 'Criar um pedido na vetor',
    type: GetOrderModelView
  },
  notFound: {
    status: HttpStatus.NOT_FOUND,
    description: 'Oferta não encontrado.',
    type: ErrorResponse
  },
  badRequest: {
    status: HttpStatus.BAD_REQUEST,
    description: 'Requisição inválida.',
    type: ErrorResponse
  },
  internalServerError: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Erro interno do servidor.',
    type: ErrorResponse
  }
}
