import { Module } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { Tenant, TenantSchema } from "src/schemas/tenants.schema";
import { User, UserSchema } from "src/schemas/users.schema";
import { TenantsModule } from "../tenants/tenants.module";
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
		TenantsModule,
	],
	controllers: [AuthController],
	providers: [
		AuthService,
		JwtStrategy,
		{
			provide: JWT_SERVICE,
			useExisting: JwtService,
		},
	],
	exports: [AuthService, JwtModule, JWT_SERVICE],
})
export class AuthModule {}
