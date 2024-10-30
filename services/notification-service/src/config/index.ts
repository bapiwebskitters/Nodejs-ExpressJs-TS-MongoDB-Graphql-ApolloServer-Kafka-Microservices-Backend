// src/config/index.ts
import dotenv from 'dotenv';
dotenv.config();

export const APP_NAME = process.env.APP_NAME || 'NodeJS Backend';

export const BASE_URL = process.env.HOST || 'http://localhost';
export const PORT = process.env.PORT || 8000;

export const JWT_SECRET = process.env.JWT_SECRET || 'mytoken';

export const DB_CONNECTION = process.env.DB_CONNECTION || 'moongose';
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT = process.env.DB_PORT || '27017';
export const DB_DATABASE = process.env.DB_DATABASE || 'node_backend';
export const DB_USERNAME = process.env.DB_USERNAME || '';
export const DB_PASSWORD = process.env.DB_PASSWORD || '';
