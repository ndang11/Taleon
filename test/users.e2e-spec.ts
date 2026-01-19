import type { INestApplication } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { UsersModule } from "../src/users/users.module";

describe("UsersController (e2e)", () => {
	let app: INestApplication;
	let mongod: MongoMemoryServer;
	let _userId: string;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [UsersModule, MongooseModule.forRoot(uri)],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix("api");
		await app.init();
	});

	afterAll(async () => {
		await app.close();
		await mongod.stop();
	});

	it("GET /api/users → empty array", async () => {
		const res = await request(app.getHttpServer())
			.get("/api/users")
			.expect(200);

		expect(res.body).toEqual([]);
	});

	it("GET /api/users/:id → 404", async () => {
		await request(app.getHttpServer())
			.get("/api/users/507f1f77bcf86cd799439011")
			.expect(404);
	});
});
