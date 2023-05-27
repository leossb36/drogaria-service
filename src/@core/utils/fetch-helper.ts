import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';
import { QueryFilter } from './query-builder';
import * as path from 'path';
import { createWriteStream } from 'fs';
import { Readable } from 'stream';

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

  return returnData.reverse().slice(0, 2);
}

export async function FetchVetorProducts(instance: any) {
  const queryFilter = new QueryFilter();
  const productStream = [];
  const queryTop = 100;
  let querySkip = 0;
  let queryCounter = 0;

  const writebleStream = createWriteStream(
    path.join('./src', '@core', 'infra', 'seed', 'data.json'),
    { flags: 'w' },
  );

  const query = queryFilter.setFilters().getQuery();

  const { total } = await instance.getProductInfo('/produtos/consulta', {
    $filter: query,
    $count: 'true',
  });

  do {
    try {
      const { data } = await instance.getProductInfo('/produtos/consulta', {
        $top: queryTop,
        $skip: querySkip,
        $filter: query,
      });

      const readStream = Readable.from(data, { objectMode: true });
      readStream
        .on('data', (response) => {
          productStream.push(response);
        })
        .on('error', (error) => {
          console.error('error while trying resolve file', error);
        });

      queryCounter += data.length;
    } catch (error) {
      console.error(error);
    }

    querySkip += queryTop;
  } while (queryCounter < total);
  writebleStream.write(JSON.stringify(productStream, null, 2));

  return productStream.length;
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
