
import ImageKit from "@imagekit/nodejs";
import { Injectable, InternalServerErrorException } from "@nestjs/common";

@Injectable()
export class ImageKitService {
	constructor(private readonly imagekit: ImageKit) {}

	/**
	 * Upload an image to ImageKit
	 * @param file uploaded file
	 * @returns uploaded image URL and fileId
	 */
	async uploadImage(
		file: Express.Multer.File,
	): Promise<{ url: string; fileId: string }> {
		if (!file) throw new InternalServerErrorException("No file provided");

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			const result = await (this.imagekit as any).upload({
				file: file.buffer,
				fileName: file.originalname,
				folder: "/posts",
			});

			if (!result.url || !result.fileId) {
				throw new InternalServerErrorException("Failed to upload image");
			}

			return { url: result.url, fileId: result.fileId };
		} catch (_error) {
			throw new InternalServerErrorException("Failed to upload image");
		}
	}

	async deleteImage(fileId: string): Promise<void> {
		if (!fileId) throw new InternalServerErrorException("Invalid fileId");

		try {
			// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
			await (this.imagekit as any).deleteFile(fileId);
		} catch (_error) {
			throw new InternalServerErrorException("Failed to delete image");
		}
	}
}
