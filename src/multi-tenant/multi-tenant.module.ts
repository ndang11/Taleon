import { Module, forwardRef } from "@nestjs/common";
import { TenantsModule } from "src/tenants/tenants.module";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
import { TenantContextService } from "./tenant-context.service";

@Module({
	imports: [forwardRef(() => TenantsModule)],
	providers: [TenantGuard, TenantService, TenantContextService],
	exports: [TenantGuard, TenantService, TenantContextService, TenantsModule],
})
export class MultiTenantModule {}
