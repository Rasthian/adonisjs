import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://127.0.0.1:3333';

export const options = {
  scenarios: {
    berat: {
      executor: 'constant-vus',
      vus: 200,
      duration: '15m',
      exec: 'postMahasiswa',
    },
  },
};

function generateData() {
  const id = `${__VU}-${__ITER}`;

  return {
    nim: `NIM${id}`,
    nama: `User ${id}`,
    email: `user${id}@test.com`,
    tanggal_lahir: '2000-01-01',
    jenis_kelamin: Math.random() > 0.5 ? 'L' : 'P',
    alamat: 'Jl. Testing K6',
    angkatan: 2020,
    ipk: 3.5,
  };
}

export function postMahasiswa() {
  const payload = JSON.stringify(generateData());

  const res = http.post(`${BASE_URL}/mahasiswa`, payload, {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  check(res, {
    'status 201': (r) => r.status === 201,
    'response < 1s': (r) => r.timings.duration < 1000,
  });

  sleep(1);
}