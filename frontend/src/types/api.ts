// News and Updates API Types
export interface NewsItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'update' | 'news' | 'announcement' | 'alert';
  url?: string;
  source?: string;
}

export interface NewsResponse {
  success: boolean;
  data: {
    news: NewsItem[];
    total: number;
  };
}

// Due Dates API Types
export interface DueDate {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  filingType: 'GSTR-1' | 'GSTR-2' | 'GSTR-3B' | 'GSTR-9' | 'ITR' | 'TDS' | 'other';
  status: 'upcoming' | 'due-soon' | 'overdue';
  frequency?: string;
  url?: string;
}

export interface DueDatesResponse {
  success: boolean;
  data: {
    dueDates: DueDate[];
    total: number;
  };
}
