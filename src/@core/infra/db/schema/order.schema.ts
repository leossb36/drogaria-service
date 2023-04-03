import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop()
  cdOrcamento: number;

  @Prop()
  numeroPedido: number;

  @Prop()
  situacao: number;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
