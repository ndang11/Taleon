import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { jwtConstants } from "./auth/constants";
import { AuthGuard } from "./common/guards/auth.guard";
import { PostsModule } from "./posts/posts.module";
import { TenantsModule } from "./tenants/tenants.module";
import { UsersController } from "./users/users.controller";
import { UsersModule } from "./users/users.module";

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
		}),
		MongooseModule.forRoot(
			process.env.MONGO_URI ??
				(() => {
					throw new Error("MONGO_URI is not defined");
				})(),
		),
		JwtModule.register({
			global: true,
			secret: jwtConstants.secret,
			signOptions: { expiresIn: "7d" },
		}),

		AuthModule,
		UsersModule,
		TenantsModule,
		PostsModule,
	],

	controllers: [AppController, UsersController],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		AppService,
	],
})
export class AppModule {}
