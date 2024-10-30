import express from "express";
import { ApolloServer } from "@apollo/server"; // Apollo Server
import { expressMiddleware } from "@apollo/server/express4"; // Middleware for Express
import { buildSubgraphSchema } from "@apollo/subgraph"; // For building the subgraph schema
import { notificationTypeDefs } from "./graphql/schema"; // Your GraphQL schema
import { notificationResolvers } from "./graphql/resolvers"; // Your resolvers
import dotenv from "dotenv";
import cors from "cors";

dotenv.config(); // Load environment variables

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Build the subgraph schema using the type definitions and resolvers
const schema = buildSubgraphSchema([
  {
    typeDefs: notificationTypeDefs,
    resolvers: notificationResolvers,
  },
]);

// Initialize Apollo Server with the built schema
const server = new ApolloServer({
  schema,
  plugins: [
    {
      async serverWillStart() {
        console.log("User service is starting...");
      },
    },
  ],
});

// Start the Apollo Server
const startServer = async () => {
  await server.start();

  // Health check endpoint
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "UP" });
  });

  app.use("/graphql", expressMiddleware(server));

  const PORT = process.env.PORT || 4002;
  app.listen(PORT, () => {
    console.log(`User service running on http://localhost:${PORT}/graphql`);
  });
};

startServer();
