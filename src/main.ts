import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.enableCors({
		origin: [
			"https://frontend-taleon.onrender.com"
		],
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		credentials: true,
		allowedHeaders: "Content-Type, Accept, Authorization",
		exposedHeaders: "Authorization",
	});

	app.use(cookieParser());

	app.setGlobalPrefix("api", { exclude: [""] });

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.useGlobalFilters(new HttpExceptionFilter());

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
