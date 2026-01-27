
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { jwtConstants } from "../../auth/constants";
import { JwtService } from "@nestjs/jwt";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.get<boolean>(
			"isPublic",
			context.getHandler(),
		);
		if (isPublic) return true;

		const request = context.switchToHttp().getRequest();

		// ✅ Read token from Authorization header
		const authHeader = request.headers.authorization;
		if (!authHeader) {
			throw new UnauthorizedException("Missing Authorization header");
		}

		const [type, token] = authHeader.split(" ");

		if (type !== "Bearer" || !token) {
			throw new UnauthorizedException("Invalid Authorization format");
		}

		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: jwtConstants.secret,
			});

			request.user = {
				userId: payload.sub,
				tenantId: payload.tenantId,
				email: payload.email,
				role: payload.role,
			};

			return true;
		} catch {
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
