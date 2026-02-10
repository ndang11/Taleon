import { IsDefined, IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateDraftDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsDefined()
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
	@IsEnum(["draft", "published", "unpublished", "archived"])
	status?: "draft" | "published" | "unpublished" | "archived";
}

export class PublishPostDto {}
