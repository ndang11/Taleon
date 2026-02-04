import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Tenant, TenantSchema } from "src/schemas/tenants.schema";
import { User, UserSchema } from "src/schemas/users.schema";
import { JwtAuthGuard } from "../common/guards/jwt-auth.guard";
import { TenantsModule } from "../tenants/tenants.module";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JWT_SERVICE, jwtConstants } from "./constants";
import { JwtStrategy } from "./jwt.strategy";

@Module({
	imports: [
		PassportModule.register({ defaultStrategy: "jwt" }),
		JwtModule.register({
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),
		MongooseModule.forFeature([
			{ name: User.name, schema: UserSchema },
			{ name: Tenant.name, schema: TenantSchema },
		]),
		UsersModule,
		TenantsModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtAuthGuard,
		JwtStrategy,
		{
			provide: JWT_SERVICE,
			useExisting: JwtService,
		},
	],
	exports: [AuthService, JwtModule, JwtAuthGuard, JWT_SERVICE],
})
export class AuthModule {}
