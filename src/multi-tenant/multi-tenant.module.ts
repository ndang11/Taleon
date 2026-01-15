import { Module } from "@nestjs/common";
import { TenantGuard } from "./tenant.guard";
import { TenantService } from "./tenant.service";
@Module({
	providers: [TenantGuard, TenantService],
	exports: [TenantGuard, TenantService],
})
export class MultiTenantModule {}
