import { Test, TestingModule } from "@nestjs/testing";
import { GroupsService } from "./groups.service";
import { PrismaService } from "../prisma/prisma.service";
import { AuditService } from "../audit/audit.service";
import { LessonDays, GroupStatus } from "@prisma/client";
import { NotFoundException, BadRequestException } from "@nestjs/common";

type MockModel = Record<string, jest.Mock>;
interface MockPrisma {
  group: MockModel;
  course: MockModel;
  branch: MockModel;
  user: MockModel;
  room: MockModel;
  lesson: MockModel;
  $transaction: jest.Mock;
}
type MockAudit = Record<string, jest.Mock>;
interface LessonCreateParam {
  data: {
    groupId: string;
    title: string;
    date: Date;
    startTime: string;
    endTime: string;
    resourceId?: string;
  };
}

describe("GroupsService (Unit Tests)", () => {
  let service: GroupsService;
  let prisma: MockPrisma;
  let auditService: MockAudit;

  beforeEach(async () => {
    prisma = {
      group: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      course: {
        findFirst: jest.fn(),
      },
      branch: {
        findFirst: jest.fn(),
      },
      user: {
        findFirst: jest.fn(),
      },
      room: {
        findFirst: jest.fn(),
      },
      lesson: {
        create: jest.fn(),
      },
      $transaction: jest.fn().mockImplementation(async (promises) => {
        return Promise.all(promises);
      }),
    };

    auditService = {
      log: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AuditService, useValue: auditService },
      ],
    }).compile();

    service = module.get<GroupsService>(GroupsService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a group successfully when valid course and room are provided", async () => {
      const mockCourse = { id: "course-1", organizationId: "org-1", name: "English B2" };
      const mockRoom = {
        id: "room-1",
        organizationId: "org-1",
        branchId: "branch-1",
        name: "Room 101",
      };
      const mockCreatedGroup = {
        id: "group-1",
        name: "Group 1",
        courseId: "course-1",
        organizationId: "org-1",
        branchId: "branch-1",
        roomId: "room-1",
        status: GroupStatus.PLANNING,
        days: LessonDays.ODD_DAYS,
        startTime: "14:00",
        endTime: "16:00",
      };

      prisma.course.findFirst.mockResolvedValue(mockCourse);
      prisma.branch.findFirst.mockResolvedValue({ id: "branch-1", organizationId: "org-1" });
      prisma.room.findFirst.mockResolvedValue(mockRoom);
      prisma.group.create.mockResolvedValue(mockCreatedGroup);

      const result = await service.create(
        {
          name: "Group 1",
          courseId: "course-1",
          branchId: "branch-1",
          roomId: "room-1",
          startTime: "14:00",
          endTime: "16:00",
          days: LessonDays.ODD_DAYS,
        },
        "org-1",
        "user-1"
      );

      expect(result).toEqual(mockCreatedGroup);
      expect(prisma.group.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            name: "Group 1",
            courseId: "course-1",
            organizationId: "org-1",
            branchId: "branch-1",
            roomId: "room-1",
            status: GroupStatus.PLANNING,
          }),
        })
      );
      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-1",
          action: "CREATE",
          entityType: "Group",
          entityId: "group-1",
        })
      );
    });

    it("should throw BadRequestException if course does not belong to organization", async () => {
      prisma.course.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: "Group 1",
            courseId: "foreign-course",
            startTime: "14:00",
            endTime: "16:00",
          },
          "org-1"
        )
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if room does not belong to organization", async () => {
      prisma.course.findFirst.mockResolvedValue({ id: "course-1", organizationId: "org-1" });
      prisma.room.findFirst.mockResolvedValue(null);

      await expect(
        service.create(
          {
            name: "Group 1",
            courseId: "course-1",
            roomId: "foreign-room",
            startTime: "14:00",
            endTime: "16:00",
          },
          "org-1"
        )
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe("generateLessonsForGroup", () => {
    it("should generate lessons for ODD_DAYS (Mon, Wed, Fri) between startDate and endDate", async () => {
      const mockGroup = {
        id: "group-1",
        name: "IELTS Band 7",
        organizationId: "org-1",
        branchId: "branch-1",
        roomId: "room-1",
        days: LessonDays.ODD_DAYS,
        startTime: "14:00",
        endTime: "16:00",
        startDate: new Date("2026-09-07T00:00:00.000Z"), // Monday
        endDate: new Date("2026-09-20T23:59:59.999Z"), // Sunday 2 weeks later
        status: GroupStatus.PLANNING,
        course: { id: "c-1", name: "IELTS", lessonCount: 24 },
        lessons: [],
      };

      prisma.group.findFirst.mockResolvedValue(mockGroup);
      prisma.lesson.create.mockImplementation(({ data }: LessonCreateParam) =>
        Promise.resolve({ id: `l-${Math.random()}`, ...data })
      );

      const result = await service.generateLessonsForGroup("group-1", "org-1");

      // In 2 weeks (Sept 7 - Sept 20):
      // Mon Sep 07, Wed Sep 09, Fri Sep 11
      // Mon Sep 14, Wed Sep 16, Fri Sep 18
      // Total = 6 lessons
      expect(result.createdCount).toBe(6);
      expect(result.totalLessons).toBe(6);
      expect(prisma.lesson.create).toHaveBeenCalledTimes(6);

      const firstCallData = prisma.lesson.create.mock.calls[0][0].data;
      expect(firstCallData.groupId).toBe("group-1");
      expect(firstCallData.title).toBe("1-dars");
      expect(firstCallData.resourceId).toBe("room-1");
      expect(new Date(firstCallData.date).getDay()).toBe(1); // Monday
      expect(new Date(firstCallData.date).getHours()).toBe(14);
      expect(new Date(firstCallData.date).getMinutes()).toBe(0);

      expect(auditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-1",
          action: "CREATE",
          entityType: "Lesson",
          entityId: "group-1",
        })
      );
    });

    it("should generate lessons for EVEN_DAYS (Tue, Thu, Sat)", async () => {
      const mockGroup = {
        id: "group-2",
        name: "General English",
        organizationId: "org-1",
        branchId: "branch-1",
        roomId: "room-2",
        days: LessonDays.EVEN_DAYS,
        startTime: "10:30",
        endTime: "12:00",
        startDate: new Date("2026-09-08T00:00:00.000Z"), // Tuesday
        endDate: new Date("2026-09-14T23:59:59.999Z"), // Monday next week
        status: GroupStatus.ACTIVE,
        course: { id: "c-2", name: "General English", lessonCount: 12 },
        lessons: [],
      };

      prisma.group.findFirst.mockResolvedValue(mockGroup);
      prisma.lesson.create.mockImplementation(({ data }: LessonCreateParam) =>
        Promise.resolve({ id: `l-${Math.random()}`, ...data })
      );

      const result = await service.generateLessonsForGroup("group-2", "org-1");

      // Sept 08 (Tue), Sept 10 (Thu), Sept 12 (Sat) = 3 lessons
      expect(result.createdCount).toBe(3);
      const daysCreated = prisma.lesson.create.mock.calls.map((c: [LessonCreateParam]) =>
        new Date(c[0].data.date).getDay()
      );
      expect(daysCreated).toEqual([2, 4, 6]); // Tue, Thu, Sat
    });

    it("should be idempotent: skip dates that already have a lesson", async () => {
      const existingDate = new Date("2026-09-07T14:00:00.000Z");
      const mockGroup = {
        id: "group-1",
        name: "IELTS Band 7",
        organizationId: "org-1",
        days: LessonDays.ODD_DAYS,
        startTime: "14:00",
        endTime: "16:00",
        startDate: new Date("2026-09-07T00:00:00.000Z"),
        endDate: new Date("2026-09-13T23:59:59.999Z"), // 1 week: Sept 7, 9, 11
        course: { lessonCount: 12 },
        lessons: [{ id: "l-existing-1", date: existingDate, title: "1-dars" }],
      };

      prisma.group.findFirst.mockResolvedValue(mockGroup);
      prisma.lesson.create.mockImplementation(({ data }: LessonCreateParam) =>
        Promise.resolve({ id: `l-${Math.random()}`, ...data })
      );

      const result = await service.generateLessonsForGroup("group-1", "org-1");

      // Out of 3 possible dates (7, 9, 11), Sept 7 already exists. Only Sept 9 and 11 should be created.
      expect(result.createdCount).toBe(2);
      expect(result.totalLessons).toBe(3);

      const callDates = prisma.lesson.create.mock.calls.map((c: [LessonCreateParam]) =>
        new Date(c[0].data.date).getDate()
      );
      expect(callDates).toEqual([9, 11]);
    });

    it("should return 0 created lessons if all dates already exist (second call idempotency)", async () => {
      const mockGroup = {
        id: "group-1",
        name: "IELTS Band 7",
        organizationId: "org-1",
        days: LessonDays.ODD_DAYS,
        startTime: "14:00",
        endTime: "16:00",
        startDate: new Date("2026-09-07T00:00:00.000Z"),
        endDate: new Date("2026-09-11T23:59:59.999Z"),
        course: { lessonCount: 12 },
        lessons: [
          { id: "l-1", date: new Date("2026-09-07T14:00:00.000Z"), title: "1-dars" },
          { id: "l-2", date: new Date("2026-09-09T14:00:00.000Z"), title: "2-dars" },
          { id: "l-3", date: new Date("2026-09-11T14:00:00.000Z"), title: "3-dars" },
        ],
      };

      prisma.group.findFirst.mockResolvedValue(mockGroup);

      const result = await service.generateLessonsForGroup("group-1", "org-1");

      expect(result.createdCount).toBe(0);
      expect(result.totalLessons).toBe(3);
      expect(prisma.lesson.create).not.toHaveBeenCalled();
      expect(result.message).toContain("barcha darslar allaqachon yaratilgan");
    });

    it("should throw NotFoundException if group does not exist", async () => {
      prisma.group.findFirst.mockResolvedValue(null);

      await expect(service.generateLessonsForGroup("non-existent", "org-1")).rejects.toThrow(
        NotFoundException
      );
    });
  });
});
