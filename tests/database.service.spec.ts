import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from '../src/database/database.service';

const mockSupabaseClient = {
  from: jest.fn(),
};

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('testConnection', () => {
    it('should return success when Supabase connection is healthy', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({ data: [{ id: 1 }], error: null }),
        }),
      });

      const result = await service.testConnection();
      expect(result).toEqual({ success: true });
    });

    it('should return error when Supabase returns an error response', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: null,
            error: { message: 'Connection refused' },
          }),
        }),
      });

      const result = await service.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Connection refused');
    });

    it('should catch and return error when exception is thrown', async () => {
      mockSupabaseClient.from.mockImplementation(() => {
        throw new Error('Network unreachable');
      });

      const result = await service.testConnection();
      expect(result.success).toBe(false);
      expect(result.error).toBe('Network unreachable');
    });
  });
});