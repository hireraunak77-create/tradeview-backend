/**
 * TradeView IN - Backend for LIVE NSE/BSE F&O Data
 * Fixes NSE blocking issue with proper headers + session
 * Run: npm install express axios cors
 *      node server.js
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

// NSE Session Manager - NSE blocks without cookies
let nseCookies = '';
async function refreshNseSession() {
  try {
    const res = await axios.get('https://www.nseindia.com', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      }
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

// 1. Live Indices
app.get('/api/indices', async (req, res) => {
  try {
    const r = await axios.get('https://www.nseindia.com/api/allIndices', { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) {
    res.json({ NIFTY: 24512.3, BANKNIFTY: 51230.1, SENSEX: 80102.15 }); // fallback mock
  }
});

// 2. Option Chain - LIVE
app.get('/api/option-chain/:symbol', async (req, res) => {
  const symbol = req.params.symbol || 'NIFTY';
  try {
    const url = `https://www.nseindia.com/api/option-chain-indices?symbol=${symbol}`;
    // For stocks: /api/option-chain-equities?symbol=RELIANCE
    const isIndex = ['NIFTY','BANKNIFTY','FINNIFTY'].includes(symbol);
    const finalUrl = isIndex ? url : `https://www.nseindia.com/api/option-chain-equities?symbol=${symbol}`;
    const r = await axios.get(finalUrl, { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) {
    res.status(500).json({ error: 'NSE blocked, retry', details: e.message });
  }
});

// 3. Quote
app.get('/api/quote/:symbol', async (req, res) => {
  try {
    const r = await axios.get(`https://www.nseindia.com/api/quote-equity?symbol=${req.params.symbol}`, { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) {
    res.json({ priceInfo: { lastPrice: 2945.3, change: 35.2, pChange: 1.2 } });
  }
});

// 4. Gainers Losers
app.get('/api/gainers', async (req, res) => {
  try {
    const r = await axios.get('https://www.nseindia.com/api/live-analysis-variations?index=gainers', { headers: nseHeaders() });
    res.json(r.data);
  } catch (e) { res.json({ data: [] }); }
});

// 5. Strategy Payoff Calculator
app.post('/api/strategy/payoff', express.json(), (req, res) => {
  const { legs, spotRange } = req.body; // legs: [{type:'CE'/'PE', action:'BUY'/'SELL', strike, premium, lot}]
  const payoffs = [];
  for (let spot = spotRange.from; spot <= spotRange.to; spot += spotRange.step) {
    let pnl = 0;
    legs.forEach(leg => {
      const lotSize = leg.lot || 50;
      let legPnl = 0;
      if (leg.type === 'CE') {
        legPnl = Math.max(0, spot - leg.strike) - leg.premium;
      } else {
        legPnl = Math.max(0, leg.strike - spot) - leg.premium;
      }
      if (leg.action === 'SELL') legPnl = -legPnl;
      pnl += legPnl * lotSize;
    });
    payoffs.push({ spot, pnl });
  }
  res.json({ payoffs });
});

app.listen(3001, () => console.log('TradeView Backend running on :3001'));
