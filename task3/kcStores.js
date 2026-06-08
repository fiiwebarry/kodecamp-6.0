class KCStore {
  constructor() {
    this.products = [];
  }

  // Add product
  addProduct(product) {
    this.products.push(product);
    return product;
  }

  // View all products
  getProducts() {
    return this.products;
  }

  // Update product by id
  updateProduct(id, updatedData) {
    const index = this.products.findIndex(p => p.id === id);

    if (index === -1) {
      return `Product with id ${id} not found`;
    }

    this.products[index] = {
      ...this.products[index],
      ...updatedData,
    };

    return this.products[index];
  }

  // Delete product by id
  deleteProduct(id) {
    const index = this.products.findIndex(p => p.id === id);

    if (index === -1) {
      return `Product with id ${id} not found`;
    }

    const removed = this.products.splice(index, 1);
    return removed[0];
  }
}