const express = require('express');
const cors = require('cors');
const stocksMaster = require('./stocks-master.json');
const app = express();
app.use(cors());
app.use(express.json());

function getLivePrice(base) {
  return +(base + (Math.random()-0.5)* (base*0.01)).toFixed(2);
}

app.get('/', (req,res)=> res.json({status:"TradeView IN Live", universe: stocksMaster.length, endpoints:["/api/search?q=","/api/stock/:symbol","/api/indian-stocks","/api/indices","/api/news","/api/config"], time: new Date().toISOString()}));

app.get('/api/search', (req,res)=>{
  const q = (req.query.q || '').toUpperCase().trim();
  if(!q) return res.json([]);
  const results = stocksMaster.filter(s => s.symbol.includes(q) || s.companyName.toUpperCase().includes(q) || s.bseCode.includes(q)).slice(0,20).map(s=> ({...s, price: getLivePrice(500+Math.random()*2000), changePercent: +(Math.random()*4-2).toFixed(2)}));
  res.json(results);
});

app.get('/api/indian-stocks', (req,res)=>{
  const q = req.query.q;
  let data = stocksMaster.slice(0,60);
  if(q){ const uq=q.toUpperCase(); data=stocksMaster.filter(s=> s.symbol.includes(uq)||s.companyName.toUpperCase().includes(uq)).slice(0,50); }
  const live = data.map(s=> ({symbol:s.symbol, companyName:s.companyName, name:s.companyName, exchange:s.exchange, bseCode:s.bseCode, sector:s.sector, price:getLivePrice(500+Math.random()*2000), change:+(Math.random()*10-5).toFixed(2), changePercent:+(Math.random()*4-2).toFixed(2), dayHigh:+(600+Math.random()*2000).toFixed(2), dayLow:+(400+Math.random()*1800).toFixed(2), week52High:+(800+Math.random()*2500).toFixed(2), week52Low:+(300+Math.random()*1000).toFixed(2), lastUpdate:new Date().toISOString()}));
  res.json(live);
});

app.get('/api/stock/:symbol', (req,res)=>{
  const sym=req.params.symbol.toUpperCase();
  const master=stocksMaster.find(s=> s.symbol===sym);
  if(!master) return res.status(404).json({error:"Stock not found"});
  const base=500+Math.random()*2000;
  res.json({...master, price:getLivePrice(base), change:+(Math.random()*10-5).toFixed(2), changePercent:+(Math.random()*4-2).toFixed(2), dayHigh:+(base*1.02).toFixed(2), dayLow:+(base*0.98).toFixed(2), week52High:+(base*1.35).toFixed(2), week52Low:+(base*0.65).toFixed(2), marketCap:(Math.random()*15).toFixed(2)+"L Cr", pe:(15+Math.random()*25).toFixed(1), eps:(20+Math.random()*150).toFixed(1), dividendYield:(Math.random()*3).toFixed(2), volume:Math.floor(Math.random()*5000000), recommendation:["BUY","HOLD","SELL"][Math.floor(Math.random()*3)], confidence:Math.floor(65+Math.random()*30), reasoning:["Price above 20 & 50 DMA","RSI 62 bullish","Q1 profit up","Valuation fair"], lastUpdate:new Date().toISOString(), dataType:"Delayed • Demo"});
});

app.get('/api/indices', (req,res)=>{ res.json([{name:"NIFTY 50", value:24850.25+(Math.random()-0.5)*50, changePercent:+(Math.random()*1-0.5).toFixed(2), exchange:"NSE"},{name:"SENSEX", value:81250.30+(Math.random()-0.5)*100, changePercent:+(Math.random()*1-0.5).toFixed(2), exchange:"BSE"},{name:"NIFTY BANK", value:51200.15+(Math.random()-0.5)*80, changePercent:+(Math.random()*1-0.5).toFixed(2), exchange:"NSE"}]);});

app.get('/api/news', (req,res)=>{
  const news=[{headline:"RBI Holds Repo Rate at 6.5%, Markets React Positively",summary:"RBI MPC keeps rates unchanged, focuses on inflation control. Banking stocks see buying interest.",time:"2h ago",source:"ET Markets",related:"HDFCBANK",tag:"Breaking"},{headline:"Reliance Industries Q1 Profit Beats Estimates",summary:"Consolidated PAT rises 12% YoY driven by retail and Jio growth.",time:"5h ago",source:"Moneycontrol",related:"RELIANCE",tag:"Results"},{headline:"Infosys Bags $1.5B Deal from US Client",summary:"5-year digital transformation deal to boost revenue visibility.",time:"1d ago",source:"CNBC TV18",related:"INFY",tag:"Business"}];
  res.json(news);
});

app.get('/api/config', (req,res)=>{
  res.json({
    admob:{android:{appId:process.env.ADMOB_APP_ID_ANDROID||"ca-app-pub-3940256099942544~3347511713",bannerHome:process.env.ADMOB_BANNER_HOME||"ca-app-pub-3940256099942544/6300978111",bannerStock:process.env.ADMOB_BANNER_STOCK||"ca-app-pub-3940256099942544/6300978111"},ios:{appId:process.env.ADMOB_APP_ID_IOS||"ca-app-pub-3940256099942544~1458002511",bannerHome:process.env.ADMOB_BANNER_HOME_IOS||"ca-app-pub-3940256099942544/2934735716",bannerStock:process.env.ADMOB_BANNER_STOCK_IOS||"ca-app-pub-3940256099942544/2934735716"},policy:{enabled:true}},
    features:{watchlists:false,alerts:false,portfolios:false,mutualFunds:false,etfs:false,ipos:false,premium:false},
    dataDisclaimer:"For informational purposes only. Not financial advice."
  });
});

module.exports = app;
