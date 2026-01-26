import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { LikesService } from "./likes.service";
import { LikesController } from "./likes.controller";
import { Like } from "../models/like.model";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [MongooseModule.forFeature([{ name: Like.name, schema: Like.schema }]), AuthModule],
  controllers: [LikesController],
  providers: [LikesService],
  exports: [LikesService],
})
export class LikesModule {}