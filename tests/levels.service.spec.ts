import { Test, TestingModule } from '@nestjs/testing';
import { LevelsService } from '../src/levels/levels.service';

const mockSupabaseClient = {
  from: jest.fn(),
};

describe('LevelsService', () => {
  let service: LevelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LevelsService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<LevelsService>(LevelsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getLevel', () => {
    it('should return level data when level exists', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({
                data: {
                  id: 1,
                  letter: 'A',
                  options: ['A', 'B', ''],
                  position_index: 2,
                },
                error: null,
              }),
            }),
          }),
        }),
      });

      const result = await service.getLevel(1);
      expect(result).toEqual({
        id: 1,
        letter: 'A',
        options: ['A', 'B', ''],
        positionIndex: 2,
      });
    });

    it('should throw error when level not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      });

      await expect(service.getLevel(999)).rejects.toThrow('Level not found');
    });
  });

  describe('getAllLevels', () => {
    it('should return all active levels ordered by id', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({
              data: [
                { id: 1, letter: 'A', is_active: true },
                { id: 2, letter: 'B', is_active: true },
              ],
              error: null,
            }),
          }),
        }),
      });

      const result = await service.getAllLevels();
      expect(result).toHaveLength(2);
      expect(result[0].letter).toBe('A');
    });

    it('should throw error when fetch fails', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      });

      await expect(service.getAllLevels()).rejects.toThrow('Failed to fetch levels');
    });
  });

  describe('malicious — NaN input handling', () => {
    it('should handle NaN gracefully when passed as levelId', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
            }),
          }),
        }),
      });

      await expect(service.getLevel(NaN)).rejects.toThrow('Level not found');
    });
  });
});