import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, Linking, Alert } from 'react-native';
import Svg, { Polyline, Line, Circle } from 'react-native-svg';

const WIDTH = Dimensions.get('window').width;
const API_BASE = 'https://tradeview-in.onrender.com'; // <-- REPLACE WITH YOUR RENDER LINK

// AFFILIATE LINKS - REPLACE WITH YOUR OWN
const AFFILIATE_LINKS = {
  zerodha: 'https://zerodha.com/open-account?c=YOUR_CODE', // Get from partners.zerodha.com
  angel: 'https://www.angelone.in/open-demat-account?c=YOUR_CODE',
  upstox: 'https://upstox.com/open-demat-account/?f=YOUR_CODE',
};

const OPTION_CHAIN = [
  { strike: 24200, callLTP: 380.5, callOI: '12.4L', putLTP: 45.2, putOI: '8.2L', atm: false },
  { strike: 24300, callLTP: 295.4, callOI: '18.2L', putLTP: 62.8, putOI: '10.5L', atm: false },
  { strike: 24400, callLTP: 210.2, callOI: '25.6L', putLTP: 88.5, putOI: '15.2L', atm: false },
  { strike: 24500, callLTP: 135.8, callOI: '42.1L', putLTP: 125.3, putOI: '28.4L', atm: true },
  { strike: 24600, callLTP: 85.4, callOI: '30.2L', putLTP: 178.9, putOI: '32.1L', atm: false },
];

type Leg = { type: 'CE' | 'PE', action: 'BUY' | 'SELL', strike: number, premium: number, lot: number };
const STRATEGIES: Record<string, Leg[]> = {
  'Long Straddle': [{ type: 'CE', action: 'BUY', strike: 24500, premium: 135.8, lot: 50 }, { type: 'PE', action: 'BUY', strike: 24500, premium: 125.3, lot: 50 }],
  'Iron Condor': [
    { type: 'PE', action: 'BUY', strike: 24200, premium: 45.2, lot: 50 },
    { type: 'PE', action: 'SELL', strike: 24300, premium: 62.8, lot: 50 },
    { type: 'CE', action: 'SELL', strike: 24700, premium: 48.2, lot: 50 },
    { type: 'CE', action: 'BUY', strike: 24800, premium: 25.8, lot: 50 },
  ],
};

function PayoffChart({ legs }: { legs: Leg[] }) {
  const points = useMemo(() => {
    const spots: number[] = []; const payoffs: number[] = [];
    for (let spot = 23500; spot <= 25500; spot += 50) {
      let pnl = 0;
      legs.forEach(leg => {
        let v = leg.type === 'CE' ? Math.max(0, spot - leg.strike) - leg.premium : Math.max(0, leg.strike - spot) - leg.premium;
        if (leg.action === 'SELL') v = -v;
        pnl += v * leg.lot;
      });
      spots.push(spot); payoffs.push(pnl);
    }
    return { spots, payoffs };
  }, [legs]);
  const minP = Math.min(...points.payoffs), maxP = Math.max(...points.payoffs);
  const range = maxP - minP || 1;
  const svgW = WIDTH - 48, svgH = 140;
  const polyPoints = points.spots.map((s, i) => `${((s - 23500) / 2000) * svgW},${svgH - ((points.payoffs[i] - minP) / range) * svgH}`).join(' ');
  const zeroY = svgH - ((0 - minP) / range) * svgH;
  return (
    <View style={styles.chartBox}>
      <Svg width={svgW} height={svgH}>
        <Line x1={0} y1={zeroY} x2={svgW} y2={zeroY} stroke="#333" strokeDasharray="4 4" />
        <Polyline points={polyPoints} fill="none" stroke="#00C853" strokeWidth={2.5} />
      </Svg>
    </View>
  );
}

export default function App() {
  const [isPremium, setIsPremium] = useState(false);
  const [strategyName, setStrategyName] = useState('Long Straddle');
  const legs = STRATEGIES[strategyName];

  const openAffiliate = (broker: keyof typeof AFFILIATE_LINKS) => {
    Linking.openURL(AFFILIATE_LINKS[broker]);
  };

  const buyPremium = () => {
    Alert.alert('Premium ₹199/month', 'Unlock OI Alerts, PCR Alerts, No Ads, All Strategies. Payment via Google Play Billing / Razorpay integration. For demo, unlocking now.', 
    [{ text: 'Unlock Demo', onPress: () => setIsPremium(true) }]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TradeView IN • Pro</Text>
        {isPremium ? <Text style={styles.premiumBadge}>PREMIUM</Text> : <TouchableOpacity onPress={buyPremium} style={styles.premiumBtn}><Text style={styles.premiumBtnText}>Go Premium ₹199</Text></TouchableOpacity>}
      </View>

      <ScrollView style={styles.container}>
        {/* MONETIZATION BANNER 1 - AFFILIATE */}
        <View style={styles.affiliateCard}>
          <Text style={styles.affTitle}>🔥 Open Free Demat Account & Earn ₹200 Brokerage Free</Text>
          <Text style={styles.affSub}>Trade NIFTY F&O with 0 brokerage for 30 days</Text>
          <View style={styles.affRow}>
            <TouchableOpacity onPress={() => openAffiliate('zerodha')} style={[styles.affBtn, { backgroundColor: '#387ed1' }]}><Text style={styles.affBtnText}>Zerodha</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => openAffiliate('angel')} style={[styles.affBtn, { backgroundColor: '#ff6b00' }]}><Text style={styles.affBtnText}>Angel One</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => openAffiliate('upstox')} style={[styles.affBtn, { backgroundColor: '#6237ea' }]}><Text style={styles.affBtnText}>Upstox</Text></TouchableOpacity>
          </View>
          <Text style={styles.affEarn}>You earn ₹500 per account • User gets free account</Text>
        </View>

        {/* ADMOB BANNER PLACEHOLDER */}
        <View style={styles.adBanner}>
          <Text style={styles.adText}>[ AdMob Banner - Finance ads pay ₹80-150 CPM ]{'\n'}ID: ca-app-pub-XXXX/XXXX</Text>
        </View>

        <Text style={styles.sectionTitle}>Strategy Builder {isPremium ? '✅' : '🔒 Premium'}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.keys(STRATEGIES).map(name => (
            <TouchableOpacity key={name} onPress={() => { if (!isPremium && name !== 'Long Straddle') { buyPremium(); return; } setStrategyName(name); }} style={[styles.chip, strategyName === name && styles.chipActive]}>
              <Text style={[styles.chipText, strategyName === name && styles.chipTextActive]}>{name} {(!isPremium && name !== 'Long Straddle') ? '🔒' : ''}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <PayoffChart legs={legs} />

        <View style={styles.statsRow}>
          <View style={styles.statCard}><Text style={styles.statLabel}>Max Profit</Text><Text style={styles.statGreen}>Unlimited</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Max Loss</Text><Text style={styles.statRed}>₹13,055</Text></View>
          <View style={styles.statCard}><Text style={styles.statLabel}>Breakeven</Text><Text style={styles.statWhite}>24,239 / 24,761</Text></View>
        </View>

        {/* PREMIUM LOCKED FEATURE */}
        {!isPremium && (
          <View style={styles.lockBox}>
            <Text style={styles.lockTitle}>🔒 Premium Features Locked</Text>
            <Text style={styles.lockText}>• OI Spike Alerts{'\n'}• PCR &lt;0.7 Alert{'\n'}• All Strategies Unlocked{'\n'}• No Ads</Text>
            <TouchableOpacity onPress={buyPremium} style={styles.unlockBtn}><Text style={styles.unlockText}>Unlock for ₹199/month</Text></TouchableOpacity>
          </View>
        )}

        <Text style={styles.sectionTitle}>Option Chain - NIFTY</Text>
        {OPTION_CHAIN.map(r => (
          <View key={r.strike} style={[styles.ocRow, r.atm && styles.atmRow]}>
            <Text style={styles.ocCell}>{r.callLTP} ({r.callOI})</Text>
            <Text style={[styles.ocStrike, r.atm && { color: '#FFD600' }]}>{r.strike}</Text>
            <Text style={styles.ocCell}>{r.putLTP} ({r.putOI})</Text>
          </View>
        ))}

        {/* BOTTOM AFFILIATE */}
        <View style={styles.affiliateCard}>
          <Text style={styles.affTitle}>Want to trade this strategy live?</Text>
          <TouchableOpacity onPress={() => openAffiliate('zerodha')} style={styles.ctaBtn}><Text style={styles.ctaText}>Open Zerodha Account - Trade in 5 mins</Text></TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.tabBar}>
        {['Market','F&O','Strategy','Premium'].map(t => (
          <TouchableOpacity key={t} onPress={() => { if (t === 'Premium') buyPremium(); }} style={styles.tab}><Text style={styles.tabText}>{t}</Text></TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#121212' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
  headerTitle: { color: '#fff', fontWeight: '800', fontSize: 18 },
  premiumBtn: { backgroundColor: '#FFD600', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  premiumBtnText: { color: '#000', fontWeight: '800', fontSize: 11 },
  premiumBadge: { backgroundColor: '#00C853', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 10, fontWeight: '800' },
  container: { flex: 1, padding: 12 },
  affiliateCard: { backgroundColor: '#1E1E1E', borderWidth: 1, borderColor: '#333', padding: 14, borderRadius: 14, marginBottom: 12 },
  affTitle: { color: '#fff', fontWeight: '700', fontSize: 13 },
  affSub: { color: '#888', fontSize: 11, marginTop: 4 },
  affRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  affBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  affBtnText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  affEarn: { color: '#00C853', fontSize: 10, marginTop: 8, textAlign: 'center' },
  adBanner: { backgroundColor: '#0f0f0f', borderWidth: 1, borderStyle: 'dashed', borderColor: '#333', padding: 14, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  adText: { color: '#555', fontSize: 10, textAlign: 'center' },
  sectionTitle: { color: '#fff', fontWeight: '700', fontSize: 15, marginVertical: 10 },
  chip: { backgroundColor: '#1E1E1E', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#2a2a2a' },
  chipActive: { backgroundColor: '#fff' },
  chipText: { color: '#888', fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: '#000' },
  chartBox: { backgroundColor: '#1E1E1E', borderRadius: 12, padding: 12, marginTop: 8 },
  statsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  statCard: { flex: 1, backgroundColor: '#1E1E1E', padding: 10, borderRadius: 10, alignItems: 'center' },
  statLabel: { color: '#888', fontSize: 9 },
  statGreen: { color: '#00C853', fontWeight: '800', fontSize: 11, marginTop: 2 },
  statRed: { color: '#FF3D57', fontWeight: '800', fontSize: 11, marginTop: 2 },
  statWhite: { color: '#fff', fontWeight: '700', fontSize: 10, marginTop: 2 },
  lockBox: { backgroundColor: '#1a1a0a', borderWidth: 1, borderColor: '#FFD600', padding: 14, borderRadius: 12, marginTop: 14 },
  lockTitle: { color: '#FFD600', fontWeight: '800', fontSize: 13 },
  lockText: { color: '#ccc', fontSize: 11, marginTop: 6, lineHeight: 16 },
  unlockBtn: { backgroundColor: '#FFD600', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 10 },
  unlockText: { color: '#000', fontWeight: '800' },
  ocRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1E1E1E', padding: 10, borderRadius: 10, marginBottom: 6 },
  atmRow: { backgroundColor: '#222', borderWidth: 1, borderColor: '#333' },
  ocCell: { color: '#fff', width: 90, textAlign: 'center', fontSize: 12 },
  ocStrike: { color: '#fff', width: 70, textAlign: 'center', fontWeight: '700' },
  ctaBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 12 },
  ctaText: { color: '#000', fontWeight: '800', fontSize: 12 },
  tabBar: { flexDirection: 'row', backgroundColor: '#1E1E1E', paddingVertical: 12, borderTopWidth: 1, borderColor: '#2a2a2a' },
  tab: { flex: 1, alignItems: 'center' },
  tabText: { color: '#888', fontSize: 11 },
});
