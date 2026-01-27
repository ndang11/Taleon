import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { TenantService } from "../multi-tenant/tenant.service";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { UpdatePostDto } from "./dto/update-post.dto";
import { Post, PostStatus } from "./post.schema";
import { PostsService } from "./posts.service";

describe("PostsService", () => {
	let service: PostsService;
	let mockPostModel: any;
	let mockTenantService: any;

	beforeEach(async () => {
		mockPostModel = {
			findOne: jest.fn().mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			}),
		};
		mockTenantService = {
			getTenantId: jest.fn(),
			create: jest.fn(),
			find: jest.fn(),
			findOne: jest.fn(),
			updateOne: jest.fn(),
			deleteOne: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				PostsService,
				{
					provide: getModelToken("Post"),
					useValue: mockPostModel,
				},
				{
					provide: TenantService,
					useValue: mockTenantService,
				},
			],
		}).compile();

		service = module.get<PostsService>(PostsService);
	});

	it("should be defined", () => {
		expect(service).toBeDefined();
	});

	describe("generateSlug", () => {
		it("should generate slug from title", () => {
			const slug = (service as any).generateSlug("Hello World!");
			expect(slug).toBe("hello-world");
		});
	});

	describe("generateUniqueSlug", () => {
		it("should return slug if unique", async () => {
			mockTenantService.getTenantId.mockReturnValue("tenant1");
			mockPostModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});

			const slug = await (service as any).generateUniqueSlug(
				"Test Title",
				"tenant1",
			);
			expect(slug).toBe("test-title");
		});

		it("should append number if slug exists", async () => {
			mockTenantService.getTenantId.mockReturnValue("tenant1");
			mockPostModel.findOne
				.mockReturnValueOnce({
					exec: jest.fn().mockResolvedValue({}),
				})
				.mockReturnValueOnce({
					exec: jest.fn().mockResolvedValue(null),
				});

			const slug = await (service as any).generateUniqueSlug(
				"Test Title",
				"tenant1",
			);
			expect(slug).toBe("test-title-1");
		});
	});

	describe("create", () => {
		it("should create post with slug and default status", async () => {
			const dto: CreatePostDto = { title: "New Post", content: "Content" };
			const tenantId = "tenant1";
			const createdPost = {
				_id: "1",
				title: "New Post",
				content: "Content",
				slug: "new-post",
				status: PostStatus.DRAFT,
				tenantId,
			};

			mockTenantService.getTenantId.mockReturnValue(tenantId);
			mockPostModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});
			mockTenantService.create.mockResolvedValue(createdPost);

			const result = await service.create(dto);
			expect(result).toEqual(createdPost);
			expect(mockTenantService.create).toHaveBeenCalledWith(mockPostModel, {
				title: "New Post",
				content: "Content",
				slug: "new-post",
				status: PostStatus.DRAFT,
			});
		});

		it("should use provided status", async () => {
			const dto: CreatePostDto = {
				title: "New Post",
				content: "Content",
				status: PostStatus.PUBLISHED,
			};
			const tenantId = "tenant1";

			mockTenantService.getTenantId.mockReturnValue(tenantId);
			mockPostModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});
			mockTenantService.create.mockResolvedValue({
				...dto,
				slug: "new-post",
				tenantId,
			});

			await service.create(dto);
			expect(mockTenantService.create).toHaveBeenCalledWith(mockPostModel, {
				title: "New Post",
				content: "Content",
				slug: "new-post",
				status: PostStatus.PUBLISHED,
			});
		});
	});

	describe("update", () => {
		it("should update post and regenerate slug if title changes", async () => {
			const dto: UpdatePostDto = { title: "Updated Title" };
			const tenantId = "tenant1";

			mockTenantService.getTenantId.mockReturnValue(tenantId);
			mockPostModel.findOne.mockReturnValue({
				exec: jest.fn().mockResolvedValue(null),
			});
			mockTenantService.updateOne.mockResolvedValue({});

			await service.update("postId", dto);
			expect(mockTenantService.updateOne).toHaveBeenCalledWith(
				mockPostModel,
				{ _id: "postId" },
				{ title: "Updated Title", slug: "updated-title" },
			);
		});

		it("should not regenerate slug if title not changed", async () => {
			const dto: UpdatePostDto = { content: "New Content" };

			mockTenantService.updateOne.mockResolvedValue({});

			await service.update("postId", dto);
			expect(mockTenantService.updateOne).toHaveBeenCalledWith(
				mockPostModel,
				{ _id: "postId" },
				{ content: "New Content" },
			);
		});
	});

	describe("findPublished", () => {
		it("should find published posts", async () => {
			const posts = [{ title: "Published" }];
			mockTenantService.find.mockResolvedValue(posts);

			const result = await service.findPublished();
			expect(result).toEqual(posts);
			expect(mockTenantService.find).toHaveBeenCalledWith(mockPostModel, {
				status: PostStatus.PUBLISHED,
			});
		});
	});
});
