import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// Skip auth for public routes
		const isPublic = this.reflector?.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		// For non-public routes, check authentication
		try {
			const result = await super.canActivate(context);
			return result as boolean;
		} catch (error) {
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
