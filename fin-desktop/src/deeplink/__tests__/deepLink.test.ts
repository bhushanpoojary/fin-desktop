import { describe, it, expect, vi } from 'vitest';
import {
  parseDeepLink,
  buildDeepLink,
  handleDeepLink,
  type DeepLinkAction,
} from '../deepLink';

describe('parseDeepLink', () => {
  it('parses a launch-manifest link', () => {
    expect(parseDeepLink('findesktop://launch?manifest=https://cdn.example.com/app.json')).toEqual({
      type: 'launch-manifest',
      manifestUrl: 'https://cdn.example.com/app.json',
    });
  });

  it('parses a launch-app link with optional url', () => {
    expect(parseDeepLink('findesktop://app?appId=blotter')).toEqual({
      type: 'launch-app',
      appId: 'blotter',
      url: undefined,
    });
    expect(parseDeepLink('findesktop://app?appId=blotter&url=https%3A%2F%2Fa.com')).toEqual({
      type: 'launch-app',
      appId: 'blotter',
      url: 'https://a.com',
    });
  });

  it('parses an intent link with a ticker shorthand', () => {
    const action = parseDeepLink('findesktop://intent?name=ViewChart&ticker=AAPL');
    expect(action).toEqual({
      type: 'raise-intent',
      intent: 'ViewChart',
      context: { type: 'fdc3.instrument', name: 'AAPL', id: { ticker: 'AAPL' } },
    });
  });

  it('parses an intent link with a JSON context and the intent alias', () => {
    const context = { type: 'fdc3.contact', name: 'Jo' };
    const link = `findesktop://intent?intent=StartChat&context=${encodeURIComponent(JSON.stringify(context))}`;
    expect(parseDeepLink(link)).toEqual({ type: 'raise-intent', intent: 'StartChat', context });
  });

  it('rejects other protocols and malformed input', () => {
    expect(parseDeepLink('https://example.com')).toBeNull();
    expect(parseDeepLink('not a url')).toBeNull();
    expect(parseDeepLink('findesktop://unknown?x=1')).toBeNull();
  });

  it('rejects links missing required params', () => {
    expect(parseDeepLink('findesktop://launch')).toBeNull();
    expect(parseDeepLink('findesktop://app')).toBeNull();
    expect(parseDeepLink('findesktop://intent')).toBeNull();
  });
});

describe('buildDeepLink + round-trip', () => {
  const actions: DeepLinkAction[] = [
    { type: 'launch-manifest', manifestUrl: 'https://cdn.example.com/app.json' },
    { type: 'launch-app', appId: 'blotter', url: 'https://a.com/x' },
    { type: 'raise-intent', intent: 'ViewChart', context: { type: 'fdc3.instrument', id: { ticker: 'MSFT' } } },
  ];

  it('round-trips every action type', () => {
    for (const action of actions) {
      expect(parseDeepLink(buildDeepLink(action))).toEqual(action);
    }
  });
});

describe('handleDeepLink', () => {
  const handlers = () => ({
    launchManifestUrl: vi.fn(),
    launchApp: vi.fn(),
    raiseIntent: vi.fn(),
  });

  it('dispatches to the matching handler', async () => {
    const h = handlers();
    expect(await handleDeepLink('findesktop://launch?manifest=https://m.json', h)).toBe(true);
    expect(h.launchManifestUrl).toHaveBeenCalledWith('https://m.json');

    await handleDeepLink('findesktop://app?appId=news', h);
    expect(h.launchApp).toHaveBeenCalledWith('news', undefined);

    await handleDeepLink('findesktop://intent?name=ViewNews&ticker=TSLA', h);
    expect(h.raiseIntent).toHaveBeenCalledWith(
      'ViewNews',
      expect.objectContaining({ id: { ticker: 'TSLA' } }),
    );
  });

  it('returns false for an invalid link and calls nothing', async () => {
    const h = handlers();
    expect(await handleDeepLink('https://nope.com', h)).toBe(false);
    expect(h.launchManifestUrl).not.toHaveBeenCalled();
    expect(h.launchApp).not.toHaveBeenCalled();
    expect(h.raiseIntent).not.toHaveBeenCalled();
  });
});
