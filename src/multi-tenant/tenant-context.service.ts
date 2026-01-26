import { Inject, Injectable, Scope } from "@nestjs/common";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

interface CustomRequest extends Request {
	user?: { userId: string; tenantId: string };
	tenantId?: string;
}

@Injectable({ scope: Scope.REQUEST })
export class TenantContextService {
	constructor(@Inject(REQUEST) private readonly request: CustomRequest) {}

	get tenantId(): string | undefined {
		return this.request.tenantId;
	}

	get userId(): string | undefined {
		return this.request.user?.userId;
	}

	get user(): { userId: string; tenantId: string } | undefined {
		return this.request.user;
	}

	get requiredTenantId(): string {
		const tenantId = this.tenantId;
		if (!tenantId) {
			throw new Error("Tenant ID is required but not available");
		}
		return tenantId;
	}

	get requiredUserId(): string {
		const userId = this.userId;
		if (!userId) {
			throw new Error("User ID is required but not available");
		}
		return userId;
	}
}
