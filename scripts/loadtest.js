import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 Load Test Script for Code Carnival 3.0 - Heist Day Finale
 * Simulates up to 2500 concurrent virtual players joining, polling state, and answering questions.
 *
 * To run:
 *   k6 run scripts/loadtest.js
 * Or target specific host:
 *   k6 run -e TARGET_URL=https://your-deployment.vercel.app scripts/loadtest.js
 */

export const options = {
  stages: [
    { duration: '30s', target: 500 },   // Ramp up players entering the lobby
    { duration: '1m', target: 2000 },   // Surge during opening lobby announcement
    { duration: '1m', target: 2500 },   // Peak 2500 concurrent active players
    { duration: '2m', target: 2500 },   // Question rounds running
    { duration: '30s', target: 0 },     // Ramp down after finale
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'],     // <1% errors permitted
    'http_req_duration{endpoint:state}': ['p(95)<150'], // CDN cached state must be ultra fast
    'http_req_duration{endpoint:answer}': ['p(95)<400'], // Atomic redis Lua submit
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';
const GAME_CODE = __ENV.GAME_CODE || 'VAULT36';

// Generates dummy unique 10-digit Indian mobile number: 98xxxxxxxx
function getUniquePhone(vu, iter) {
  const num = 9800000000 + (vu * 1000 + iter) % 19999999;
  return num.toString();
}

export default function () {
  const phone = getUniquePhone(__VU, __ITER);
  const name = `Crew_${__VU}`;
  const avatar = (__VU + __ITER) % 24;

  // 1. Clock Sync
  const timeRes = http.get(`${BASE_URL}/api/time`, {
    tags: { endpoint: 'time' },
  });
  check(timeRes, { 'time status is 200': (r) => r.status === 200 });

  // 2. Player Join
  const joinPayload = JSON.stringify({
    code: GAME_CODE,
    name: name,
    phone: phone,
    avatar: avatar,
  });

  const joinRes = http.post(`${BASE_URL}/api/join`, joinPayload, {
    headers: { 'Content-Type': 'application/json' },
    tags: { endpoint: 'join' },
  });

  const joinSuccess = check(joinRes, {
    'join status is 200': (r) => r.status === 200,
    'has session token': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.token !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  if (!joinSuccess) {
    sleep(1);
    return;
  }

  const session = JSON.parse(joinRes.body);
  const token = session.token;
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 3. Game Cycle Simulation: Poll State
  const stateRes = http.get(`${BASE_URL}/api/state`, {
    tags: { endpoint: 'state' },
  });

  check(stateRes, { 'state status 200': (r) => r.status === 200 });

  let state = null;
  try {
    state = JSON.parse(stateRes.body);
  } catch (e) {}

  if (state && state.phase === 'QUESTION' && state.qi >= 0) {
    // Simulate player thinking time (0.5s to 4s) before answering
    sleep(0.5 + Math.random() * 3.5);

    // Pick a choice between 0 and 3
    const choice = Math.floor(Math.random() * 4);
    const ansPayload = JSON.stringify({
      q: state.qi,
      c: choice,
    });

    const ansRes = http.post(`${BASE_URL}/api/answer`, ansPayload, {
      headers: authHeaders,
      tags: { endpoint: 'answer' },
    });

    check(ansRes, {
      'answer status 200': (r) => r.status === 200,
    });
  } else if (state && (state.phase === 'REVEAL' || state.phase === 'FINAL')) {
    // In reveal phase, check own result with random jitter (0-2s)
    sleep(Math.random() * 2);
    const meRes = http.get(`${BASE_URL}/api/me?q=${state.qi}`, {
      headers: authHeaders,
      tags: { endpoint: 'me' },
    });
    check(meRes, {
      'me status 200': (r) => r.status === 200,
    });
  }

  // Jittered interval between cycle actions
  sleep(2 + Math.random() * 1.5);
}
