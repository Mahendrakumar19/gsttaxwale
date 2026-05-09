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
  filingType: 'GSTR-1' | 'GSTR-2A' | 'GSTR-2' | 'GSTR-3B' | 'GSTR-9' | 'ITR-1/ITR-4' | 'ITR-2/ITR-3' | 'Company-ITR' | 'Partnership-ITR' | 'TDS' | 'other';
  status: 'upcoming' | 'due-soon' | 'overdue';
  frequency?: string;
  deadline?: string;
  lateFee?: string;
  type?: 'gst' | 'itr';
  url?: string;
}

export interface DueDatesResponse {
  success: boolean;
  data: {
    dueDates: DueDate[];
    total: number;
  };
}
