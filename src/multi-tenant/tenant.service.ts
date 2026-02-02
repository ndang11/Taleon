import { Inject, Injectable, Scope } from "@nestjs/common";
import type { Request } from "express";
import type { Model } from "mongoose";

@Injectable({ scope: Scope.REQUEST })
export class TenantService {
	constructor(
		@Inject("REQUEST")
		private readonly request: Request & { tenantId?: string },
	) {}

	private getTenantId(): string {
		const tenantId = this.request.tenantId;
		if (!tenantId) {
			throw new Error("Tenant ID not set in request");
		}
		return tenantId;
	}

	async find<T>(
		model: Model<T>,
		filter: Record<string, unknown> = {},
		options: Record<string, unknown> = {},
	): Promise<T[]> {
		const tenantFilter = { ...filter, tenantId: this.getTenantId() };
		return model.find(tenantFilter, null, options).exec();
	}

	async findOne<T>(
		model: Model<T>,
		filter: Record<string, unknown> = {},
	): Promise<T | null> {
		const tenantFilter = { ...filter, tenantId: this.getTenantId() };
		return model.findOne(tenantFilter).exec();
	}

	async create<T>(model: Model<T>, data: Partial<T>): Promise<T> {
		const doc = new model({ ...data, tenantId: this.getTenantId() });
		return (await doc.save()) as T;
	}

	async updateOne<T>(
		model: Model<T>,
		filter: Record<string, unknown>,
		update: Record<string, unknown>,
	): Promise<unknown> {
		const tenantFilter = { ...filter, tenantId: this.getTenantId() };
		return model.updateOne(tenantFilter, update).exec();
	}

	async deleteOne<T>(
		model: Model<T>,
		filter: Record<string, unknown>,
	): Promise<unknown> {
		const tenantFilter = { ...filter, tenantId: this.getTenantId() };
		return model.deleteOne(tenantFilter).exec();
	}

	// Add more methods as needed
}
