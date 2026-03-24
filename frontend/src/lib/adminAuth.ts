// Admin-specific auth helpers (separate from user auth)
export const adminAuth = {
  setAdminToken: (token: string) => {
    if (typeof window !== 'undefined') localStorage.setItem('adminToken', token);
  },
  
  getAdminToken: () => {
    if (typeof window !== 'undefined') return localStorage.getItem('adminToken');
    return null;
  },
  
  setAdminUser: (user: any) => {
    if (typeof window !== 'undefined') localStorage.setItem('adminUser', JSON.stringify(user));
  },
  
  getAdminUser: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },
  
  clearAdmin: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
    }
  },
};
