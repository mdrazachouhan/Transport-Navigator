import { Request, Response, NextFunction } from "express";

export function setupCors(req: Request, res: Response, next: NextFunction) {
    const origins = new Set<string>();

    if (process.env.REPLIT_DEV_DOMAIN) {
        origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}`);
        origins.add(`https://${process.env.REPLIT_DEV_DOMAIN}:5000`);
    }

    if (process.env.REPLIT_DOMAINS) {
        process.env.REPLIT_DOMAINS.split(",").forEach((d: string) => {
            origins.add(`https://${d.trim()}`);
            origins.add(`https://${d.trim()}:5000`);
        });
    }

    const origin = req.header("origin");

    const isLocalhost =
        origin?.startsWith("http://localhost:") ||
        origin?.startsWith("http://127.0.0.1:") ||
        origin?.startsWith("http://10.") ||
        origin?.startsWith("http://192.168.");

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
}
