import { Router, type Router as RouterType } from 'express';
import { checkGatewayHealth } from '../gateway/client.js';

const router: RouterType = Router();

router.get('/', async (_req, res) => {
  const gatewayOk = await checkGatewayHealth();
  res.json({
    status: 'ok',
    gateway: gatewayOk,
  });
});

export default router;
