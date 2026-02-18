import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Follow, FollowSchema } from "../schemas/follow.schema";
import { User, UserSchema } from "../schemas/users.schema";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Follow.name, schema: FollowSchema },
		]),
	],
	controllers: [UsersController],
	providers: [UsersService],
	exports: [UsersService],
})
export class UsersModule {}
