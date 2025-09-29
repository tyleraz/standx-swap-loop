// === StandX DUSD ↔ USDT Swap Loop (Final 7.2) ===
// Pointer/Submit sequence + per-cycle console.clear + 15–30s wait
let isRunning = false;
let cycle = 1;
const maxCycles = 100; // limit total rounds

// Generic click by text (used for Flip/Max, kept for flexibility)
function clickElementByText(text, isPartialMatch = false) {
  const elements = document.querySelectorAll('button, div, a, span');
  let foundElement = null;
  const options = { bubbles: true, cancelable: true, view: window };

  for (const el of elements) {
    const elText = (el.textContent || '').trim();
    if (!elText) continue;
    if (isPartialMatch ? elText.includes(text) : elText === text) {
      if (el.tagName === 'BUTTON' || el.classList.contains('cursor-pointer')) {
        foundElement = el; break;
      }
    }
  }
  if (foundElement) {
    foundElement.dispatchEvent(new MouseEvent('click', options));
    console.log("✅ คลิก:", text);
    return true;
  } else {
    console.warn("❌ ไม่พบปุ่ม:", text);
    return false;
  }
}

// Click Flip (direction swap)
function clickFlipButton() {
  const flipBtn = document.querySelector('div.border.p-2.mt-2.cursor-pointer');
  if (flipBtn) {
    flipBtn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    console.log("✅ คลิก: สลับทิศทางการ Swap (Flip)");
    return true;
  } else {
    console.warn("❌ ไม่พบปุ่ม Flip (สลับทิศทาง).");
    return false;
  }
}

// Click MAX (use full balance)
function clickMaxButton() {
  const balanceDivs = document.querySelectorAll('div.text-sm.text-grayscale-700.cursor-pointer.break-keep.text-nowrap.hover\\:underline');
  let maxButton = null;
  for (const div of balanceDivs) {
    const t = (div.textContent || '').trim();
    if (t && t !== 'BALANCE') { maxButton = div; break; }
  }
  if (maxButton) {
    maxButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
    console.log("✅ คลิก: MAX (ใช้ยอด Balance ทั้งหมด)");
    return true;
  } else {
    console.warn("❌ ไม่พบปุ่ม MAX (Balance link).");
    return false;
  }
}

// Wait until the "YOU WILL RECEIVE" input stabilizes
async function waitReceiveAmountStable(timeoutMs = 4000) {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const inputs = Array.from(document.querySelectorAll('div .border input, input'));
  const receiveInput =
    inputs.find(inp => (inp.className || '').includes('text-xl')) ||
    inputs.find(inp => (inp.className || '').includes('font-bold')) ||
    inputs[1] ||
    null;
  if (!receiveInput) return true;

  let last = receiveInput.value, elapsed = 0, stableCount = 0;
  while (elapsed < timeoutMs) {
    await sleep(150); elapsed += 150;
    if (receiveInput.value === last) {
      if (++stableCount >= 3) break; // ~450ms stable
    } else { stableCount = 0; last = receiveInput.value; }
  }
  return true;
}

// Click SWAP using requestSubmit first, then pointer+mouse fallback
async function clickFinalSwapButton() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  await sleep(400);

  const swapBtn = Array.from(document.querySelectorAll('button'))
    .filter(b => b.textContent && b.textContent.trim() === 'SWAP')
    .pop();
  if (!swapBtn) { console.warn("❌ ไม่พบปุ่ม SWAP"); return false; }

  // wait readiness (disabled / aria-disabled / styles like pointer-events)
  let elapsed = 0;
  while (elapsed < 6000) {
    const cs = getComputedStyle(swapBtn);
    const ariaDisabled = swapBtn.getAttribute('aria-disabled') === 'true';
    const disabled = !!swapBtn.disabled;
    const blockedStyle = cs.pointerEvents === 'none' || cs.cursor === 'not-allowed' || Number(cs.opacity) < 0.6;
    if (!disabled && !ariaDisabled && !blockedStyle) break;
    console.log("   -- ปุ่มยังไม่พร้อม (disabled/aria/สไตล์). รอ 300ms...");
    await sleep(300); elapsed += 300;
  }

  swapBtn.focus(); await sleep(30);

  const form = swapBtn.closest('form');
  if (form && typeof form.requestSubmit === 'function') {
    try {
      form.requestSubmit(swapBtn);
      console.log("✅ ส่ง form.requestSubmit() ให้ SWAP แล้ว");
      return true;
    } catch (e) {
      console.warn("   -- requestSubmit มีปัญหา ลองคลิกแบบ pointer ต่อ:", e);
    }
  }

  const evtOpt = { bubbles: true, cancelable: true, view: window, pointerId: 1, isPrimary: true };
  try {
    swapBtn.dispatchEvent(new PointerEvent('pointerover', evtOpt));
    swapBtn.dispatchEvent(new PointerEvent('pointerenter', evtOpt));
    swapBtn.dispatchEvent(new MouseEvent('mouseover', evtOpt));
    swapBtn.dispatchEvent(new MouseEvent('mouseenter', evtOpt));

    swapBtn.dispatchEvent(new PointerEvent('pointerdown', evtOpt));
    swapBtn.dispatchEvent(new MouseEvent('mousedown', evtOpt));
    await new Promise(r => setTimeout(r, 40));
    swapBtn.dispatchEvent(new PointerEvent('pointerup', evtOpt));
    swapBtn.dispatchEvent(new MouseEvent('mouseup', evtOpt));
    await new Promise(r => setTimeout(r, 10));

    swapBtn.click();

    console.log("✅ คลิก SWAP ด้วย pointer+mouse sequence แล้ว");
    return true;
  } catch (e) {
    console.warn("❌ คลิก SWAP ล้มเหลว:", e);
    return false;
  }
}

// Main loop
async function swapLoop() {
  console.clear(); // clear at start
  isRunning = true;
  cycle = 1;
  console.log("🚀 Swap Loop เริ่มทำงาน");

  while (isRunning && cycle <= maxCycles) {
    // clear every cycle
    console.clear();
    console.log(`\n🔄 เริ่มรอบการ Swap #${cycle} (จาก ${maxCycles})`);

    // 1) Flip direction
    console.log(`➡️ ขั้นตอนที่ 1: สลับทิศทางสำหรับรอบ #${cycle}`);
    if (!clickFlipButton()) break;
    await new Promise(r => setTimeout(r, 800));

    // 2) MAX
    console.log("➡️ ขั้นตอนที่ 2: คลิกปุ่ม MAX (100% Amount)...");
    if (!clickMaxButton()) break;

    // Wait until receive field stabilizes
    await waitReceiveAmountStable();

    // 3) SWAP
    console.log("➡️ ขั้นตอนที่ 3: คลิกปุ่ม SWAP...");
    if (!(await clickFinalSwapButton())) break;

    // 4) Wallet confirmation wait (15–30s)
    const randomWaitTime = Math.floor(Math.random() * (30 - 15 + 1) + 15);
    console.log(`\n⚠️ กรุณายืนยันธุรกรรมใน Rabby Wallet (Pop-up) ภายใน ${randomWaitTime} วินาที...`);
    console.log(`⏳ รอ ${randomWaitTime} วินาที ก่อนเริ่มรอบใหม่...`);

    await new Promise(r => setTimeout(r, randomWaitTime * 1000));
    if (!isRunning) break;

    console.log(`\n✅ รอบการ Swap #${cycle} เสร็จสมบูรณ์!`);
    cycle++;
  }

  if (cycle > maxCycles) {
    console.log("🎉 Swap Loop ทำงานครบ 100 รอบแล้ว! การทำงานสิ้นสุดลง");
  } else {
    console.log("🛑 Trade Loop หยุดทำงาน");
  }
  isRunning = false;
}

// Controls
function start() {
  if (isRunning) { console.log("⚠️ สคริปต์กำลังทำงานอยู่แล้ว"); return; }
  swapLoop();
}

function stop() { isRunning = false; }

// Auto-start
start();
