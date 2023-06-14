import { CategoryEnum } from '@core/common/enum/category.enum';

export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setFilters() {
    const categories = Object.values(CategoryEnum);
    categories.map((category) => {
      const odata = `cdFilial eq 1 and qtdEstoque gt 0 and inativo eq false and contains(nomeLinha, '${category}')`;
      this.filters.push(odata);
    });
    return this;
  }

  getQuery() {
    this.query = this.filters.join(' or ');
    return this.query;
  }
}
