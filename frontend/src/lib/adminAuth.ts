// Admin-specific auth helpers (separate from user auth) using sessionStorage for temporary sessions
export const adminAuth = {
  setAdminToken: (token: string) => {
    if (typeof window !== 'undefined') sessionStorage.setItem('adminToken', token);
  },
  
  getAdminToken: () => {
    if (typeof window !== 'undefined') return sessionStorage.getItem('adminToken');
    return null;
  },
  
  setAdminUser: (user: any) => {
    if (typeof window !== 'undefined') sessionStorage.setItem('adminUser', JSON.stringify(user));
  },
  
  getAdminUser: () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('adminUser');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  },
  
  clearAdmin: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminUser');
    }
  },
};
