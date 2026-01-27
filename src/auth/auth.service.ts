import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { TenantsService } from "src/tenants/tenants.service";
import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UserDocument } from "src/users/user.entity";


/**
 * Service for handling authentication operations including registration and login.
 */
@Injectable()
export class AuthService {
	constructor(
		private readonly usersService: UsersService,
		private readonly jwtService: JwtService,
		private readonly tenantsService: TenantsService,
	) {}

	/**
	 * Registers a new user and creates a tenant for them.
	 * @param data The registration data.
	 * @returns An object containing the access token.
	 * @throws BadRequestException if the email is already in use.
	 */
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
			ownerId: user._id.toString(),
		});

		const payload = {
			userId: user._id.toString(),
			tenantId: user.tenantId.toString(),
		};

		return {
			accessToken: this.jwtService.sign(payload),
		};
	}

	/**
	 * Logs in a user with email and password.
	 * @param credentials The login credentials.
	 * @returns An object containing the access token.
	 * @throws UnauthorizedException if credentials are invalid.
	 */
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

	/**
	 * Hashes a password using bcrypt.
	 * @param password The plain password.
	 * @returns The hashed password.
	 */
	private async hashPassword(password: string): Promise<string> {
		const SALT_ROUNDS = 12;
		return bcrypt.hash(password, SALT_ROUNDS);
	}

	/**
	 * Verifies a plain password against a hashed password.
	 * @param plain The plain password.
	 * @param hashed The hashed password.
	 * @throws UnauthorizedException if passwords do not match.
	 */
	private async verifyPassword(plain: string, hashed: string): Promise<void> {
		const isValid = await bcrypt.compare(plain, hashed);
		if (!isValid) {
			throw new UnauthorizedException("Email or password is incorrect");
		}
	}

	/**
	 * Generates an access token for a user with tenant information.
	 * @param user The user document.
	 * @returns An object containing the access token.
	 */
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
