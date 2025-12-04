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

function LiveMarketApp() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const { subscribe } = useDesktopApi();

  subscribe("TRADE_EXECUTED", (trade: Trade) => {
    setTrades(prev => [trade, ...prev]);
  });

  return (
    <div>
      <h2>Live Market</h2>
      <DataGrid
        columns={columns}
        rows={trades}
        pageSize={10}
        theme="quartz"
      />
    </div>
  );
}

export default LiveMarketApp;
