import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Query,
	Request,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Public } from "../common/decorators/public.decorator";
import { TenantGuard } from "../multi-tenant/tenant.guard";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import type { PostsService } from "./posts.service";

interface CustomRequest extends Request {
	user: { userId: string; tenantId: string };
	tenantId: string;
}

@Controller("posts")
@UseGuards(JwtAuthGuard, TenantGuard)
export class PostsController {
	constructor(private readonly postsService: PostsService) {}

	@Post()
	create(@Body() createPostDto: CreatePostDto, @Request() req: CustomRequest) {
		return this.postsService.create(
			createPostDto,
			req.user.userId,
			req.tenantId,
		);
	}

	@Public()
	@Get()
	findAll(@Request() req: CustomRequest, @Query("public") isPublic?: string) {
		const publicFlag =
			isPublic === "true" ? true : isPublic === "false" ? false : undefined;
		return this.postsService.findAll(req.tenantId, publicFlag);
	}

	@Public()
	@Get(":id")
	findOne(@Param("id") id: string, @Request() req: CustomRequest) {
		return this.postsService.findOne(id, req.tenantId);
	}

	@Public()
	@Get("slug/:slug")
	findBySlug(@Param("slug") slug: string, @Request() req: CustomRequest) {
		return this.postsService.findBySlug(slug, req.tenantId);
	}

	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updatePostDto: UpdatePostDto,
		@Request() req: CustomRequest,
	) {
		return this.postsService.update(
			id,
			updatePostDto,
			req.user.userId,
			req.tenantId,
		);
	}

	@Delete(":id")
	remove(@Param("id") id: string, @Request() req: CustomRequest) {
		return this.postsService.remove(id, req.user.userId, req.tenantId);
	}

	@Post("upload")
	@UseInterceptors(FileInterceptor("file"))
	uploadImage(@UploadedFile() file: Express.Multer.File) {
		return this.postsService.uploadImage(file);
	}
}
