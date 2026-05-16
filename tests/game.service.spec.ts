import { Test, TestingModule } from '@nestjs/testing';
import { GameService } from '../src/game/game.service';

const mockSupabaseClient = {
  from: jest.fn(),
};

describe('GameService', () => {
  let service: GameService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GameService,
        { provide: 'SUPABASE_CLIENT', useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<GameService>(GameService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('submitAnswer', () => {
    it('should return correct true and advance when answer is correct', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { letter: 'A' },
              error: null,
            }),
          }),
        }),
      }).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        }),
      });

      const result = await service.submitAnswer(1, 1, 'A');
      expect(result).toEqual({ correct: true, advance: true, nextLevel: 2 });
    });

    it('should return correct false when answer is wrong', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { letter: 'A' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(1, 1, 'B');
      expect(result).toEqual({ correct: false, advance: false });
    });

    it('should return error when level not found', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const result = await service.submitAnswer(1, 999, 'A');
      expect(result).toEqual({ correct: false, error: 'Level not found' });
    });
  });

  describe('malicious — case insensitive comparison', () => {
    it('should accept lowercase answer for uppercase letter', async () => {
      mockSupabaseClient.from.mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { letter: 'A' },
              error: null,
            }),
          }),
        }),
      }).mockReturnValueOnce({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
        }),
      });

      const result = await service.submitAnswer(1, 1, 'a');
      expect(result.correct).toBe(true);
    });
  });

  describe('malicious — empty string answer', () => {
    it('should not crash when empty string is submitted', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: { letter: 'A' },
              error: null,
            }),
          }),
        }),
      });

      const result = await service.submitAnswer(1, 1, '');
      expect(result).toEqual({ correct: false, advance: false });
    });
  });
});