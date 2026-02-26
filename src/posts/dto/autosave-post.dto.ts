import { IsOptional, IsString } from "class-validator";

export class AutosavePostDto {
	@IsOptional()
	@IsString()
	content?: string;

	@IsOptional()
	@IsString()
	title?: string;

	@IsOptional()
	@IsString()
	image?: string;
}
