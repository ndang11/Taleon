import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "../auth/auth.module";
import { Like } from "../models/like.model";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { LikesController } from "./likes.controller";
import { LikesService } from "./likes.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Like.name, schema: Like.schema }]),
		AuthModule,
		MultiTenantModule,
	],
	controllers: [LikesController],
	providers: [LikesService],
	exports: [LikesService],
})
export class LikesModule {}
