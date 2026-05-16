import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';

const mockSupabaseClient = {
  from: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should create profile with next available ID', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [{ id: 5 }], error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 6, current_level: 1 }, error: null }),
          }),
        }),
      });

      const result = await service.register();
      expect(result).toEqual({ id: 6 });
    });

    it('should create first profile with ID 1 when no profiles exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: { id: 1, current_level: 1 }, error: null }),
          }),
        }),
      });

      const result = await service.register();
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('login', () => {
    it('should return success true when profile exists', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { id: 1, current_level: 1 },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.login(1);
      expect(result.success).toBe(true);
      expect(result.profile).toEqual({ id: 1, current_level: 1 });
    });

    it('should return success false when profile does not exist', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const result = await service.login(999);
      expect(result.success).toBe(false);
    });
  });

  describe('malicious — invalid ID handling', () => {
    it('should handle negative ID without crashing', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const result = await service.login(-1);
      expect(result.success).toBe(false);
    });

    it('should handle extremely large ID without crashing', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const result = await service.login(999999999999);
      expect(result.success).toBe(false);
    });
  });

  describe('malicious — concurrent registration race condition', () => {
    it('should fail when two registrations happen simultaneously with same starting ID', async () => {
      let callCount = 0;
      const mockClient = {
        from: jest.fn().mockImplementation(() => ({
          select: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [{ id: 5 }], error: null }),
            }),
          }),
          insert: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockImplementation(() => {
                callCount++;
                if (callCount > 1) {
                  return Promise.resolve({ data: null, error: { message: 'Duplicate key' } });
                }
                return Promise.resolve({ data: { id: 6, current_level: 1 }, error: null });
              }),
            }),
          }),
        })),
      };

      const raceService = new AuthService(mockClient as any);

      const [result1, result2] = await Promise.allSettled([
        raceService.register(),
        raceService.register(),
      ]);

      const hasFailure = result1.status === 'rejected' || result2.status === 'rejected';
      expect(hasFailure).toBe(true);
    });
  });
});