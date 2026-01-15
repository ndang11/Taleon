import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { User, type UserDocument } from "./schemas/user.schema";

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private readonly userModel: Model<UserDocument>,
	) {}

	async create(data: {
		name: string;
		email: string;
		password: string;
	}): Promise<User> {
		const user = new this.userModel(data);
		return user.save();
	}

	async findAll(): Promise<User[]> {
		return this.userModel.find().exec();
	}

	async findOne(id: string): Promise<User> {
		const user = await this.userModel.findById(id).exec();
		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	async findByEmail(email: string): Promise<UserDocument | null> {
		return this.userModel.findOne({ email }).select("+password").exec();
	}

	async update(id: string, data: Partial<User>): Promise<User> {
		const user = await this.userModel
			.findByIdAndUpdate(id, data, { new: true })
			.exec();

		if (!user) throw new NotFoundException("User not found");
		return user;
	}

	async remove(id: string): Promise<User> {
		const user = await this.userModel.findByIdAndDelete(id).exec();
		if (!user) throw new NotFoundException("User not found");
		return user;
	}
}
