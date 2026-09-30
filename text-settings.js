/* Text-chat comfort controls. Preferences are local to this browser. */
(() => {
  const storageKey = 'brindle.text.settings.v1';
  const defaults = {
    fontSize: '16', compact: false, timestamps: true, typing: true,
    enterSends: true, warmAccent: true, focusComposer: false,
  };
  let prefs = { ...defaults };
  try { prefs = { ...defaults, ...(JSON.parse(localStorage.getItem(storageKey)) || {}) }; } catch (_) {}

  const save = () => localStorage.setItem(storageKey, JSON.stringify(prefs));
  const textScreen = () => document.querySelector('[data-screen-label="Text Chat"]');
  const composer = () => document.getElementById('tx-ta');

  function apply() {
    const root = textScreen();
    if (!root) return;
    root.classList.toggle('tx-compact', prefs.compact);
    root.classList.toggle('tx-no-times', !prefs.timestamps);
    root.classList.toggle('tx-no-typing', !prefs.typing);
    root.classList.toggle('tx-cool-accent', !prefs.warmAccent);
    root.style.setProperty('--tx-message-size', `${prefs.fontSize}px`);
    if (prefs.focusComposer && location.hash.startsWith('#/text')) {
      setTimeout(() => composer()?.focus(), 80);
    }
  }

  function toggle(name) {
    prefs[name] = !prefs[name];
    save(); apply(); renderPanel();
  }
  function chooseSize(size) {
    prefs.fontSize = size;
    save(); apply(); renderPanel();
  }
  function button(label, active, fn, title = '') {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = label; b.title = title;
    b.setAttribute('aria-pressed', String(active));
    b.style.cssText = `padding:7px 10px;border-radius:8px;border:1px solid ${active ? '#D9957F' : '#4A443B'};background:${active ? '#523b32' : '#2A2723'};color:#ECE7DD;font-size:12px;cursor:pointer`;
    b.addEventListener('click', fn);
    return b;
  }
  function settingRow(panel, label, description, enabled, handler) {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:14px;padding:10px 0;border-top:1px solid #3D3830';
    const copy = document.createElement('div');
    const strong = document.createElement('div'); strong.textContent = label; strong.style.fontWeight = '600';
    const hint = document.createElement('div'); hint.textContent = description; hint.style.cssText = 'color:#A69D8E;font-size:12px;line-height:1.35;margin-top:2px';
    copy.append(strong, hint);
    row.append(copy, button(enabled ? 'On' : 'Off', enabled, handler)); panel.append(row);
  }
  function renderPanel() {
    const panel = document.getElementById('tx-settings-panel');
    if (!panel) return;
    panel.replaceChildren();
    const heading = document.createElement('div'); heading.textContent = 'Text chat settings'; heading.style.cssText = 'font:600 18px Newsreader,Georgia,serif;margin-bottom:3px';
    const sub = document.createElement('div'); sub.textContent = 'Saved on this device'; sub.style.cssText = 'font-size:12px;color:#A69D8E;margin-bottom:10px';
    const sizes = document.createElement('div'); sizes.style.cssText = 'display:flex;gap:6px;align-items:center;padding:9px 0 10px';
    const sizeLabel = document.createElement('span'); sizeLabel.textContent = 'Message size'; sizeLabel.style.cssText = 'font-size:13px;font-weight:600;margin-right:auto'; sizes.append(sizeLabel);
    [['14','Small'], ['16','Default'], ['18','Large']].forEach(([size, label]) => sizes.append(button(label, prefs.fontSize === size, () => chooseSize(size))));
    panel.append(heading, sub, sizes);
    settingRow(panel, 'Compact messages', 'Tighter spacing in the conversation.', prefs.compact, () => toggle('compact'));
    settingRow(panel, 'Timestamps', 'Show the time next to message authors.', prefs.timestamps, () => toggle('timestamps'));
    settingRow(panel, 'Typing status', 'Show who is currently typing.', prefs.typing, () => toggle('typing'));
    settingRow(panel, 'Enter sends', 'Use Shift + Enter for a new line.', prefs.enterSends, () => toggle('enterSends'));
    settingRow(panel, 'Warm accent', 'Use the peach accent instead of cool blue.', prefs.warmAccent, () => toggle('warmAccent'));
    settingRow(panel, 'Focus composer', 'Place the cursor in the composer when opening Text Chat.', prefs.focusComposer, () => toggle('focusComposer'));
    const footer = document.createElement('div'); footer.style.cssText = 'display:flex;justify-content:space-between;gap:8px;padding-top:12px';
    footer.append(button('Reset defaults', false, () => { prefs = { ...defaults }; save(); apply(); renderPanel(); }));
    footer.append(button('Close', true, () => panel.remove()));
    panel.append(footer);
  }
  function openPanel() {
    const root = textScreen(); if (!root) return;
    const old = document.getElementById('tx-settings-panel'); if (old) { old.remove(); return; }
    const panel = document.createElement('aside'); panel.id = 'tx-settings-panel'; panel.setAttribute('aria-label', 'Text chat settings');
    panel.style.cssText = 'position:absolute;z-index:30;right:14px;top:58px;width:min(390px,calc(100vw - 28px));max-height:calc(100vh - 86px);overflow:auto;padding:14px;background:#1F1D1A;border:1px solid #4A443B;border-radius:12px;box-shadow:0 18px 48px #0009;color:#ECE7DD';
    root.style.position = 'relative'; root.append(panel); renderPanel();
  }
  function install() {
    const root = textScreen(); if (!root) return;
    apply();
    const header = root.firstElementChild;
    if (header && !document.getElementById('tx-settings-button')) {
      const b = document.createElement('button'); b.id = 'tx-settings-button'; b.type = 'button'; b.textContent = 'Text settings';
      b.style.cssText = 'padding:5px 10px;border-radius:8px;background:transparent;border:1px solid #3D3830;color:#ECE7DD;font-size:13px;cursor:pointer';
      b.addEventListener('click', openPanel);
      const destination = header.querySelector('div:last-child');
      (destination || header).prepend(b);
    }
    const ta = composer();
    if (ta && !ta.dataset.txSettingsBound) {
      ta.dataset.txSettingsBound = '1';
      ta.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' && !event.shiftKey && !prefs.enterSends) event.stopImmediatePropagation();
      }, true);
    }
  }

  const style = document.createElement('style');
  style.textContent = `
    [data-screen-label="Text Chat"] #tx-scroll [style*="white-space:pre-wrap"] { font-size:var(--tx-message-size,16px)!important; }
    [data-screen-label="Text Chat"].tx-compact #tx-scroll [style*="padding:"] { padding-top:3px!important; padding-bottom:0!important; }
    [data-screen-label="Text Chat"].tx-no-times #tx-scroll time { display:none!important; }
    [data-screen-label="Text Chat"].tx-no-typing #tx-scroll + div [role="status"] > span:first-child { display:none!important; }
    [data-screen-label="Text Chat"].tx-cool-accent #tx-settings-button { border-color:#7295A8!important; color:#B9D7E6!important; }
    #tx-settings-button:hover { background:#34302A!important; }
  `;
  document.head.append(style);
  new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('hashchange', () => setTimeout(install, 20));
  install();
})();
