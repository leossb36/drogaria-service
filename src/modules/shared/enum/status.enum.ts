export enum StatusEnum {
  NOT_FOUND = 0, // Não encontrado
  PENDING = 1, // Pendente
  ON_SEPARATE = 2, // Em separação
  CONFERENCE = 3, // Conferência
  FATURED = 4, // Faturado
  DISPACH = 5, //Despachado
  RECEIVED = 6, //Entregue
  NOT_DONE = 7, //Entrega não realizada
  CANCELED = 8, //Cancelado
  SEND_BACK = 9 //Devolvido
}

export enum VetorStatusEnum {
  NOT_FOUND = 'Não encontrado', // Não encontrado
  PENDING = 'Pendente', // Pendente
  ON_SEPARATE = 'Em separação', // Em separação
  CONFERENCE = 'Conferência', // Conferência
  FATURED = 'Faturado', // Faturado
  DISPACH = 'Despachado', //Despachado
  RECEIVED = 'Entregue', //Entregue
  NOT_DONE = 'Entrega não realizada', //Entrega não realizada
  CANCELED = 'Cancelado', //Cancelado
  SEND_BACK = 'Devolvido' //Devolvido
}

export enum StatusEnumTerminated {
  NOT_FOUND = 0, // Não encontrado
  RECEIVED = 6, //Entregue
  NOT_DONE = 7, //Entrega não realizada
  CANCELED = 8, //Cancelado
  SEND_BACK = 9 //Devolvido
}

export const statusMap: { [key in VetorStatusEnum]: StatusEnum } = {
  [VetorStatusEnum.NOT_FOUND]: StatusEnum.NOT_FOUND,
  [VetorStatusEnum.PENDING]: StatusEnum.PENDING,
  [VetorStatusEnum.ON_SEPARATE]: StatusEnum.ON_SEPARATE,
  [VetorStatusEnum.CONFERENCE]: StatusEnum.CONFERENCE,
  [VetorStatusEnum.FATURED]: StatusEnum.FATURED,
  [VetorStatusEnum.DISPACH]: StatusEnum.DISPACH,
  [VetorStatusEnum.RECEIVED]: StatusEnum.RECEIVED,
  [VetorStatusEnum.NOT_DONE]: StatusEnum.NOT_DONE,
  [VetorStatusEnum.CANCELED]: StatusEnum.CANCELED,
  [VetorStatusEnum.SEND_BACK]: StatusEnum.SEND_BACK
}
