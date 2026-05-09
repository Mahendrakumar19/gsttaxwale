import api from './api';

export interface PageContent {
  [key: string]: {
    content: string;
    type: string;
    section: string;
  };
}

/**
 * Fetch content for a specific page
 */
export async function getPageContent(page: string): Promise<PageContent> {
  try {
    const response = await api.get(`/api/cms/pages/${page}`);
    return response.data?.data?.content || {};
  } catch (error) {
    console.error(`Failed to fetch content for page: ${page}`, error);
    return {};
  }
}

/**
 * Fetch all site settings
 */
export async function getSiteSettings(): Promise<Record<string, string>> {
  try {
    const response = await api.get('/api/cms/settings');
    return response.data?.data || {};
  } catch (error) {
    console.error('Failed to fetch site settings', error);
    return {};
  }
}

/**
 * Update page content (Admin only)
 */
export async function updatePageContent(data: {
  page: string;
  section: string;
  key: string;
  content: string;
  type?: string;
}) {
  return await api.post('/api/cms/pages/update', data);
}

/**
 * Update site setting (Admin only)
 */
export async function updateSiteSetting(key: string, value: string, type?: string) {
  return await api.post('/api/cms/settings/update', { key, value, type });
}

/**
 * Helper to get a specific content value with a fallback
 */
export function getContent(content: PageContent, key: string, fallback: string): string {
  return content[key]?.content || fallback;
}
