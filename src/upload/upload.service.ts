import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { UploadApiResponse } from "cloudinary";
import { v2 as cloudinary } from "cloudinary";

@Injectable()
export class UploadService {
	private readonly logger = new Logger(UploadService.name);

	constructor(private readonly configService: ConfigService) {
		// Get configuration values from ConfigService
		const cloudinaryUrl = this.configService.get<string>("CLOUDINARY_URL");
		const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
		const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
		const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

		this.logger.log(`Cloudinary config check - CLOUDINARY_URL: ${cloudinaryUrl ? 'set' : 'not set'}, CLOUDINARY_CLOUD_NAME: ${cloudName ? 'set' : 'not set'}, CLOUDINARY_API_KEY: ${apiKey ? 'set' : 'not set'}`);

		// Also set process.env for Cloudinary SDK (it may use this internally)
		if (cloudinaryUrl) {
			process.env.CLOUDINARY_URL = cloudinaryUrl;
			// Parse CLOUDINARY_URL to extract individual credentials
			// Format: cloudinary://api_key:api_secret@cloud_name
			const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
			if (urlMatch) {
				const [, parsedApiKey, parsedApiSecret, parsedCloudName] = urlMatch;
				process.env.CLOUDINARY_CLOUD_NAME = parsedCloudName;
				process.env.CLOUDINARY_API_KEY = parsedApiKey;
				process.env.CLOUDINARY_API_SECRET = parsedApiSecret;
				cloudinary.config({
					cloud_name: parsedCloudName,
					api_key: parsedApiKey,
					api_secret: parsedApiSecret,
				});
				this.logger.log("Cloudinary configured by parsing CLOUDINARY_URL");
			} else {
				// Fallback: use cloudinary_url config
				cloudinary.config({
					cloudinary_url: cloudinaryUrl,
				});
				this.logger.log("Cloudinary configured with CLOUDINARY_URL (fallback)");
			}
		} else if (cloudName) process.env.CLOUDINARY_CLOUD_NAME = cloudName;
		if (apiKey) process.env.CLOUDINARY_API_KEY = apiKey;
		if (apiSecret) process.env.CLOUDINARY_API_SECRET = apiSecret;

		// If CLOUDINARY_URL is provided, use it (it contains all credentials)
		if (cloudinaryUrl) {
			cloudinary.config({
				cloudinary_url: cloudinaryUrl,
			});
			this.logger.log("Cloudinary configured with CLOUDINARY_URL");
		} else if (cloudName && apiKey && apiSecret) {
			cloudinary.config({
				cloud_name: cloudName,
				api_key: apiKey,
				api_secret: apiSecret,
			});
			this.logger.log("Cloudinary configured with individual credentials");
		} else {
			this.logger.error(
				"Cloudinary credentials are missing! Please set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.",
			);
		}
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
		// Get configuration values from ConfigService
		const cloudinaryUrl = this.configService.get<string>("CLOUDINARY_URL");
		const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
		const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
		const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

		this.logger.log(`Cloudinary config check - CLOUDINARY_URL: ${cloudinaryUrl ? 'set' : 'not set'}, CLOUDINARY_CLOUD_NAME: ${cloudName ? 'set' : 'not set'}, CLOUDINARY_API_KEY: ${apiKey ? 'set' : 'not set'}`);

		// Explicitly configure Cloudinary before upload
		if (cloudinaryUrl) {
			// Parse CLOUDINARY_URL to extract individual credentials
			const urlMatch = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
			if (urlMatch) {
				const [, parsedApiKey, parsedApiSecret, parsedCloudName] = urlMatch;
				cloudinary.config({
					cloud_name: parsedCloudName,
					api_key: parsedApiKey,
					api_secret: parsedApiSecret,
				});
			} else {
				cloudinary.config({ cloudinary_url: cloudinaryUrl });
			}
		} else if (cloudName && apiKey && apiSecret) {
			cloudinary.config({
				cloud_name: cloudName,
				api_key: apiKey,
				api_secret: apiSecret,
			});
		} else {
			throw new InternalServerErrorException("Cloudinary credentials are missing");
		}

		// Debug: Log current Cloudinary config
		this.logger.log(`Cloudinary config - api_key: ${cloudinary.config().api_key || 'not set'}, cloud_name: ${cloudinary.config().cloud_name || 'not set'}`);

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

		const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET") as string;
		const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY") as string;
		const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME") as string;

		const signature = cloudinary.utils.api_sign_request(
			{
				timestamp,
				folder,
			},
			apiSecret,
		);

		return {
			timestamp,
			signature,
			apiKey,
			cloudName,
		};
	}
}
