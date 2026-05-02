const mongoose = require('mongoose');
const { seedProducts } = require('./seed');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    description: { type: String, required: true }
  },
  { timestamps: true, versionKey: false }
);

const orderSchema = new mongoose.Schema(
  {
    _id: { type: String, required: true },
    customer: {
      name: String,
      phone: String,
      address: String
    },
    items: [
      {
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
      }
    ],
    paymentMethod: { type: String, enum: ['gpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Confirmed'], default: 'Pending' },
    status: { type: String, enum: ['Pending', 'Accepted', 'Preparing', 'Delivered'], default: 'Pending' },
    total: Number
  },
  { timestamps: true, versionKey: false }
);

productSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  }
});

orderSchema.set('toJSON', {
  transform: (_, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

const Product = mongoose.model('Product', productSchema);
const Order = mongoose.model('Order', orderSchema);

function normalize(doc) {
  const value = { ...doc };
  value.id = value._id.toString();
  delete value._id;
  if (value.createdAt instanceof Date) value.createdAt = value.createdAt.toISOString();
  if (value.updatedAt instanceof Date) value.updatedAt = value.updatedAt.toISOString();
  return value;
}

async function makeMongoStore(uri) {
  await mongoose.connect(uri);
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(seedProducts);
  }

  return {
    async listProducts() {
      const products = await Product.find().sort({ createdAt: -1 }).lean();
      return products.map(normalize);
    },

    async createProduct(input) {
      const product = await Product.create({
        name: input.name,
        price: Number(input.price),
        image: input.image,
        description: input.description
      });
      return product.toJSON();
    },

    async updateProduct(id, input) {
      const product = await Product.findByIdAndUpdate(
        id,
        { ...input, price: input.price !== undefined ? Number(input.price) : undefined },
        { new: true, runValidators: true }
      );
      return product ? product.toJSON() : null;
    },

    async deleteProduct(id) {
      const result = await Product.findByIdAndDelete(id);
      return Boolean(result);
    },

    async listOrders() {
      const orders = await Order.find().sort({ createdAt: -1 }).lean();
      return orders.map(normalize);
    },

    async createOrder(order) {
      const created = await Order.create({ ...order, _id: order.id });
      return created.toJSON();
    },

    async updateOrder(id, patch) {
      const order = await Order.findByIdAndUpdate(id, patch, { new: true, runValidators: true });
      return order ? order.toJSON() : null;
    }
  };
}

module.exports = { makeMongoStore };
