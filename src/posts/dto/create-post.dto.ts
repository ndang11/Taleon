import { IsIn, IsNotEmpty, IsString } from "class-validator";

export class CreatePostDto {
	@IsString()
	@IsNotEmpty({ message: "Title is required" })
	title!: string;

	@IsString()
	@IsNotEmpty({ message: "Content is required" })
	content!: string;

	@IsString()
	@IsNotEmpty({ message: "Category is required" })
	category!: string;

	@IsIn(["draft", "published", "unpublished"], {
		message: "Status must be draft, published, or unpublished",
	})
	status!: "draft" | "published" | "unpublished";
}

export enum PostStatus {
	DRAFT = "draft",
	PUBLISHED = "published",
	UNPUBLISHED = "unpublished",
}
