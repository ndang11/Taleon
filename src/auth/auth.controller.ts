import { Body, Controller, Post, Res } from "@nestjs/common";
import { Public } from "../common/decorators/public.decorator";
import { AuthService } from "./auth.service";
import { type Response } from "express";
import { RegisterDto } from "src/dto/register.dto";
import { LoginDto } from "src/dto/login.dto";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService
	) { }

	@Public()
	@Post("register")
	async register(
		@Body() dto: RegisterDto,
		@Res({ passthrough: true }) res: Response,
	) {
		const { accessToken } = await this.authService.register(dto);

		this.setCookie(res, accessToken);

		return {
			success: true,
			accessToken,
		};
	}

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
		res.cookie("access_token", token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
	}
}
