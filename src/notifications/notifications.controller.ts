import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { NotificationsService } from "./notifications.service";
import { CreateNotificationDto } from "./dto/create-notification.dto";

interface RequestWithUser extends Request {
  user: {
    userId: string;
    tenantId?: string;
  };
}

@Controller("notifications")
@UseGuards(AuthGuard("jwt"))
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Get()
  async findAll(
    @Request() req: RequestWithUser,
    @Query("limit") limit?: number,
  ) {
    const notifications = await this.notificationsService.findByUserId(
      req.user.userId,
      limit || 20,
    );
    return { notifications };
  }

  @Get("unread")
  async findUnread(@Request() req: RequestWithUser) {
    const notifications = await this.notificationsService.findUnreadByUserId(
      req.user.userId,
    );
    return { notifications };
  }

  @Get("count")
  async getUnreadCount(@Request() req: RequestWithUser) {
    const count = await this.notificationsService.getUnreadCount(
      req.user.userId,
    );
    return { count };
  }

  @Post(":id/read")
  async markAsRead(
    @Param("id") id: string,
    @Request() req: RequestWithUser,
  ) {
    const notification = await this.notificationsService.markAsRead(id);
    const unreadCount = await this.notificationsService.getUnreadCount(
      req.user.userId,
    );
    return { notification, unreadCount };
  }

  @Post("read-all")
  async markAllAsRead(@Request() req: RequestWithUser) {
    await this.notificationsService.markAllAsRead(req.user.userId);
    return { success: true };
  }

  @Delete(":id")
  async deleteNotification(@Param("id") id: string) {
    await this.notificationsService.deleteNotification(id);
    return { success: true };
  }

  // Endpoint for creating notifications (used internally)
  @Post()
  async create(@Body() createNotificationDto: CreateNotificationDto) {
    const notification = await this.notificationsService.create(
      createNotificationDto,
    );
    return notification;
  }
}
