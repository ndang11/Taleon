import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);

	constructor() {
		// Configure Cloudinary with your credentials
		// Get these from: https://cloudinary.com/console
		// cloud_name: 'dauivea1l' (from your Cloudinary dashboard)
		// api_key: '419861726753472' (from your Cloudinary dashboard)
		// api_secret: 'AMc8IWuGXW5KSoSxT-TBIESDryk' (from your Cloudinary dashboard - View API Keys)
		cloudinary.config({
			cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
			api_key: process.env.CLOUDINARY_API_KEY,
			api_secret: process.env.CLOUDINARY_API_SECRET,
		});
		this.logger.log("Cloudinary configured successfully");
	}

	/**
	 * Upload an image to Cloudinary
	 * @param file - The uploaded file buffer
	 * @param originalName - Original filename
	 * @param folder - The folder to store the image in
	 * @returns Uploaded image URL and publicId
	 */
	async uploadImage(
		file: Buffer,
		originalName: string,
		folder: string = "uploads",
	): Promise<{ url: string; publicId: string }> {
		this.logger.log(`Uploading image to ${folder}: ${originalName}`);

		return new Promise((resolve, reject) => {
			const uploadStream = cloudinary.uploader.upload_stream(
				{
					resource_type: "image",
					folder: folder,
					public_id: originalName.split(".")[0], // Use filename without extension
					transformation: [{ quality: "auto:best" }, { fetch_format: "auto" }],
				},
				(error: Error | undefined, result: UploadApiResponse | undefined) => {
					if (error) {
						this.logger.error(`Upload failed: ${error.message}`, error.stack);
						reject(
							new InternalServerErrorException(
								`Failed to upload image: ${error.message}`,
							),
						);
					} else if (result) {
						this.logger.log(`Upload successful: ${result.secure_url}`);
						resolve({
							url: result.secure_url,
							publicId: result.public_id,
						});
					} else {
						reject(
							new InternalServerErrorException(
								"Upload failed: No result returned",
							),
						);
					}
				},
			);

			uploadStream.end(file);
		});
	}

	/**
	 * Delete an image from Cloudinary
	 * @param publicId - The public ID of the image to delete
	 */
	async deleteImage(publicId: string): Promise<void> {
		try {
			await cloudinary.uploader.destroy(publicId);
			this.logger.log(`Image deleted: ${publicId}`);
		} catch (error) {
			const message = error instanceof Error ? error.message : "Unknown error";
			this.logger.error(`Failed to delete image: ${message}`);
			throw new InternalServerErrorException("Failed to delete image");
		}
	}

	/**
	 * Generate upload signature for signed uploads
	 * @param folder - The folder to upload to
	 */
	generateUploadSignature(folder: string = "uploads"): {
		timestamp: number;
		signature: string;
		apiKey: string;
		cloudName: string;
	} {
		const timestamp = Math.round(Date.now() / 1000);

		const signature = cloudinary.utils.api_sign_request(
			{
				timestamp,
				folder,
			},
			process.env.CLOUDINARY_API_SECRET as string,
		);

		return {
			timestamp,
			signature,
			apiKey: process.env.CLOUDINARY_API_KEY as string,
			cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
		};
	}
}
