import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic } from "./vite";
import chatRouter from "./routes/chat";

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const server = createServer(app);

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Chat route
app.use("/api/chat", chatRouter);

// Start server function
const startServer = async () => {
  try {
    const PORT = process.env.PORT || 4000; // Cambiado a 4000

    if (process.env.NODE_ENV !== "production") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server error:", error);
    process.exit(1);
  }
};

startServer();
