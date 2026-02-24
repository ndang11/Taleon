import { Controller, Get } from "@nestjs/common";

@Controller()
export class HealthController {
	@Get()
	health() {
		return {
			status: "ok",
			service: "taleon-api",
			environment: process.env.NODE_ENV,
			timestamp: new Date().toISOString(),
		};
	}
}
