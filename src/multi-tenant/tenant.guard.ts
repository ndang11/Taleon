import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import type { TenantsService } from "../tenants/tenants.service";

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

		if (isPublic) return true;

		const request = context.switchToHttp().getRequest();

		if (!request.user?.tenantId) {
			throw new UnauthorizedException("Tenant context missing");
		}

		const tenant = await this.tenantsService.findById(request.user.tenantId);

		request.tenant = tenant;
		return true;
	}
}
