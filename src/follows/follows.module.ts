import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { Follow, FollowSchema } from "../schemas/follow.schema";
import { FollowsController } from "./follows.controller";
import { FollowsService } from "./follows.service";

@Module({
	imports: [
		MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),
		MultiTenantModule,
	],
	controllers: [FollowsController],
	providers: [FollowsService],
	exports: [FollowsService],
})
export class FollowsModule {}
