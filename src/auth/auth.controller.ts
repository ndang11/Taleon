import { Body, Controller, Post, Res } from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../common/decorators/public.decorator";
// biome-ignore lint/style/useImportType: DTOs must be values for validation metadata
import { LoginDto } from "../dto/login.dto";
// biome-ignore lint/style/useImportType: DTOs must be values for validation metadata
import { RegisterDto } from "../dto/register.dto";
// biome-ignore lint/style/useImportType: NestJS uses this for dependency injection.
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private authService: AuthService) {}

	@Public()
	@Post("register")
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, user } = await this.authService.register(dto);

		this.setCookie(res, accessToken);

		return {
			success: true,
			accessToken,
			user,
		};
	}

	@Public()
	@Post("login")
	async login(
		@Body() dto: LoginDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken, user } = await this.authService.login(dto);

		this.setCookie(res, accessToken);

		return {
			success: true,
			accessToken,
			user,
		};
	}

	@Post("logout")
	logout(@Res({ passthrough: true }) res: Response) {
		res.clearCookie("access_token");
		return { success: true };
	}

	private setCookie(res: Response, token: string) {
		const isProduction = process.env.NODE_ENV === "production";
		res.cookie("access_token", token, {
			httpOnly: true,
			secure: isProduction,
			sameSite: isProduction ? "none" : "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
			partitioned: isProduction,
		});
	}
}
