import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { JwtService } from "@nestjs/jwt";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../../common/decorators/public.decorator";

@Injectable()
export class JwtAuthGuard implements CanActivate {
	constructor(
		private readonly jwtService: JwtService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request = context.switchToHttp().getRequest<Request>();
		const token = request.cookies?.access_token;

		if (!token) {
			throw new UnauthorizedException("Authentication required");
		}

		try {
			const payload = await this.jwtService.verifyAsync(token);
			request.user = payload;
			return true;
		} catch {
			throw new UnauthorizedException("Invalid token");
		}
	}
}
