import "reflect-metadata";

const SWAGGER_METADATA_KEY = "swagger";

// API Tags decorator
function ApiTags(...tags: string[]) {
  return function (target: any) {
    Reflect.defineMetadata(SWAGGER_METADATA_KEY, { tags }, target.prototype);
  };
}

// API Operation decorator
function ApiOperation(summary: string) {
  return function (target: any, propertyKey: string) {
    const metadata =
      Reflect.getMetadata(SWAGGER_METADATA_KEY, target, propertyKey) || {};
    metadata.operation = { summary };
    Reflect.defineMetadata(SWAGGER_METADATA_KEY, metadata, target, propertyKey);
  };
}

// API Response decorator
function ApiResponse(statusCode: number, description: string) {
  return function (target: any, propertyKey: string) {
    const metadata =
      Reflect.getMetadata(SWAGGER_METADATA_KEY, target, propertyKey) || {};
    metadata.responses = metadata.responses || {};
    metadata.responses[statusCode] = { description };
    Reflect.defineMetadata(SWAGGER_METADATA_KEY, metadata, target, propertyKey);
  };
}

// API Body decorator
function ApiBody(schema: any) {
  return function (target: any, propertyKey: string) {
    const metadata =
      Reflect.getMetadata(SWAGGER_METADATA_KEY, target, propertyKey) || {};
    metadata.requestBody = { content: { "application/json": { schema } } };
    Reflect.defineMetadata(SWAGGER_METADATA_KEY, metadata, target, propertyKey);
  };
}

// HTTP Method Decorators (Get, Post, Put, Delete) with Path Support
function createMethodDecorator(method: string) {
  return function (path: string) {
    return function (target: any, propertyKey: string) {
      const metadata =
        Reflect.getMetadata(SWAGGER_METADATA_KEY, target, propertyKey) || {};
      metadata.method = method.toLowerCase();
      metadata.path = path;
      Reflect.defineMetadata(
        SWAGGER_METADATA_KEY,
        metadata,
        target,
        propertyKey
      );
    };
  };
}

const Get = createMethodDecorator("GET");
const Post = createMethodDecorator("POST");
const Put = createMethodDecorator("PUT");
const Delete = createMethodDecorator("DELETE");

// Get Swagger metadata for a method
function getSwaggerMetadata(target: any, propertyKey: string) {
  return Reflect.getMetadata(SWAGGER_METADATA_KEY, target, propertyKey);
}

// Get controller-level tags metadata
function getControllerTags(target: any) {
  return Reflect.getMetadata(SWAGGER_METADATA_KEY, target.prototype);
}

export {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  Get,
  Post,
  Put,
  Delete,
  getSwaggerMetadata,
  getControllerTags,
};
