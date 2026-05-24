export interface SymbolConfig {
  id: string;
  name: string;
  isFeatured?: boolean;
}

export const SYMBOLS_LIST: SymbolConfig[] = [
  // Top Featured
  { id: "BTC", name: "Bitcoin", isFeatured: true },
  { id: "ETH", name: "Ethereum", isFeatured: true },
  { id: "SOL", name: "Solana", isFeatured: true },
  { id: "BNB", name: "BNB Chain", isFeatured: true },
  { id: "LINK", name: "Chainlink", isFeatured: true },
  { id: "LTC", name: "Litecoin", isFeatured: true },
  { id: "XRP", name: "Ripple", isFeatured: true },
  { id: "AVAX", name: "Avalanche", isFeatured: true },
  { id: "DOT", name: "Polkadot", isFeatured: true },
  { id: "NEAR", name: "Near Protocol", isFeatured: true },
  
  // More Backtested Pairs
  { id: "ADA", name: "Cardano" },
  { id: "TRX", name: "Tron" },
  { id: "ATOM", name: "Cosmos" },
  { id: "DOGE", name: "Dogecoin" },
  { id: "TON", name: "Toncoin" },
  { id: "UNI", name: "Uniswap" },
  { id: "AAVE", name: "Aave" },
  { id: "OP", name: "Optimism" },
  { id: "APT", name: "Aptos" },
  { id: "SUI", name: "Sui" },
  { id: "WLD", name: "Worldcoin" },
  { id: "FIL", name: "Filecoin" },
  { id: "ICP", name: "Internet Computer" },
  { id: "INJ", name: "Injective" },
  { id: "FET", name: "Fetch.ai" },
  { id: "ALGO", name: "Algorand" },
  { id: "HBAR", name: "Hedera" },
  { id: "BCH", name: "Bitcoin Cash" },
  { id: "MATIC", name: "Polygon" },
  { id: "CHZ", name: "Chiliz" },
  { id: "PEPE", name: "Pepe" },
  { id: "RENDER", name: "Render" },
  { id: "TAO", name: "Bittensor" },
  { id: "ENA", name: "Ethena" },
  { id: "ALT", name: "Altlayer" },
  { id: "GMT", name: "STEPN" },
  { id: "ZEC", name: "Zcash" },
  { id: "DASH", name: "Dash" },
  { id: "COS", name: "Contentos" },
  { id: "UTK", name: "xMoney" },
  { id: "FIDA", name: "Bonfida" },
  { id: "LUNC", name: "Terra Classic" }
];

export const TIMEFRAMES = [
  { id: "15m", label: "15m Chart", sub: "Scalp Regime" },
  { id: "1h", label: "1H Chart", sub: "Intraday Swing" },
  { id: "4h", label: "4H Chart", sub: "V22 Standard" },
  { id: "1d", label: "Daily Chart", sub: "Macro Trend" }
];
