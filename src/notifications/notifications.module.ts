import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { NotificationsController } from "./notifications.controller";
import { Notification, NotificationSchema } from "./notifications.schema";
import { NotificationsService } from "./notifications.service";

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: Notification.name, schema: NotificationSchema },
		]),
	],
	controllers: [NotificationsController],
	providers: [NotificationsService],
	exports: [NotificationsService],
})
export class NotificationsModule {}
