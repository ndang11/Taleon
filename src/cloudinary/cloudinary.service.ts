/// <reference types="multer" />
import { Readable } from "node:stream";

import {
	InternalServerErrorException,
} from "@nestjs/common";
import type { UploadApiResponse } from "cloudinary";
import type { Express } from "express";

export class CloudinaryService {
	constructor(
		private readonly cloudinary: any,
	) {}

	/**
	 * Upload an image to Cloudinary
	 * @param file uploaded file
	 * @returns uploaded image URL
	 */
	async uploadImage(file: Express.Multer.File): Promise<string> {
		if (!file) throw new InternalServerErrorException("No file provided");

		try {
			const result: UploadApiResponse = await new Promise((resolve, reject) => {
				const uploadStream = this.cloudinary.uploader.upload_stream(
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
			this.cloudinary.uploader.destroy(publicId, (err, res) => {
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
