import {
	IsBoolean,
	IsEnum,
	IsOptional,
	IsString,
} from "class-validator";

export class CreatePostDto {
	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsEnum(["draft", "published", "unpublished"])
	status?: "draft" | "published" | "unpublished";

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
