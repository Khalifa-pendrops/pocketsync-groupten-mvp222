import mongoose, { Document, Schema } from 'mongoose';
import sanitizeHtml from 'sanitize-html';

export type TransactionCategory =
  | 'Food'
  | 'Transport'
  | 'Bills'
  | 'Entertainment'
  | 'Savings'
  | 'Transfer'
  | 'Other';

export type TransactionType = 'credit' | 'debit';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  accountId: mongoose.Types.ObjectId;
  institution: string;
  date: Date;
  description: string;
  amount: number;       // Positive = credit, negative = debit (in kobo)
  type: TransactionType;
  category: TransactionCategory;
  reference: string;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'LinkedAccount',
      required: true,
      index: true,
    },
    institution: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: 200,
      // Sanitise on write — prevents stored XSS via transaction descriptions
      set: (val: string) =>
        sanitizeHtml(val, { allowedTags: [], allowedAttributes: {} }),
    },
    amount: {
      type: Number,
      required: true, // In kobo — positive = credit, negative = debit
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: true,
    },
    category: {
      type: String,
      enum: ['Food', 'Transport', 'Bills', 'Entertainment', 'Savings', 'Transfer', 'Other'],
      default: 'Other',
    },
    reference: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Compound indexes for user-scoped, date-sorted queries
TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, accountId: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
