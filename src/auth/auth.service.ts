import {
	ConflictException,
	Inject,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import * as bcrypt from "bcrypt";
import type { Connection, Model } from "mongoose";
import slugify from "slugify";
import type { LoginDto } from "../dto/login.dto";
import type { RegisterDto } from "../dto/register.dto";
import { Tenant, type TenantDocument } from "../schemas/tenants.schema";
import { User, type UserDocument } from "../schemas/users.schema";
import { JWT_SERVICE } from "./constants";

@Injectable()
export class AuthService {
	constructor(
		@InjectModel(User.name) private userModel: Model<UserDocument>,
		@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
		@InjectConnection() private readonly connection: Connection,
		@Inject(JWT_SERVICE) private jwtService: JwtService,
	) {}

	async register(dto: RegisterDto) {
		const { email, password, name, blogName } = dto;
		const normalizedEmail = email.toLowerCase().trim();

		console.log("[Auth] Register attempt for email:", normalizedEmail);

		const existingUser = await this.userModel.findOne({
			email: normalizedEmail,
		});
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

			// console.log(
			// 	"[Auth] User created successfully:",
			// 	newUser.email,
			// 	"- ID:",
			// 	newUser._id,
			// );

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
				avatar: user.avatar || "",
				coverImage: user.coverImage || "",
				bio: user.bio || "",
				location: user.location || "",
				website: user.website || "",
				phone: user.phone || "",
			},
		};
	}

	async login(credentials: LoginDto) {
		const { email, password } = credentials;

		// Normalize email to lowercase to match the schema's lowercase option
		const normalizedEmail = email.toLowerCase().trim();

		// console.log("[Auth] Login attempt for email:", normalizedEmail);

		const user = await this.userModel
			.findOne({ email: normalizedEmail })
			.select("+password")
			.exec();

		if (!user) {
			console.warn("[Auth] User not found for email:", email);
			throw new UnauthorizedException("Invalid email or password");
		}

		// console.log(
		// 	"[Auth] User found:",
		// 	user.email,
		// 	"- Password field type:",
		// 	typeof user.password,
		// );
		// console.log("[Auth] User password length:", user.password?.length);

		if (!user.password) {
			console.warn("[Auth] User has no password field set:", email);
			throw new UnauthorizedException("Invalid email or password");
		}

		// console.log("[Auth] User found:", user.email, "- Verifying password...");

		let isPasswordValid = false;
		try {
			isPasswordValid = await bcrypt.compare(password, user.password);
			// console.log("[Auth] Password comparison result:", isPasswordValid);
			// console.log("[Auth] Input password length:", password.length);
			// console.log("[Auth] Stored hash length:", user.password.length);
		} catch (error) {
			console.error("[Auth] Password comparison error:", error);
			throw new UnauthorizedException("Invalid email or password");
		}

		if (!isPasswordValid) {
			console.warn("[Auth] Invalid password for user:", email);
			throw new UnauthorizedException("Invalid email or password");
		}

		// console.log("[Auth] Login successful for user:", email);

		return this.generateToken(user);
	}
}
