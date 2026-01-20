import {
	Body,
	Controller,
	Delete,
	Get,
	Post as HttpPost,
	Param,
	Patch,
} from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import type { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@HttpPost()
	create(@Body() dto: CreatePostDto, @CurrentUser() user) {
		return this.postsService.create(dto, user.tenantId, user.userId);
	}

	@Get()
	findAll(@CurrentUser() user) {
		return this.postsService.findAllByTenant(user.tenantId);
	}

	@Get(":id")
	findOne(@Param("id") id: string, @CurrentUser() user) {
		return this.postsService.findOne(id, user.tenantId);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user,
	) {
		return this.postsService.update(id, dto, user.tenantId, user.userId);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @CurrentUser() user) {
		return this.postsService.remove(id, user.tenantId, user.userId);
	}
}
