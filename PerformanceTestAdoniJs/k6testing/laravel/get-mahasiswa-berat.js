import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8000/api/mahasiswa';
const MAX_ID = 50000;

function getRandomId() {
  return Math.floor(Math.random() * MAX_ID) + 1;
}

export const options = {
  vus: 200,
  duration: '15m',
  thresholds: {
    http_req_duration: ['p(95)<1000'], // opsional: kontrol performa
  },
};

export default function () {
  const id = getRandomId();

  const res = http.get(`${BASE_URL}/${id}`, {
    headers: {
      Accept: 'application/json',
    },
    tags: {
      name: 'GET /mahasiswa/:id', // 🔥 ini kunci fix high cardinality
    },
  });

  check(res, {
    'status 200': (r) => r.status === 200,
    'response < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}