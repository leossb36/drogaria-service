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
