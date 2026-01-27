import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { Request } from "express";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import type { TenantDocument } from "../tenants/schemas/tenant.schema";
import type { TenantsService } from "../tenants/tenants.service";

interface CustomRequest extends Request {
	user?: { userId: string; tenantId: string };
	tenant?: TenantDocument;
}

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(
		private readonly tenantsService: TenantsService,
		private readonly reflector: Reflector,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		const request = context.switchToHttp().getRequest<CustomRequest>();

		if (isPublic) return true;

		if (!request.user?.tenantId) {
			throw new UnauthorizedException("Tenant context missing");
		}

		const tenant = await this.tenantsService.findById(request.user.tenantId);

		request.tenant = tenant;
		return true;
	}
}
