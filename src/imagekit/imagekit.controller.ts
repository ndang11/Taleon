import type ImageKit from "@imagekit/nodejs";
import {
	BadRequestException,
	Controller,
	Inject,
	InternalServerErrorException,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
	Logger,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { TenantGuard } from "../multi-tenant/tenant.guard";

@Controller("upload")
@UseGuards(JwtAuthGuard, TenantGuard)
export class ImageKitController {
	private readonly logger = new Logger(ImageKitController.name);

	constructor(@Inject("IMAGEKIT") private readonly imagekit: ImageKit) {}

	@Post("profile-image")
	@UseInterceptors(
		FileInterceptor("file", {
			limits: {
				fileSize: 5 * 1024 * 1024, // 5MB limit
			},
			fileFilter: (req, file, callback) => {
				if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
					return callback(
						new BadRequestException("Only image files are allowed!"),
						false,
					);
				}
				callback(null, true);
			},
		}),
	)
	async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log("Starting profile image upload");

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		this.logger.log(`File received: ${file.originalname}, size: ${file.size}, mimetype: ${file.mimetype}`);

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			const result = await (this.imagekit as any).upload({
				file: file.buffer,
				fileName: file.originalname,
				folder: "/profile-images",
			});

			this.logger.log(`Upload successful: ${result.url}`);

			if (!result.url || !result.fileId) {
				throw new InternalServerErrorException("Failed to upload image to ImageKit");
			}

			return {
				url: result.url,
				fileId: result.fileId,
			};
		} catch (error: any) {
			this.logger.error(`Upload failed: ${error.message}`, error.stack);
			throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
		}
	}

	@Post("post-image")
	@UseInterceptors(
		FileInterceptor("file", {
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB limit
			},
			fileFilter: (req, file, callback) => {
				if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
					return callback(
						new BadRequestException("Only image files are allowed!"),
						false,
					);
				}
				callback(null, true);
			},
		}),
	)
	async uploadPostImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log("Starting post image upload");

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			const result = await (this.imagekit as any).upload({
				file: file.buffer,
				fileName: file.originalname,
				folder: "/post-images",
			});

			if (!result.url || !result.fileId) {
				throw new InternalServerErrorException("Failed to upload image to ImageKit");
			}

			return {
				url: result.url,
				fileId: result.fileId,
			};
		} catch (error: any) {
			this.logger.error(`Upload failed: ${error.message}`, error.stack);
			throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
		}
	}

	@Post("cover-image")
	@UseInterceptors(
		FileInterceptor("file", {
			limits: {
				fileSize: 10 * 1024 * 1024, // 10MB limit
			},
			fileFilter: (req, file, callback) => {
				if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
					return callback(
						new BadRequestException("Only image files are allowed!"),
					false,
					);
				}
				callback(null, true);
			},
		}),
	)
	async uploadCoverImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log("Starting cover image upload");

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			const result = await (this.imagekit as any).upload({
				file: file.buffer,
				fileName: file.originalname,
				folder: "/cover-images",
			});

			if (!result.url || !result.fileId) {
				throw new InternalServerErrorException("Failed to upload image to ImageKit");
			}

			return {
				url: result.url,
				fileId: result.fileId,
			};
		} catch (error: any) {
			this.logger.error(`Upload failed: ${error.message}`, error.stack);
			throw new InternalServerErrorException(`Failed to upload image: ${error.message}`);
		}
	}
}
