import express from "express";
import cors from "cors";
import proxy from "express-http-proxy";
import dotenv from "dotenv"; // Import dotenv

dotenv.config(); // Load environment variables from .env file

const app = express();

app.use(cors());
app.use(express.json());

// Ensure the URLs are defined before using them
const userServiceUrl = process.env.USER_SERVICE_URL;
const productServiceUrl = process.env.PRODUCT_SERVICE_URL;
const notificationServiceUrl = process.env.NOTIFICATION_SERVICE_URL;

if (!userServiceUrl) {
  console.error("USER_SERVICE_URL is not defined");
}
if (!productServiceUrl) {
  console.error("PRODUCT_SERVICE_URL is not defined");
}
if (!notificationServiceUrl) {
  console.error("NOTIFICATION_SERVICE_URL is not defined");
}

app.use("/user", proxy(userServiceUrl || ""));
app.use("/product", proxy(productServiceUrl || ""));
app.use("/notification", proxy(notificationServiceUrl || ""));

app.listen(5000, () => {
  console.log("Gateway is Listening to Port 8000");
});
