import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CommentsService } from "./comments.service";
import { CommentsController } from "./comments.controller";
import { Comment } from "../models/comment.model";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Comment.name, schema: Comment.schema }]), AuthModule],
  controllers: [CommentsController],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}