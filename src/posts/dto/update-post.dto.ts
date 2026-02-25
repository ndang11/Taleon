import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateDraftDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	content?: string | Record<string, unknown>;

	@IsOptional()
	@IsString()
	slug?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsString()
	image?: string;

	@IsOptional()
	@IsString()
	subtitle?: string;

	@IsOptional()
	@IsEnum(["draft", "published", "unpublished", "archived"])
	status?: "draft" | "published" | "unpublished" | "archived";
}

export class PublishPostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsString()
	image?: string;
}
