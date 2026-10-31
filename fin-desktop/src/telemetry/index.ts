/**
 * FinDesktop telemetry — opt-in usage analytics + structured logging.
 *
 * Pure, framework-agnostic. The runtime wires real sinks (rotating files, remote HTTP,
 * crash reporter) behind these interfaces.
 */

export * from './events';
export * from './telemetry';
export * from './logger';
