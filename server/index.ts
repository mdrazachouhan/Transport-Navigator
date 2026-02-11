import express from "express";
import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { registerRoutes } from "./routes";
import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
      origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}:5000`);
    }

    if (process.env.REPLIT_DOMAINS) {
      process.env.REPLIT_DOMAINS.split(",").forEach((d) => {
        origins.add(`https://${d.trim()}`);
        origins.add(`https://${d.trim()}:5000`);
      });
    }

    const origin = req.header("origin");

    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    const isReplitOrigin = origin && process.env.REPLIT_DEV_DOMAIN &&
      origin.includes(process.env.REPLIT_DEV_DOMAIN);

    if (origin && (origins.has(origin) || isLocalhost || isReplitOrigin)) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS",
      );
      res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.header("Access-Control-Allow-Credentials", "true");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(200);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const adminTemplatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "admin-panel.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const adminTemplate = fs.readFileSync(adminTemplatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.get("/admin", (req: Request, res: Response) => {
    const forwardedProto = req.header("x-forwarded-proto");
    const protocol = forwardedProto || req.protocol || "https";
    const forwardedHost = req.header("x-forwarded-host");
    const host = forwardedHost || req.get("host");
    const baseUrl = `${protocol}://${host}`;
    const html = adminTemplate.replace(/BASE_URL_PLACEHOLDER/g, baseUrl);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest" && req.path !== "/customer" && req.path !== "/driver") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    if (req.path === "/customer" || req.path === "/driver") {
      const mode = req.path === "/customer" ? "customer" : "driver";
      const forwardedProto = req.header("x-forwarded-proto");
      const protocol = forwardedProto || req.protocol || "https";
      const forwardedHost = req.header("x-forwarded-host");
      const host = forwardedHost || req.get("host");
      const expoPort = 8081;
      const expoHost = process.env.REPLIT_DEV_DOMAIN
        ? `https://${process.env.REPLIT_DEV_DOMAIN}`.replace(/:5000$/, '')
        : `http://localhost:${expoPort}`;
      const redirectUrl = `${expoHost}:${expoPort}?mode=${mode}`;
      const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${appName} - ${mode === 'customer' ? 'Customer' : 'Driver'} App</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#0A1628;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:24px}
.wrap{max-width:400px}.icon{width:80px;height:80px;border-radius:20px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center}
.icon.customer{background:rgba(27,110,243,0.15)}.icon.driver{background:rgba(0,201,167,0.15)}
.icon svg{width:40px;height:40px}h1{font-size:28px;margin-bottom:12px}p{color:rgba(255,255,255,0.6);margin-bottom:32px;line-height:1.6}
.info-card{background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:24px;margin-bottom:24px;text-align:left}
.info-card h3{font-size:16px;margin-bottom:12px;color:rgba(255,255,255,0.9)}.step{display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.step-num{width:24px;height:24px;border-radius:50%;background:${mode === 'customer' ? 'rgba(27,110,243,0.2)' : 'rgba(0,201,167,0.2)'};color:${mode === 'customer' ? '#1B6EF3' : '#00C9A7'};display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
.step-text{font-size:14px;color:rgba(255,255,255,0.7);line-height:1.4}
.env-badge{display:inline-block;background:rgba(255,255,255,0.08);padding:4px 10px;border-radius:6px;font-size:13px;font-family:monospace;color:${mode === 'customer' ? '#1B6EF3' : '#00C9A7'}}
.back{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,0.5);font-size:14px;margin-top:16px;text-decoration:none;transition:color 0.3s}.back:hover{color:#fff}
</style></head><body><div class="wrap">
<div class="icon ${mode}">
<img src="/assets/images/logo.png" alt="${appName}" style="width:50px;height:50px;object-fit:contain;">
</div>
<h1>${appName} ${mode === 'customer' ? 'Customer' : 'Driver'}</h1>
<p>To use the ${mode === 'customer' ? 'Customer' : 'Driver'} App on your phone, follow these steps:</p>
<div class="info-card">
<h3>How to Open on Phone</h3>
<div class="step"><div class="step-num">1</div><div class="step-text">Install <strong>Expo Go</strong> app from Play Store / App Store (free)</div></div>
<div class="step"><div class="step-num">2</div><div class="step-text">Set app mode environment variable to:<br><span class="env-badge">EXPO_PUBLIC_APP_MODE=${mode}</span></div></div>
<div class="step"><div class="step-num">3</div><div class="step-text">Scan the QR code from the Replit URL bar menu</div></div>
<div class="step"><div class="step-num">4</div><div class="step-text">The ${mode === 'customer' ? 'Customer' : 'Driver'} App will open in Expo Go</div></div>
</div>
<a href="/" class="back"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg> Back to Home</a>
</div></body></html>`;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.status(200).send(html);
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });
}

(async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error("MONGODB_URI environment variable is required");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, { dbName: 'transportgo' });
    log("Connected to MongoDB Atlas");
    await storage.seedDefaults();
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }

  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  configureExpoAndLanding(app);

  const server = await registerRoutes(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
    },
  );
})();
