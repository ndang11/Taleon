import {
	CanActivate,
	ExecutionContext,
	Inject,
	Injectable,
	UnauthorizedException,
	forwardRef,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { TenantsService } from "../tenants/tenants.service";

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(
		@Inject(forwardRef(() => TenantsService))
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
		} catch (_error) {
			request.tenant = null;
			request.tenantId = request.user.tenantId;
		}

		return true;
	}
}
