export interface StrategyTemplate {
  title: string;
  desc: string;
  prompt: string;
  timeframe: string;
  indicators: string;
  stopLoss: string;
  baseReturn: string;
  baseWinRate: string;
  baseDrawdown: string;
  optReturn: string;
  optWinRate: string;
  optDrawdown: string;
}

export const TEMPLATES: StrategyTemplate[] = [
  {
    title: "Golden Cross Trend",
    desc: "Classic moving average momentum breakout.",
    prompt: "Buy Bitcoin on 4H chart if 50 EMA crosses above 200 EMA with candle closing above trigger, exit on 20 EMA crossover down. Set stop loss to 1.5% ATR.",
    timeframe: "4H Chart",
    indicators: "EMA(50), EMA(200), ATR(14)",
    stopLoss: "1.5x ATR trailing",
    baseReturn: "+184%",
    baseWinRate: "47.2%",
    baseDrawdown: "14.5%",
    optReturn: "+394%",
    optWinRate: "56.8%",
    optDrawdown: "7.1%"
  },
  {
    title: "RSI Mean Reverter",
    desc: "Oversold bounce hunter on volatile alts.",
    prompt: "Long Ethereum on 1H if RSI under 25 and price is above 200 EMA, close when RSI crosses 65 or when price touches the upper Bollinger Band.",
    timeframe: "1H Chart",
    indicators: "RSI(14), EMA(200), BB(20,2)",
    stopLoss: "1.2% fixed stop",
    baseReturn: "+238%",
    baseWinRate: "50.1%",
    baseDrawdown: "12.8%",
    optReturn: "+512%",
    optWinRate: "61.4%",
    optDrawdown: "5.4%"
  },
  {
    title: "Volatility Breakout",
    desc: "Squeeze and breakout rider.",
    prompt: "Long Solana on 15m if Bollinger Bands contract to historic low squeeze and breakout upwards. Stop loss at lower band extreme, TP at 2.5R.",
    timeframe: "15m Chart",
    indicators: "BB(20,2) Squeeze, ATR(14)",
    stopLoss: "BB Lower Band",
    baseReturn: "+114%",
    baseWinRate: "42.8%",
    baseDrawdown: "19.2%",
    optReturn: "+324%",
    optWinRate: "54.2%",
    optDrawdown: "8.7%"
  }
];
