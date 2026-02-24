import { createParamDecorator, type ExecutionContext } from "@nestjs/common";

export interface JwtUserPayload {
	userId: string;
	email?: string;
	tenantId: string;
}

export const CurrentUser = createParamDecorator(
	(_data: unknown, ctx: ExecutionContext): JwtUserPayload | undefined => {
		const request = ctx.switchToHttp().getRequest();

		if (!request.user) {
			return undefined;
		}

		return request.user as JwtUserPayload;
	},
);
