import {
	type CanActivate,
	type ExecutionContext,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { TenantsService } from "../tenants/tenants.service";

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

		try {
			const tenant = await this.tenantsService.findById(request.user.tenantId);
			request.tenant = tenant;
			request.tenantId = tenant._id.toString();
		} catch (error) {
			// If tenant not found, still allow the request but without tenant context
			// Use the tenantId from the user object as fallback
			request.tenant = null;
			request.tenantId = request.user.tenantId;
		}

		return true;
	}
}
