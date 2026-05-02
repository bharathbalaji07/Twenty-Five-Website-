const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { seedProducts } = require('./seed');

async function resetMenu() {
  const dbPath = path.join(__dirname, '..', '..', 'data', 'db.json');
  let db = { products: [], orders: [] };

  try {
    db = JSON.parse(await fs.readFile(dbPath, 'utf8'));
  } catch {
    await fs.mkdir(path.dirname(dbPath), { recursive: true });
  }

  const now = new Date().toISOString();
  db.products = seedProducts.map((item) => ({
    id: randomUUID(),
    ...item,
    createdAt: now,
    updatedAt: now
  }));

  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  console.log(`Loaded ${db.products.length} Twenty Five menu products.`);
}

resetMenu().catch((error) => {
  console.error(error);
  process.exit(1);
});
