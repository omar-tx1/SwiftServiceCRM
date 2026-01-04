import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertCustomerSchema,
  insertInvoiceSchema,
  insertJobSchema,
  insertLeadSchema,
  insertNotificationSchema,
  insertQuoteSchema,
  insertTransactionSchema
} from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

type RequestRole = "admin" | "dispatcher" | "field";

function getRole(req: any): RequestRole | null {
  const roleHeader = (req.headers["x-user-role"] as string | undefined)?.toLowerCase();
  if (roleHeader === "dispatcher" || roleHeader === "field" || roleHeader === "admin") {
    return roleHeader;
  }
  return null;
}

const requireRole = (allowed: RequestRole[]) => (req: any, res: any, next: any) => {
  const role = getRole(req);
  if (!role) {
    return res.status(401).json({ error: "Missing or invalid role" });
  }
  if (!allowed.includes(role)) {
    return res.status(403).json({ error: `Requires role: ${allowed.join(", ")}` });
  }
  next();
};

const authSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["admin", "dispatcher", "field"]).optional(),
});

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(stored: string, password: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(derived, "hex"));
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ============ AUTH ============
  app.post("/api/auth/register", async (req, res) => {
    try {
      const parsed = authSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }

      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(409).json({ error: "Username already exists" });
      }

      const userCount = await storage.countUsers();
      const requestedRole = parsed.data.role ?? "dispatcher";
      if (userCount > 0) {
        const role = getRole(req);
        if (role !== "admin") {
          return res.status(403).json({ error: "Only admins can create additional users" });
        }
      }

      const roleToAssign = userCount === 0 ? "admin" : requestedRole;
      const hashedPassword = hashPassword(parsed.data.password);
      const user = await storage.createUser({
        username: parsed.data.username,
        password: hashedPassword,
        role: roleToAssign,
      });

      res.status(201).json({ id: user.id, username: user.username, role: user.role });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const parsed = authSchema.pick({ username: true, password: true }).safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: fromZodError(parsed.error).message });
      }

      const user = await storage.getUserByUsername(parsed.data.username);
      if (!user || !verifyPassword(user.password, parsed.data.password)) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ CUSTOMERS ============
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.getCustomer(parseInt(req.params.id));
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const result = insertCustomerSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const customer = await storage.createCustomer(result.data);
      res.status(201).json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const customer = await storage.updateCustomer(parseInt(req.params.id), req.body);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const success = await storage.deleteCustomer(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ JOBS ============
  app.get("/api/jobs", async (req, res) => {
    try {
      const jobs = await storage.getJobs();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.getJob(parseInt(req.params.id));
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/jobs", async (req, res) => {
    try {
      const result = insertJobSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const job = await storage.createJob(result.data);
      res.status(201).json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    try {
      const job = await storage.updateJob(parseInt(req.params.id), req.body);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    try {
      const success = await storage.deleteJob(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ QUOTES ============
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(parseInt(req.params.id));
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const result = insertQuoteSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const quote = await storage.createQuote(result.data);
      res.status(201).json(quote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.updateQuote(parseInt(req.params.id), req.body);
      if (!quote) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.json(quote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/quotes/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuote(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Quote not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TRANSACTIONS ============
  app.get("/api/transactions", async (req, res) => {
    try {
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const result = insertTransactionSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const transaction = await storage.createTransaction(result.data);
      res.status(201).json(transaction);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const success = await storage.deleteTransaction(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Transaction not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ LEADS ============
  app.get("/api/leads", requireRole(["admin", "dispatcher", "field"]), async (_req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/leads", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const result = insertLeadSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const lead = await storage.createLead(result.data);
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/leads/:id", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const lead = await storage.updateLead(parseInt(req.params.id), req.body);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/leads/:id", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const success = await storage.deleteLead(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ INVOICES ============
  app.get("/api/invoices", requireRole(["admin", "dispatcher", "field"]), async (_req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/invoices", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const result = insertInvoiceSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const invoice = await storage.createInvoice(result.data);
      res.status(201).json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch("/api/invoices/:id", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const invoice = await storage.updateInvoice(parseInt(req.params.id), req.body);
      if (!invoice) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/invoices/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const success = await storage.deleteInvoice(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Invoice not found" });
      }
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ NOTIFICATIONS ============
  app.get("/api/notifications", requireRole(["admin", "dispatcher", "field"]), async (_req, res) => {
    try {
      const notifications = await storage.getNotifications();
      res.json(notifications);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications", requireRole(["admin", "dispatcher"]), async (req, res) => {
    try {
      const result = insertNotificationSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: fromZodError(result.error).message });
      }
      const notification = await storage.createNotification(result.data);
      res.status(201).json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications/:id/read", requireRole(["admin", "dispatcher", "field"]), async (req, res) => {
    try {
      const notification = await storage.markNotificationRead(parseInt(req.params.id));
      if (!notification) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.json(notification);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications/read-all", requireRole(["admin", "dispatcher", "field"]), async (_req, res) => {
    try {
      const count = await storage.markAllNotificationsRead();
      res.json({ updated: count });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/notifications", requireRole(["admin"]), async (_req, res) => {
    try {
      const deleted = await storage.clearNotifications();
      res.json({ deleted });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SMS ============
  app.post("/api/send-sms", async (req, res) => {
    try {
      const { phone, message } = req.body;
      if (!phone || !message) {
        return res.status(400).json({ error: "Phone and message are required" });
      }
      // Mock SMS sending - in production this would use Twilio
      console.log(`SMS sent to ${phone}: ${message}`);
      res.json({ success: true, message: "SMS sent successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
