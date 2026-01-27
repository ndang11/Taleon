import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TenantsService } from "../tenants/tenants.service";
import type { UserDocument } from "../users/schemas/user.schema";
import { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly tenantsService: TenantsService,
	) {}

	async register(data: RegisterDto) {
		const emailInUse = await this.usersService.findByEmail(data.email);
		if (emailInUse) {
			throw new BadRequestException(
				"An account with this email already exists",
			);
		}

		const hashedPassword = await this.hashPassword(data.password);

		// Create tenant
		const tenant = await this.tenantsService.create({
			name: `${data.name}'s Tenant`,
			slug: data.email.replace("@", "-").replace(".", "-"),
		});

		const user = await this.usersService.create({
			email: data.email,
			password: hashedPassword,
			name: data.name,
			tenantId: tenant._id.toString(),
		});

		// Update tenant with ownerId
		await this.tenantsService.update(tenant._id.toString(), {
			ownerId: user._id,
		});

		const payload = {
			userId: user._id.toString(),
			tenantId: user.tenantId.toString(),
		};

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	async login(credentials: LoginDto) {
		const user = await this.usersService.findByEmail(credentials.email);
		if (!user) {
			throw new UnauthorizedException("Email or password is incorrect");
		}

		await this.verifyPassword(credentials.password, user.password);

		const payload = {
			userId: user._id.toString(),
			tenantId: user.tenantId.toString(),
		};

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	private async hashPassword(password: string): Promise<string> {
		const SALT_ROUNDS = 12;
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	private async verifyPassword(plain: string, hashed: string): Promise<void> {
		const isValid = await bcrypt.compare(plain, hashed);
		if (!isValid) {
			throw new UnauthorizedException("Email or password is incorrect");
		}
	}

	async loginWithTenant(user: UserDocument) {
		const payload = {
			userId: user._id.toString(),
			tenantId: user.tenantId.toString(),
			email: user.email,
		};

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}
}
