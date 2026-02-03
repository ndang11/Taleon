import { Injectable, ConflictException, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { Follow, type FollowDocument } from "../schemas/follow.schema";

@Injectable()
export class FollowsService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<FollowDocument>,
  ) {}

  async follow(
    followerId: string,
    followingId: string,
    tenantId: string,
  ): Promise<{ following: boolean; followersCount: number }> {
    // Can't follow yourself
    if (followerId === followingId) {
      throw new ConflictException("You cannot follow yourself");
    }

    // Check if already following
    const existingFollow = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    if (existingFollow) {
      throw new ConflictException("You are already following this user");
    }

    // Create follow
    const follow = new this.followModel({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
      tenantId: new Types.ObjectId(tenantId),
    });

    await follow.save();

    // Get updated followers count
    const followersCount = await this.getFollowersCount(followingId);

    return { following: true, followersCount };
  }

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<{ following: boolean; followersCount: number }> {
    const result = await this.followModel.deleteOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });

    if (result.deletedCount === 0) {
      throw new NotFoundException("You are not following this user");
    }

    // Get updated followers count
    const followersCount = await this.getFollowersCount(followingId);

    return { following: false, followersCount };
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.followModel.findOne({
      followerId: new Types.ObjectId(followerId),
      followingId: new Types.ObjectId(followingId),
    });
    return !!follow;
  }

  async getFollowers(userId: string): Promise<FollowDocument[]> {
    return this.followModel
      .find({ followingId: new Types.ObjectId(userId) })
      .populate("followerId", "name email avatar")
      .sort({ createdAt: -1 });
  }

  async getFollowing(userId: string): Promise<FollowDocument[]> {
    return this.followModel
      .find({ followerId: new Types.ObjectId(userId) })
      .populate("followingId", "name email avatar")
      .sort({ createdAt: -1 });
  }

  async getFollowersCount(userId: string): Promise<number> {
    return this.followModel.countDocuments({
      followingId: new Types.ObjectId(userId),
    });
  }

  async getFollowingCount(userId: string): Promise<number> {
    return this.followModel.countDocuments({
      followerId: new Types.ObjectId(userId),
    });
  }
}
