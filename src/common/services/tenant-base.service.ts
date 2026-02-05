import { Injectable } from "@nestjs/common";
import { type Document, type Model, Types } from "mongoose";

@Injectable()
export abstract class TenantBaseService<T extends Document> {
	constructor(protected readonly model: Model<T>) {}

	/**
	 * Automatically adds tenantId to any find query.
	 * We use a Record here to avoid the FilterQuery export issue
	 * while maintaining type safety for the tenantId.
	 */

	async findAll(
		tenantId: string | Types.ObjectId,
		filter: Record<string, unknown> = {},
	) {
		return this.model.find({ ...filter, tenantId }).exec();
	}

	async findOne(tenantId: string | Types.ObjectId, id: string) {
		const tenantObjectId =
			typeof tenantId === "string" ? new Types.ObjectId(tenantId) : tenantId;
		const idObjectId = new Types.ObjectId(id);
		return this.model
			.findOne({ _id: idObjectId, tenantId: tenantObjectId })
			.exec();
	}

	async create(tenantId: string | Types.ObjectId, dto: Partial<T>) {
		return this.model.create({ ...dto, tenantId });
	}

	async update(tenantId: string | Types.ObjectId, id: string, dto: Partial<T>) {
		const tenantObjectId =
			typeof tenantId === "string" ? new Types.ObjectId(tenantId) : tenantId;
		const idObjectId = new Types.ObjectId(id);

		return this.model
			.findOneAndUpdate(
				{ _id: idObjectId, tenantId: tenantObjectId },
				{ $set: dto },
				{ new: true },
			)
			.exec();
	}
}
