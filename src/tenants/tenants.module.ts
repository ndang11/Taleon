import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Tenant, TenantSchema } from "src/schemas/tenants.schema";
import { TenantsService } from "./tenants.service";

/**
 * Module for tenant-related functionality.
 * Provides and exports the TenantsService for managing tenants.
 */
@Module({
	imports: [
		MongooseModule.forFeature([{ name: Tenant.name, schema: TenantSchema }]),
	],
	providers: [TenantsService],
	exports: [TenantsService],
})
export class TenantsModule {}
