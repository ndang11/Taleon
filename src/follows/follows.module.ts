import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MultiTenantModule } from "../multi-tenant/multi-tenant.module";
import { NotificationsModule } from "../notifications/notifications.module";
import { Follow, FollowSchema } from "../schemas/follow.schema";
import { User, UserSchema } from "../schemas/users.schema";
import { FollowsController } from "./follows.controller";
import { FollowsService } from "./follows.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Follow.name, schema: FollowSchema },
			{ name: User.name, schema: UserSchema },
		]),
		MultiTenantModule,
		NotificationsModule,
	],
	controllers: [FollowsController],
	providers: [FollowsService],
	exports: [FollowsService],
})
export class FollowsModule {}
