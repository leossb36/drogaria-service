import { CategoryEnum } from '@core/common/enum/category.enum';

export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setActiveProduct() {
    this.filters.push('inativo eq false');
    return this;
  }

  setCategory() {
    const filters = Object.values(CategoryEnum);
    const categories = [];
    let result: string;
    let query: string;
    for (let index = 0; index < filters.length; index++) {
      query = `nomeLinha eq '${filters[index]}'`;
      if (index === filters.length - 1) {
        result = query;
      } else {
        result = query + ' or ';
      }
      categories.push(result);
      query = categories.join('');
    }
    this.filters.push(query);
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
    this.query = this.filters.join(' and ');
    return this.query;
  }
}
