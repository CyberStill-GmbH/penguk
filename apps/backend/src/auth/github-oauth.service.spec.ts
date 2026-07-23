import { Test, TestingModule } from '@nestjs/testing';
import { GithubOauthService } from './github-oauth.service';
import { RedisService } from '../redis/redis.service';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { UnauthorizedException } from '@nestjs/common';
import { vi, describe, it, expect, beforeEach } from 'vitest';

describe('GithubOauthService', () => {
  let service: GithubOauthService;
  let redisService: RedisService;
  let usersService: UsersService;
  let authService: AuthService;

  const mockRedisService = {
    set: vi.fn(),
    get: vi.fn(),
    del: vi.fn(),
  };

  const mockUsersService = {
    findOrCreateFromOAuth: vi.fn(),
  };

  const mockAuthService = {
    login: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();

    process.env.GITHUB_CLIENT_ID = 'test-client-id';
    process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
    process.env.GITHUB_CALLBACK_URL = 'http://localhost/callback';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GithubOauthService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    service = module.get<GithubOauthService>(GithubOauthService);
    redisService = module.get<RedisService>(RedisService);
    usersService = module.get<UsersService>(UsersService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('createAuthUrl', () => {
    it('should generate a valid github oauth url and store the code verifier in redis', async () => {
      const url = await service.createAuthUrl();

      expect(url).toContain('https://github.com/login/oauth/authorize?');
      expect(url).toContain('client_id=test-client-id');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcallback');
      expect(url).toContain('state=');
      expect(url).toContain('code_challenge=');
      expect(url).toContain('code_challenge_method=S256');

      expect(mockRedisService.set).toHaveBeenCalledTimes(1);
      const callArgs = mockRedisService.set.mock.calls[0];
      expect(callArgs[0]).toMatch(/^oauth:github:/);
      expect(callArgs[2]).toBe('EX');
      expect(callArgs[3]).toBe(300);
    });
  });

  describe('handleCallback', () => {
    const mockCode = 'auth-code-123';
    const mockState = 'state-xyz';
    const mockCodeVerifier = 'verifier-abc';

    it('should throw UnauthorizedException if state is invalid or expired', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);

      await expect(service.handleCallback(mockCode, mockState)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(`oauth:github:${mockState}`);
    });

    it('should successfully authenticate and return token', async () => {
      mockRedisService.get.mockResolvedValueOnce(mockCodeVerifier);

      // Mock token fetch
      const mockTokenResponse = {
        json: vi.fn().mockResolvedValue({ access_token: 'gh-token-123' }),
      };

      // Mock profile fetch
      const mockProfileResponse = {
        json: vi.fn().mockResolvedValue({
          id: 12345,
          login: 'testuser',
          email: 'test@example.com',
        }),
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockProfileResponse);

      const mockUser = { id: 1, email: 'test@example.com' };
      mockUsersService.findOrCreateFromOAuth.mockResolvedValueOnce(mockUser);
      
      const mockJwt = { access_token: 'jwt-token' };
      mockAuthService.login.mockResolvedValueOnce(mockJwt);

      const result = await service.handleCallback(mockCode, mockState);

      expect(result).toEqual(mockJwt);
      expect(mockRedisService.del).toHaveBeenCalledWith(`oauth:github:${mockState}`);
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(mockUsersService.findOrCreateFromOAuth).toHaveBeenCalledWith({
        provider: 'GitHub',
        providerAccountId: '12345',
        email: 'test@example.com',
        username: 'testuser',
      });
      expect(mockAuthService.login).toHaveBeenCalledWith({ id: 1, email: 'test@example.com' });
    });

    it('should fetch emails separately if profile email is null', async () => {
      mockRedisService.get.mockResolvedValueOnce(mockCodeVerifier);

      const mockTokenResponse = {
        json: vi.fn().mockResolvedValue({ access_token: 'gh-token-123' }),
      };

      const mockProfileResponse = {
        json: vi.fn().mockResolvedValue({
          id: 12345,
          login: 'testuser',
          email: null,
        }),
      };

      const mockEmailsResponse = {
        json: vi.fn().mockResolvedValue([
          { email: 'hidden@example.com', primary: false, verified: true },
          { email: 'primary@example.com', primary: true, verified: true },
        ]),
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockProfileResponse)
        .mockResolvedValueOnce(mockEmailsResponse);

      const mockUser = { id: 1, email: 'primary@example.com' };
      mockUsersService.findOrCreateFromOAuth.mockResolvedValueOnce(mockUser);
      mockAuthService.login.mockResolvedValueOnce({ access_token: 'jwt-token' });

      await service.handleCallback(mockCode, mockState);

      expect(global.fetch).toHaveBeenCalledTimes(3);
      expect(mockUsersService.findOrCreateFromOAuth).toHaveBeenCalledWith({
        provider: 'GitHub',
        providerAccountId: '12345',
        email: 'primary@example.com',
        username: 'testuser',
      });
    });

    it('should throw UnauthorizedException if no valid email is found', async () => {
      mockRedisService.get.mockResolvedValueOnce(mockCodeVerifier);

      const mockTokenResponse = {
        json: vi.fn().mockResolvedValue({ access_token: 'gh-token-123' }),
      };

      const mockProfileResponse = {
        json: vi.fn().mockResolvedValue({
          id: 12345,
          login: 'testuser',
          email: null,
        }),
      };

      const mockEmailsResponse = {
        json: vi.fn().mockResolvedValue([]),
      };

      (global.fetch as any)
        .mockResolvedValueOnce(mockTokenResponse)
        .mockResolvedValueOnce(mockProfileResponse)
        .mockResolvedValueOnce(mockEmailsResponse);

      await expect(service.handleCallback(mockCode, mockState)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
