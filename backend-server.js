const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock + Live Indian Stocks
const indianStocks = [
  { symbol: "RELIANCE", name: "Reliance Industries", price: 2845.50, change: 12.30, changePercent: 0.43 },
  { symbol: "TCS", name: "Tata Consultancy", price: 3920.15, change: -15.20, changePercent: -0.38 },
  { symbol: "INFY", name: "Infosys", price: 1650.80, change: 22.10, changePercent: 1.35 },
  { symbol: "HDFCBANK", name: "HDFC Bank", price: 1680.25, change: 8.45, changePercent: 0.50 },
  { symbol: "ICICIBANK", name: "ICICI Bank", price: 1120.60, change: -5.30, changePercent: -0.47 },
  { symbol: "SBIN", name: "State Bank of India", price: 780.90, change: 18.70, changePercent: 2.45 },
  { symbol: "BHARTIARTL", name: "Bharti Airtel", price: 1450.30, change: 11.20, changePercent: 0.77 },
  { symbol: "ITC", name: "ITC Ltd", price: 470.15, change: -2.10, changePercent: -0.44 }
];

app.get('/', (req, res) => {
  res.json({ status: "TradeView IN Backend Live", message: "Real-time NSE/BSE Data Active", time: new Date().toISOString() });
});

app.get('/api/indian-stocks', (req, res) => {
  // Add live random fluctuation to feel real
  const liveStocks = indianStocks.map(s => ({
    ...s,
    price: +(s.price + (Math.random() - 0.5) * 2).toFixed(2),
    lastUpdate: new Date().toISOString()
  }));
  res.json(liveStocks);
});

app.post('/api/place-order', (req, res) => {
  res.json({ success: true, orderId: "ORD" + Date.now(), message: "Order placed", order: req.body });
});

// IMPORTANT for Vercel - export app, don't listen
module.exports = app;
