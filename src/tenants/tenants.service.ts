import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import { Tenant, type TenantDocument } from "./schemas/tenant.schema";

@Injectable()
export class TenantsService {
	constructor(
		@InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
	) {}

	async create(data: {
		name: string;
		slug?: string;
		ownerId?: string;
	}): Promise<TenantDocument> {
		const {
			name,
			slug = name.toLowerCase().replace(/ /g, "-"),
			ownerId,
		} = data;
		const createdTenant = new this.tenantModel({ name, slug, ownerId });
		return createdTenant.save();
	}

	async findAll(): Promise<Tenant[]> {
		return this.tenantModel.find().exec();
	}

	async findOne(id: string): Promise<Tenant | null> {
		return this.tenantModel.findById(id).exec();
	}

	async findBySlug(slug: string): Promise<Tenant | null> {
		return this.tenantModel.findOne({ slug }).exec();
	}

	async update(id: string, data: Partial<Tenant>): Promise<Tenant | null> {
		return this.tenantModel.findByIdAndUpdate(id, data, { new: true }).exec();
	}
}
