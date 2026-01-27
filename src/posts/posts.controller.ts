import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { FileInterceptor } from "@nestjs/platform-express";
import { Public } from "../common/decorators/public.decorator";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { TenantContextService } from "../multi-tenant/tenant-context.service";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
	constructor(
		private readonly postsService: PostsService,
		private readonly tenantContext: TenantContextService,
	) {}

	@UseGuards(AuthGuard("jwt"), TenantGuard)
	@Post()
	create(@Body() createPostDto: CreatePostDto) {
		return this.postsService.create(
			createPostDto,
			this.tenantContext.requiredUserId,
			this.tenantContext.requiredTenantId,
		);
	}

	@Public()
	@Get()
	findAll(@Query("public") isPublic?: string) {
		const publicFlag =
			isPublic === "true" ? true : isPublic === "false" ? false : undefined;
		return this.postsService.findAll(this.tenantContext.tenantId, publicFlag);
	}

	@Public()
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.postsService.findOne(id, this.tenantContext.tenantId);
	}

	@Public()
	@Get("/slug/:slug")
	getPostBySlug(@Param("slug") slug: string) {
		return this.postsService.findBySlug(slug);
	}

	@Patch(":id")
	update(@Param("id") id: string, @Body() updatePostDto: UpdatePostDto) {
		return this.postsService.update(
			id,
			updatePostDto,
			this.tenantContext.requiredUserId,
			this.tenantContext.requiredTenantId,
		);
	}

	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.postsService.remove(
			id,
			this.tenantContext.requiredUserId,
			this.tenantContext.requiredTenantId,
		);
	}

	@Post("upload")
	@UseInterceptors(FileInterceptor("file"))
	uploadImage(@UploadedFile() file: Express.Multer.File) {
		return this.postsService.uploadImage(file);
	}
}
