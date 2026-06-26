import { Request, Response } from 'express';
import LinkedAccount, { Institution } from '../models/LinkedAccount';
import { SUPPORTED_INSTITUTIONS } from '../constants/institutions';

// GET /api/v1/institutions
export const getInstitutions = (_req: Request, res: Response): void => {
  res.status(200).json({
    institutions: SUPPORTED_INSTITUTIONS.map((name, i) => ({ id: String(i + 1), name })),
  });
};

// POST /api/v1/accounts/link
export const linkAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { institution, mockAccountRef } = req.body;

    // Validate institution against server whitelist
    if (!institution || !SUPPORTED_INSTITUTIONS.includes(institution as Institution)) {
      res.status(400).json({
        error: `Unsupported institution. Supported: ${SUPPORTED_INSTITUTIONS.join(', ')}`,
      });
      return;
    }

    // Check if already linked
    const existing = await LinkedAccount.findOne({
      userId: req.user!.userId,
      institution,
      isActive: true,
    });

    if (existing) {
      res.status(409).json({ error: `${institution} account already linked` });
      return;
    }

    // Mock OAuth token (in real implementation this comes from bank OAuth flow)
    const mockAccessToken = `mock_token_${institution.replace(' ', '_').toLowerCase()}_${Date.now()}`;
    const maskedNumber = mockAccountRef
      ? `****${String(mockAccountRef).slice(-4)}`
      : `****${Math.floor(1000 + Math.random() * 9000)}`;

    // Mock balances per institution (in kobo)
    const mockBalances: Record<Institution, number> = {
      GTBank: 24500000,      // ₦245,000.00
      'Access Bank': 87300000, // ₦873,000.00
      Kuda: 12750000,        // ₦127,500.00
      Opay: 5600000,         // ₦56,000.00
      Moniepoint: 340000000, // ₦3,400,000.00
    };

    const account = await LinkedAccount.create({
      userId: req.user!.userId,
      institution,
      maskedAccountNumber: maskedNumber,
      accessToken: mockAccessToken,
      tokenExpiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 min
      balance: mockBalances[institution as Institution] || 0,
      accountType: ['Kuda', 'Opay'].includes(institution) ? 'wallet' : 'current',
    });

    res.status(201).json({
      message: `${institution} account linked successfully`,
      account: {
        id: account._id,
        institution: account.institution,
        maskedAccountNumber: account.maskedAccountNumber,
        balance: account.balance / 100, // Convert kobo to NGN for display
        currency: account.currency,
        accountType: account.accountType,
        linkedAt: account.linkedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to link account' });
  }
};

// GET /api/v1/accounts
export const getAccounts = async (req: Request, res: Response): Promise<void> => {
  try {
    // Always scoped to authenticated user — never trust client-supplied userId
    const accounts = await LinkedAccount.find({
      userId: req.user!.userId,
      isActive: true,
    }).select('-accessToken'); // Never return access token

    res.status(200).json({
      accounts: accounts.map((a) => ({
        id: a._id,
        institution: a.institution,
        maskedAccountNumber: a.maskedAccountNumber,
        balance: a.balance / 100, // kobo to NGN
        currency: a.currency,
        accountType: a.accountType,
        linkedAt: a.linkedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
};

// DELETE /api/v1/accounts/:accountId
export const disconnectAccount = async (req: Request, res: Response): Promise<void> => {
  try {
    // req.linkedAccount is set by requireAccountOwnership middleware
    const account = req.linkedAccount!;

    // Soft delete — mark as inactive and revoke token
    account.isActive = false;
    account.accessToken = 'REVOKED';
    account.tokenExpiresAt = new Date();
    await account.save();

    res.status(200).json({ message: `${account.institution} account disconnected successfully` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to disconnect account' });
  }
};
