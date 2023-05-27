import { CategoryEnum } from '@core/common/enum/category.enum';

export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setActiveProduct() {
    this.filters.push('inativo eq false');
    return this;
  }

  setFilters() {
    const categories = Object.values(CategoryEnum);
    categories.map((category) => {
      const odata = `cdFilial eq 1 and qtdEstoque gt 0 and inativo eq false and contains(nomeLinha, '${category}')`;
      this.filters.push(odata);
    });
    return this;
  }

  setFilial() {
    this.filters.push('cdFilial eq 1');
    return this;
  }

  setHasStock() {
    this.filters.push('qtdEstoque gt 0');
    return this;
  }

  getQuery() {
    this.query = this.filters.join(' or ');
    return this.query;
  }
}
