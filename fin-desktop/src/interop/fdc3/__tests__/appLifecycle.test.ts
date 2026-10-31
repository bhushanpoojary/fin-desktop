import { describe, it, expect, vi } from 'vitest';
import { InteropBroker } from '../broker';
import { DesktopAgent } from '../desktopAgent';
import { AppDirectory } from '../appDirectory';
import { createInstrument } from '../context';

function directory() {
  return new AppDirectory([
    { appId: 'chart', name: 'Chart', interop: { intents: { listensFor: { ViewChart: { contexts: ['fdc3.instrument'] } } } } },
    { appId: 'news', name: 'News', interop: { intents: { listensFor: { ViewNews: { contexts: ['fdc3.instrument'] } } } } },
  ]);
}

describe('FDC3 app lifecycle', () => {
  it('open launches an app via the injected launcher and returns an AppIdentifier', () => {
    const launcher = vi.fn((appId: string) => `${appId}-1`);
    const broker = new InteropBroker({ directory: directory(), launcher });
    const agent = new DesktopAgent(broker, { appId: 'caller' });

    const id = agent.open('chart', createInstrument('AAPL'));
    expect(id).toEqual({ appId: 'chart', instanceId: 'chart-1' });
    expect(launcher).toHaveBeenCalledWith('chart', expect.objectContaining({ type: 'fdc3.instrument' }));
  });

  it('open rejects unknown apps and a missing launcher', () => {
    const withLauncher = new DesktopAgent(new InteropBroker({ directory: directory(), launcher: () => 'x' }));
    expect(() => withLauncher.open('missing')).toThrow(/No app/);
    const noLauncher = new DesktopAgent(new InteropBroker({ directory: directory() }));
    expect(() => noLauncher.open('chart')).toThrow(/no launcher/);
  });

  it('delivers the open context once to the launched instance', () => {
    const broker = new InteropBroker({ directory: directory(), launcher: (appId) => `${appId}-1` });
    const agent = new DesktopAgent(broker, { appId: 'caller' });
    const { instanceId } = agent.open('chart', createInstrument('AAPL'));
    expect(broker.consumeOpenContext(instanceId!)).toMatchObject({ type: 'fdc3.instrument' });
    expect(broker.consumeOpenContext(instanceId!)).toBeUndefined(); // one-shot
  });

  it('findInstances lists running instances of an app', () => {
    const broker = new InteropBroker({ directory: directory() });
    new DesktopAgent(broker, { appId: 'chart' });
    new DesktopAgent(broker, { appId: 'chart' });
    new DesktopAgent(broker, { appId: 'news' });
    expect(broker.findInstances('chart')).toHaveLength(2);
    expect(broker.findInstances('news')).toHaveLength(1);
    expect(broker.findInstances('unknown')).toEqual([]);
  });

  it('targeted raiseIntent only delivers to the targeted app', () => {
    const broker = new InteropBroker({ directory: directory() });
    const chart = new DesktopAgent(broker, { appId: 'chart' });
    const other = new DesktopAgent(broker, { appId: 'other' });
    const caller = new DesktopAgent(broker, { appId: 'caller' });

    const chartHandler = vi.fn();
    const otherHandler = vi.fn();
    chart.addIntentListener('ViewChart', chartHandler);
    other.addIntentListener('ViewChart', otherHandler);

    const res = caller.raiseIntent('ViewChart', createInstrument('AAPL'), { appId: 'chart' });
    expect(res.deliveredTo).toBe(1);
    expect(chartHandler).toHaveBeenCalledTimes(1);
    expect(otherHandler).not.toHaveBeenCalled();
    expect(res.source).toEqual({ appId: 'chart' });
  });

  it('assigns a unique instanceId per agent', () => {
    const broker = new InteropBroker({ directory: directory() });
    const a = new DesktopAgent(broker, { appId: 'chart' });
    const b = new DesktopAgent(broker, { appId: 'chart' });
    expect(a.getInstanceId()).not.toBe(b.getInstanceId());
  });
});
