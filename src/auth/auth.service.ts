import {
	ConflictException,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import type { Connection, Model } from "mongoose";
import slugify from "slugify";
import type { LoginDto } from "src/dto/login.dto";
import type { RegisterDto } from "../dto/register.dto";
import { Tenant, type TenantDocument } from "../schemas/tenants.schema";
import { User, type UserDocument } from "../schemas/users.schema";

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
		@InjectConnection() private readonly connection: Connection,
		private jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const { email, password, name, blogName } = dto;

		const existingUser = await this.userModel.findOne({ email });
		if (existingUser) throw new ConflictException("Email already registered");

		const slug = slugify(blogName, { lower: true, strict: true });
		const existingTenant = await this.tenantModel.findOne({ slug });
		if (existingTenant)
			throw new ConflictException("Blog name/slug already taken");

		const session = await this.connection.startSession();
		session.startTransaction();

		try {
			const createdTenants = await this.tenantModel.create(
				[{ name: blogName, slug }],
				{ session },
			);
			const newTenant = createdTenants[0];
			if (!newTenant)
				throw new InternalServerErrorException("Failed to create tenant");

			const hashedPassword = await bcrypt.hash(password, 12);
			const createdUsers = await this.userModel.create(
				[
					{
						name,
						email,
						password: hashedPassword,
						tenantId: newTenant._id,
					},
				],
				{ session },
			);
			const newUser = createdUsers[0];
			if (!newUser)
				throw new InternalServerErrorException("Failed to create user");

			newTenant.ownerId = newUser._id;
			await newTenant.save({ session });

			await session.commitTransaction();

			return this.generateToken(newUser);
		} catch (error) {
			await session.abortTransaction();
			throw error;
		} finally {
			session.endSession();
		}
	}

	private generateToken(user: UserDocument) {
		const payload = {
			sub: user._id.toString(),
			email: user.email,
			tenantId: user.tenantId.toString(),
		};

		return {
			accessToken: this.jwtService.sign(payload),
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				tenantId: user.tenantId,
			},
		};
	}

	async login(credentials: LoginDto) {
		const { email, password } = credentials;

		const user = await this.userModel
			.findOne({ email })
			.select("+password")
			.exec();

		if (!user) {
			throw new UnauthorizedException("Invalid email or password");
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			throw new UnauthorizedException("Invalid email or password");
		}

		return this.generateToken(user);
	}
}
