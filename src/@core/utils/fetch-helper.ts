import WooCommerceRestApi from '@woocommerce/woocommerce-rest-api';

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

export async function FetchVetorProducts(instance: any) {
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

export function ChunckData(data: any[]) {
  const countChunks = Math.ceil(data.length / 100);
  let begin = 0;
  let limitChunks = 0;
  const arrayChunks = [];

  while (begin < data.length && limitChunks < countChunks) {
    arrayChunks.push(data.slice(begin, begin + 99));
    begin += 100;
    limitChunks += 1;
  }

  return arrayChunks;
}
