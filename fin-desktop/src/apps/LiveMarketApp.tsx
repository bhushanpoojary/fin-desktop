import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';

type Trade = { id: number; symbol: string; qty: number; price: number };

function LiveMarketApp() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { subscribe } = useDesktopApi();

  subscribe("TRADE_EXECUTED", (trade: Trade) => {
    setTrades(prev => [trade, ...prev]);
  });

  return (
    <div>
      <h2>Live Market</h2>
      <ul>
        {trades.map((trade) => (
          <li key={trade.id}>
            {trade.symbol} - Qty: {trade.qty} - Price: ${trade.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default LiveMarketApp;
