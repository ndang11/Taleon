import {
	BadRequestException,
	Controller,
	Delete,
	Logger,
	Param,
	Post,
	UploadedFile,
	UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import type { UploadService } from "./upload.service";

@Controller("upload")
export class UploadController {
	private readonly logger = new Logger(UploadController.name);

	constructor(private readonly uploadService: UploadService) {}

	/**
	 * Upload a post image (for editor use)
	 * POST /upload/post-image
	 */
	@Post("post-image")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
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
	async uploadPostImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log(`Uploading post image: ${file?.originalname}`);

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			const result = await this.uploadService.uploadImage(
				file.buffer,
				file.originalname,
				"post-images",
			);

			return {
				url: result.url,
				publicId: result.publicId,
			};
		} catch (error) {
			this.logger.error(`Post image upload failed: ${error}`);
			throw error;
		}
	}

	@Post("cover-image")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: 10 * 1024 * 1024 },
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
	async uploadCoverImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log(`Uploading cover image: ${file?.originalname}`);

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			const result = await this.uploadService.uploadImage(
				file.buffer,
				file.originalname,
				"cover-images",
			);

			return {
				url: result.url,
				publicId: result.publicId,
			};
		} catch (error) {
			this.logger.error(`Cover image upload failed: ${error}`);
			throw error;
		}
	}

	@Post("profile-image")
	@UseInterceptors(
		FileInterceptor("file", {
			storage: memoryStorage(),
			limits: { fileSize: 5 * 1024 * 1024 },
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
	async uploadProfileImage(@UploadedFile() file: Express.Multer.File) {
		this.logger.log(`Uploading profile image: ${file?.originalname}`);

		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			const result = await this.uploadService.uploadImage(
				file.buffer,
				file.originalname,
				"profile-images",
			);

			return {
				url: result.url,
				publicId: result.publicId,
			};
		} catch (error) {
			this.logger.error(`Profile image upload failed: ${error}`);
			throw error;
		}
	}

	/**
	 * Delete an image
	 * DELETE /upload/:publicId
	 */
	@Delete(":publicId")
	async deleteImage(@Param("publicId") publicId: string) {
		this.logger.log(`Deleting image: ${publicId}`);

		try {
			await this.uploadService.deleteImage(decodeURIComponent(publicId));
			return { message: "Image deleted successfully" };
		} catch (error) {
			this.logger.error(`Image deletion failed: ${error}`);
			throw error;
		}
	}

	/**
	 * Get upload signature for signed uploads
	 * POST /upload/signature
	 */
	@Post("signature")
	getUploadSignature() {
		return this.uploadService.generateUploadSignature("uploads");
	}
}
