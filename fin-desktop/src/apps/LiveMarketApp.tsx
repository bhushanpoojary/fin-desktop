import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';
import { DataGrid } from 'react-open-source-grid';
import type { Column } from 'react-open-source-grid';
import 'react-open-source-grid/dist/lib/index.css';

type Trade = { id: number; symbol: string; qty: number; price: number };

const columns: Column[] = [
  {
    field: 'id',
    headerName: 'Id',
    width: 100,
    sortable: true
  },
  {
    field: 'symbol',
    headerName: 'Symbol',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    field: 'qty',
    headerName: 'Quantity',
    width: 150,
    sortable: true,
    filterable: true
  },
  {
    field: 'price',
    headerName: 'Price',
    width: 150,
    sortable: true,
    filterable: true
  },
];

const initialTrades: Trade[] = [
  { id: 1, symbol: 'AAPL', qty: 100, price: 178.25 },
  { id: 2, symbol: 'GOOGL', qty: 50, price: 142.80 },
  { id: 3, symbol: 'MSFT', qty: 75, price: 378.90 },
  { id: 4, symbol: 'TSLA', qty: 200, price: 242.15 },
  { id: 5, symbol: 'AMZN', qty: 30, price: 155.60 },
  { id: 6, symbol: 'META', qty: 60, price: 485.20 },
  { id: 7, symbol: 'NVDA', qty: 45, price: 495.75 },
  { id: 8, symbol: 'AMD', qty: 120, price: 142.30 },
];

function LiveMarketApp() {
  const [trades, setTrades] = useState<Trade[]>(initialTrades);
  const { subscribe } = useDesktopApi();

  subscribe("TRADE_EXECUTED", (trade: Trade) => {
    setTrades(prev => [trade, ...prev]);
  });

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Live Market</h2>
      <div style={{ flex: 1 }}>
        <DataGrid
          columns={columns}
          rows={trades}
          pageSize={10}
          theme="quartz"
        />
      </div>
    </div>
  );
}

export default LiveMarketApp;
