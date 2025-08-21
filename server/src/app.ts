// server/app.ts
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import { IError } from "./types";
import morgan from "morgan";
import articleRoute from "./routes/articleRoutes";

dotenv.config();

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.config();
    this.connectDB();
    this.routes();
    this.errorHandler();
  }

  private config(): void {
    this.app.use(
      cors({
        origin:"http://localhost:5173",
        // origin:"https://article-frontend-ldmr.onrender.com",
        credentials: true,
      })
    );
    this.app.use(express.json());
    this.app.use(cookieParser());
    this.app.use(morgan("dev"));
    this.app.use(express.urlencoded({ extended: true }));
  }

  private connectDB(): void {
    const MONGO_URI = `${process.env.MONGO_URI}/Article` as string;

    mongoose
      .connect(MONGO_URI)
      .then(() => console.log("MongoDB connected successfully"))
      .catch((err) => console.error("MongoDB connection error:", err));

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB error:", err);
    });
  }

  private routes(): void {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("Article Feeds API is running...");
    });

    this.app.use("/api/auth", authRoutes);
    this.app.use('/api/articles', articleRoute);

    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: "Route not found" });
    });
  }

  private errorHandler(): void {
    this.app.use(
      (err: IError, req: Request, res: Response, next: NextFunction) => {
        const status = err.status || 500;
        const message = err.message || "Internal Server Error";

        console.error(err.stack);

        res.status(status).json({
          message,
          stack: process.env.NODE_ENV === "production" ? "🥞" : err.stack,
        });
      }
    );
  }
}

export default new App().app;
