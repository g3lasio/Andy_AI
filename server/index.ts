import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import router from "./routes";
import onboardingRouter from "./routes/onboarding";

const app = express();
const server = createServer(app);

// Middleware para parsear JSON y form data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware de logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Usar las rutas API
app.use(router);
app.use('/api/onboarding', onboardingRouter);

// Middleware de manejo de errores global
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  console.error('Server error:', err);
  res.status(status).json({ message });
});

// Función principal asíncrona para iniciar el servidor
const startServer = async () => {
  try {
    // Setup Vite en desarrollo
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
    const VITE_PORT = 5173;
    
    if (app.get("env") === "development") {
      server.listen(VITE_PORT, "0.0.0.0", () => {
        log(`✅ Servidor de desarrollo iniciado en puerto ${VITE_PORT}`);
      });
    } else {
      server.listen(PORT, "0.0.0.0", () => {
        log(`✅ Servidor iniciado en puerto ${PORT}`);
      });
    }
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Iniciar el servidor
startServer();
