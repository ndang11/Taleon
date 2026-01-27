import {
	IsBoolean,
	IsEnum,
	IsNotEmpty,
	IsOptional,
	IsString,
} from "class-validator";

export class CreatePostDto {
	@IsNotEmpty()
	@IsString()
	title!: string;

	@IsNotEmpty()
	@IsString()
	content!: string;

	@IsOptional()
	@IsEnum(["draft", "published", "unpublished"])
	status?: "draft" | "published" | "unpublished";

	@IsOptional()
	@IsString()
	slug?: string;

	@IsNotEmpty()
	@IsString()
	category!: string;

	@IsOptional()
	@IsString()
	image?: string;

	@IsOptional()
	@IsBoolean()
	isPublic?: boolean;
}
