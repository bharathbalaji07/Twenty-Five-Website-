const { requireAdmin } = require('../middleware/auth');
const { requiredFields } = require('../utils');

function productRoutes(store, io) {
  const router = require('express').Router();

  router.get('/', async (_req, res, next) => {
    try {
      res.json(await store.listProducts());
    } catch (error) {
      next(error);
    }
  });

  router.post('/', requireAdmin, async (req, res, next) => {
    try {
      const message = requiredFields(req.body, ['name', 'price', 'image', 'description']);
      if (message) return res.status(400).json({ message });

      const product = await store.createProduct(req.body);
      io.emit('products:changed', { action: 'created', product });
      return res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', requireAdmin, async (req, res, next) => {
    try {
      const product = await store.updateProduct(req.params.id, req.body);
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      io.emit('products:changed', { action: 'updated', product });
      return res.json(product);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', requireAdmin, async (req, res, next) => {
    try {
      const deleted = await store.deleteProduct(req.params.id);
      if (!deleted) return res.status(404).json({ message: 'Product not found.' });

      io.emit('products:changed', { action: 'deleted', id: req.params.id });
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = { productRoutes };
