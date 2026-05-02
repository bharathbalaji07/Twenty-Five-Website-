function requiredFields(body, fields) {
  const missing = fields.filter((field) => !body[field]);
  return missing.length ? `Missing required fields: ${missing.join(', ')}` : null;
}

function makeOrderId() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `BF-${ymd}-${random}`;
}

function summarizeAnalytics(orders) {
  const deliveredOrPaid = orders.filter((order) => order.status === 'Delivered' || order.paymentStatus === 'Paid' || order.paymentStatus === 'Confirmed');
  const todayKey = new Date().toISOString().slice(0, 10);
  const monthKey = new Date().toISOString().slice(0, 7);

  const dailySales = deliveredOrPaid
    .filter((order) => order.createdAt?.slice(0, 10) === todayKey)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const monthlySales = deliveredOrPaid
    .filter((order) => order.createdAt?.slice(0, 7) === monthKey)
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const totalRevenue = deliveredOrPaid.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const byDay = {};
  deliveredOrPaid.forEach((order) => {
    const key = order.createdAt?.slice(0, 10) || todayKey;
    byDay[key] = (byDay[key] || 0) + Number(order.total || 0);
  });

  const chart = Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-14)
    .map(([date, revenue]) => ({ date, revenue }));

  return {
    dailySales,
    monthlySales,
    totalRevenue,
    numberOfOrders: orders.length,
    chart
  };
}

module.exports = { makeOrderId, requiredFields, summarizeAnalytics };
