import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
	CurrentUser,
	type JwtUserPayload,
} from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
// biome-ignore lint/style/useImportType: Needed for NestJS DI
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Public()
	findAll() {
		return this.usersService.findAll();
	}

	@Get("me")
	getMe(@CurrentUser() user: JwtUserPayload) {
		return user;
	}

	@UseGuards(AuthGuard("jwt"))
	@Get("me/analytics")
	async getMyAnalytics(@CurrentUser() user: JwtUserPayload) {
		if (!user?.userId) {
			throw new Error("User ID not found in request. Check JWT strategy.");
		}

		return this.usersService.getAnalytics(user.userId);
	}

	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.usersService.findOne(id);
	}

	@Post()
	@Public()
	create(@Body() body: { name: string; email: string; password: string }) {
		return this.usersService.create(body);
	}

	@Put(":id")
	update(
		@Param("id") id: string,
		@Body() body: { name?: string; bio?: string; avatar?: string },
	) {
		return this.usersService.update(id, body);
	}

	@Delete(":id")
	delete(@Param("id") id: string) {
		return this.usersService.remove(id);
	}
}
