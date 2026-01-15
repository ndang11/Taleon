import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { TenantGuard } from "./tenant.guard";

describe("TenantGuard", () => {
	let guard: TenantGuard;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [TenantGuard],
		}).compile();

		guard = module.get<TenantGuard>(TenantGuard);
	});

	it("should be defined", () => {
		expect(guard).toBeDefined();
	});

	it("should allow access when user has tenantId", () => {
		const mockRequest: any = {
			user: { id: "1", tenantId: "tenant1" },
		};
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => mockRequest,
			}),
		} as ExecutionContext;

		const result = guard.canActivate(mockContext);
		expect(result).toBe(true);
		expect(mockRequest.tenantId).toBe("tenant1");
	});

	it("should throw ForbiddenException when user is not present", () => {
		const mockRequest = {};
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => mockRequest,
			}),
		} as ExecutionContext;

		expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
	});

	it("should throw ForbiddenException when user has no tenantId", () => {
		const mockRequest = {
			user: { id: "1" },
		};
		const mockContext = {
			switchToHttp: () => ({
				getRequest: () => mockRequest,
			}),
		} as ExecutionContext;

		expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
	});
});
