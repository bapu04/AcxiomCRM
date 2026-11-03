import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';
import path from 'path';

const ASSETS_DIR = '/Users/ptattvamasi/Documents/AcxiomCRM/report_assets';
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function fetchJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function loginBackend() {
  const payload = JSON.stringify({
    username: 'investigator',
    password: 'password123',
  });

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 8080,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Backend login failed: ' + data));
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

class CDPClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.id = 1;
    this.callbacks = new Map();
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.callbacks.has(msg.id)) {
          const { resolve, reject } = this.callbacks.get(msg.id);
          this.callbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message));
          } else {
            resolve(msg.result);
          }
        }
      };
    });
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.id++;
      this.callbacks.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    return res.result?.value;
  }

  async captureScreenshot(filename) {
    const res = await this.send('Page.captureScreenshot', { format: 'png', quality: 95 });
    const buffer = Buffer.from(res.data, 'base64');
    const outPath = path.join(ASSETS_DIR, filename);
    fs.writeFileSync(outPath, buffer);
    console.log(`Saved screenshot: ${outPath} (${buffer.length} bytes)`);
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  console.log('1. Authenticating with backend...');
  const authData = await loginBackend();
  console.log('Logged in as:', authData.username, 'Role:', authData.role);

  console.log('2. Spawning headless Chrome on port 9222...');
  const profileDir = `/tmp/chrome-cdp-profile-${Date.now()}`;
  const chrome = spawn(
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    [
      '--headless=new',
      '--remote-debugging-port=9222',
      `--user-data-dir=${profileDir}`,
      '--window-size=1440,900',
      '--disable-gpu',
      '--no-first-run',
      '--no-default-browser-check',
      'about:blank',
    ],
    { stdio: 'ignore' }
  );

  // Wait for Chrome CDP port to be open
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await sleep(300);
    try {
      const list = await fetchJson('http://127.0.0.1:9222/json/list');
      if (list && list.length > 0 && list[0].webSocketDebuggerUrl) {
        wsUrl = list[0].webSocketDebuggerUrl;
        break;
      }
    } catch (e) {
      // wait
    }
  }

  if (!wsUrl) {
    chrome.kill();
    throw new Error('Failed to connect to Chrome DevTools Protocol');
  }

  console.log('3. Connecting to CDP at:', wsUrl);
  const client = new CDPClient(wsUrl);
  await client.connect();

  await client.send('Page.enable');
  await client.send('Runtime.enable');

  console.log('4. Navigating to frontend http://localhost:5173/ ...');
  await client.send('Page.navigate', { url: 'http://localhost:5173/' });
  await sleep(1500);

  console.log('5. Injecting JWT auth into localStorage...');
  const userJson = JSON.stringify({
    username: authData.username,
    role: authData.role,
    fullName: authData.fullName,
  });
  await client.evaluate(`
    localStorage.setItem('fraudgraph_token', ${JSON.stringify(authData.token)});
    localStorage.setItem('fraudgraph_user', ${JSON.stringify(userJson)});
    window.location.reload();
  `);

  console.log('6. Waiting for Dashboard to load...');
  await sleep(3000);

  // Capture Dashboard View
  console.log('Capturing Dashboard view...');
  await client.captureScreenshot('screenshot_dashboard.png');

  // Navigate to Live Stream
  console.log('Switching to Live Stream tab...');
  await client.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Live Stream'));
    if (btn) btn.click();
  `);
  await sleep(2000);
  await client.captureScreenshot('screenshot_livestream.png');

  // Navigate to Topology Visualizer
  console.log('Switching to Fraud Topology tab...');
  await client.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Graph') || b.textContent.includes('Topology'));
    if (btn) btn.click();
  `);
  await sleep(2500);
  await client.captureScreenshot('screenshot_topology.png');

  // Navigate to Investigation Queue
  console.log('Switching to Investigation Queue tab...');
  await client.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Investigation') || b.textContent.includes('Queue'));
    if (btn) btn.click();
  `);
  await sleep(2000);
  await client.captureScreenshot('screenshot_investigation.png');

  // Open an XAI Modal by clicking the first Inspect / Review button
  console.log('Opening XAI drill-down modal...');
  await client.evaluate(`
    const inspectBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Investigate') || b.textContent.includes('Inspect') || b.textContent.includes('Review') || b.textContent.includes('View'));
    if (inspectBtn) inspectBtn.click();
  `);
  await sleep(1500);
  await client.captureScreenshot('screenshot_xai_modal.png');

  // Close modal if open (press Esc or click backdrop/close)
  await client.evaluate(`
    const closeBtn = document.querySelector('button[aria-label="Close"]') || Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('✕') || b.textContent.includes('Close'));
    if (closeBtn) closeBtn.click();
  `);
  await sleep(500);

  // Navigate to Simulator Workbench
  console.log('Switching to Simulator Workbench tab...');
  await client.evaluate(`
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Simulator'));
    if (btn) btn.click();
  `);
  await sleep(2000);
  await client.captureScreenshot('screenshot_simulator.png');

  client.close();
  chrome.kill();
  console.log('All screenshots captured successfully!');
}

main().catch((err) => {
  console.error('Capture script error:', err);
  process.exit(1);
});
