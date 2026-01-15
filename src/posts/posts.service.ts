import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { Post } from "./post.entity";

@Injectable()
export class PostsService {
	constructor(
		@InjectRepository(Post)
		private repo: Repository<Post>,
	) {}

	create(data: Partial<Post>) {
		return this.repo.save(data);
	}

	findAll() {
		return this.repo.find({ relations: ["author"] });
	}
}
