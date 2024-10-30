// src/services/Express.ts
import express, { Application } from "express";
import path from "path";
import passport from "passport";
import NamedRoutes from "named-routes";
import session from "express-session";
import routes from "../routes";
import expressLayouts from "express-ejs-layouts";
import { JWT_SECRET } from "../config/index";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const setupExpressApp = async (app: Application) => {
  // Initialize NamedRoutes
  const namedRoutes = new NamedRoutes();
  namedRoutes.extendExpress(app as express.Express);
  namedRoutes.registerAppHelpers(app as express.Express);
  // Configure CORS
  app.use(
    cors({
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

    app.use(
      cors({
        origin: "http://localhost:5000", // Allow requests from the API Gateway's URL
        credentials: true,
      })
    );
  // Setup view engine
  app.use(expressLayouts);
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "../views"));
  app.set("layout", "layouts/mainlayout");
  //
  const imagePath = path.join(__dirname, "../public/images");
  app.use("/images", express.static(imagePath));
  // Middleware setup
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Session setup
  app.use(
    session({
      secret: JWT_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );
  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());
  // Initialize Routes
  app.use(routes);

  return app;
};

export default setupExpressApp;
