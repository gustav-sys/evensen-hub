#!/usr/bin/env node
/**
 * Daily email-reminder pipeline for the Evensen Hub campaign board.
 *
 * Reads hub/state AND hub/profiles from Firestore (public REST API; the api key
 * is public by design), decodes the Firestore typed-value format into plain
 * objects, then emails the assigned person `REMINDER_DAYS` before a deliverable's
 * due date — but only if the deliverable is not 'done'. Recipient emails come
 * from hub/profiles, the same directory the app writes when a user logs in
 * (name + work email), keyed by name (trimmed + lowercased) to match the app.
 *
 * No npm dependencies; uses Node global fetch.
 *
 * Env:
 *   SENDGRID_API_KEY  SendGrid API key (required unless DRY_RUN).
 *   SENDGRID_FROM     Verified sender address (required unless DRY_RUN).
 *   DRY_RUN           'true' or '1' => log instead of send; api key not required.
 *   REMINDER_DAYS     Whole days before dueDate to fire. Default 7.
 *
 * Flags:
 *   --self-test       Run the filter/date logic against inline mock data
 *                     (forces DRY_RUN, does not touch Firestore).
 */

// Public Firebase project config (mirrors src/firebase.ts; key is public by design).
const PROJECT_ID = 'evensen-hub';
const API_KEY = 'AIzaSyD82ppbgCIsJJa2tJq6ndFeSpDOdi2o5yw';

const FIRESTORE_BASE =
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const STATE_URL = `${FIRESTORE_BASE}/hub/state?key=${API_KEY}`;
const PROFILES_URL = `${FIRESTORE_BASE}/hub/profiles?key=${API_KEY}`;
const SENDGRID_URL = 'https://api.sendgrid.com/v3/mail/send';

const isTruthy = (v) => v === 'true' || v === '1';

/** name trimmed + lowercased — must match the app's useProfiles nameKeyFor. */
const nameKey = (name) => String(name ?? '').trim().toLowerCase();

// ---------------------------------------------------------------------------
// Firestore REST value decoding
// ---------------------------------------------------------------------------

function decodeValue(value) {
  if (value == null || typeof value !== 'object') return value;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return Number(value.integerValue);
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('arrayValue' in value) {
    const values = value.arrayValue?.values ?? [];
    return values.map(decodeValue);
  }
  if ('mapValue' in value) {
    return decodeFields(value.mapValue?.fields ?? {});
  }
  return undefined;
}

function decodeFields(fields) {
  const out = {};
  for (const [key, value] of Object.entries(fields ?? {})) {
    out[key] = decodeValue(value);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Date math (UTC calendar-date-only to avoid timezone off-by-one)
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parse 'YYYY-MM-DD' as a UTC calendar date (ms at UTC midnight), or null.
 *  Round-trips the value so out-of-range parts (e.g. month 13) are rejected. */
function parseUtcDate(yyyyMmDd) {
  if (typeof yyyyMmDd !== 'string') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(yyyyMmDd.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]) - 1;
  const d = Number(m[3]);
  const ms = Date.UTC(y, mo, d);
  const back = new Date(ms);
  if (
    back.getUTCFullYear() !== y ||
    back.getUTCMonth() !== mo ||
    back.getUTCDate() !== d
  ) {
    return null;
  }
  return ms;
}

function todayUtcMidnight(now = new Date()) {
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

function daysUntilDue(dueDate, now = new Date()) {
  const due = parseUtcDate(dueDate);
  if (due == null) return null;
  return Math.round((due - todayUtcMidnight(now)) / MS_PER_DAY);
}

// ---------------------------------------------------------------------------
// Core: select reminders to send from an AppState + an email directory
// ---------------------------------------------------------------------------

function selectReminders(state, emails, reminderDays, now = new Date()) {
  const reminders = [];
  let checked = 0;
  let due = 0;
  const missingEmail = [];

  const nodes = Array.isArray(state?.nodes) ? state.nodes : [];
  for (const node of nodes) {
    const nodeTitle = node?.title ?? '(untitled section)';
    const deliverables = Array.isArray(node?.deliverables) ? node.deliverables : [];
    for (const d of deliverables) {
      checked++;
      if (!d || !d.dueDate) continue;
      if (d.status === 'done') continue;
      const assignee = typeof d.assignee === 'string' ? d.assignee.trim() : '';
      if (!assignee) continue;
      const diff = daysUntilDue(d.dueDate, now);
      if (diff !== reminderDays) continue;

      due++;
      const title =
        typeof d.title === 'string' && d.title.trim() ? d.title.trim() : '(untitled deliverable)';
      const email = (emails[nameKey(assignee)] ?? '').trim();
      if (!email) {
        missingEmail.push({ node: nodeTitle, title, assignee, dueDate: d.dueDate });
        continue;
      }
      reminders.push({ node: nodeTitle, title, assignee, dueDate: d.dueDate, email });
    }
  }
  return { reminders, checked, due, missingEmail };
}

// ---------------------------------------------------------------------------
// SendGrid
// ---------------------------------------------------------------------------

function whenPhrase(days) {
  if (days <= 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === 7) return 'in 1 week';
  if (days === 14) return 'in 2 weeks';
  return `in ${days} days`;
}

function buildEmail(r, from, reminderDays) {
  const when = whenPhrase(reminderDays);
  const subject = `Reminder: "${r.title}" is due ${when}`;
  const value =
    `Hi ${r.assignee},\n\n` +
    `This is a reminder that the deliverable "${r.title}" ` +
    `(section: ${r.node}) is due ${when}.\n\n` +
    `Assignee: ${r.assignee}\n` +
    `Due date: ${r.dueDate}\n\n` +
    `Please make sure it's on track.\n\n` +
    `— Evensen Hub`;
  return {
    personalizations: [{ to: [{ email: r.email }] }],
    from: { email: from },
    subject,
    content: [{ type: 'text/plain', value }],
  };
}

async function sendViaSendGrid(body, apiKey) {
  return fetch(SENDGRID_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// Firestore reads
// ---------------------------------------------------------------------------

async function fetchDoc(url, label) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    console.warn(`[reminders] ${label} fetch failed: ${err.message}. Continuing.`);
    return null;
  }
  if (res.status === 404) {
    console.warn(`[reminders] ${label} document not found (404).`);
    return null;
  }
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    console.warn(`[reminders] ${label} returned ${res.status}: ${text.slice(0, 200)}.`);
    return null;
  }
  const doc = await res.json();
  if (!doc || !doc.fields) return null;
  return decodeFields(doc.fields);
}

/** Build a { nameKey: email } map from the hub/profiles directory. */
async function fetchEmails() {
  const decoded = await fetchDoc(PROFILES_URL, 'hub/profiles');
  const emails = {};
  if (!decoded) return emails;
  for (const [key, entry] of Object.entries(decoded)) {
    const email = entry && typeof entry.email === 'string' ? entry.email.trim() : '';
    if (!email) continue;
    // The doc keys are already the nameKey; re-key defensively from name too.
    emails[key] = email;
    if (entry.name) emails[nameKey(entry.name)] = email;
  }
  return emails;
}

async function fetchState() {
  return fetchDoc(STATE_URL, 'hub/state');
}

// ---------------------------------------------------------------------------
// Self-test (inline mock; forces DRY_RUN, no Firestore)
// ---------------------------------------------------------------------------

function buildSelfTestState(now) {
  const iso = (offsetDays) => {
    const ms = todayUtcMidnight(now) + offsetDays * MS_PER_DAY;
    return new Date(ms).toISOString().slice(0, 10);
  };
  return {
    nodes: [
      {
        title: 'Launch Section',
        deliverables: [
          { title: 'Press kit', status: 'in-progress', assignee: 'Sofia', dueDate: iso(7) }, // SELECTED
          { title: 'Logo final', status: 'done', assignee: 'Mikkel', dueDate: iso(7) }, // skip: done
          { title: 'Venue booking', status: 'not-started', assignee: 'Ingrid', dueDate: iso(3) }, // skip: window
          { title: 'Budget sheet', status: 'blocked', assignee: 'Lars', dueDate: iso(7) }, // skip: no email
          { title: 'Misc task', status: 'not-started', assignee: '', dueDate: iso(7) }, // skip: unassigned
        ],
      },
    ],
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const args = process.argv.slice(2);
  const selfTest = args.includes('--self-test');

  const dryRun = selfTest || isTruthy(process.env.DRY_RUN ?? '');
  const parsedDays = Number.parseInt(process.env.REMINDER_DAYS ?? '7', 10);
  const reminderDays = Number.isInteger(parsedDays) && parsedDays >= 0 ? parsedDays : 7;
  const apiKey = process.env.SENDGRID_API_KEY ?? '';
  const from = process.env.SENDGRID_FROM ?? '';
  const now = new Date();

  console.log(
    `[reminders] mode=${dryRun ? 'DRY_RUN' : 'SEND'} reminderDays=${reminderDays}` +
      (selfTest ? ' (self-test: inline mock data)' : ''),
  );

  if (!dryRun) {
    if (!apiKey) {
      console.error('[reminders] SENDGRID_API_KEY is required for real sends. Aborting.');
      process.exitCode = 1;
      return;
    }
    if (!from) {
      console.error('[reminders] SENDGRID_FROM is required for real sends. Aborting.');
      process.exitCode = 1;
      return;
    }
  }

  const emails = selfTest
    ? { sofia: 'sofia@example.com', mikkel: 'mikkel@example.com', ingrid: 'ingrid@example.com', lars: '' }
    : await fetchEmails();

  const state = selfTest ? buildSelfTestState(now) : await fetchState();
  if (state == null) {
    console.log('[reminders] Summary: checked 0 deliverables, 0 due, sent/queued 0, skipped 0.');
    return;
  }

  const { reminders, checked, due, missingEmail } = selectReminders(state, emails, reminderDays, now);

  for (const m of missingEmail) {
    console.warn(
      `[reminders] WARNING: "${m.title}" (section: ${m.node}) is due in ${reminderDays} days ` +
        `but assignee "${m.assignee}" has no email on file — skipping.`,
    );
  }

  let sent = 0;
  let failed = 0;

  for (const r of reminders) {
    const body = buildEmail(r, from, reminderDays);
    const subject = body.subject;
    if (dryRun) {
      console.log(`[reminders] WOULD SEND -> ${r.email} | ${subject}`);
      sent++;
      continue;
    }
    try {
      const res = await sendViaSendGrid(body, apiKey);
      if (res.ok) {
        console.log(`[reminders] SENT -> ${r.email} | ${subject} (status ${res.status})`);
        sent++;
      } else {
        const text = await res.text().catch(() => '');
        console.error(
          `[reminders] FAILED -> ${r.email} | ${subject} (status ${res.status}): ${text.slice(0, 300)}`,
        );
        failed++;
      }
    } catch (err) {
      console.error(`[reminders] FAILED -> ${r.email} | ${subject}: ${err.message}`);
      failed++;
    }
  }

  const verb = dryRun ? 'queued' : 'sent';
  console.log(
    `[reminders] Summary: checked ${checked} deliverables, ${due} due in ${reminderDays} days, ` +
      `${verb} ${sent}, skipped ${missingEmail.length} for missing email` +
      (failed ? `, ${failed} failed to send` : '') +
      '.',
  );
}

main().catch((err) => {
  console.error(`[reminders] Unexpected error: ${err?.stack ?? err}`);
  process.exitCode = 0; // lenient on a daily cron
});
