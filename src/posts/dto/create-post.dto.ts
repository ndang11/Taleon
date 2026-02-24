import { Type } from "class-transformer";
import {
	IsBoolean,
	IsDefined,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

export class PostContent {
	@IsOptional()
	blocks?: any[];

	@IsOptional()
	time?: number;

	@IsOptional()
	version?: string;
}

export class CreatePostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsDefined()
	content?: string | Record<string, unknown>;

	@IsOptional()
	@ValidateNested()
	@Type(() => PostContent)
	contentObject?: PostContent;

	@IsOptional()
	@IsEnum(["draft", "published", "unpublished", "archived"])
	status?: "draft" | "published" | "unpublished" | "archived";

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
	@IsBoolean()
	isPublic?: boolean;

	@IsOptional()
	@IsString()
	subtitle?: string;
}
