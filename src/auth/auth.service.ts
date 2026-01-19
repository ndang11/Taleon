import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { TenantsService } from "../tenants/tenants.service";
import type { UsersService } from "../users/users.service";
import type { LoginDto } from "./dto/login.dto";
import type { RegisterDto } from "./dto/register.dto";

interface JwtPayload {
	userId: string;
}

@Injectable()
export class AuthService {
	constructor(
		private readonly users: UsersService,
		readonly tenants: TenantsService,
		private readonly jwt: JwtService,
	) {}

	async register(data: RegisterDto) {
		const emailInUse = await this.users.findByEmail(data.email);
		if (emailInUse) {
			throw new BadRequestException(
				"An account with this email already exists",
			);
		}

		const hashedPassword = await this.hashPassword(data.password);

		const user = await this.users.create({
			email: data.email,
			password: hashedPassword,
			name: data.name,
		});

		return this.issueToken(user._id.toString());
	}

	async login(credentials: LoginDto) {
		const user = await this.users.findByEmail(credentials.email);
		if (!user) {
			throw new UnauthorizedException("Email or password is incorrect");
		}

		await this.verifyPassword(credentials.password, user.password);

		return this.issueToken(user._id.toString());
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

	private issueToken(userId: string) {
		const payload: JwtPayload = { userId };

		return {
			accessToken: this.jwt.sign(payload),
		};
	}
}
