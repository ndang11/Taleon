import {
	type CanActivate,
	type ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import type { Request } from "express";

interface User {
	id: string;
	tenantId: string;
	// other properties
}

@Injectable()
export class TenantGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request = context
			.switchToHttp()
			.getRequest<Request & { user?: User; tenantId?: string }>();
		const user = request.user;

		if (!user || !user.tenantId) {
			throw new ForbiddenException("Tenant ID not found in user");
		}

		request.tenantId = user.tenantId;
		return true;
	}
}
