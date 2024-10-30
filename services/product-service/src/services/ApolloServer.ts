import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { typeDefs } from "../graphql/schemas";
import { resolvers } from "../graphql/resolvers";
import { createContext } from "../graphql/context";
import { json } from "body-parser";

export const createApolloServer = async () => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  return [
    json(),
    expressMiddleware(server, {
      context: createContext,
    }),
  ];
};
