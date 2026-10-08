'use strict';
/*
 * Zero-dependency local server: serves ./public and mounts the Netlify function at /api/explain.
 *   npm run dev      ->  http://localhost:8888
 * Put FEATHERLESS_API_KEY in a .env file (see .env.example) to try the real AI explanation locally.
 * Without a key the app still works and shows its offline explanation.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

// Minimal .env loader (KEY=value per line).
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !(m[1] in process.env)) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
  }
} catch (e) { /* no .env file: fine */ }

const { handler } = require('./netlify/functions/explain.js');
const PUBLIC_DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.json': 'application/json',
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/explain') {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', async () => {
      const out = await handler({ httpMethod: req.method, body: Buffer.concat(chunks).toString('utf8'), isBase64Encoded: false });
      res.writeHead(out.statusCode, out.headers);
      res.end(out.body);
    });
    return;
  }

  let rel = decodeURIComponent(url.pathname);
  if (rel.endsWith('/')) rel += 'index.html';
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
});

const port = process.env.PORT || 8888;
server.listen(port, () => console.log('Pulli running at http://localhost:' + port +
  (process.env.FEATHERLESS_API_KEY ? ' (AI explanations on)' : ' (no FEATHERLESS_API_KEY: offline explanations only)')));
