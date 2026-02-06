import { IsString, IsOptional } from "class-validator";

export class ToggleLikeDto {
	@IsOptional()
	@IsString()
	postId?: string;
}
