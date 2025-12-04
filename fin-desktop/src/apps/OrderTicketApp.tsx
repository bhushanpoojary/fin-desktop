import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';

function OrderTicketApp() {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const { publish } = useDesktopApi();

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    publish("TRADE_EXECUTED", {
      id: Date.now(),
      symbol,
      qty: Number(qty),
      price: Number(price),
    });

    // Clear inputs after publishing
    setSymbol("");
    setQty("");
    setPrice("");
  };

  return (
    <div>
      <h2>Order Ticket</h2>
      <form onSubmit={handleExecuteTrade}>
        <div>
          <label>Symbol: </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
        </div>
        <div>
          <label>Quantity: </label>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
          />
        </div>
        <div>
          <label>Price: </label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <button type="submit">Execute Trade</button>
      </form>
    </div>
  );
}

export default OrderTicketApp;
