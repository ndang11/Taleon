import ImageKit from "@imagekit/nodejs";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ImageKitService } from "./imagekit.service";

@Module({
	imports: [ConfigModule],
	providers: [
		{
			provide: ImageKitService,
			useFactory: (imagekitInstance: ImageKit) =>
				new ImageKitService(imagekitInstance),
			inject: ["IMAGEKIT"],
		},
		{
			provide: "IMAGEKIT",
			useFactory: (configService: ConfigService) => {
				const publicKey = configService.get<string>("IMAGEKIT_PUBLIC_KEY");
				const privateKey = configService.get<string>("IMAGEKIT_PRIVATE_KEY");
				const urlEndpoint = configService.get<string>("IMAGEKIT_URL_ENDPOINT");

				if (!publicKey || !privateKey || !urlEndpoint) {
					throw new Error("ImageKit environment variables are not set");
				}

				return new ImageKit({
					publicKey,
					privateKey,
					urlEndpoint,
					// biome-ignore lint/suspicious/noExplicitAny: ImageKit types are incomplete
				} as any);
			},
			inject: [ConfigService],
		},
	],
	exports: [ImageKitService],
})
export class ImageKitModule {}
