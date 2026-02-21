import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";
import { NestFactory, Reflector } from "@nestjs/core";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";

async function bootstrap() {
	console.log('MONGO_URI:', process.env.MONGO_URI);
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: [
			"https://frontend-taleon.onrender.com",
			"http://localhost:3000",
		],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
		credentials: true,
		allowedHeaders: "Content-Type, Authorization, X-Requested-With",
		exposedHeaders: "Authorization",
	});

	app.use(cookieParser());

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
