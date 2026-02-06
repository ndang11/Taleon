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
import type { UserDocument } from "src/schemas/users.schema";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
// biome-ignore lint/style/useImportType: NestJS uses this for dependency injection.
import { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(private readonly usersService: UsersService) {}

	@Get()
	@Public()
	findAll() {
		return this.usersService.findAll();
	}

	@Get("me")
	getMe(@CurrentUser() user: UserDocument) {
		return user;
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
