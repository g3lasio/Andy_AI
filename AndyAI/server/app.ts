
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import routes from './routes';
import { setupAuth } from './services/auth.service';
import { errorHandler } from './middleware/error.handler';

const app = express();
const server = createServer(app);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Auth setup
setupAuth(app);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

export default server;
