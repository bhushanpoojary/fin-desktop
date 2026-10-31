import { describe, it, expect } from 'vitest';
import { AppDirectory, type AppDirectoryApp } from '../appDirectory';
import { ContextTypes } from '../context';
import { Intents } from '../intents';

const chartApp: AppDirectoryApp = {
  appId: 'chart',
  name: 'Chart',
  interop: {
    intents: {
      listensFor: {
        [Intents.ViewChart]: { displayName: 'View Chart', contexts: [ContextTypes.Instrument] },
      },
    },
  },
};

const newsApp: AppDirectoryApp = {
  appId: 'news',
  name: 'News',
  interop: {
    intents: {
      listensFor: {
        [Intents.ViewNews]: {
          displayName: 'View News',
          contexts: [ContextTypes.Instrument, ContextTypes.Organization],
        },
      },
    },
  },
};

const multiApp: AppDirectoryApp = {
  appId: 'terminal',
  name: 'Terminal',
  interop: {
    intents: {
      listensFor: {
        [Intents.ViewChart]: { contexts: [ContextTypes.Instrument] },
        [Intents.ViewContact]: { contexts: [ContextTypes.Contact] },
      },
    },
  },
};

function dir() {
  return new AppDirectory([chartApp, newsApp, multiApp]);
}

describe('AppDirectory', () => {
  it('lists and gets apps', () => {
    const d = dir();
    expect(d.getApps().map((a) => a.appId)).toEqual(['chart', 'news', 'terminal']);
    expect(d.getApp('news')?.name).toBe('News');
    expect(d.getApp('missing')).toBeUndefined();
  });

  it('add/remove apps (dedupe by appId)', () => {
    const d = new AppDirectory();
    d.add(chartApp);
    d.add({ ...chartApp, name: 'Chart v2' });
    expect(d.getApps()).toHaveLength(1);
    expect(d.getApp('chart')?.name).toBe('Chart v2');
    d.remove('chart');
    expect(d.getApps()).toHaveLength(0);
  });

  it('findIntent returns all apps handling an intent', () => {
    const result = dir().findIntent(Intents.ViewChart);
    expect(result.intent.name).toBe('ViewChart');
    expect(result.apps.map((a) => a.appId).sort()).toEqual(['chart', 'terminal']);
  });

  it('findIntent narrows by context type', () => {
    const forInstrument = dir().findIntent(Intents.ViewChart, ContextTypes.Instrument);
    expect(forInstrument.apps.map((a) => a.appId).sort()).toEqual(['chart', 'terminal']);

    const forContact = dir().findIntent(Intents.ViewChart, ContextTypes.Contact);
    expect(forContact.apps).toHaveLength(0);
  });

  it('carries the displayName through', () => {
    expect(dir().findIntent(Intents.ViewNews).intent.displayName).toBe('View News');
  });

  it('findIntentsByContext groups intents for a context', () => {
    const results = dir().findIntentsByContext(ContextTypes.Instrument);
    const byName = Object.fromEntries(results.map((r) => [r.intent.name, r.apps.map((a) => a.appId)]));
    expect(byName['ViewChart'].sort()).toEqual(['chart', 'terminal']);
    expect(byName['ViewNews']).toEqual(['news']);
    expect(byName['ViewContact']).toBeUndefined();
  });

  it('findAppsByContext returns apps accepting a context for any intent', () => {
    expect(dir().findAppsByContext(ContextTypes.Contact).map((a) => a.appId)).toEqual(['terminal']);
    expect(dir().findAppsByContext(ContextTypes.Instrument).map((a) => a.appId).sort()).toEqual([
      'chart',
      'news',
      'terminal',
    ]);
  });
});
