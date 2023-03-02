export interface WebhookBilling {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
  number?: string;
  neighborhood?: string;
  persontype?: string;
  cpf?: string;
  rg?: string;
  cnpj?: string;
  ie?: string;
  birthdate?: string;
  sex?: string;
  cellphone?: string;
}

export interface WebhookShipping {
  first_name?: string;
  last_name?: string;
  company?: string;
  address_1?: string;
  address_2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  phone?: string;
  number?: string;
  neighborhood?: string;
}

export interface WebhookLineItem {
  id?: number;
  name?: string;
  product_id?: number;
  variation_id?: number;
  quantity?: number;
  tax_class?: string;
  subtotal?: string;
  subtotal_tax?: string;
  total?: string;
  total_tax?: string;
  taxes?: any[];
  meta_data?: any[];
  sku?: string;
  price?: number;
  image?: WebhookImage;
  parent_name?: any;
}

export interface WebhookImage {
  id?: string;
  src?: string;
}

export interface getWebhookDto {
  id?: number;
  parent_id?: number;
  status?: string;
  currency?: string;
  version?: string;
  prices_include_tax?: boolean;
  date_created?: string;
  date_modified?: string;
  discount_total?: string;
  discount_tax?: string;
  shipping_total?: string;
  shipping_tax?: string;
  cart_tax?: string;
  total?: string;
  total_tax?: string;
  customer_id?: number;
  order_key?: string;
  billing?: WebhookBilling;
  shipping?: WebhookShipping;
  payment_method?: string;
  payment_method_title?: string;
  line_items?: WebhookLineItem[];
}
