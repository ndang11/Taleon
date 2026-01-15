import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { TenantsModule } from "../tenants/tenants.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { jwtConstants } from "./constants";

@Module({
	imports: [
		UsersModule,
		TenantsModule,
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),
	],
	providers: [AuthService],
	controllers: [AuthController],
})
export class AuthModule {}
