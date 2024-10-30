const products: Array<{ id: string; name: string; price: number }> = [
  { id: "1", name: "Demo Product 1", price: 500 },
  { id: "2", name: "Demo Product 2", price: 700 },
  { id: "3", name: "Demo Product 1", price: 800 },
];

export const productResolvers = {
  Query: {
    products: () => products,
    product: (parent: any, { id }: { id: string }) =>
      products.find((product) => product.id === id),
  },
  Mutation: {
    createProduct: (
      parent: any,
      { name, price }: { name: string; price: number }
    ) => {
      const product = { id: String(products.length + 1), name, price };
      products.push(product);
      return product;
    },
  },
  Product: {
    __resolveReference(reference: { id: string }) {
      // Here you would look up the user by ID in your database
      return { id: reference.id, name: "John Doe", email: "john@example.com" };
    },
  },
};
