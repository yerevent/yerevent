// yerevent sync robot
// Fetches events from the Google Apps Script API and saves them to events.json.
// The website reads events.json (served by GitHub Pages), so visitors never
// depend on Google being up. If the fetch fails or the data looks wrong,
// this script exits WITHOUT touching events.json — the last good snapshot stays.

const fs = require('fs');
const path = require('path');

const API_URL = 'https://script.google.com/macros/s/AKfycbyCsVTwsBMazq5vn5ZOzE4BEmW2QdiGbyjUtIXPgrmevkUGd-fN1etI2GHeGC0cf3UvsA/exec';
const OUT_FILE = path.join(__dirname, '..', 'events.json');
const TIMEOUT_MS = 60000;

async function main() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let raw;
  try {
    const res = await fetch(API_URL, { signal: controller.signal, redirect: 'follow' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    raw = await res.json();
  } finally {
    clearTimeout(timer);
  }

  if (!Array.isArray(raw)) throw new Error('Response is not a list of events');

  const valid = raw.filter(ev => ev && typeof ev === 'object' && ev.name && ev.Date);
  if (valid.length === 0) throw new Error('No valid events (need at least one with name + Date)');

  // Guard against a half-broken sheet: refuse to shrink the snapshot by more than half.
  if (fs.existsSync(OUT_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
      if (Array.isArray(prev) && prev.length >= 4 && valid.length < prev.length / 2) {
        throw new Error(`Event count dropped from ${prev.length} to ${valid.length} — refusing to overwrite`);
      }
    } catch (e) {
      if (String(e.message).includes('refusing to overwrite')) throw e;
      // previous file unreadable/corrupt — overwriting it is an improvement
    }
  }

  fs.writeFileSync(OUT_FILE, JSON.stringify(valid, null, 1) + '\n');
  console.log(`Saved ${valid.length} events to events.json`);
}

main().catch(err => {
  console.error('Sync failed, keeping last good events.json:', err.message);
  process.exit(1);
});
