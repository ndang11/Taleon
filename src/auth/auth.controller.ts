import {
	Body,
	Controller,
	Get,
	Post,
	Req,
	Res,
	UseGuards,
} from "@nestjs/common";
import type { Response } from "express";
import type { LoginDto } from "src/dto/login.dto";
import type { RegisterDto } from "src/dto/register.dto";
import { Public } from "../common/decorators/public.decorator";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
	constructor(private readonly authService: AuthService) {}

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
