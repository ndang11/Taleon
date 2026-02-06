import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  Notification,
  NotificationDocument,
} from "./notifications.schema";
import { CreateNotificationDto } from "./dto/create-notification.dto";

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      userId: new Types.ObjectId(createNotificationDto.userId),
      fromUserId: createNotificationDto.fromUserId
        ? new Types.ObjectId(createNotificationDto.fromUserId)
        : undefined,
      postId: createNotificationDto.postId
        ? new Types.ObjectId(createNotificationDto.postId)
        : undefined,
      isRead: false,
    });
    return notification.save();
  }

  async findByUserId(
    userId: string,
    limit = 20,
  ): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("fromUserId", "name avatar")
      .populate("postId", "title")
      .exec();
  }

  async findUnreadByUserId(userId: string): Promise<Notification[]> {
    return this.notificationModel
      .find({ userId: new Types.ObjectId(userId), isRead: false })
      .sort({ createdAt: -1 })
      .populate("fromUserId", "name avatar")
      .populate("postId", "title")
      .exec();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      userId: new Types.ObjectId(userId),
      isRead: false,
    });
  }

  async markAsRead(
    notificationId: string,
  ): Promise<Notification | null> {
    return this.notificationModel
      .findByIdAndUpdate(
        notificationId,
        { isRead: true },
        { new: true },
      )
      .exec();
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { userId: new Types.ObjectId(userId), isRead: false },
        { isRead: true },
      )
      .exec();
  }

  async deleteNotification(notificationId: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(notificationId).exec();
  }
}
