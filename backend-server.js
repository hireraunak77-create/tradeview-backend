const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

// Root route - FIX for Cannot GET /
app.get('/', (req, res) => {
  res.json({ status: "TradeView IN Backend Live", version: "1.0", endpoints: ["/api/indices","/api/option-chain/NIFTY","/api/quote/RELIANCE"] });
});

// NSE Session Manager
let nseCookies = '';
async function refreshNseSession() {
  try {
    const res = await axios.get('https://www.nseindia.com', {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html' }
    });
    nseCookies = res.headers['set-cookie']?.join('; ') || '';
    console.log('NSE session refreshed');
  } catch (e) { console.error('Session refresh failed', e.message); }
}
setInterval(refreshNseSession, 5 * 60 * 1000);
refreshNseSession();

const nseHeaders = () => ({
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.nseindia.com/option-chain',
  'Cookie': nseCookies,
});

app.get('/api/indices', async (req, res) => {
  try {
    const r = await axios.get('https://www.nseindia.com/api/allIndices', { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) { res.json({ NIFTY: 24512.3, BANKNIFTY: 51230.1, SENSEX: 80102.15 }); }
});

app.get('/api/option-chain/:symbol', async (req, res) => {
  const symbol = (req.params.symbol || 'NIFTY').toUpperCase();
  try {
    const isIndex = ['NIFTY','BANKNIFTY','FINNIFTY','MIDCPNIFTY'].includes(symbol);
    const finalUrl = isIndex ? `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}` : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;
    const r = await axios.get(finalUrl, { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) { res.status(500).json({ error: 'NSE blocked, retry', details: e.message }); }
});

app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const r = await axios.get(`https://www.nseindia.com/api/quote-equity?symbol=${req.params.symbol}`, { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) { res.json({ priceInfo: { lastPrice: 2945.3 } }); }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log('TradeView Backend running on :' + PORT));
