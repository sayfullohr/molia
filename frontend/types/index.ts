export interface User {
  id: string;
  username: string;
  createdAt: string;
  stats?: UserStats;
  unreadNotifications?: number;
}

export interface AchievementItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requirement?: string;
  xpReward: number;
  unlocked?: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  totalXP: number;
  level: number;
  currentLevelMinXP: number;
  nextLevelXP: number;
  progressPercent: number;
  streak: number;
  longestStreak: number;
  achievementsCount: number;
  totalAchievements: number;
  unlockedAchievements: AchievementItem[];
  allAchievements: AchievementItem[];
  gamesPlayedCount: number;
  gamesWonCount: number;
}

export interface Category {
  id: string;
  userId?: string | null;
  name: string;
  icon: string;
  type: 'EXPENSE' | 'INCOME';
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'EXPENSE' | 'INCOME';
  amount: number;
  categoryId?: string | null;
  category?: Category | null;
  title: string;
  description?: string | null;
  date: string;
  createdAt: string;
}

export interface BudgetSummary {
  budgetAmount: number;
  spent: number;
  remaining: number;
  percent: number;
  remainingDays: number;
  smartDailyLimit: number;
  isWarning: boolean;
  isExceeded: boolean;
}

export interface DashboardData {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  monthIncome: number;
  monthExpense: number;
  todayExpense: number;
  recentTransactions: Transaction[];
  budget: BudgetSummary | null;
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface FriendItem {
  id: string;
  username: string;
  level: number;
  streak: number;
  totalXP: number;
  isOnline: boolean;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationItem {
  partnerId: string;
  username: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

export interface GameSession {
  id: string;
  gameType: 'TIC_TAC_TOE' | 'QUIZ' | 'CHECKERS';
  player1Id: string;
  player1: { id: string; username: string };
  player2Id?: string | null;
  player2?: { id: string; username: string } | null;
  status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'DRAW';
  winnerId?: string | null;
  winner?: { id: string; username: string } | null;
  gameState: string;
  currentTurn?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeaderboardUser {
  rank: number;
  userId: string;
  username: string;
  totalXP: number;
  level: number;
  streak: number;
  isCurrentUser: boolean;
}

export interface LoginAttemptItem {
  id: string;
  username: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  deviceInfo: string;
  createdAt: string;
}

export interface ActiveSessionItem {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}
