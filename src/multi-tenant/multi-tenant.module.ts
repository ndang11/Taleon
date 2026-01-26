import { Module } from "@nestjs/common";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
import { TenantContextService } from "./tenant-context.service";
@Module({
	providers: [TenantGuard, TenantService, TenantContextService],
	exports: [TenantGuard, TenantService, TenantContextService],
})
export class MultiTenantModule {}
