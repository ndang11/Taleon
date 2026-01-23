import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { JwtUser } from "../auth/interfaces/jwt-user.interface";
import { AuthGuard } from "../common/guards/auth.guard";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import type { PostsService } from "./posts.service";

@Controller("posts")
@UseGuards(AuthGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}
	@Post()
	@UseInterceptors(FileInterceptor("image"))
	async create(
		@Body() dto: CreatePostDto,
		@CurrentUser() user: JwtUser,
		@UploadedFile() image?: any,
	) {
		console.log("AUTH USER:", user);
		if (!user || !user.tenantId) {
			throw new BadRequestException("Invalid authenticated user");
		}
		return this.postsService.create(dto, user, image);
	}

	@Get()
	async findAll(@CurrentUser() user: JwtUser) {
		return this.postsService.findAllByTenant(user.tenantId);
	}

	@Get(":id")
	async findOne(@Param("id") id: string, @CurrentUser() user: JwtUser) {
		return this.postsService.findOne(id, user.tenantId);
	}

	@Patch(":id")
	@UseInterceptors(FileInterceptor("image"))
	async update(
		@Param("id") id: string,
		@Body() dto: UpdatePostDto,
		@CurrentUser() user: JwtUser,
		@UploadedFile() image?: any,
	) {
		return this.postsService.update(id, dto, user.tenantId, user.userId, image);
	}

	@Delete(":id")
	async remove(@Param("id") id: string, @CurrentUser() user: JwtUser) {
		return this.postsService.remove(id, user.tenantId, user.userId);
	}
}
