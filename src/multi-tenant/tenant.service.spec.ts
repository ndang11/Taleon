import type { Model } from "mongoose";
import { TenantService } from "./tenant.service";

describe("TenantService", () => {
	let service: TenantService;
	let mockModel: Model<unknown>;

	const _mockRequest = { tenantId: "tenant1" };

	beforeEach(() => {
		mockModel = {
			find: jest.fn(),
			findOne: jest.fn(),
			updateOne: jest.fn(),
			deleteOne: jest.fn(),
		} as unknown as Model<unknown>;

		// Directly instantiate with mock request
		service = new TenantService({ tenantId: "tenant1" } as Request & {
			tenantId?: string;
		});
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should find documents with tenantId filter", async () => {
		const mockDocs = [{ title: "Test" }];
		mockModel.find = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue(mockDocs),
		});

		const result = await service.find(mockModel, { title: "Test" });
		expect(result).toEqual(mockDocs);
		expect(mockModel.find).toHaveBeenCalledWith(
			{ title: "Test", tenantId: "tenant1" },
			null,
			{},
		);
	});

	it("should findOne with tenantId filter", async () => {
		const mockDoc = { title: "Test" };
		mockModel.findOne = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue(mockDoc),
		});

		const result = await service.findOne(mockModel, { _id: "1" });
		expect(result).toEqual(mockDoc);
		expect(mockModel.findOne).toHaveBeenCalledWith({
			_id: "1",
			tenantId: "tenant1",
		});
	});

	it("should create document with tenantId", async () => {
		const mockDoc = {
			title: "Test",
			tenantId: "tenant1",
			save: jest.fn().mockResolvedValue({ title: "Test", tenantId: "tenant1" }),
		};
		(mockModel as unknown) = jest.fn().mockImplementation(() => mockDoc);

		const result = await service.create(mockModel, { title: "Test" });
		expect(result).toEqual({ title: "Test", tenantId: "tenant1" });
	});

	it("should updateOne with tenantId filter", async () => {
		mockModel.updateOne = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({ acknowledged: true }),
		});

		const _result = await service.updateOne(
			mockModel,
			{ _id: "1" },
			{ title: "Updated" },
		);
		expect(mockModel.updateOne).toHaveBeenCalledWith(
			{ _id: "1", tenantId: "tenant1" },
			{ title: "Updated" },
		);
	});

	it("should deleteOne with tenantId filter", async () => {
		mockModel.deleteOne = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
		});

		const _result = await service.deleteOne(mockModel, { _id: "1" });
		expect(mockModel.deleteOne).toHaveBeenCalledWith({
			_id: "1",
			tenantId: "tenant1",
		});
	});

	it("should throw error if tenantId not set", async () => {
		const serviceWithoutTenant = new TenantService(
			{} as Request & { tenantId?: string },
		);

		await expect(serviceWithoutTenant.find(mockModel)).rejects.toThrow(
			"Tenant ID not set in request",
		);
	});
});
