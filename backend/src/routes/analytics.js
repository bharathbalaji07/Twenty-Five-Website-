const { requireAdmin } = require('../middleware/auth');
const { summarizeAnalytics } = require('../utils');

function analyticsRoutes(store) {
  const router = require('express').Router();

  router.get('/', requireAdmin, async (_req, res, next) => {
    try {
      const orders = await store.listOrders();
      res.json(summarizeAnalytics(orders));
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { analyticsRoutes };
