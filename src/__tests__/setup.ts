import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

// Mock environment variables
vi.stubEnv('INSTAGRAM_BASE_URL', 'https://graph.instagram.com');
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

// Mock fetch globally
global.fetch = vi.fn();
