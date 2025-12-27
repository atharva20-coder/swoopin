import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import {
  getCampaigns,
  createCampaign,
  updateCampaignStatus,
  getCampaignInsights,
  getAdAccounts,
  CreateCampaignSchema,
} from '@/lib/instagram/ads';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('Ads API Wrapper', () => {
  const mockToken = 'test-access-token';
  const mockAdAccountId = '123456789';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCampaigns', () => {
    it('should fetch campaigns successfully', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Campaign 1', status: 'ACTIVE', objective: 'ENGAGEMENT' },
        { id: '2', name: 'Campaign 2', status: 'PAUSED', objective: 'REACH' },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockCampaigns },
      });

      const result = await getCampaigns(mockAdAccountId, mockToken);

      expect(result.success).toBe(true);
      expect(result.campaigns).toEqual(mockCampaigns);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(`/act_${mockAdAccountId}/campaigns`),
        expect.any(Object)
      );
    });

    it('should return empty array on 400 error', async () => {
      mockedAxios.get.mockRejectedValueOnce({
        isAxiosError: true,
        response: { status: 400 },
      });

      const result = await getCampaigns(mockAdAccountId, mockToken);

      expect(result.success).toBe(true);
      expect(result.campaigns).toEqual([]);
    });
  });

  describe('CreateCampaignSchema', () => {
    it('should validate valid campaign data', () => {
      const validData = {
        name: 'Test Campaign',
        objective: 'ENGAGEMENT' as const,
        budget: 100,
        currency: 'USD',
      };

      const result = CreateCampaignSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid objective', () => {
      const invalidData = {
        name: 'Test Campaign',
        objective: 'INVALID_OBJECTIVE',
        budget: 100,
      };

      const result = CreateCampaignSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative budget', () => {
      const invalidData = {
        name: 'Test Campaign',
        objective: 'ENGAGEMENT',
        budget: -100,
      };

      const result = CreateCampaignSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateCampaignStatus', () => {
    it('should update campaign status', async () => {
      mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

      const result = await updateCampaignStatus('campaign123', mockToken, 'PAUSED');

      expect(result.success).toBe(true);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/campaign123'),
        { status: 'PAUSED' },
        expect.any(Object)
      );
    });
  });

  describe('getCampaignInsights', () => {
    it('should fetch campaign insights', async () => {
      const mockInsights = {
        impressions: '1000',
        reach: '800',
        clicks: '50',
        spend: '25.00',
        cpc: '0.50',
        cpm: '25.00',
        ctr: '5.00',
      };

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [mockInsights] },
      });

      const result = await getCampaignInsights('campaign123', mockToken);

      expect(result.success).toBe(true);
      expect(result.insights).toBeDefined();
      expect(result.insights?.impressions).toBe(1000);
    });

    it('should handle missing insights', async () => {
      mockedAxios.get.mockResolvedValueOnce({
        data: { data: [] },
      });

      const result = await getCampaignInsights('campaign123', mockToken);

      expect(result.success).toBe(true);
      expect(result.insights).toBeUndefined();
    });
  });

  describe('getAdAccounts', () => {
    it('should fetch ad accounts', async () => {
      const mockAccounts = [
        { id: '123', name: 'Account 1', currency: 'USD' },
        { id: '456', name: 'Account 2', currency: 'EUR' },
      ];

      mockedAxios.get.mockResolvedValueOnce({
        data: { data: mockAccounts },
      });

      const result = await getAdAccounts(mockToken);

      expect(result.success).toBe(true);
      expect(result.adAccounts).toEqual(mockAccounts);
    });
  });
});
