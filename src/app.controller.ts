import { Controller, Get, UseGuards } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
	@Public()
	@Get("api")
	getHello() {
		return "Hello World!";
	}
}
