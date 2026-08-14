import { Router } from 'express';
import { sendWelcomeEmailController } from './email.controller';

const router = Router();

router.post('/send-welcome-email', sendWelcomeEmailController);

export default router;
