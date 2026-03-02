import "dotenv/config";
import express from "express";
import path from "path";
import { createServer } from "http";
import { Server as SocketServer } from "socket.io";
import { connectDB } from "./config/db";
import { storage } from "./storage";
import { setupCors } from "./middleware/cors";
import { requestLogger } from "./middleware/logging";
import { errorHandler } from "./middleware/error";
import { registerRoutes } from "./routes";
import { createProxyMiddleware } from "http-proxy-middleware";

async function startServer() {
    const app = express();
    const port = process.env.PORT || 5000;

    // Connect to Database
    await connectDB();

    // Root configuration
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(setupCors);
    app.use((req, _res, next) => {
        console.log(`[REQUEST] ${req.method} ${req.url} from ${req.ip}`);
        next();
    });
    app.use(requestLogger);

    // Serve static files (logo, etc if needed)
    app.use("/assets", express.static("assets"));

    const httpServer = createServer(app);

    // Socket.io initialization
    const io = new SocketServer(httpServer, {
        cors: { origin: "*", methods: ["GET", "POST"] },
        path: "/socket.io",
    });

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on("driver:location", async (data: { driverId: string; lat: number; lng: number }) => {
            await storage.updateUser(data.driverId, { location: { lat: data.lat, lng: data.lng } });
            io.emit("driver:location:update", data);
        });

        socket.on("driver:online", async (data: { driverId: string }) => {
            await storage.updateUser(data.driverId, { isOnline: true });
            socket.join(`driver:${data.driverId}`);
        });

        socket.on("driver:offline", async (data: { driverId: string }) => {
            await storage.updateUser(data.driverId, { isOnline: false });
        });

        socket.on("disconnect", () => {
            console.log("Socket disconnected:", socket.id);
        });
    });

    // Register API Routes
    app.use("/api", registerRoutes(io));

    // Serve Admin Web Panel
    if (process.env.NODE_ENV === "development") {
        console.log("[PROXY] Admin Panel requests being proxied to http://localhost:5173");
        app.use("/admin", createProxyMiddleware({
            target: "http://localhost:5173",
            changeOrigin: true,
            pathRewrite: { '^/admin': '/admin' }
        }));
    } else {
        const adminPath = path.join(process.cwd(), "admin-web", "dist");
        app.use("/admin", express.static(adminPath));
        app.get(/^\/admin/, (_req, res) => {
            res.sendFile(path.join(adminPath, "index.html"));
        });
    }

    // UI Routes (HTML Templates)


    app.get("/", (_req, res) => {
        res.sendFile("landing-page.html", { root: "server/templates" });
    });

    // Global Error Handler
    app.use(errorHandler);

    // Seed default data
    await storage.seedDefaults();

    httpServer.on("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${port} is already in use.`);
        } else {
            console.error("Server error:", err);
        }
    });

    httpServer.listen({ port, host: "0.0.0.0" }, () => {
        console.log(`Express server serving on port ${port}`);
    });
}

startServer().catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
});
