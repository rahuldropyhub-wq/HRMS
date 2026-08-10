import { Router } from 'express';
import { ExtensionController } from './extension.controller';
// import { verifyJWT } from './extension.middleware';

const router = Router();
const controller = new ExtensionController();

// Apply middleware to verify extension JWT
// router.use(verifyJWT);

router.post('/heartbeat', controller.heartbeat);
router.post('/status', controller.statusChange);
router.post('/idle/start', controller.idleStart);
// Add other endpoints as needed...

export default router;
