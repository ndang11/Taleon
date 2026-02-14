import { Test, type TestingModule } from "@nestjs/testing";
import { NotificationsController } from "./notifications.controller";
import { NotificationType } from "./notifications.schema";
import { NotificationsService } from "./notifications.service";

describe("NotificationsController", () => {
	let controller: NotificationsController;
	let service: NotificationsService;

	const mockUser = {
		userId: "507f1f77bcf86cd799439011",
		tenantId: "507f1f77bcf86cd799439012",
	};

	const mockNotification = {
		_id: "507f1f77bcf86cd799439013",
		userId: mockUser.userId,
		fromUserId: "507f1f77bcf86cd799439014",
		type: NotificationType.LIKE,
		postId: "507f1f77bcf86cd799439015",
		message: "Someone liked your post",
		isRead: false,
		link: "/post/123",
		createdAt: new Date(),
		updatedAt: new Date(),
	};

	const mockRequest: { user: typeof mockUser } = {
		user: mockUser,
	};

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [NotificationsController],
			providers: [
				{
					provide: NotificationsService,
					useValue: {
						findByUserId: jest.fn(),
						findUnreadByUserId: jest.fn(),
						getUnreadCount: jest.fn(),
						markAsRead: jest.fn(),
						markAllAsRead: jest.fn(),
						deleteNotification: jest.fn(),
						create: jest.fn(),
					},
				},
			],
		}).compile();

		controller = module.get<NotificationsController>(NotificationsController);
		service = module.get<NotificationsService>(NotificationsService);
	});

	describe("findAll", () => {
		it("should return all notifications for a user", async () => {
			jest.spyOn(service, "findByUserId").mockResolvedValue([mockNotification]);

			const result = await controller.findAll(mockRequest, 20);

			expect(result).toEqual({ notifications: [mockNotification] });
			expect(service.findByUserId).toHaveBeenCalledWith(mockUser.userId, 20);
		});

		it("should use default limit when not provided", async () => {
			jest.spyOn(service, "findByUserId").mockResolvedValue([mockNotification]);

			await controller.findAll(mockRequest);

			expect(service.findByUserId).toHaveBeenCalledWith(mockUser.userId, 20);
		});
	});

	describe("findUnread", () => {
		it("should return unread notifications", async () => {
			jest
				.spyOn(service, "findUnreadByUserId")
				.mockResolvedValue([mockNotification]);

			const result = await controller.findUnread(mockRequest);

			expect(result).toEqual({ notifications: [mockNotification] });
			expect(service.findUnreadByUserId).toHaveBeenCalledWith(mockUser.userId);
		});
	});

	describe("getUnreadCount", () => {
		it("should return unread count", async () => {
			jest.spyOn(service, "getUnreadCount").mockResolvedValue(5);

			const result = await controller.getUnreadCount(mockRequest);

			expect(result).toEqual({ count: 5 });
			expect(service.getUnreadCount).toHaveBeenCalledWith(mockUser.userId);
		});
	});

	describe("markAsRead", () => {
		it("should mark notification as read", async () => {
			const readNotification = { ...mockNotification, isRead: true };
			jest.spyOn(service, "markAsRead").mockResolvedValue(readNotification);
			jest.spyOn(service, "getUnreadCount").mockResolvedValue(4);

			const result = await controller.markAsRead(
				mockNotification._id,
				mockRequest,
			);

			expect(result).toEqual({
				notification: readNotification,
				unreadCount: 4,
			});
			expect(service.markAsRead).toHaveBeenCalledWith(mockNotification._id);
		});
	});

	describe("markAllAsRead", () => {
		it("should mark all notifications as read", async () => {
			jest.spyOn(service, "markAllAsRead").mockResolvedValue();

			const result = await controller.markAllAsRead(mockRequest);

			expect(result).toEqual({ success: true });
			expect(service.markAllAsRead).toHaveBeenCalledWith(mockUser.userId);
		});
	});

	describe("deleteNotification", () => {
		it("should delete a notification", async () => {
			jest.spyOn(service, "deleteNotification").mockResolvedValue();

			const result = await controller.deleteNotification(mockNotification._id);

			expect(result).toEqual({ success: true });
			expect(service.deleteNotification).toHaveBeenCalledWith(
				mockNotification._id,
			);
		});
	});

	describe("create", () => {
		it("should create a notification", async () => {
			const createDto = {
				userId: mockUser.userId,
				fromUserId: mockNotification.fromUserId,
				type: NotificationType.LIKE,
				postId: mockNotification.postId,
				message: mockNotification.message,
				link: mockNotification.link,
			};
			jest.spyOn(service, "create").mockResolvedValue(mockNotification);

			const result = await controller.create(createDto);

			expect(result).toEqual(mockNotification);
			expect(service.create).toHaveBeenCalledWith(createDto);
		});
	});
});
