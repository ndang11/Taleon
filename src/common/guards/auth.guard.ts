import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "../../auth/constants";

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
		const token = request.cookies?.access_token;

		if (!token) throw new UnauthorizedException();

		try {
			const payload = await this.jwtService.verifyAsync(token, {
				secret: jwtConstants.secret,
			});

			request.user = payload.sub;
			return true;
		} catch {
			throw new UnauthorizedException();
		}
	}
}
