import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type {
	ParamsDictionary,
	Query,
	Request,
} from "express-serve-static-core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";

interface User {
	userId: string;
	tenantId: string;
}

interface CustomRequest
	extends Request<ParamsDictionary, unknown, unknown, Query> {
	user?: User;
	tenantId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			// For public routes, tenantId might be from query or something, but for now, set to undefined or handle in service
			return true;
		}

		const request = context.switchToHttp().getRequest<CustomRequest>();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException("Tenant ID not found in user");
		}

		request.tenantId = user.tenantId;
		return true;
	}
}
