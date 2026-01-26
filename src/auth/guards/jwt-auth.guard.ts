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
export class JwtAuthGuard extends AuthGuard("jwt") {
	constructor(private reflector: Reflector) {
		super();
	}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) return true;

		return lastValueFrom(super.canActivate(context) as Observable<boolean>);
	}
}
