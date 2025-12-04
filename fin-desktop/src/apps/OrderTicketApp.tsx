import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';
import { useLogger } from '../logging/useLogger';

function OrderTicketApp() {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [submitted, setSubmitted] = useState(false);
  const { publish } = useDesktopApi();
  const logger = useLogger("OrderTicketApp");

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !qty || !price) {
      logger.warn("Trade submission validation failed", {
        symbol,
        qty,
        price,
        reason: "Missing required fields"
      });
      return;
    }
    
    const tradeData = {
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      qty: Number(qty),
      price: Number(price),
      side,
    };

    publish("TRADE_EXECUTED", tradeData);

    logger.info("Trade executed successfully", tradeData);

    // Show success message
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2000);

    // Clear inputs after publishing
    setSymbol("");
    setQty("");
    setPrice("");
  };

  const totalValue = qty && price ? (Number(qty) * Number(price)).toFixed(2) : "0.00";

  return (
    <div style={{ 
      padding: '16px', 
      height: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '2px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        padding: '20px',
        width: '100%',
        maxWidth: '420px'
      }}>
        <h2 style={{ 
          margin: '0 0 4px 0', 
          fontSize: '16px', 
          fontWeight: '600',
          color: '#ff8c00',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Order Ticket
        </h2>
        <p style={{ 
          margin: '0 0 16px 0', 
          color: '#888',
          fontSize: '11px'
        }}>
          Enter trade details to execute
        </p>

        {submitted && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#1a3a1a',
            border: '1px solid #2d5a2d',
            borderRadius: '2px',
            marginBottom: '12px',
            color: '#4ade80',
            fontSize: '11px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ✓ TRADE EXECUTED
          </div>
        )}

        <form onSubmit={handleExecuteTrade}>
          {/* Buy/Sell Toggle */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '4px',
              backgroundColor: '#0a0a0a',
              border: '1px solid #2a2a2a',
              borderRadius: '2px'
            }}>
              <button
                type="button"
                onClick={() => setSide("BUY")}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: side === "BUY" ? '#00a86b' : 'transparent',
                  color: side === "BUY" ? '#000' : '#666',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.5px'
                }}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: side === "SELL" ? '#dc143c' : 'transparent',
                  color: side === "SELL" ? '#fff' : '#666',
                  transition: 'all 0.15s ease',
                  letterSpacing: '0.5px'
                }}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Symbol Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '4px',
              color: '#ff8c00',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="AAPL"
              required
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '13px',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                outline: 'none',
                transition: 'all 0.15s ease',
                fontWeight: '600',
                boxSizing: 'border-box',
                backgroundColor: '#0a0a0a',
                color: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff8c00'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {/* Quantity Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '4px',
              color: '#ff8c00',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Quantity
            </label>
            <input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              placeholder="0"
              required
              min="1"
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '13px',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                outline: 'none',
                transition: 'all 0.15s ease',
                fontWeight: '600',
                boxSizing: 'border-box',
                backgroundColor: '#0a0a0a',
                color: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff8c00'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {/* Price Input */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '4px',
              color: '#ff8c00',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
              min="0.01"
              style={{
                width: '100%',
                padding: '6px 8px',
                fontSize: '13px',
                border: '1px solid #2a2a2a',
                borderRadius: '2px',
                outline: 'none',
                transition: 'all 0.15s ease',
                fontWeight: '600',
                boxSizing: 'border-box',
                backgroundColor: '#0a0a0a',
                color: '#fff'
              }}
              onFocus={(e) => e.target.style.borderColor = '#ff8c00'}
              onBlur={(e) => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {/* Total Value Display */}
          <div style={{
            padding: '8px 10px',
            backgroundColor: '#0a0a0a',
            border: '1px solid #2a2a2a',
            borderRadius: '2px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: '#ff8c00',
              fontSize: '10px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Value
            </span>
            <span style={{ 
              fontSize: '16px',
              fontWeight: '700',
              color: '#fff'
            }}>
              ${totalValue}
            </span>
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            disabled={!symbol || !qty || !price}
            style={{
              width: '100%',
              padding: '8px 16px',
              fontSize: '11px',
              fontWeight: '700',
              color: side === "BUY" ? '#000' : '#fff',
              backgroundColor: side === "BUY" ? '#00a86b' : '#dc143c',
              border: 'none',
              borderRadius: '2px',
              cursor: (!symbol || !qty || !price) ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              opacity: (!symbol || !qty || !price) ? 0.4 : 1,
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}
            onMouseOver={(e) => {
              if (symbol && qty && price) {
                e.currentTarget.style.opacity = '0.85';
              }
            }}
            onMouseOut={(e) => {
              if (symbol && qty && price) {
                e.currentTarget.style.opacity = '1';
              }
            }}
          >
            Execute {side} Order
          </button>
        </form>
      </div>
    </div>
  );
}

export default OrderTicketApp;
