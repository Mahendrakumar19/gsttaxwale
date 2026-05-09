import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useCMS(page: string) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await api.get(`/api/cms/pages/${page}`);
        if (res.data?.status === 'success') {
          const contentMap: Record<string, any> = {};
          const rawContent = res.data.data.content || {};
          Object.keys(rawContent).forEach(key => {
            contentMap[key] = rawContent[key].content;
          });
          setContent(contentMap);
        }
      } catch (err) {
        console.error(`Failed to fetch CMS content for ${page}`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchContent();
  }, [page]);

  const get = (key: string, defaultValue: string = '') => {
    return content[key] || defaultValue;
  };

  return { get, loading, content };
}
