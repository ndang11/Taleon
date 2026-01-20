import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import type {
	ParamsDictionary,
	Query,
	Request,
} from "express-serve-static-core";

interface User {
	id: string;
	tenantId: string;
}

interface CustomRequest
	extends Request<ParamsDictionary, unknown, unknown, Query> {
	user?: User;
	tenantId?: string;
}

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest<CustomRequest>();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException("Tenant ID not found in user");
		}

		request.tenantId = user.tenantId;
		return true;
	}
}
