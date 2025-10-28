import { Test, TestingModule } from '@nestjs/testing';
import { RequestsService, REQUESTS_LOGGER } from './requests.service';
import { RequestsRepository } from './requests.repository';
import { RequestStatus } from './request.entity';

describe('RequestsService', () => {
  let service: RequestsService;
  let repository: jest.Mocked<RequestsRepository>;
  let logger: { log: jest.Mock };

  beforeEach(async () => {
    logger = { log: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RequestsService,
        {
          provide: RequestsRepository,
          useValue: {
            create: jest.fn(),
            findActive: jest.fn(),
            archive: jest.fn(),
          },
        },
        {
          provide: REQUESTS_LOGGER,
          useValue: logger,
        },
      ],
    }).compile();

    service = module.get<RequestsService>(RequestsService);
    repository = module.get(RequestsRepository) as jest.Mocked<RequestsRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  describe('createAnonymousRequest', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2024-01-01T00:00:00.000Z'));
    });

    it('creates a request without persisting user identifiers', async () => {
      repository.create.mockImplementation(async (payload) => ({
        id: 'req_123',
        ...payload,
      }));

      const result = await service.createAnonymousRequest('  Need help  ', {
        email: 'user@example.com',
        uid: 'uid-123',
        userAgent: 'Mozilla/5.0',
      });

      expect(repository.create).toHaveBeenCalledTimes(1);
      const storedPayload = repository.create.mock.calls[0][0];

      expect(storedPayload.text).toBe('Need help');
      expect(storedPayload.status).toBe(RequestStatus.Active);
      expect(storedPayload.createdAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(storedPayload.updatedAt.toISOString()).toBe('2024-01-01T00:00:00.000Z');
      expect(storedPayload.anonymousAuthorId).toMatch(/^anon_[a-f0-9]{16}$/);
      expect((storedPayload as any).uid).toBeUndefined();
      expect((storedPayload as any).email).toBeUndefined();
      expect((storedPayload as any).userAgent).toBeUndefined();

      expect(result).toMatchObject({
        id: 'req_123',
        text: 'Need help',
        status: RequestStatus.Active,
        anonymousAuthorId: storedPayload.anonymousAuthorId,
      });
    });

    it('logs only sanitized metadata', async () => {
      repository.create.mockImplementation(async (payload) => ({
        id: 'req_999',
        ...payload,
      }));

      await service.createAnonymousRequest('Assistance request', {
        email: 'citizen@unipd.it',
        uid: 'uid-secret',
      });

      expect(logger.log).toHaveBeenCalledTimes(1);
      const [message, context] = logger.log.mock.calls[0];
      expect(context).toBe('RequestsService');
      expect(message).toContain('Anonymous request created');
      expect(message).toContain('"domain":"unipd.it"');
      expect(message).not.toContain('citizen@unipd.it');
      expect(message).not.toContain('uid-secret');
    });

    it('throws when the request text is empty after trimming', async () => {
      await expect(service.createAnonymousRequest('   ')).rejects.toThrow(
        'Request text cannot be empty',
      );
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  it('lists active requests through the repository', async () => {
    const records = [
      {
        id: 'req_1',
        text: 'First',
        status: RequestStatus.Active,
        createdAt: new Date(),
        updatedAt: new Date(),
        anonymousAuthorId: 'anon_1',
      },
    ];
    repository.findActive.mockResolvedValue(records as any);

    const result = await service.listRequests();
    expect(result).toBe(records as any);
    expect(repository.findActive).toHaveBeenCalledTimes(1);
  });

  it('archives a request through the repository', async () => {
    const archived = {
      id: 'req_2',
      text: 'Archived text',
      status: RequestStatus.Archived,
      createdAt: new Date(),
      updatedAt: new Date(),
      archivedAt: new Date(),
      anonymousAuthorId: 'anon_2',
    };
    repository.archive.mockResolvedValue(archived as any);

    const result = await service.archiveRequest('req_2');
    expect(result).toBe(archived as any);
    expect(repository.archive).toHaveBeenCalledWith('req_2');
  });
});
