import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TenantsModule } from "../tenants/tenants.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constants";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@Module({
	imports: [
		UsersModule,
		TenantsModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtAuthGuard],
	exports: [AuthService, JwtModule, JwtAuthGuard],
})
export class AuthModule {}
