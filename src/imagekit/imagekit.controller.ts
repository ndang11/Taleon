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
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";

@Controller("upload")
@UseGuards(JwtAuthGuard)
export class ImageKitController {
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
		if (!file) {
			throw new BadRequestException("No file uploaded");
		}

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			const result = await (this.imagekit as any).upload({
				file: file.buffer,
				fileName: file.originalname,
				folder: "/profile-images",
			});

			if (!result.url || !result.fileId) {
				throw new InternalServerErrorException("Failed to upload image");
			}

			return {
				url: result.url,
				fileId: result.fileId,
			};
		} catch (_error) {
			throw new InternalServerErrorException("Failed to upload image");
		}
	}
}
