import { PartialType } from "@nestjs/mapped-types";
import { CreatePostDto } from "./create-post.dto";

export class UpdateDraftDto extends PartialType(CreatePostDto) {}

export class PublishPostDto {}

