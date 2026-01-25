import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryService } from "./cloudinary.service";

@Module({
	imports: [ConfigModule],
	providers: [
		CloudinaryService,
		{
			provide: "CLOUDINARY",
			useFactory: (configService: ConfigService) => {
				const cloudName = configService.get<string>("CLOUDINARY_CLOUD_NAME");
				const apiKey = configService.get<string>("CLOUDINARY_API_KEY");
				const apiSecret = configService.get<string>("CLOUDINARY_API_SECRET");

				if (!cloudName || !apiKey || !apiSecret) {
					throw new Error("Cloudinary environment variables are not set");
				}

				cloudinary.config({
					cloud_name: cloudName,
					api_key: apiKey,
					api_secret: apiSecret,
					secure: true,
				});

				return cloudinary;
			},
			inject: [ConfigService],
		},
	],
	exports: [CloudinaryService],
})
export class CloudinaryModule {}
