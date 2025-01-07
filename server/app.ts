
import express from 'express';
import cors from 'cors';
import { createLinkToken, exchangePublicToken, fetchAndStoreTransactions } from './services/plaid.service';
import { analyzeFile } from './services/ai.service';

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

// Plaid routes
app.post('/api/plaid/create-link', async (req, res) => {
  try {
    const { userId } = req.body;
    const linkToken = await createLinkToken(userId);
    res.json({ linkToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/plaid/set-access-token', async (req, res) => {
  try {
    const { publicToken } = req.body;
    const accessToken = await exchangePublicToken(publicToken);
    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Chat routes
app.post('/api/chat/financial-advice', async (req, res) => {
  try {
    const { message } = req.body;
    const response = await analyzeFile([{ 
      name: 'chat.txt', 
      type: 'txt', 
      url: '/tmp/chat.txt', 
      size: message.length 
    }]);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
