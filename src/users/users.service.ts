import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { type Model, Types } from "mongoose";
import { User, type UserDocument } from "../schemas/users.schema";

/**
 * Service for managing user operations.
 */
@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
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
		const user = new this.userModel({
			...data,
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
	 * @returns The user document.
	 * @throws NotFoundException if the user is not found.
	 */
	async findOne(id: string): Promise<UserDocument> {
		const user = await this.userModel.findById(id).exec();
		if (!user) throw new NotFoundException("User not found");
		return user;
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
}
