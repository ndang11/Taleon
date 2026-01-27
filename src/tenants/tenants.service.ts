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

	/**
	 * Creates a new tenant.
	 * @param params The tenant data to create.
	 * @returns The created tenant document.
	 */
	async create(params: CreateTenantDto): Promise<TenantDocument> {
		const tenant = new this.tenantModel({
			name: params.name,
			ownerId: params.ownerId,
			isActive: true,
		});
		return tenant.save();
	}

	/**
	 * Updates a tenant by ID.
	 * @param tenantId The tenant ID.
	 * @param params The data to update.
	 * @returns The updated tenant document.
	 * @throws NotFoundException if the tenant is not found.
	 */
	async update(
		tenantId: string,
		params: UpdateTenantDto,
	): Promise<TenantDocument> {
		const tenant = await this.tenantModel
			.findByIdAndUpdate(tenantId, { $set: params }, { new: true })
			.exec();
		if (!tenant) {
			throw new NotFoundException("Tenant not found");
		}
		return tenant;
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
}
