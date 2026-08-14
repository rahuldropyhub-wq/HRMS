import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import extensionRoutes from './modules/extension/extension.routes';
import emailRoutes from './modules/notifications/email.routes';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/extension', extensionRoutes);
app.use('/api/notifications', emailRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend API running on http://localhost:${port}`);
});
