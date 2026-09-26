const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers || {});

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include', // Ensure HttpOnly cookies are passed!
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    if (!response.ok) {
      let errorMessage = 'Tarmoq yoki server xatoligi yuz berdi';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignored
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  public async register(body: any) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async login(body: any) {
    return this.request<{ success: boolean; data: { user: any; token: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async logout() {
    return this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  }

  public async getMe() {
    return this.request<{ success: boolean; data: any }>('/auth/me');
  }

  // Transactions & Dashboard
  public async getDashboard() {
    return this.request<{ success: boolean; data: any }>('/transactions/dashboard');
  }

  public async getTransactions(params?: Record<string, string>) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.request<{ success: boolean; data: any }>(`/transactions${query}`);
  }

  public async createTransaction(body: any) {
    return this.request<{ success: boolean; data: any }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async smartParse(text: string) {
    return this.request<{ success: boolean; data: any }>('/transactions/smart-parse', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
  }

  public async updateTransaction(id: string, body: any) {
    return this.request<{ success: boolean; data: any }>(`/transactions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  public async deleteTransaction(id: string) {
    return this.request<{ success: boolean }>(`/transactions/${id}`, { method: 'DELETE' });
  }

  // Categories & Budget & Statistics
  public async getCategories() {
    return this.request<{ success: boolean; data: any }>('/categories');
  }

  public async createCategory(body: any) {
    return this.request<{ success: boolean; data: any }>('/categories', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async deleteCategory(id: string) {
    return this.request<{ success: boolean }>(`/categories/${id}`, { method: 'DELETE' });
  }

  public async getBudget(month?: number, year?: number) {
    const query = month && year ? `?month=${month}&year=${year}` : '';
    return this.request<{ success: boolean; data: any }>(`/budget${query}`);
  }

  public async setBudget(body: any) {
    return this.request<{ success: boolean; data: any }>('/budget', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  public async getStatistics(period = 'monthly') {
    return this.request<{ success: boolean; data: any }>(`/statistics?period=${period}`);
  }

  // Social & Chat
  public async searchUsers(q: string) {
    return this.request<{ success: boolean; data: any }>(`/friends/search?q=${encodeURIComponent(q)}`);
  }

  public async getFriends() {
    return this.request<{ success: boolean; data: any }>('/friends');
  }

  public async getOnlineUsers() {
    return this.request<{
      success: boolean;
      data: {
        friends: any[];
        allFriends: any[];
        communityPlayers: any[];
      };
    }>('/friends/online');
  }

  public async getFriendRequests() {
    return this.request<{ success: boolean; data: any }>('/friends/requests');
  }

  public async sendFriendRequest(username: string) {
    return this.request<{ success: boolean; data: any }>('/friends/request', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  public async respondFriendRequest(id: string, action: 'ACCEPT' | 'REJECT') {
    return this.request<{ success: boolean }>(`/friends/request/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ action }),
    });
  }

  public async removeFriend(id: string) {
    return this.request<{ success: boolean }>(`/friends/${id}`, { method: 'DELETE' });
  }

  public async getConversations() {
    return this.request<{ success: boolean; data: any }>('/messages/conversations');
  }

  public async getMessages(partnerId: string) {
    return this.request<{ success: boolean; data: any }>(`/messages/${partnerId}`);
  }

  public async sendMessage(receiverId: string, message: string) {
    return this.request<{ success: boolean; data: any }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ receiverId, message }),
    });
  }

  // Games
  public async sendGameHeartbeat() {
    return this.request<{ success: boolean; activePlayersCount: number }>('/games/heartbeat', {
      method: 'POST',
    });
  }

  public async createGame(gameType: string, opponentId?: string | null) {
    return this.request<{ success: boolean; data: any }>('/games', {
      method: 'POST',
      body: JSON.stringify({ gameType, opponentId }),
    });
  }

  public async getGame(id: string) {
    return this.request<{ success: boolean; data: any }>(`/games/${id}`);
  }

  public async joinGame(id: string) {
    return this.request<{ success: boolean; data: any }>(`/games/${id}/join`, { method: 'POST' });
  }

  public async getPendingGameInvite() {
    return this.request<{ success: boolean; data: any }>('/games/pending-invite');
  }

  public async makeGameMove(id: string, moveData: any) {
    return this.request<{ success: boolean; data: any }>(`/games/${id}/move`, {
      method: 'POST',
      body: JSON.stringify({ moveData }),
    });
  }

  public async rematchGame(id: string) {
    return this.request<{ success: boolean; data: any }>(`/games/${id}/rematch`, { method: 'POST' });
  }

  // Gamification
  public async getGamificationStats() {
    return this.request<{ success: boolean; data: any }>('/gamification/stats');
  }

  public async getLeaderboard(filter: 'global' | 'friends' = 'global') {
    return this.request<{ success: boolean; data: any }>(`/gamification/leaderboard?filter=${filter}`);
  }

  // Security & Notifications
  public async getNotifications() {
    return this.request<{ success: boolean; data: any }>('/notifications');
  }

  public async markNotificationRead(id: string) {
    return this.request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  public async markAllNotificationsRead() {
    return this.request<{ success: boolean }>('/notifications/read-all', { method: 'POST' });
  }

  public async getLoginHistory() {
    return this.request<{ success: boolean; data: any }>('/security/login-history');
  }

  public async getActiveSessions() {
    return this.request<{ success: boolean; data: any }>('/security/sessions');
  }

  public async revokeSession(id: string) {
    return this.request<{ success: boolean }>(`/security/sessions/${id}`, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
