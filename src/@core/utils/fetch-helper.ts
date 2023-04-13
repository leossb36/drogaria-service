import { CategoryEnum } from '@core/application/dto/enum/category.enum';
import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { QueryFilter } from './query-builder';

export default async function FetchAllProducts(instance: WooCommerceRestApi) {
  let actualPage = 1;

  let products = [];
  const returnData = [];

  do {
    try {
      products = await instance
        .get('products', {
          per_page: 100,
          page: actualPage,
        })
        .then((result) => {
          return result.data;
        });
    } catch (e) {
      console.error(e.response.data.message);
    }

    returnData.push(...products);
    actualPage += 1;
  } while (products.length > 0);

  return returnData;
}
export async function getProductsWithoutImages(instance: WooCommerceRestApi) {
  let actualPage = 1;

  let products = [];
  const returnData = [];

  do {
    try {
      products = await instance
        .get('products', {
          per_page: 100,
          page: actualPage,
        })
        .then((result) => {
          return result.data.filter((product) => !product.images.length);
        });
    } catch (e) {
      console.error(e.response.data.message);
    }

    returnData.push(...products);
    actualPage += 1;
  } while (products.length > 0);

  const reverse = returnData.reverse();
  return reverse.slice(0, 2);

  // return [(await instance.get('products/5009')).data];
}

export async function FetchVetorProducts(instance: any) {
  const queryFilter = new QueryFilter();
  let products;
  const returnData = [];
  const queryTop = 500;
  let querySkip = 0;
  let queryCounter = 0;

  do {
    try {
      const query = queryFilter
        .setFilial()
        .setHasStock()
        .setActiveProduct()
        .getQuery();

      products = await instance.getProductInfo('/produtos/consulta', {
        $top: queryTop,
        $skip: querySkip,
        $filter: query,
        $count: 'true',
      });

      queryCounter += products.data.length;
      returnData.push(...products.data);
    } catch (error) {
      console.error(error.response.data.message);
    }

    querySkip = returnData.length;
  } while (queryCounter < products.total);

  const filteredListProducts = returnData.filter((product) =>
    Object.values(CategoryEnum).includes(product.nomeLinha),
  );

  return filteredListProducts;
}

export async function FetchVetorCategories(instance: any) {
  let products;
  const returnData = [];
  const queryTop = 500;
  let querySkip = 0;

  do {
    try {
      products = await instance.getProductInfo('/produtos/consulta', {
        $top: queryTop,
        $skip: querySkip,
        $filter: 'cdFilial eq 1',
      });

      returnData.push(...products.data);
    } catch (error) {
      console.error(error.response.data.message);
    }

    querySkip = returnData.length;
  } while (products.data.length > 0);

  return returnData;
}

export function ChunckData(data: any[], size = 100) {
  const chunks = [];
  for (let i = 0; i < Math.max(1, data.length / 100); i++)
    chunks.push(data.slice(i * size, i * size + size));
  return chunks;
}
