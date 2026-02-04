import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Post,
	Put,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { UserDocument } from "src/schemas/users.schema";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import type { UploadService } from "../upload/upload.service";
import type { UsersService } from "./users.service";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
	constructor(
		private readonly usersService: UsersService,
		private readonly uploadService: UploadService,
	) {}

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

	/**
	 * Upload a profile picture
	 * POST /users/me/avatar
	 */
	@Post("me/avatar")
	@UseInterceptors(
		FileInterceptor("file", {
			limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
			fileFilter: (_req, file, callback) => {
				if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp)$/)) {
					return callback(
						new BadRequestException("Only image files are allowed!"),
						false,
					);
				}
				callback(null, true);
			},
		}),
	)
	async uploadAvatar(
		@CurrentUser() user: UserDocument,
		@UploadedFile() file: Express.Multer.File,
	) {
		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		const result = await this.uploadService.uploadImage(
			file.buffer,
			file.originalname,
			"profile-images",
		);

		// Update user's avatar
		return this.usersService.updateAvatar(user._id.toString(), result.url);
	}
}
