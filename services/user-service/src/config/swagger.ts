import express, { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { getSwaggerMetadata, getControllerTags } from "../decorators/swagger.decorator";
import fs from "fs";
import path from "path";

function generateSwaggerDocs() {
  const paths: any = {};
  const tagsSet: Set<string> = new Set();

  // Determine the environment and set the controllers path accordingly
  const controllersPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "../../dist/controllers/api") // For production
      : path.resolve(__dirname, "../../src/controllers/api"); // For development

  function findControllerFiles(dir: string): string[] {
    const files = fs.readdirSync(dir);
    let controllerFiles: string[] = [];

    files.forEach((file) => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        controllerFiles = controllerFiles.concat(findControllerFiles(fullPath));
      } else if (file.endsWith(".ts") || file.endsWith(".js")) {
        controllerFiles.push(fullPath);
      }
    });

    return controllerFiles;
  }

  const controllerFiles = findControllerFiles(controllersPath);

  controllerFiles.forEach((controllerFile) => {
    try {
      const ControllerClass = require(controllerFile).default;

      if (ControllerClass) {
        const controllerInstance = new ControllerClass();
        const methods = Object.getOwnPropertyNames(
          Object.getPrototypeOf(controllerInstance)
        );
        const controllerTags = getControllerTags(ControllerClass);

        methods.forEach((method) => {
          if (method !== "constructor") {
            const metadata = getSwaggerMetadata(controllerInstance, method);

            if (metadata) {
              const routePath = metadata.path
                .replace(/\/+/g, "/") // Normalize slashes
                .replace(/\/:([^\/]+)/g, "/{$1}"); // Convert :param to {param}

              const httpMethod = metadata.method || "post";
              paths[routePath] = paths[routePath] || {};
              paths[routePath][httpMethod] = {
                tags: controllerTags ? controllerTags.tags : [],
                summary: metadata.operation?.summary,
                requestBody: metadata.requestBody,
                responses: metadata.responses,
                security: metadata.security || [{ bearerAuth: [] }],
              };

              if (controllerTags) {
                controllerTags.tags.forEach((tag: string) => tagsSet.add(tag));
              }
            }
          }
        });
      }
    } catch (error) {
      console.error(
        `Error loading controller from file ${controllerFile}:`,
        error
      );
    }
  });

  const tagsArray = Array.from(tagsSet).map((tag) => ({
    name: tag,
    description: `${tag} management`,
  }));

  return {
    openapi: "3.0.0",
    info: {
      title: "Your API",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
        description: "Development server",
      },
      {
        url: "https://aaahealthcare-admin.dedicateddevelopers.us/api",
        description: "Production server",
      },
    ],
    tags: tagsArray,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  };
}

export function setupSwagger(app: Express) {
  const swaggerSpec = generateSwaggerDocs();
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
