/// <reference types="multer" />
import { Readable } from "node:stream";
import { Injectable, InternalServerErrorException } from "@nestjs/common";
import type { ConfigService } from "@nestjs/config";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

@Injectable()
export class CloudinaryService {
	constructor(private readonly configService: ConfigService) {
		const cloudName = this.configService.get<string>("CLOUDINARY_CLOUD_NAME");
		const apiKey = this.configService.get<string>("CLOUDINARY_API_KEY");
		const apiSecret = this.configService.get<string>("CLOUDINARY_API_SECRET");

		if (!cloudName || !apiKey || !apiSecret) {
			throw new Error("Cloudinary environment variables are not set");
		}

		cloudinary.config({
			cloud_name: cloudName,
			api_key: apiKey,
			api_secret: apiSecret,
			secure: true,
		});
	}

	/**
	 * Upload an image to Cloudinary
	 * @param file uploaded file
	 * @returns uploaded image URL
	 */
	async uploadImage(file: any): Promise<string> {
		if (!file) throw new InternalServerErrorException("No file provided");

		try {
			const result: UploadApiResponse = await new Promise((resolve, reject) => {
				const uploadStream = cloudinary.uploader.upload_stream(
					{ folder: "posts", resource_type: "auto" },
					(err, res) => {
						if (err) return reject(err);
						if (!res) return reject(new Error("Upload failed"));
						resolve(res);
					},
				);

				const stream = new Readable();
				stream.push(file.buffer);
				stream.push(null);
				stream.pipe(uploadStream);
			});

			if (!result.secure_url) {
				throw new InternalServerErrorException("Failed to upload image");
			}

			return result.secure_url;
		} catch (_error) {
			throw new InternalServerErrorException("Failed to upload image");
		}
	}

	async deleteImage(url: string): Promise<void> {
		const publicId = this.extractPublicId(url);
		if (!publicId)
			throw new InternalServerErrorException("Invalid Cloudinary URL");

		return new Promise((resolve, reject) => {
			cloudinary.uploader.destroy(publicId, (err, res) => {
				if (err) return reject(err);
				resolve(res);
			});
		});
	}

	private extractPublicId(url: string): string | null {
		try {
			const parts = url.split("/");
			const publicIdWithExtension = parts[parts.length - 1];
			const publicId = publicIdWithExtension
				? publicIdWithExtension.split(".")[0]
				: null;
			return publicId || null;
		} catch {
			return null;
		}
	}
}
