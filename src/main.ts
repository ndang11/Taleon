import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.setGlobalPrefix("api");

	app.enableCors({
		origin: ["http://localhost:3000", "http://localhost:3001"],
		credentials: true,
	});

	app.enableShutdownHooks();

	const port = Number(process.env.PORT) || 3000;

	await app.listen(port, "0.0.0.0");

	console.log(`Server running on http://localhost:${port}`);
}

bootstrap();
