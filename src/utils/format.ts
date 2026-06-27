export function formatNgn(amount: number): string {
  return `₦${Math.abs(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatSignedNgn(amount: number, type?: 'credit' | 'debit'): string {
  const isCredit = type === 'credit' || (type === undefined && amount > 0);
  const prefix = isCredit ? '+' : '-';
  return `${prefix}${formatNgn(amount)}`;
}

export function formatTransactionDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((startOfToday.getTime() - startOfDate.getTime()) / 86_400_000);

  const time = date.toLocaleTimeString('en-NG', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  if (dayDiff === 0) {
    return `Today, ${time}`;
  }

  if (dayDiff === 1) {
    return `Yesterday, ${time}`;
  }

  return date.toLocaleDateString('en-NG', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatAccountType(accountType: string): string {
  const labels: Record<string, string> = {
    current: 'Current Account',
    savings: 'Savings Account',
    wallet: 'Wallet',
    business: 'Business Account',
  };

  return labels[accountType] ?? accountType;
}