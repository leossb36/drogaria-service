import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema()
export class Product {
  @Prop()
  name: string;

  @Prop()
  slug: string;

  @Prop()
  virtual: boolean;

  @Prop()
  downloadable: boolean;

  @Prop()
  description: string;

  @Prop()
  short_description: string;

  @Prop()
  sku: string;

  @Prop()
  price: string;

  @Prop()
  regular_price: string;

  @Prop()
  sale_price: string;

  @Prop()
  on_sale: boolean;

  @Prop()
  purchasable: boolean;

  @Prop()
  tax_status: string;

  @Prop()
  manage_stock: boolean;

  @Prop()
  stock_quantity: number;

  @Prop()
  backorders: string;

  @Prop()
  backorders_allowed: false;

  @Prop()
  backordered: false;

  @Prop()
  sold_individually: false;

  @Prop()
  shipping_required: boolean;

  @Prop()
  shipping_taxable: boolean;

  @Prop()
  reviews_allowed: boolean;

  @Prop()
  categories: [{ id: string }];

  @Prop()
  stock_status: string;

  @Prop()
  has_options: false;

  @Prop()
  images: [{ src: string }];

  @Prop()
  attributes: [
    {
      id?: number;
      name?: string;
      options?: string[];
      position?: number;
      visible?: boolean;
      variation?: boolean;
    },
  ];
}

export const ProductSchema = SchemaFactory.createForClass(Product);
