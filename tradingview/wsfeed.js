import { z } from 'zod';
import { jsonResult } from './_format.js';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { Client } = require('@mathieuc/tradingview');

function wsQuote(symbol) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    const timer = setTimeout(() => {
      client.end();
      reject(new Error(`Timeout fetching quote for ${symbol}`));
    }, 12000);

    client.onConnected(() => {
      const quote = new client.Session.Quote({ fields: 'all' });
      const market = new quote.Market(symbol);

      market.onData((data) => {
        if (data.lp !== undefined) {
          clearTimeout(timer);
          const result = { ...market.lastData, ...data };
          client.end();
          resolve(result);
        }
      });

      market.onError((...e) => {
        clearTimeout(timer);
        client.end();
        reject(new Error(e.join(' ')));
      });
    });
  });
}

function wsOHLCV(symbol, timeframe = 'D', range = 50) {
  return new Promise((resolve, reject) => {
    const client = new Client();
    const timer = setTimeout(() => {
      client.end();
      reject(new Error(`Timeout fetching OHLCV for ${symbol}`));
    }, 15000);

    client.onConnected(() => {
      const chart = new client.Session.Chart();

      chart.onSymbolLoaded(() => {
        setTimeout(() => {
          const periods = chart.periods.slice(0, range).map((p) => ({
            time: new Date(p.time * 1000).toISOString(),
            open: p.open,
            high: p.high,
            low: p.low,
            close: p.close,
            volume: p.volume,
          }));
          clearTimeout(timer);
          client.end();
          resolve({
            symbol,
            timeframe,
            bars: periods.length,
            latest: periods[0] || null,
            periods,
          });
        }, 1500);
      });

      chart.onError((...e) => {
        clearTimeout(timer);
        client.end();
        reject(new Error(e.join(' ')));
      });

      chart.setMarket(symbol, { timeframe, range });
    });
  });
}

export function registerWsFeedTools(server) {
  server.tool(
    'ws_quote',
    'Get a real-time price quote from TradingView servers via WebSocket — no Desktop app required. Works for crypto (BINANCE:BTCUSDT), stocks, forex, indices.',
    {
      symbol: z.string().describe("TradingView symbol, e.g. 'BINANCE:BTCUSDT', 'NASDAQ:AAPL', 'FX:EURUSD'"),
    },
    async ({ symbol }) => {
      try {
        const data = await wsQuote(symbol);
        return jsonResult({ success: true, symbol, ...data });
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    },
  );

  server.tool(
    'ws_ohlcv',
    'Fetch historical OHLCV candles from TradingView servers via WebSocket — no Desktop app required. Supports any symbol and timeframe.',
    {
      symbol: z.string().describe("TradingView symbol, e.g. 'BINANCE:BTCUSDT'"),
      timeframe: z.string().optional().describe("Timeframe: 1, 5, 15, 60, 240, D, W, M (default: D)"),
      range: z.coerce.number().optional().describe("Number of candles to fetch (default: 50, max: 300)"),
    },
    async ({ symbol, timeframe = 'D', range = 50 }) => {
      try {
        const data = await wsOHLCV(symbol, timeframe, Math.min(range, 300));
        return jsonResult({ success: true, ...data });
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    },
  );

  server.tool(
    'ws_watchlist_quotes',
    'Fetch live quotes for all symbols in your rules.json watchlist via TradingView WebSocket. Returns price, change %, volume for each.',
    {},
    async () => {
      try {
        const { readFileSync } = await import('fs');
        const { createRequire: cr } = await import('module');
        const rulesPath = new URL('../../rules.json', import.meta.url).pathname;
        const rules = JSON.parse(readFileSync(rulesPath, 'utf8'));
        const allSymbols = [
          ...rules.watchlist.majors,
          ...rules.watchlist.alts,
          ...rules.watchlist.macro,
        ];

        const results = await Promise.allSettled(
          allSymbols.map((sym) => wsQuote(sym).then((d) => ({ symbol: sym, ...d }))),
        );

        const quotes = results.map((r, i) =>
          r.status === 'fulfilled'
            ? r.value
            : { symbol: allSymbols[i], error: r.reason?.message },
        );

        return jsonResult({ success: true, count: quotes.length, quotes });
      } catch (err) {
        return jsonResult({ success: false, error: err.message }, true);
      }
    },
  );
}
