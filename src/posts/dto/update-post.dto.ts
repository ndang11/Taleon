import { PartialType } from "@nestjs/mapped-types";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { CreatePostDto, PostStatus } from "./create-post.dto";

export class UpdatePostDto extends PartialType(CreatePostDto) {
	@IsOptional()
	@IsString()
	@MinLength(3)
	title?: string;

	@IsOptional()
	@IsString()
	@MinLength(10)
	content?: string;

	@IsOptional()
	@IsString()
	category?: string;

	@IsOptional()
	@IsEnum(PostStatus)
	status?: PostStatus;
}
