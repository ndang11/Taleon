import { Type } from "class-transformer";
import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested,
} from "class-validator";

export class PostContent {
	blocks?: any[];
	time?: number;
	version?: string;
}

export class CreatePostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	content?: string;

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
}
