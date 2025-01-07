
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';
import { db } from '@db/index';
import { transactions } from '@db/schema';

const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

const plaidClient = new PlaidApi(plaidConfig);

export async function createLinkToken(userId: number) {
  const response = await plaidClient.linkTokenCreate({
    user: { client_user_id: userId.toString() },
    client_name: 'Andy AI',
    products: ['transactions'],
    country_codes: ['US'],
    language: 'es',
  });
  return response.data.link_token;
}

export async function exchangePublicToken(publicToken: string) {
  const response = await plaidClient.itemPublicTokenExchange({
    public_token: publicToken,
  });
  return response.data.access_token;
}

export async function fetchAndStoreTransactions(userId: number, accessToken: string) {
  const now = new Date();
  const startDate = new Date(now.setMonth(now.getMonth() - 3)).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  const response = await plaidClient.transactionsGet({
    access_token: accessToken,
    start_date: startDate,
    end_date: endDate,
  });

  const transactions = response.data.transactions.map(transaction => ({
    userId,
    type: transaction.amount > 0 ? 'expense' : 'income',
    amount: Math.abs(transaction.amount),
    category: transaction.category?.[0],
    description: transaction.name,
    merchantName: transaction.merchant_name,
    plaidId: transaction.transaction_id,
    accountId: transaction.account_id,
    pending: transaction.pending,
    date: new Date(transaction.date)
  }));

  await db.insert(transactions).values(transactions)
    .onConflictDoUpdate({
      target: transactions.plaidId,
      set: {
        amount: sql`EXCLUDED.amount`,
        category: sql`EXCLUDED.category`,
        description: sql`EXCLUDED.description`,
        pending: sql`EXCLUDED.pending`,
      }
    });

  return transactions;
}
