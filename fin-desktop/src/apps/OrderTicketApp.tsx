import { useState } from 'react';
import { useDesktopApi } from '../shared/hooks/useDesktopApi';

function OrderTicketApp() {
  const [symbol, setSymbol] = useState("");
  const [qty, setQty] = useState("");
  const [price, setPrice] = useState("");
  const [side, setSide] = useState<"BUY" | "SELL">("BUY");
  const [submitted, setSubmitted] = useState(false);
  const { publish } = useDesktopApi();

  const handleExecuteTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !qty || !price) {
      return;
    }
    
    publish("TRADE_EXECUTED", {
      id: Date.now(),
      symbol: symbol.toUpperCase(),
      qty: Number(qty),
      price: Number(price),
    });

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
      padding: '30px', 
      height: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        padding: '40px',
        width: '100%',
        maxWidth: '500px'
      }}>
        <h2 style={{ 
          margin: '0 0 10px 0', 
          fontSize: '32px', 
          fontWeight: '700',
          color: '#1a1a1a'
        }}>
          Order Ticket
        </h2>
        <p style={{ 
          margin: '0 0 30px 0', 
          color: '#666',
          fontSize: '15px'
        }}>
          Enter trade details to execute
        </p>

        {submitted && (
          <div style={{
            padding: '15px',
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '10px',
            marginBottom: '20px',
            color: '#155724',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            ✓ Trade executed successfully!
          </div>
        )}

        <form onSubmit={handleExecuteTrade}>
          {/* Buy/Sell Toggle */}
          <div style={{ marginBottom: '25px' }}>
            <div style={{ 
              display: 'flex', 
              gap: '10px',
              padding: '4px',
              backgroundColor: '#f0f0f0',
              borderRadius: '12px'
            }}>
              <button
                type="button"
                onClick={() => setSide("BUY")}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: side === "BUY" ? '#10b981' : 'transparent',
                  color: side === "BUY" ? 'white' : '#666',
                  transition: 'all 0.2s ease'
                }}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setSide("SELL")}
                style={{
                  flex: 1,
                  padding: '12px',
                  border: 'none',
                  borderRadius: '10px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  backgroundColor: side === "SELL" ? '#ef4444' : 'transparent',
                  color: side === "SELL" ? 'white' : '#666',
                  transition: 'all 0.2s ease'
                }}
              >
                SELL
              </button>
            </div>
          </div>

          {/* Symbol Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. AAPL"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Quantity Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '600'
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
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Price Input */}
          <div style={{ marginBottom: '25px' }}>
            <label style={{ 
              display: 'block',
              marginBottom: '8px',
              color: '#333',
              fontSize: '14px',
              fontWeight: '600'
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
                padding: '14px 16px',
                fontSize: '16px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                outline: 'none',
                transition: 'all 0.2s ease',
                fontWeight: '500',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Total Value Display */}
          <div style={{
            padding: '16px',
            backgroundColor: '#f9fafb',
            borderRadius: '10px',
            marginBottom: '25px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ 
              color: '#666',
              fontSize: '14px',
              fontWeight: '600'
            }}>
              Total Value
            </span>
            <span style={{ 
              fontSize: '24px',
              fontWeight: '700',
              color: '#1a1a1a'
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
              padding: '16px',
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              backgroundColor: side === "BUY" ? '#10b981' : '#ef4444',
              border: 'none',
              borderRadius: '12px',
              cursor: (!symbol || !qty || !price) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: (!symbol || !qty || !price) ? 0.5 : 1,
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }}
            onMouseOver={(e) => {
              if (symbol && qty && price) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.15)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
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
