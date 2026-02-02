import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common/pipes/validation.pipe";
import { NestFactory } from "@nestjs/core";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.use(cookieParser());

	app.setGlobalPrefix("api");

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	app.enableCors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
	});

	app.enableShutdownHooks();

	const port = Number(process.env.PORT) || 4000;

	await app.listen(port, "0.0.0.0");
}

bootstrap();
