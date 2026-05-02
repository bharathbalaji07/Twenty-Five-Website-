const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { seedProducts } = require('./seed');

const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json');

const clone = (value) => JSON.parse(JSON.stringify(value));

async function ensureDb() {
  try {
    await fs.access(dbPath);
  } catch {
    const now = new Date().toISOString();
    const products = seedProducts.map((product) => ({
      id: randomUUID(),
      ...product,
      createdAt: now,
      updatedAt: now
    }));
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
    await fs.writeFile(dbPath, JSON.stringify({ products, orders: [] }, null, 2));
  }
}

async function readDb() {
  await ensureDb();
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

function makeFileStore() {
  return {
    async listProducts() {
      const db = await readDb();
      return clone(db.products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    },

    async createProduct(input) {
      const db = await readDb();
      const now = new Date().toISOString();
      const product = {
        id: randomUUID(),
        name: input.name,
        price: Number(input.price),
        image: input.image,
        description: input.description,
        createdAt: now,
        updatedAt: now
      };
      db.products.unshift(product);
      await writeDb(db);
      return clone(product);
    },

    async updateProduct(id, input) {
      const db = await readDb();
      const index = db.products.findIndex((product) => product.id === id);
      if (index === -1) return null;
      db.products[index] = {
        ...db.products[index],
        ...input,
        price: input.price !== undefined ? Number(input.price) : db.products[index].price,
        updatedAt: new Date().toISOString()
      };
      await writeDb(db);
      return clone(db.products[index]);
    },

    async deleteProduct(id) {
      const db = await readDb();
      const initialLength = db.products.length;
      db.products = db.products.filter((product) => product.id !== id);
      await writeDb(db);
      return db.products.length !== initialLength;
    },

    async listOrders() {
      const db = await readDb();
      return clone(db.orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    },

    async createOrder(order) {
      const db = await readDb();
      db.orders.unshift(order);
      await writeDb(db);
      return clone(order);
    },

    async updateOrder(id, patch) {
      const db = await readDb();
      const index = db.orders.findIndex((order) => order.id === id);
      if (index === -1) return null;
      db.orders[index] = {
        ...db.orders[index],
        ...patch,
        updatedAt: new Date().toISOString()
      };
      await writeDb(db);
      return clone(db.orders[index]);
    }
  };
}

module.exports = { makeFileStore };
