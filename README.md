# StandX DUSD ↔ USDT Swap Loop (Final 7.2)

A lightweight in-browser script that automates alternating swaps between **DUSD** and **USDT** on StandX.

> **URL:** https://standx.com/dusd?action=swap

## What this does
- Flips swap direction every round (DUSD ↔ USDT ↔ DUSD …)
- Clicks **MAX** to use full balance each round
- Waits until the “YOU WILL RECEIVE” field stabilizes
- Tries to submit using `form.requestSubmit()`; if absent, it fires a realistic pointer/mouse event sequence
- Clears the console **each round** for clean logs
- Waits a **random 15–30 seconds** between rounds for your wallet confirmation (e.g., Rabby)
- Stops after `maxCycles` (default 100) or when you call `stop()`

> ⚠️ Some sites may block synthetic clicks (`event.isTrusted === false`). This script already tries more realistic pointer sequences and `form.requestSubmit()`. If the site hard-blocks synthetic events, consider Playwright/Puppeteer or calling contracts/SDKs directly.

---

## Quick Start (copy–paste)
1. Open **Chrome/Brave** (desktop recommended).
2. Go to **https://standx.com/dusd?action=swap** and connect your wallet.
3. Open **DevTools → Console** (F12).
4. Paste the contents of [`standx-swap-loop.js`](./standx-swap-loop.js) into the console and press **Enter**.
5. The script starts automatically. To stop at any time, run:
   ```js
   stop();
   ```

### Download files
- [Download README.md](sandbox:/mnt/data/README.md)
- [Download standx-swap-loop.js](sandbox:/mnt/data/standx-swap-loop.js)

---

## Bookmarklet (optional)
Create a bookmark and set its URL to this (one-line) code. Clicking the bookmark on the StandX page will inject and run the script.

```text
javascript:(()=>{const u='https://raw.githubusercontent.com/tyleraz/standx-swap-loop/refs/heads/main/standx-swap-loop.js';fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error('HTTP '+r.status);return r.text()}).then(code=>{console.log('[StandX] Loaded from',u);(0,eval)(code)}).catch(err=>{alert('Failed to load standx-swap-loop.js: '+err);console.error(err);});})();
```
> For safety, **host the JS yourself** (e.g., GitHub Pages, raw.githubusercontent.com). Bookmarklets running third‑party URLs can be risky.

---

## Configuration
Open `standx-swap-loop.js` and tweak these if needed:

- `const maxCycles = 100` — number of rounds to run.
- Delay knobs are inline and commented. The wait between rounds is randomized **15–30 seconds**.

Runtime helpers (in console):
```js
start(); // start loop (auto-called on load)
stop();  // stop loop at the end of the current wait
```

---

## Troubleshooting
- **No wallet popup / no action:** the site may require trusted user input (`isTrusted = true`). This script tries `form.requestSubmit()` and realistic pointer events; if still blocked, use Playwright/Puppeteer or call contracts/SDKs directly.
- **Couldn’t find buttons:** the site UI or classes may change. Update the selectors in `clickFlipButton`, `clickMaxButton`, and `clickFinalSwapButton`.
- **MAX not applied:** ensure you have balance on the “from” side *after flip*; the script flips first, then MAX.

---

## Safety
- Use only on pages you trust with wallets you control.
- Review and run the script in the console so you fully understand what it does.
- This project is provided “as is”, without warranties. Use at your own risk.
