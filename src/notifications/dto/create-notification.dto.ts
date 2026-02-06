import { IsEnum, IsOptional, IsString } from "class-validator";
import { NotificationType } from "../notifications.schema";

export class CreateNotificationDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  fromUserId?: string;

  @IsEnum(NotificationType)
  type!: NotificationType;

  @IsOptional()
  @IsString()
  postId?: string;

  @IsString()
  message!: string;

  @IsOptional()
  @IsString()
  link?: string;
}

export class MarkNotificationReadDto {
  @IsString()
  notificationId!: string;
}
