import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import type { Model } from "mongoose";
import type { CreateTenantDto } from "./dto/create-tenant.dto";
import type { UpdateTenantDto } from "./dto/update-tenant.dto";
import { Tenant, type TenantDocument } from "./schemas/tenant.schema";

/**
 * Service for managing tenant operations.
 */
@Injectable()
export class TenantsService {
	constructor(
		@InjectModel(Tenant.name)
		private readonly tenantModel: Model<TenantDocument>,
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

	/**
	 * Retrieves a tenant by ID.
	 * @param tenantId The tenant ID.
	 * @returns The tenant document.
	 * @throws NotFoundException if the tenant is not found.
	 */
	async findById(tenantId: string): Promise<TenantDocument> {
		const tenant = await this.tenantModel.findById(tenantId).exec();
		if (!tenant) {
			throw new NotFoundException("Tenant not found");
		}
		return tenant;
	}

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
