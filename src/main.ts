import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";
import { NestFactory, Reflector } from "@nestjs/core";
import cookieParser from "cookie-parser";
import express from "express";
import mongoose from "mongoose";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

async function bootstrap() {
	console.log('MONGO_URI:', process.env.MONGO_URI);
	const app = await NestFactory.create(AppModule);

	const staticAllowedOrigins = [
		"https://frontend-taleon.onrender.com",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
	];

	const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
		.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean);

	const allowedOrigins = new Set([...staticAllowedOrigins, ...envAllowedOrigins]);

	const isLocalDevOrigin = (origin: string) => {
		return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
	};

	app.enableCors({
		origin: (origin, callback) => {
			// Allow requests with no origin (like mobile apps or curl requests)
			if (!origin) return callback(null, true);
			if (allowedOrigins.has(origin) || isLocalDevOrigin(origin)) {
				return callback(null, true);
			}
			return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
		},
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		credentials: true,
		allowedHeaders: "Content-Type, Authorization, X-Requested-With",
		exposedHeaders: "Authorization",
	});

	// Explicitly add JSON body parser BEFORE cookie parser
	app.use(express.json({ limit: "10mb" }));
	app.use(express.urlencoded({ extended: true, limit: "10mb" }));
	app.use(cookieParser());

	// Debug middleware to log raw request body
	app.use((req: any, res: any, next: any) => {
		if (req.method === "PATCH" || req.method === "POST") {
			console.log("[Middleware] Raw body type:", typeof req.body);
			console.log("[Middleware] Raw body:", req.body ? JSON.stringify(req.body).substring(0, 300) : "(undefined)");
		}
		next();
	});

	app.setGlobalPrefix("api", { exclude: [""] });

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: false,
			transform: true,
			transformOptions: {
				enableImplicitConversion: true,
			},
		}),
	);

	app.useGlobalFilters(new HttpExceptionFilter());

	// Use global guard with proper reflector injection
	const reflector = app.get(Reflector);
	const jwtAuthGuard = new JwtAuthGuard(reflector);
	app.useGlobalGuards(jwtAuthGuard);

	app.enableShutdownHooks();

	mongoose.connection.on("connected", () => {
		console.log("[DB] MongoDB connected successfully");
	});
	mongoose.connection.on("error", (err) => {
		console.error("[DB] MongoDB connection error:", err);
	});
	mongoose.connection.on("disconnected", () => {
		console.warn("[DB] MongoDB disconnected");
	});

	const port = Number(process.env.PORT) || 4000;

	await app.listen(port, "0.0.0.0");
	console.log(`[Server] Application is running on port ${port}`);
}

bootstrap();
