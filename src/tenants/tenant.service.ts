import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import  { Model, Types } from "mongoose";
import { Tenant, TenantDocument,  } from "./schemas/tenant.schema";

@Injectable()
export class TenantsService {
	constructor(
		@InjectModel(Tenant.name)
		private tenantModel: Model<TenantDocument>,
	) {}

	create(data: Partial<Tenant>) {
		return this.tenantModel.create(data);
	}

	findBySlug(slug: string) {
		return this.tenantModel.findOne({ slug });
	}

	findById(id: string | Types.ObjectId) {
		return this.tenantModel.findById(id);
	}
}
