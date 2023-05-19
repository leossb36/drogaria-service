export interface Category {
  id: number;
  name: string;
  slug: string;
  parent: number;
  description: string;
  display: string;
  image: Image;
  menu_order: number;
  count: number;
  _links: Links;
}

export interface Image {
  id: number;
  date_created: string;
  date_created_gmt: string;
  date_modified: string;
  date_modified_gmt: string;
  src: string;
  name: string;
  alt: string;
}

export interface Links {
  self: Self[];
  collection: Collection[];
}

export interface Self {
  href: string;
}

export interface Collection {
  href: string;
}
