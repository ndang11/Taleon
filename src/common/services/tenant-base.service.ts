import { Model, Document, Types } from 'mongoose';

export abstract class TenantBaseService<T extends Document> {
  constructor(protected readonly model: Model<T>) {}

  /**
   * Automatically adds tenantId to any find query.
   * We use a Record here to avoid the FilterQuery export issue 
   * while maintaining type safety for the tenantId.
   */
  
  async findAll(tenantId: string | Types.ObjectId, filter: Record<string, unknown> = {}) {
    return this.model.find({ ...filter, tenantId }).exec();
  }

  async findOne(tenantId: string | Types.ObjectId, id: string) {
    return this.model.findOne({ _id: id, tenantId } as any).exec();
  }

  async create(tenantId: string | Types.ObjectId, dto: Partial<T>) {
    return this.model.create({ ...dto, tenantId });
  }

  async update(tenantId: string | Types.ObjectId, id: string, dto: Partial<T>) {
    return this.model.findOneAndUpdate(
      { _id: id, tenantId } as any,
      { $set: dto },
      { new: true }
    ).exec();
  }

  async delete(tenantId: string, id: string) {
    return this.model.deleteOne({ _id: id, tenantId }).exec();
  }
}