// Clean initial state — no demo data
// All data is managed via in-component state or will come from the backend

export const mockUser = {
  id: "",
  name: "",
  email: "",
  phone: "",
  avatar: null as null,
  currency: "USD",
  language: "English",
  joinDate: "",
  plan: "Free",
};

export const mockStats = {
  totalBalance: 0,
  income: 0,
  expenses: 0,
  savings: 0,
  monthlyBudget: 0,
  investments: 0,
  incomeChange: 0,
  expensesChange: 0,
  savingsChange: 0,
  balanceChange: 0,
};

export const mockTransactions: {
  id: string; date: string; description: string; category: string;
  amount: number; type: "income" | "expense"; icon: string; recurring: boolean;
}[] = [];

export const mockSpendingTrend: { day: number; amount: number; income: number }[] = [];

export const mockIncomeVsExpense: { month: string; income: number; expense: number }[] = [];

export const mockBudgetCategories: {
  category: string; budget: number; spent: number; color: string;
}[] = [];

export const mockSavingsGrowth: { month: string; savings: number; target: number }[] = [];

export const mockAIPredictions = {
  nextMonthExpense: 0,
  expenseChange: 0,
  confidence: 0,
  incomeForecasts: [] as { month: string; predicted: number; actual: null }[],
  expenseForecasts: [] as { month: string; predicted: number; actual: null }[],
  categoryPredictions: [] as { category: string; predicted: number; change: number }[],
  riskScore: 0,
  riskLevel: "N/A",
  aiSuggestions: [] as { type: string; text: string }[],
  recommendedBudget: { total: 0, breakdown: [] as { category: string; amount: number }[] },
  futureSavings: { threeMonths: 0, sixMonths: 0, oneYear: 0 },
};

export const mockGoals: {
  id: string; name: string; icon: string; target: number; current: number;
  deadline: string; color: string;
  milestones: { amount: number; label: string; achieved: boolean }[];
}[] = [];

export const mockReports = {
  monthly: {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    topCategories: [] as { category: string; amount: number; percentage: number }[],
  },
  sixMonthForecast: [] as { month: string; income: number; expense: number }[],
};

export const mockUpcomingBills: {
  id: string; name: string; amount: number; dueDate: string; category: string; status: string;
}[] = [];

export const mockNotifications: {
  id: string; title: string; message: string; time: string; read: boolean; type: string;
}[] = [];

export const mockCashFlow: {
  month: string; inflow: number; outflow: number; net: number;
}[] = [];
