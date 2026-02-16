import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { Types } from "mongoose";
import { Notification, NotificationType } from "./notifications.schema";
import { NotificationsService } from "./notifications.service";

describe("NotificationsService", () => {
	let service: NotificationsService;
	let mockModel: any;

	beforeEach(async () => {
		mockModel = jest.fn().mockImplementation((data) => ({
			...data,
			save: jest.fn().mockResolvedValue({
				_id: new Types.ObjectId(),
				...data,
				userId: data.userId ? new Types.ObjectId(data.userId) : undefined,
				fromUserId: data.fromUserId
					? new Types.ObjectId(data.fromUserId)
					: undefined,
				postId: data.postId ? new Types.ObjectId(data.postId) : undefined,
				isRead: false,
			}),
		}));

		const createFindMock = () => {
			const mockChain = {
				sort: jest.fn().mockReturnThis(),
				limit: jest.fn().mockReturnThis(),
				populate: jest.fn().mockReturnThis(),
				exec: jest.fn().mockResolvedValue([]),
			};
			return jest.fn().mockReturnValue(mockChain);
		};

		mockModel.find = createFindMock();
		mockModel.findByIdAndUpdate = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({}),
		});
		mockModel.updateMany = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({}),
		});
		mockModel.findByIdAndDelete = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue({}),
		});
		mockModel.countDocuments = jest.fn().mockReturnValue({
			exec: jest.fn().mockResolvedValue(0),
		});

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				NotificationsService,
				{
					provide: getModelToken(Notification.name),
					useValue: mockModel,
				},
			],
		}).compile();

		service = module.get<NotificationsService>(NotificationsService);
	});

	describe("create", () => {
		it("should create a notification", async () => {
			const createDto = {
				userId: new Types.ObjectId().toString(),
				fromUserId: new Types.ObjectId().toString(),
				type: NotificationType.LIKE,
				postId: new Types.ObjectId().toString(),
				message: "Test notification",
			};

			const result = await service.create(createDto);

			expect(result).toBeDefined();
			expect(result.message).toBe(createDto.message);
			expect(result.type).toBe(createDto.type);
		});
	});

	describe("findByUserId", () => {
		it("should return notifications for a user", async () => {
			const userId = new Types.ObjectId().toString();

			await service.findByUserId(userId, 20);

			expect(mockModel.find).toHaveBeenCalled();
		});
	});

	describe("findUnreadByUserId", () => {
		it("should return unread notifications", async () => {
			const userId = new Types.ObjectId().toString();

			await service.findUnreadByUserId(userId);

			expect(mockModel.find).toHaveBeenCalled();
		});
	});

	describe("getUnreadCount", () => {
		it("should return unread count", async () => {
			const userId = new Types.ObjectId().toString();

			await service.getUnreadCount(userId);

			expect(mockModel.countDocuments).toHaveBeenCalled();
		});
	});

	describe("markAsRead", () => {
		it("should mark notification as read", async () => {
			const notificationId = new Types.ObjectId().toString();

			await service.markAsRead(notificationId);

			expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith(
				notificationId,
				{ isRead: true },
				{ new: true },
			);
		});
	});

	describe("markAllAsRead", () => {
		it("should mark all notifications as read", async () => {
			const userId = new Types.ObjectId().toString();

			await service.markAllAsRead(userId);

			expect(mockModel.updateMany).toHaveBeenCalled();
		});
	});

	describe("deleteNotification", () => {
		it("should delete a notification", async () => {
			const notificationId = new Types.ObjectId().toString();

			await service.deleteNotification(notificationId);

			expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith(notificationId);
		});
	});
});
