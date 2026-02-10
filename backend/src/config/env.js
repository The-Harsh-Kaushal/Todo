export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
export const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
export const PORT = process.env.PORT || 5000;
export const DB_URL = process.env.DB_URL || "mongodb://localhost:27017/ToDoList";
export const AT_LIFE = process.env.AT_LIFE || "1h";
export const RT_LIFE = process.env.RT_LIFE || "7d";

// postman collection link for all the apis

// https://promatics-harshkaushal-7837737.postman.co/workspace/Harsh-Kaushal's-Workspace~353120ee-6b35-4dd0-84bd-fdc0b9a8adc7/collection/52224668-804d7a2a-a6ad-4890-be38-5290b633ec49?action=share&source=copy-link&creator=52224668