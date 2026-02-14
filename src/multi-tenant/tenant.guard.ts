import {
	type CanActivate,
	type ExecutionContext,
	forwardRef,
	Inject,
	Injectable,
	UnauthorizedException,
} from "@nestjs/common";
import { IS_PUBLIC_KEY } from "../common/decorators/public.decorator";
import { TenantsService } from "../tenants/tenants.service";

@Injectable()
export class TenantGuard implements CanActivate {
	constructor(
		@Inject(forwardRef(() => TenantsService))
		private readonly tenantsService: TenantsService,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
		const isPublic =
			Reflect.getMetadata(IS_PUBLIC_KEY, context.getHandler()) ||
			Reflect.getMetadata(IS_PUBLIC_KEY, context.getClass());

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
