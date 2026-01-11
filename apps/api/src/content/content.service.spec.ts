import { Test, TestingModule } from '@nestjs/testing';
import { ContentService } from './content.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContentStatus } from './enums/content-status.enum';
import { ContentType } from './enums/content-type.enum';

describe('ContentService', () => {
  let service: ContentService;
  let prisma: PrismaService;

  const mockPrismaService = {
    content: {
      create: jest.fn(),
      update: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new content entry', async () => {
      const userId = 'user123';
      const createDto = {
        title: 'Test Content',
        prompt: 'Test prompt for content generation',
        contentType: ContentType.BLOG_POST,
      };

      const expectedContent = {
        id: 'content123',
        userId,
        ...createDto,
        status: ContentStatus.PENDING,
        generatedText: null,
        jobId: null,
        errorMessage: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.content.create.mockResolvedValue(expectedContent);

      const result = await service.create(userId, createDto);

      expect(result).toEqual(expectedContent);
      expect(mockPrismaService.content.create).toHaveBeenCalledWith({
        data: {
          userId,
          title: createDto.title,
          prompt: createDto.prompt,
          contentType: createDto.contentType,
          status: ContentStatus.PENDING,
        },
      });
    });
  });

  describe('updateStatus', () => {
    it('should update content status to COMPLETED with generated text', async () => {
      const contentId = 'content123';
      const generatedText = 'AI generated content here';

      const updatedContent = {
        id: contentId,
        status: ContentStatus.COMPLETED,
        generatedText,
        errorMessage: null,
      };

      mockPrismaService.content.update.mockResolvedValue(updatedContent);

      const result = await service.updateStatus(
        contentId,
        ContentStatus.COMPLETED,
        generatedText,
      );

      expect(result.status).toBe(ContentStatus.COMPLETED);
      expect(result.generatedText).toBe(generatedText);
    });

    it('should update content status to FAILED with error message', async () => {
      const contentId = 'content123';
      const errorMessage = 'AI generation failed';

      const updatedContent = {
        id: contentId,
        status: ContentStatus.FAILED,
        errorMessage,
      };

      mockPrismaService.content.update.mockResolvedValue(updatedContent);

      const result = await service.updateStatus(
        contentId,
        ContentStatus.FAILED,
        undefined,
        errorMessage,
      );

      expect(result.status).toBe(ContentStatus.FAILED);
      expect(result.errorMessage).toBe(errorMessage);
    });
  });

  describe('findAllForUser', () => {
    it('should return paginated content for a user', async () => {
      const userId = 'user123';
      const mockContents = [
        { id: '1', title: 'Content 1', userId },
        { id: '2', title: 'Content 2', userId },
      ];

      mockPrismaService.content.findMany.mockResolvedValue(mockContents);
      mockPrismaService.content.count.mockResolvedValue(2);

      const result = await service.findAllForUser(userId, {
        skip: 0,
        take: 10,
      });

      expect(result.contents).toEqual(mockContents);
      expect(result.total).toBe(2);
    });
  });
});
