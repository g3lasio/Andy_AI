import type { Express } from "express";
import { createServer } from "http";
import { setupAuth } from "./auth";
import { db } from "../db";
import { creditReports, transactions, users } from "@db/schema";
import { eq } from "drizzle-orm";
import { analyzeFinancialData, generateChatResponse } from "./ai";

export function registerRoutes(app: Express) {
  setupAuth(app);
  const httpServer = createServer(app);

  // Credit score endpoint
  app.get("/api/credit/score", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const [latestReport] = await db
      .select()
      .from(creditReports)
      .where(eq(creditReports.userId, req.user.id))
      .orderBy(creditReports.reportDate)
      .limit(1);

    res.json(latestReport);
  });

  // Transactions summary endpoint
  app.get("/api/transactions/summary", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, req.user.id))
      .orderBy(transactions.date);

    const income = userTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expenses = userTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = income - expenses;

    // Calculate monthly trends
    const trends = userTransactions.reduce((acc: any[], t) => {
      const date = new Date(t.date!).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
      });
      
      const existing = acc.find(a => a.date === date);
      if (existing) {
        existing.balance += Number(t.type === 'income' ? t.amount : -t.amount);
      } else {
        acc.push({
          date,
          balance: Number(t.type === 'income' ? t.amount : -t.amount)
        });
      }
      
      return acc;
    }, []);

    res.json({
      balance,
      income,
      expenses,
      transactions: userTransactions.slice(-10), // Last 10 transactions
      trends
    });
  });

  // AI Chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    const { message } = req.body;
    
    try {
      // Obtener datos del usuario
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, req.user.id))
        .orderBy(transactions.date);

      const [latestCreditReport] = await db
        .select()
        .from(creditReports)
        .where(eq(creditReports.userId, req.user.id))
        .orderBy(creditReports.reportDate)
        .limit(1);

      // Generar respuesta del chat
      const response = await generateChatResponse(message, {
        transactions: userTransactions,
        creditReport: latestCreditReport,
        previousMessages: [] // TODO: Implementar historial de mensajes
      });

      // Analizar datos financieros
      const analysis = await analyzeFinancialData(
        userTransactions,
        latestCreditReport
      );

      res.json({
        response,
        analysis
      });
    } catch (error) {
      console.error("Error in AI chat:", error);
      res.status(500).send("Error procesando el mensaje");
    }
  });

  // Current financial analysis endpoint
  app.get("/api/analysis/current", async (req, res) => {
    if (!req.user) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const userTransactions = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, req.user.id))
        .orderBy(transactions.date);

      const [latestCreditReport] = await db
        .select()
        .from(creditReports)
        .where(eq(creditReports.userId, req.user.id))
        .orderBy(creditReports.reportDate)
        .limit(1);

      const analysis = await analyzeFinancialData(
        userTransactions,
        latestCreditReport
      );

      res.json(analysis);
    } catch (error) {
      console.error("Error in analysis:", error);
      res.status(500).send("Error generando análisis");
    }
  });

  return httpServer;
}
