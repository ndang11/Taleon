import {
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
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

		console.log(
			"[JwtAuthGuard] isPublic:",
			isPublic,
			"- Handler:",
			context.getHandler().name,
		);

		if (isPublic) {
			console.log("[JwtAuthGuard] Allowing public route");
			return true;
		}

		// For non-public routes, check authentication
		try {
			const result = await super.canActivate(context);
			console.log("[JwtAuthGuard] Auth result:", result);
			return result as boolean;
		} catch (_error) {
			console.error("[JwtAuthGuard] Auth error:", _error);
			throw new UnauthorizedException("Invalid or expired token");
		}
	}
}
