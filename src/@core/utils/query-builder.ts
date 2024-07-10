import { CategoryEnum } from '@core/common/enum/category.enum';

export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setFilters() {
    // const now = new Date();
    // const timeBefore = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // const isoDate = timeBefore.toISOString();
    // and dtUltimaAlteracao gt ${isoDate}
    const categories = Object.values(CategoryEnum);
    categories.map((category) => {
      const odata = `cdFilial eq 1 and inativo eq false and contains(nomeLinha, '${category}') and vlrTabela gt 0`;
      this.filters.push(odata);
    });
    return this;
  }

  getQuery() {
    this.query = this.filters.join(' or ');
    return this.query;
  }
}
