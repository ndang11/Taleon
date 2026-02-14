import { IsDefined, IsOptional, IsString } from "class-validator";

export class AutosavePostDto {
	@IsOptional()
	@IsDefined()
	content?: string | Record<string, unknown>;

	@IsOptional()
	@IsString()
	title?: string;
}
