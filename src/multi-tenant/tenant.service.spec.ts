import type { Model } from "mongoose";
import { TenantService } from "./tenant.service";

describe("TenantService", () => {
	let service: TenantService;
	let mockModel: jest.Mocked<Partial<Model<unknown>>>;

	beforeEach(() => {
		mockModel = {
			find: jest.fn(),
			findOne: jest.fn(),
			updateOne: jest.fn(),
			deleteOne: jest.fn(),
			create: jest.fn(),
		};

		service = new TenantService({
			tenantId: "tenant1",
		} as unknown as Request & { tenantId?: string } & Record<string, unknown>);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	it("should find documents scoped by tenantId", async () => {
		const docs = [{ title: "Test" }];

		(mockModel.find as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue(docs),
		});

		const result = await service.find(mockModel as Model<unknown>, {
			title: "Test",
		});

		expect(result).toEqual(docs);
		expect(mockModel.find).toHaveBeenCalledWith(
			{
				title: "Test",
				tenantId: "tenant1",
			},
			null,
			{},
		);
	});

	it("should findOne scoped by tenantId", async () => {
		const doc = { title: "Test" };

		(mockModel.findOne as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue(doc),
		});

		const result = await service.findOne(mockModel as Model<unknown>, {
			_id: "1",
		});

		expect(result).toEqual(doc);
		expect(mockModel.findOne).toHaveBeenCalledWith({
			_id: "1",
			tenantId: "tenant1",
		});
	});

	it("should create document with tenantId injected", async () => {
		const created = { title: "Test", tenantId: "tenant1" };

		const mockConstructor = jest.fn<() => unknown>().mockImplementation(() => ({
			save: jest.fn().mockResolvedValue(created),
		}));

		const result = await service.create(
			mockConstructor as unknown as Model<unknown>,
			{
				title: "Test",
			},
		);

		expect(result).toEqual(created);
	});

	it("should updateOne scoped by tenantId", async () => {
		(mockModel.updateOne as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue({ acknowledged: true }),
		});

		await service.updateOne(
			mockModel as Model<unknown>,
			{ _id: "1" },
			{ title: "Updated" },
		);

		expect(mockModel.updateOne).toHaveBeenCalledWith(
			{ _id: "1", tenantId: "tenant1" },
			{ title: "Updated" },
		);
	});

	it("should deleteOne scoped by tenantId", async () => {
		(mockModel.deleteOne as jest.Mock).mockReturnValue({
			exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
		});

		await service.deleteOne(mockModel as Model<unknown>, { _id: "1" });

		expect(mockModel.deleteOne).toHaveBeenCalledWith({
			_id: "1",
			tenantId: "tenant1",
		});
	});

	it("should throw if tenantId is missing", async () => {
		const serviceWithoutTenant = new TenantService(
			{} as unknown as Request & { tenantId?: string } & Record<
					string,
					unknown
				>,
		);

		await expect(
			serviceWithoutTenant.find(mockModel as Model<unknown>),
		).rejects.toThrow("Tenant ID not set in request");
	});
});
