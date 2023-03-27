export class QueryFilter {
  private query: string;
  private filters: string[] = [];

  setActiveProduct() {
    this.filters.push('inativo eq false');
    return this;
  }

  setCategory() {
    this.filters.push(
      `nomeLinha eq 'Perfumes' nomeLinha eq 'Maquiagens' or
      nomeLinha eq 'Dermocosméticos' or nomeLinha eq 'Linha infantil' or
      nomeLinha 'Cabelos' or nomeLinha eq 'Higiene e beleza'`,
    );
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
