import { gql } from "apollo-server-express";

export const notificationTypeDefs = gql`
  type Notification @key(fields: "id") {
    id: ID!
    message: String!
    userId: ID!
  }

  extend type Query {
    notifications(userId: ID!): [Notification]
  }

  extend type Mutation {
    sendNotification(message: String!, userId: ID!): Notification
  }
`;
