export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setActiveProduct() {
    this.filters.push('inativo eq false');
    return this;
  }

  setCategory() {
    this.filters.push(`nomeCategoria ne 'NAO DEFINIDO'`);
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
