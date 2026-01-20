import { Controller, Get } from "@nestjs/common";
import { Public } from "./common/decorators/public.decorator";

@Controller()
export class AppController {
	@Public()
	@Get()
	getHello() {
		return "Welcome to my blog post API";
	}

	@Public()
	@Get("api")
	getApiHello() {
		return "Hello World!";
	}
}
