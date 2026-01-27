import type { INestApplication } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Test, TestingModule } from "@nestjs/testing";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { AuthModule } from "../src/auth/auth.module";

describe("AuthController (e2e)", () => {
	let app: INestApplication;
	let mongod: MongoMemoryServer;

	beforeAll(async () => {
		mongod = await MongoMemoryServer.create();
		const uri = mongod.getUri();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AuthModule, MongooseModule.forRoot(uri)],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.setGlobalPrefix("api");
		await app.init();
	});

	afterAll(async () => {
		await app.close();
		await mongod.stop();
	});

	it("POST /api/auth/register", async () => {
		const res = await request(app.getHttpServer())
			.post("/api/auth/register")
			.send({
				name: "Royalty",
				email: "royalty@test.com",
				password: "secret123",
			})
			.expect(201);

		expect(res.body).toHaveProperty("access_token");
	});

	it("POST /api/auth/login", async () => {
		const res = await request(app.getHttpServer())
			.post("/api/auth/login")
			.send({
				email: "royalty@test.com",
				password: "secret123",
			})
			.expect(201);

		expect(res.body).toHaveProperty("access_token");
	});
});
