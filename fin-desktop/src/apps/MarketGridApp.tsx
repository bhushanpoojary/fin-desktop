/**
 * Market Grid App - Example Usage of FDC3 Intents
 * 
 * Demonstrates how to raise intents when users interact with market data:
 * - View chart for a symbol
 * - View news for a symbol
 * - Open trade ticket for a symbol
 */

import React, { useState, useEffect } from "react";
import "./MarketGridApp.css";

// Sample market data
interface MarketRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const SAMPLE_DATA: MarketRow[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 178.25, change: 2.45, changePercent: 1.39 },
  { symbol: "MSFT", name: "Microsoft Corporation", price: 378.91, change: -1.23, changePercent: -0.32 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 140.15, change: 3.78, changePercent: 2.77 },
  { symbol: "AMZN", name: "Amazon.com Inc.", price: 151.94, change: 0.87, changePercent: 0.58 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 238.72, change: -5.43, changePercent: -2.22 },
  { symbol: "META", name: "Meta Platforms Inc.", price: 338.89, change: 4.21, changePercent: 1.26 },
  { symbol: "NVDA", name: "NVIDIA Corporation", price: 495.22, change: 12.34, changePercent: 2.56 },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", price: 157.88, change: -0.92, changePercent: -0.58 },
];

interface MarketGridAppProps {
  // The app should receive desktopApi via props or hook
  desktopApi?: typeof window.desktopApi;
}

export const MarketGridApp: React.FC<MarketGridAppProps> = ({ desktopApi }) => {
  const [selectedRow, setSelectedRow] = useState<string | null>(null);
  const [contextMenuData, setContextMenuData] = useState<{
    symbol: string;
    x: number;
    y: number;
  } | null>(null);

  // Get desktopApi from window if not provided via props
  const api = desktopApi || window.desktopApi;

  // Debug: Check API on mount
  useEffect(() => {
    console.log('🔍 MarketGridApp mounted');
    console.log('  - api available:', !!api);
    console.log('  - api.raiseIntent available:', typeof api?.raiseIntent);
    console.log('  - window.desktopApi:', !!window.desktopApi);
    console.log('  - window.desktopApi.raiseIntent:', typeof window.desktopApi?.raiseIntent);
  }, [api]);

  const handleRowClick = (symbol: string) => {
    setSelectedRow(symbol);
  };

  const handleRowDoubleClick = (symbol: string) => {
    // Double-click opens chart by default
    handleViewChart(symbol);
  };

  const handleContextMenu = (e: React.MouseEvent, symbol: string) => {
    e.preventDefault();
    setContextMenuData({
      symbol,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const closeContextMenu = () => {
    setContextMenuData(null);
  };

  const handleViewChart = async (symbol: string) => {
    try {
      if (!api) {
        alert("DesktopApi not available. Please ensure the app is running in the proper environment.");
        return;
      }

      if (!api.raiseIntent) {
        alert("FDC3 Intent system not initialized. Please check the console for initialization errors.");
        console.error("raiseIntent not available on desktopApi. FDC3 intents may not be initialized.");
        return;
      }

      const resolution = await api.raiseIntent("ViewChart", {
        instrument: symbol,
      });

      console.log(`✅ Chart opened for ${symbol}:`, resolution);
      closeContextMenu();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Don't show alert for user cancellation
      if (message.includes("cancelled") || message.includes("canceled")) {
        console.log(`ℹ️ User cancelled chart for ${symbol}`);
      } else {
        console.error("Failed to open chart:", error);
        alert(`Failed to open chart: ${message}`);
      }
    }
  };

  const handleViewNews = async (symbol: string) => {
    try {
      if (!api) {
        alert("DesktopApi not available. Please ensure the app is running in the proper environment.");
        return;
      }

      if (!api.raiseIntent) {
        alert("FDC3 Intent system not initialized. Please check the console for initialization errors.");
        console.error("raiseIntent not available on desktopApi. FDC3 intents may not be initialized.");
        return;
      }

      const resolution = await api.raiseIntent("ViewNews", {
        instrument: symbol,
      });

      console.log(`✅ News opened for ${symbol}:`, resolution);
      closeContextMenu();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Don't show alert for user cancellation
      if (message.includes("cancelled") || message.includes("canceled")) {
        console.log(`ℹ️ User cancelled news for ${symbol}`);
      } else {
        console.error("Failed to open news:", error);
        alert(`Failed to open news: ${message}`);
      }
    }
  };

  const handleTrade = async (symbol: string, side: "BUY" | "SELL") => {
    try {
      if (!api) {
        alert("DesktopApi not available. Please ensure the app is running in the proper environment.");
        return;
      }

      if (!api.raiseIntent) {
        alert("FDC3 Intent system not initialized. Please check the console for initialization errors.");
        console.error("raiseIntent not available on desktopApi. FDC3 intents may not be initialized.");
        return;
      }

      const resolution = await api.raiseIntent("Trade", {
        instrument: symbol,
        side,
        quantity: 100,
      });

      console.log(`Trade ticket opened for ${symbol}:`, resolution);
      closeContextMenu();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      
      // Don't show alert for user cancellation
      if (message.includes("cancelled") || message.includes("canceled")) {
        console.log(`ℹ️ User cancelled trade for ${symbol}`);
      } else {
        console.error("Failed to open trade ticket:", error);
        alert(`Failed to open trade ticket: ${message}`);
      }
    }
  };

  return (
    <div className="market-grid-app" onClick={closeContextMenu}>
      <div className="market-grid-header">
        <h2>Market Overview</h2>
        <p className="market-grid-subtitle">
          Double-click a row to view chart, or right-click for more options
        </p>
      </div>

      <div className="market-grid-container">
        <table className="market-grid-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Name</th>
              <th align="right">Price</th>
              <th align="right">Change</th>
              <th align="right">Change %</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_DATA.map((row) => (
              <tr
                key={row.symbol}
                className={selectedRow === row.symbol ? "selected" : ""}
                onClick={() => handleRowClick(row.symbol)}
                onDoubleClick={() => handleRowDoubleClick(row.symbol)}
                onContextMenu={(e) => handleContextMenu(e, row.symbol)}
              >
                <td className="symbol-cell">{row.symbol}</td>
                <td>{row.name}</td>
                <td align="right">${row.price.toFixed(2)}</td>
                <td
                  align="right"
                  className={row.change >= 0 ? "positive" : "negative"}
                >
                  {row.change >= 0 ? "+" : ""}
                  {row.change.toFixed(2)}
                </td>
                <td
                  align="right"
                  className={row.changePercent >= 0 ? "positive" : "negative"}
                >
                  {row.changePercent >= 0 ? "+" : ""}
                  {row.changePercent.toFixed(2)}%
                </td>
                <td className="actions-cell">
                  <button
                    className="action-btn chart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewChart(row.symbol);
                    }}
                    title="View Chart"
                  >
                    📈
                  </button>
                  <button
                    className="action-btn news-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewNews(row.symbol);
                    }}
                    title="View News"
                  >
                    📰
                  </button>
                  <button
                    className="action-btn buy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTrade(row.symbol, "BUY");
                    }}
                    title="Buy"
                  >
                    Buy
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      {contextMenuData && (
        <div
          className="market-grid-context-menu"
          style={{
            left: contextMenuData.x,
            top: contextMenuData.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="context-menu-header">{contextMenuData.symbol}</div>
          <button onClick={() => handleViewChart(contextMenuData.symbol)}>
            📈 View Chart
          </button>
          <button onClick={() => handleViewNews(contextMenuData.symbol)}>
            📰 View News
          </button>
          <div className="context-menu-divider" />
          <button onClick={() => handleTrade(contextMenuData.symbol, "BUY")}>
            💰 Buy {contextMenuData.symbol}
          </button>
          <button onClick={() => handleTrade(contextMenuData.symbol, "SELL")}>
            💸 Sell {contextMenuData.symbol}
          </button>
        </div>
      )}
    </div>
  );
};
