import { Request, Response } from 'express';
import LinkedAccount from '../models/LinkedAccount';
import Transaction from '../models/Transaction';

// GET /api/v1/dashboard/summary
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Fetch all active accounts for this user
    const accounts = await LinkedAccount.find({ userId, isActive: true }).select('-accessToken');

    // Total balance across all accounts (convert kobo to NGN)
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0) / 100;

    // Fetch last 30 days of transactions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTransactions = await Transaction.find({
      userId,
      date: { $gte: thirtyDaysAgo },
    })
      .sort({ date: -1 })
      .limit(30);

    // Monthly income and expense
    const monthlyIncome = recentTransactions
      .filter((t) => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0) / 100;

    const monthlyExpense = recentTransactions
      .filter((t) => t.type === 'debit')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) / 100;

    // Expense breakdown by category
    const expenseBreakdown: Record<string, number> = {};
    recentTransactions
      .filter((t) => t.type === 'debit')
      .forEach((t) => {
        expenseBreakdown[t.category] =
          (expenseBreakdown[t.category] || 0) + Math.abs(t.amount) / 100;
      });

    res.status(200).json({
      totalBalance,
      currency: 'NGN',
      monthlyIncome,
      monthlyExpense,
      netCashFlow: monthlyIncome - monthlyExpense,
      accounts: accounts.map((a) => ({
        id: a._id,
        institution: a.institution,
        maskedAccountNumber: a.maskedAccountNumber,
        balance: a.balance / 100,
        accountType: a.accountType,
        currency: a.currency,
      })),
      recentTransactions: recentTransactions.slice(0, 10).map((t) => ({
        id: t._id,
        date: t.date,
        description: t.description,
        amount: t.amount / 100,
        type: t.type,
        category: t.category,
        institution: t.institution,
      })),
      expenseBreakdown: Object.entries(expenseBreakdown).map(([category, amount]) => ({
        category,
        amount,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

// GET /api/v1/dashboard/balance-trend
export const getBalanceTrend = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Last 6 months labels
    const labels: string[] = [];
    const data: number[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(months[d.getMonth()]);

      // Sum credits - debits for that month
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

      const txs = await Transaction.find({ userId, date: { $gte: start, $lte: end } });
      const net = txs.reduce((sum, t) => sum + t.amount, 0) / 100;
      data.push(net);
    }

    res.status(200).json({ labels, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load balance trend' });
  }
};
