# Project Name

NodeJs and ExpressJs Backend Setup with EJS Admin Portals

## Project Description

This is a Node.js project using Express, TypeScript, and MongoDB, designed to handle both a mobile application API and an admin portal with EJS templates. The project also integrates Passport for authentication, Multer for file uploads, Joi for validation, Redis for caching, and named routes for the web routes.

## Getting Started

### Project Structure

```plaintext
project-root/
│
├── public/                 # Static files (CSS, images, etc.)               
├── src/
│   ├── config/             # Configuration files (e.g., database, Redis, passport)
│   │   ├── index.ts
│   │   ├── swagger.ts
│   ├── controllers/        # REST Controllers for handling requests
│   │   ├── web/            # Controllers for web (admin portal) routes
│   │   │   ├── admin.ts 
│   │   │   ├── auth.ts  
│   │   │   ├── user.ts   
│   │   │   ├── index.ts 
│   │   ├── api/            # REST Controllers for API (mobile application) routes
│   │   │   ├── auth.ts   
│   │   │   ├── user.ts   
│   │   │   ├── product.ts
│   │   │   ├── index.ts 
│   │   ├── index.ts        # Main controller index
│   ├── graphql/            # GraphQL Schema and Resolvers for mobile API
│   │   ├── schemas/        # Define GraphQL schema files
│   │   │   ├── userSchema.ts
│   │   │   ├── productSchema.ts
│   │   │   ├── index.ts    # Aggregate and export all schemas
│   │   ├── resolvers/      # Define GraphQL resolver files
│   │   │   ├── userResolver.ts
│   │   │   ├── productResolver.ts
│   │   │   ├── index.ts    # Aggregate and export all resolvers
│   │   ├── context.ts      # GraphQL context setup (e.g., auth, data loaders)
│   ├── decorators/         # decorators for custom decorators
│   │   ├── swagger.decorator.ts 
│   ├── interfaces/         # Interfaces for REST and GraphQL
│   ├── middlewares/        # Custom middleware (auth, file uploads, validation)
│   │   ├── auth.ts
│   │   ├── uploads.ts
│   │   ├── validation.ts
│   ├── models/             # MongoDB Models (using Mongoose)
│   │   ├── user.ts
│   │   ├── product.ts
│   │   ├── role.ts
│   │   ├── category.ts
│   │   ├── brand.ts
│   ├── repository/         # Repository pattern for data access
│   │   ├── BaseRepository.ts
│   │   ├── TestRepository.ts
│   ├── routes/             # Route definitions for different parts of the application
│   │   ├── web/            # Web routes for the Admin portal (EJS)
│   │   │   ├── admin.ts    
│   │   │   ├── auth.ts     
│   │   │   ├── user.ts     
│   │   │   ├── index.ts 
│   │   ├── api/            # REST API routes for the mobile application
│   │   │   ├── auth.ts     
│   │   │   ├── user.ts     
│   │   │   ├── product.ts  
│   │   │   ├── index.ts 
│   │   ├── graphql.ts      # GraphQL route for mobile API
│   │   ├── index.ts        # Main route index
│   ├── services/           # Services (e.g., database connection, Express app setup)
│   │   ├── Database.ts     
│   │   ├── ExpressApp.ts   
│   │   ├── ApolloServer.ts # GraphQL server setup using Apollo Server
│   ├── types/              # TypeScript type definitions (interfaces, enums, etc.)
│   ├── utils/              # Utility functions (e.g., validation helpers, caching helpers)
│   ├── validations/        # Validations functions
│   ├── views/              # EJS views for the admin portal
│   │   ├── layouts/        
│   │   │   ├── mainlayout.ejs
│   │   │   ├── authlayout.ejs
│   │   │   ├── header.ejs
│   │   │   ├── footer.ejs
│   │   │   ├── sidebar.ejs
│   │   ├── user/           
│   │   ├── category/       
│   │   ├── brand/          
│   │   ├── product/        
│   │   ├── login.ejs
│   │   ├── dashboard.ejs
│   └── app.ts              # Main Express app entry point
├── .env                    
├── .env.example            
├── tsconfig.json           
├── package.json            
└── README.md 
```

### Prerequisites

- **Node.js** (v18.x or higher)
- **TypeScript**
- **MongoDB**
- **Redis**

### Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

### Environment Variables

Create a .env file at the root of the project and add the following variables:

```plaintext
SESSION_SECRET=your-session-secret
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb://localhost:27017/your-database
```

### Run the Project

To start the project in development mode, run:

```bash
npm run dev
```

This will compile the TypeScript files and start the Express server.

## Features

- **Admin Portal :** Uses EJS templates for rendering the admin dashboard and other pages.
- **API for Mobile Application :** Provides RESTful API endpoints for mobile clients.
- **Authentication :** Implements Passport.js for both local and JWT authentication.
- **File Uploads:** Uses Multer to handle file uploads for the web and API routes.
- **Validation :** Uses Joi for request validation in both web and API routes.
- **Caching :** Integrates Redis for session management and caching.
- **Named Routes :**
The project uses named-routes to manage named routes in the web routes (admin portal). Named routes are helpful for generating URLs in views and controllers.

Middleware
Authentication: Middleware to check if a user is authenticated before accessing protected routes.
File Uploads: Middleware to handle file uploads using Multer.
Validation: Middleware to validate incoming requests using Joi.
Folder Structure Overview
Controllers: Handle business logic for web and API routes.
Middlewares: Custom middlewares for authentication, file uploads, and validation.
Models: MongoDB models using Mongoose for handling data persistence.
Routes: Define routes for both the web and API parts of the application.
Views: EJS templates for rendering pages in the admin portal.
Services: Core services for the application, such as database connection and app setup.
Utils: Utility functions that can be reused across the application.
Contribution
Feel free to fork this project and contribute by creating pull requests. Ensure your code follows the existing structure and conventions.

## License

This project is licensed under the MIT License.
