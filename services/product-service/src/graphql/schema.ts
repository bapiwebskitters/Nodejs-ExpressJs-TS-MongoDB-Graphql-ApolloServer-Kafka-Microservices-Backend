import { gql } from "apollo-server-express";

export const productTypeDefs = gql`
  type Product @key(fields: "id") {
    id: ID!
    name: String!
    price: Float!
  }

  extend type Query {
    products: [Product]
    product(id: ID!): Product
  }

  extend type Mutation {
    createProduct(name: String!, price: Float!): Product
  }
`;
