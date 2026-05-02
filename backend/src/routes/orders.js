const { requireAdmin } = require('../middleware/auth');
const { makeOrderId, requiredFields } = require('../utils');

function orderRoutes(store, io) {
  const router = require('express').Router();

  router.get('/', requireAdmin, async (_req, res, next) => {
    try {
      res.json(await store.listOrders());
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const message = requiredFields(req.body, ['customer', 'items', 'paymentMethod']);
      if (message) return res.status(400).json({ message });
      if (!Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ message: 'Order must include at least one item.' });
      }

      const customerMessage = requiredFields(req.body.customer, ['name', 'phone', 'address']);
      if (customerMessage) return res.status(400).json({ message: customerMessage });

      const items = req.body.items.map((item) => ({
        productId: item.productId || item.id,
        name: item.name,
        price: Number(item.price),
        quantity: Number(item.quantity),
        image: item.image
      }));

      if (items.some((item) => !item.name || item.quantity < 1 || Number.isNaN(item.price))) {
        return res.status(400).json({ message: 'Invalid order item payload.' });
      }

      const paymentMethod = req.body.paymentMethod === 'cod' ? 'cod' : 'gpay';
      const now = new Date().toISOString();
      const order = {
        id: makeOrderId(),
        customer: req.body.customer,
        items,
        paymentMethod,
        paymentStatus: paymentMethod === 'gpay' ? 'Paid' : 'Pending',
        status: 'Pending',
        total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
        createdAt: now,
        updatedAt: now
      };

      const saved = await store.createOrder(order);
      io.emit('orders:new', saved);
      io.emit('orders:changed', saved);
      return res.status(201).json(saved);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/payment', requireAdmin, async (req, res, next) => {
    try {
      const order = await store.updateOrder(req.params.id, { paymentStatus: 'Confirmed' });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      io.emit('orders:changed', order);
      return res.json(order);
    } catch (error) {
      next(error);
    }
  });

  router.patch('/:id/status', requireAdmin, async (req, res, next) => {
    try {
      const allowed = ['Pending', 'Accepted', 'Preparing', 'Delivered'];
      if (!allowed.includes(req.body.status)) {
        return res.status(400).json({ message: 'Invalid order status.' });
      }

      const current = (await store.listOrders()).find((order) => order.id === req.params.id);
      if (!current) return res.status(404).json({ message: 'Order not found.' });
      if (req.body.status === 'Delivered' && current.paymentMethod === 'cod' && current.paymentStatus !== 'Confirmed') {
        return res.status(409).json({ message: 'Confirm COD payment before marking delivered.' });
      }

      const order = await store.updateOrder(req.params.id, { status: req.body.status });
      io.emit('orders:changed', order);
      return res.json(order);
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { orderRoutes };
