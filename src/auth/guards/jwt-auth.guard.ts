import type { ExecutionContext } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import { lastValueFrom, type Observable } from "rxjs";
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
