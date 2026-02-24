import { IsOptional, IsString } from "class-validator";

export class ToggleLikeDto {
	@IsOptional()
	@IsString()
	postId?: string;
}
