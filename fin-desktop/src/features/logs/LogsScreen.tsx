import React, { useState, useMemo, useEffect, useRef } from "react";
import { useLogStore } from "../../logging/LogStoreContext";
import type { LogLevel, LogEntry } from "../../logging/types";
import "./LogsScreen.css";

export const LogsScreen: React.FC = () => {
  const { logs, clear } = useLogStore();
  
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  
  const logsEndRef = useRef<HTMLDivElement>(null);
  
  // Get unique sources for the dropdown
  const uniqueSources = useMemo(() => {
    const sources = new Set<string>();
    logs.forEach((log) => sources.add(log.source));
    return Array.from(sources).sort();
  }, [logs]);
  
  // Filter logs based on current filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Level filter
      if (levelFilter !== "all" && log.level !== levelFilter) {
        return false;
      }
      
      // Source filter
      if (sourceFilter && log.source !== sourceFilter) {
        return false;
      }
      
      // Search text filter
      if (searchText) {
        const lowerSearch = searchText.toLowerCase();
        const messageMatch = log.message.toLowerCase().includes(lowerSearch);
        const detailsMatch = log.details
          ? JSON.stringify(log.details).toLowerCase().includes(lowerSearch)
          : false;
        
        if (!messageMatch && !detailsMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [logs, levelFilter, sourceFilter, searchText]);
  
  // Auto-scroll to bottom when logs change
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredLogs, autoScroll]);
  
  const toggleRowExpansion = (logId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };
  
  const formatTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return timestamp;
    }
  };
  
  const getLevelBadgeClass = (level: LogLevel): string => {
    return `log-level-badge log-level-${level}`;
  };
  
  return (
    <div className="logs-screen">
      <div className="logs-header">
        <div className="logs-title">
          <h2>Logs</h2>
          <span className="logs-count">({filteredLogs.length} entries)</span>
        </div>
        <div className="logs-actions">
          <label className="auto-scroll-toggle">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
            />
            Auto-scroll
          </label>
          <button onClick={clear} className="clear-button">
            Clear
          </button>
        </div>
      </div>
      
      <div className="logs-filters">
        <div className="filter-group">
          <label htmlFor="level-filter">Level:</label>
          <select
            id="level-filter"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as LogLevel | "all")}
          >
            <option value="all">All</option>
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>
        
        <div className="filter-group">
          <label htmlFor="source-filter">Source:</label>
          <select
            id="source-filter"
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <option value="">All sources</option>
            {uniqueSources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>
        
        <div className="filter-group search-group">
          <label htmlFor="search-filter">Search:</label>
          <input
            id="search-filter"
            type="text"
            placeholder="Search message or details..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
      </div>
      
      <div className="logs-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th className="col-time">Time</th>
              <th className="col-level">Level</th>
              <th className="col-source">Source</th>
              <th className="col-message">Message</th>
              <th className="col-expand"></th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={5} className="no-logs">
                  No logs to display
                </td>
              </tr>
            ) : (
              filteredLogs.map((log, index) => {
                const isExpanded = expandedRows.has(log.id);
                const hasDetails = log.details !== undefined;
                
                return (
                  <React.Fragment key={log.id}>
                    <tr className={`log-row ${index % 2 === 0 ? "even" : "odd"}`}>
                      <td className="col-time">{formatTime(log.timestamp)}</td>
                      <td className="col-level">
                        <span className={getLevelBadgeClass(log.level)}>
                          {log.level}
                        </span>
                      </td>
                      <td className="col-source">{log.source}</td>
                      <td className="col-message">{log.message}</td>
                      <td className="col-expand">
                        {hasDetails && (
                          <button
                            className="expand-button"
                            onClick={() => toggleRowExpansion(log.id)}
                            aria-label={isExpanded ? "Collapse" : "Expand"}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        )}
                      </td>
                    </tr>
                    {isExpanded && hasDetails && (
                      <tr className="log-details-row">
                        <td colSpan={5}>
                          <pre className="log-details">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};
