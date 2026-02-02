import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export interface CurrentUser {
	id: string;
	email?: string;
	tenantId: string;
}

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): CurrentUser | undefined => {
		const request = ctx.switchToHttp().getRequest();

		if (!request.user) {
			return undefined;
		}

		return request.user;
	},
);
