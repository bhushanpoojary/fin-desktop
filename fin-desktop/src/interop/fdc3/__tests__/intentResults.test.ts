import { describe, it, expect } from 'vitest';
import { InteropBroker } from '../broker';
import { DesktopAgent } from '../desktopAgent';
import { AppDirectory } from '../appDirectory';
import { createInstrument } from '../context';

function agents() {
  const directory = new AppDirectory([
    {
      appId: 'chart',
      name: 'Price Chart',
      title: 'Chart',
      description: 'Charts',
      version: '2.1.0',
      publisher: 'FinDesktop',
      icons: [{ src: 'chart.png' }],
      interop: { intents: { listensFor: { ViewChart: { contexts: ['fdc3.instrument'] } } } },
    },
  ]);
  const broker = new InteropBroker({ directory });
  return { a: new DesktopAgent(broker, { appId: 'a' }), b: new DesktopAgent(broker, { appId: 'b' }) };
}

describe('FDC3 intents with results', () => {
  it('resolves a Context result from the handling app', async () => {
    const { a, b } = agents();
    b.addIntentListener('ViewChart', () => createInstrument('AAPL'));
    const resolution = a.raiseIntent('ViewChart', createInstrument('MSFT'));
    const result = await resolution.getResult();
    expect(result).toMatchObject({ type: 'fdc3.instrument', id: { ticker: 'AAPL' } });
  });

  it('resolves a Channel result for streaming intents', async () => {
    const { a, b } = agents();
    const channel = b.createPrivateChannel();
    b.addIntentListener('ViewChart', () => channel);
    const resolution = a.raiseIntent('ViewChart', createInstrument('MSFT'));
    const result = await resolution.getResult();
    expect(result).toMatchObject({ id: channel.id, type: 'private' });
  });

  it('awaits async handler results', async () => {
    const { a, b } = agents();
    b.addIntentListener('ViewChart', async () => createInstrument('ASYNC'));
    const result = await a.raiseIntent('ViewChart', createInstrument('X')).getResult();
    expect(result).toMatchObject({ id: { ticker: 'ASYNC' } });
  });

  it('resolves to undefined when the handler returns nothing', async () => {
    const { a, b } = agents();
    b.addIntentListener('ViewChart', () => {});
    const result = await a.raiseIntent('ViewChart', createInstrument('X')).getResult();
    expect(result).toBeUndefined();
  });

  it('takes the result from the first (resolved) handler', async () => {
    const { a, b } = agents();
    b.addIntentListener('ViewChart', () => createInstrument('FIRST'));
    b.addIntentListener('ViewChart', () => createInstrument('SECOND'));
    const result = await a.raiseIntent('ViewChart', createInstrument('X')).getResult();
    expect(result).toMatchObject({ id: { ticker: 'FIRST' } });
  });
});

describe('FDC3 getAppMetadata', () => {
  it('returns public metadata for a known app', () => {
    const { a } = agents();
    expect(a.getAppMetadata('chart')).toEqual({
      appId: 'chart',
      name: 'Price Chart',
      title: 'Chart',
      description: 'Charts',
      version: '2.1.0',
      publisher: 'FinDesktop',
      icons: [{ src: 'chart.png' }],
      screenshots: undefined,
    });
  });

  it('throws for an unknown app', () => {
    const { a } = agents();
    expect(() => a.getAppMetadata('missing')).toThrow(/No app/);
  });
});
