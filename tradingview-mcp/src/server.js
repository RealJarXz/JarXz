#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import express from 'express';
import { registerWsFeedTools } from './wsfeed.js';

const useHttp = process.argv.includes('--http') || !!process.env.PORT;

if (useHttp) {
  const app = express();
  const transports = new Map();

  // SSE endpoint — Claude Code web connects here
  app.get('/sse', async (req, res) => {
    const server = new McpServer({ name: 'tradingview-mcp', version: '1.0.0' });
    registerWsFeedTools(server);
    const transport = new SSEServerTransport('/messages', res);
    transports.set(transport.sessionId, transport);
    res.on('close', () => transports.delete(transport.sessionId));
    await server.connect(transport);
  });

  // Message endpoint — client posts JSON-RPC here
  app.post('/messages', express.json(), async (req, res) => {
    const transport = transports.get(req.query.sessionId);
    if (!transport) return res.status(404).send('Session not found');
    await transport.handlePostMessage(req, res);
  });

  app.get('/health', (_, res) => res.json({ status: 'ok', server: 'tradingview-mcp' }));

  const port = process.env.PORT || 3000;
  app.listen(port, '0.0.0.0', () =>
    console.log(`TradingView MCP server running on http://0.0.0.0:${port}\n  SSE endpoint: /sse\n  Health:       /health`)
  );
} else {
  // Local stdio mode (used by desktop Claude Code)
  const server = new McpServer({ name: 'tradingview-mcp', version: '1.0.0' });
  registerWsFeedTools(server);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
