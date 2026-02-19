import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import { type Model, Types } from "mongoose";
import { Comment } from "../models/comment.model";
import { Like } from "../models/like.model";
import { Follow, type FollowDocument } from "../schemas/follow.schema";
import { Post, type PostDocument } from "../schemas/post.schema";
import { User, type UserDocument } from "../schemas/users.schema";

export interface UserSummary {
	_id: Types.ObjectId;
	name: string;
	email: string;
	avatar: string;
}

export interface UserProfile {
	_id: Types.ObjectId;
	name: string;
	email: string;
	avatar: string;
	coverImage: string;
	bio: string;
	location: string;
	website: string;
	phone: string;
	tenantId: Types.ObjectId;
	followersCount: number;
	followingCount: number;
	followers: UserSummary[];
	following: UserSummary[];
}

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name)
		private readonly userModel: Model<UserDocument>,
		@InjectModel(Follow.name)
		private readonly followModel: Model<FollowDocument>,
		@InjectModel(Post.name)
		private readonly postModel: Model<PostDocument>,
		@InjectModel(Like.name)
		private readonly likeModel: Model<ILike>,
		@InjectModel(Comment.name)
		private readonly commentModel: Model<Comment>,
	) {}

	/**
	 * Creates a new user.
	 * @param data The user data to create.
	 * @returns The created user document.
	 */
	async create(data: {
		name: string;
		email: string;
		password: string;
		tenantId?: string;
	}): Promise<UserDocument> {
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(data.password, salt);

		const user = new this.userModel({
			...data,
			password: hashedPassword,
			tenantId: data.tenantId ? new Types.ObjectId(data.tenantId) : undefined,
			bio: "",
			avatar: "",
			coverImage: "",
			location: "",
			website: "",
			phone: "",
			followersCount: 0,
			followingCount: 0,
		});
		return user.save();
	}

	/**
	 * Retrieves all users.
	 * @returns An array of user documents.
	 */
	async findAll(): Promise<UserDocument[]> {
		return this.userModel.find().exec();
	}

	/**
	 * Retrieves a user by ID.
	 * @param id The user ID.
	 * @returns The user document with followers and following data.
	 * @throws NotFoundException if the user is not found.
	 */
	async findOne(id: string): Promise<UserProfile> {
		const user = await this.userModel.findById(id).exec();
		if (!user) throw new NotFoundException("User not found");

		const followers = await this.followModel
			.find({ followingId: new Types.ObjectId(id) })
			.populate("followerId", "name email avatar")
			.exec();

		const following = await this.followModel
			.find({ followerId: new Types.ObjectId(id) })
			.populate("followingId", "name email avatar")
			.exec();

		// Transform to match frontend interface
		return {
			_id: user._id,
			name: user.name,
			email: user.email,
			avatar: user.avatar,
			coverImage: user.coverImage,
			bio: user.bio,
			location: user.location,
			website: user.website,
			phone: user.phone,
			tenantId: user.tenantId,
			followersCount: user.followersCount || 0,
			followingCount: user.followingCount || 0,
			followers: followers.map((f) => {
				const follower = f.followerId as unknown as UserSummary | null;
				return {
					_id: follower?._id ?? new Types.ObjectId(),
					name: follower?.name ?? "",
					email: follower?.email ?? "",
					avatar: follower?.avatar ?? "",
				};
			}),
			following: following.map((f) => {
				const followingUser = f.followingId as unknown as UserSummary | null;
				return {
					_id: followingUser?._id ?? new Types.ObjectId(),
					name: followingUser?.name ?? "",
					email: followingUser?.email ?? "",
					avatar: followingUser?.avatar ?? "",
				};
			}),
		};
	}

	/**
	 * Retrieves a user by email, including the password field.
	 * @param email The user email.
	 * @returns The user document or null if not found.
	 */
	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email }).select("+password").exec();
	}

	/**
	 * Updates a user by ID.
	 * @param id The user ID.
	 * @param data The data to update.
	 * @returns The updated user document.
	 * @throws NotFoundException if the user is not found.
	 */
	async update(id: string, data: Partial<User>): Promise<UserDocument> {
		const user = await this.userModel
			.findByIdAndUpdate(id, data, { new: true })
			.exec();

		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	/**
	 * Removes a user by ID.
	 * @param id The user ID.
	 * @returns The deleted user document.
	 * @throws NotFoundException if the user is not found.
	 */
	async remove(id: string): Promise<UserDocument> {
		const user = await this.userModel.findByIdAndDelete(id).exec();
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	/**
	 * Updates a user's avatar URL.
	 * @param id The user ID.
	 * @param avatarUrl The new avatar URL.
	 * @returns The updated user document.
	 */
	async updateAvatar(id: string, avatarUrl: string): Promise<UserDocument> {
		const user = await this.userModel
			.findByIdAndUpdate(id, { avatar: avatarUrl }, { new: true })
			.exec();
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	/**
	 * Gets analytics data for a user.
	 * @param userId The user ID.
	 * @returns Analytics data including posts, views, likes, comments, followers, and following counts.
	 */
	async getAnalytics(userId: string) {
		const userObjectId = new Types.ObjectId(userId);

		// Get all posts by the user
		const userPosts = await this.postModel
			.find({ authorId: userObjectId })
			.exec();

		const totalPosts = userPosts.length;
		const postIds = userPosts.map((post) => post._id);

		// Get total views across all posts
		const totalViews = userPosts.reduce(
			(sum, post) => sum + (post.viewCount || 0),
			0,
		);

		// Get total likes for user's posts
		const totalLikes = await this.likeModel.countDocuments({
			postId: { $in: postIds },
		});

		// Get total comments for user's posts
		const totalComments = await this.commentModel.countDocuments({
			postId: { $in: postIds },
		});

		// Get followers count
		const followersCount = await this.followModel.countDocuments({
			followingId: userObjectId,
		});

		// Get following count
		const followingCount = await this.followModel.countDocuments({
			followerId: userObjectId,
		});

		return {
			totalPosts,
			totalViews,
			totalLikes,
			totalComments,
			followersCount,
			followingCount,
		};
	}
}
