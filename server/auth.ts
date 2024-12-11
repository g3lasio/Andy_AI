import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { type Express } from "express";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { users, insertUserSchema } from "@db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

const scryptAsync = promisify(scrypt);

const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

declare global {
  namespace Express {
    interface User extends typeof users.$inferSelect {}
  }
}

async function createTestUser(db: any) {
  try {
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.username, "test"))
      .limit(1);

    if (!existingUser) {
      const hashedPassword = await crypto.hash("test123");
      await db.insert(users).values({
        username: "test",
        password: hashedPassword,
      });
      console.log("Usuario de prueba creado: test/test123");
    }
  } catch (error) {
    console.error("Error creando usuario de prueba:", error);
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  
  // Crear usuario de prueba
  createTestUser(db);
  
  app.use(
    session({
      secret: process.env.REPL_ID || "andy-ai-secret",
      resave: false,
      saveUninitialized: false,
      store: new MemoryStore({
        checkPeriod: 86400000, // 24h
      }),
      cookie: {
        secure: app.get("env") === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24h
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.username, username))
          .limit(1);

        if (!user) {
          return done(null, false, { message: "El usuario no existe" });
        }

        const isMatch = await crypto.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "La contraseña es incorrecta" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Auth routes
  app.post("/api/register", async (req, res, next) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).send(
          "Datos inválidos: " + result.error.issues.map(i => i.message).join(", ")
        );
      }

      const { username, password } = result.data;

      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("El usuario ya existe");
      }

      const hashedPassword = await crypto.hash(password);

      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      req.login(newUser, (err) => {
        if (err) return next(err);
        return res.json({
          message: "Registro exitoso",
          user: { id: newUser.id, username: newUser.username },
        });
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).send("Usuario y contraseña son requeridos");
    }

    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        console.error("Auth error:", err);
        return next(err);
      }
      
      if (!user) {
        console.log("Login failed:", info);
        return res.status(401).json({
          error: true,
          message: info?.message || "Usuario o contraseña incorrectos"
        });
      }

      try {
        await new Promise((resolve, reject) => {
          req.logIn(user, (err) => {
            if (err) reject(err);
            else resolve(user);
          });
        });
        return res.json({
          ok: true,
          message: "Inicio de sesión exitoso",
          user: { id: user.id, username: user.username },
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).send("Error al cerrar sesión");
      }
      res.json({ message: "Sesión cerrada exitosamente" });
    });
  });

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      return res.json(req.user);
    }
    res.status(401).send("No autenticado");
  });
}
