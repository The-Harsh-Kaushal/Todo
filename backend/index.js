import express from "express";
import cookieParser from "cookie-parser";

import { PORT, mongodConnect } from "./src/config/env.js";
import userRoutes from "./src/routes/user.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import boardRoutes from "./src/routes/board.routes.js";
import listRoutes from "./src/routes/list.routes.js";
import taskRoutes from "./src/routes/task.routes.js";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/board", boardRoutes);
app.use("/api/list", listRoutes);
app.use("/api/task", taskRoutes);

try {
  await mongodConnect();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
} catch (error) {
  console.error("Error starting the server:", error);
}
