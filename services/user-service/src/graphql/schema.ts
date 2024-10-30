import { gql } from "apollo-server-express";

export const userTypeDefs = gql`
  type User @key(fields: "id") {
    id: ID! # Keep this as is (no @external)
    name: String!
    email: String!
  }

  extend type Query {
    getUser(id: ID!): User
    getAllUsers: [User]
  }

  extend type Mutation {
    createUser(name: String!, email: String!): User
  }
`;
