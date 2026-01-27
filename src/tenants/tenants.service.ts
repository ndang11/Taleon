import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Tenant, type TenantDocument } from "./schemas/tenant.schema";

@Injectable()
export class TenantsService {
	constructor(
		@InjectModel(Tenant.name)
		private readonly tenantModel: Model<TenantDocument>,
	) {}

	async findById(tenantId: string) {
		const tenant = await this.tenantModel.findById(tenantId).exec();
		if (!tenant) throw new NotFoundException("Tenant not found");
		return tenant;
	}
}
