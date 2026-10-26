/* 약속의 길 — 야곱 편 (창세기 25–33장)
   구성: 그림책 오프닝(쌍둥이의 탄생) → 튜토리얼(브엘세바) → 벧엘의 꿈(컷신) → 하란 · 라반의 집 본게임(타이쿤·사냥·낚시·
        농사·목축·짓기, 열한 아들) → 점 있고 아롱진 양 → 얍복 강 보스전(씨름) → 에필로그(숙곳과 세겜 성읍, 끝없이 이어지는 삶) */
'use strict';
(function (G) {
const { fbm, vnoise, smooth, lerp, clamp, rng, m4, m4trs, m4mul, Rig, AB, HB, HBI, animAnimal, animHuman, R } = G;
const say = (l, cb) => G.UI.say(l, cb), narr = (c, cb) => G.UI.narr(c, cb);
const J = (t, ref) => ({ n: '야곱', t, ref });
const NM = { rebekah: '리브가', deborah: '드보라', isaac: '이삭', esau: '에서', laban: '라반', rachel: '라헬', leah: '레아', bilhah: '빌하', zilpah: '실바', shep1: '하란의 목자', man: '어떤 사람', merchant: '하란의 상인', trader: '가축 상인',
  hunter: '사냥꾼 우스', smith: '대장장이', tanner: '가죽 장인', fisher: '시냇가 어부', lson1: '라반의 큰아들', lson2: '라반의 작은아들', herder: '이삭의 목자',
  reuben: '르우벤', simeon: '시므온', levi: '레위', judah: '유다', dan: '단', naphtali: '납달리', gad: '갓', asher: '아셀', issachar: '잇사갈', zebulun: '스불론', dinah: '디나', joseph: '요셉', israel: '이스라엘', oldwoman: '하란의 할머니', boy: '양치는 아이', hamor: '하몰의 아들', musician: '하란의 악사' };
const N = (id, t, ref) => ({ n: NM[id] || id, t, ref });
const T = (t, ref) => ({ n: '', t, ref });

// ------------------------------------------------------------------ MAP
const SIZE = 480;
function riverX(z) { return 205 + 7 * Math.sin(z / 34) + 4 * Math.sin(z / 13); }          // 얍복 강
function streamX(z) { return 6 + 9 * Math.sin(z / 31) + 4 * Math.sin(z / 11); }            // 하란 서쪽 시내 (발리크)
const POND = { x: 6, z: -96, r: 10 };
const ROADS = [
  [[10, 150], [5, 120], [-10, 90], [-25, 62], [-40, 38]],
  [[-40, 38], [-28, 10], [-5, -25], [20, -60], [40, -105], [45, -118]],
  [[48, -125], [70, -145], [86, -155]], [[95, -165], [115, -180], [128, -188]], [[95, -158], [108, -140]],
  [[110, -132], [140, -110], [160, -98]], [[162, -92], [165, -50], [166, -12], [172, 20], [178, 40], [184, 70], [190, 95]],
  [[200, 96], [226, 100]], [[190, 98], [170, 115], [150, 130]],
  [[10, 166], [-6, 179]], [[10, 166], [28, 180]], [[10, 166], [-22, 160]], [[45, -125], [60, -165]], [[86, -150], [140, -150]], [[45, -125], [18, -108]],
  // 세겜 성읍: 동쪽 성문 → 숙곳의 장막 · 마하나임, 서쪽 문 → 루스(벧엘)
  [[121, 89], [136, 102], [146, 118], [150, 127]], [[121, 89], [150, 70], [176, 48]], [[75, 97], [44, 84], [10, 66], [-20, 50], [-40, 38]]];
function segD(x, z, a, b) { const vx = b[0] - a[0], vz = b[1] - a[1], wx = x - a[0], wz = z - a[1]; const t = clamp((wx * vx + wz * vz) / (vx * vx + vz * vz), 0, 1); return Math.hypot(wx - vx * t, wz - vz * t); }
function roadD(x, z) { let b = 1e9; for (const r of ROADS) for (let i = 0; i < r.length - 1; i++) { const d = segD(x, z, r[i], r[i + 1]); if (d < b) b = d; } return b; }
const PADS = [
  { x: 8, z: 166, r: 26, set: 1 }, { x: -30, z: 160, r: 10 }, { x: 30, z: 182, r: 8 }, { x: -8, z: 182, r: 5, set: 1 },
  { x: -47, z: 20, r: 9, keep: 1 }, { x: 45, z: -125, r: 13, set: 1 }, { x: 90, z: -160, r: 20, set: 1 }, { x: 110, z: -130, r: 16 },
  { x: 62, z: -182, r: 20 }, { x: 132, z: -192, r: 14, set: 1 }, { x: 165, z: -95, r: 13 }, { x: 150, z: -112, r: 11, set: 1 },
  { x: 166, z: -12, r: 9 }, { x: 178, z: 40, r: 13, set: 1 }, { x: 188, z: 95, r: 9 }, { x: 228, z: 100, r: 11 }, { x: 150, z: 130, r: 16, set: 1 },
  { x: 140, z: -150, r: 8, set: 1 }, { x: 16, z: -110, r: 6 }, { x: 98, z: 89, r: 27, set: 1 }, { x: 64, z: 83, r: 6 }, { x: 98, z: 60, r: 8 }];
const STREAM_Z0 = -240, STREAM_Z1 = -103;
function waterDist(x, z) {
  let d = Math.abs(x - riverX(z)); if (z > STREAM_Z0 && z < STREAM_Z1) d = Math.min(d, Math.abs(x - streamX(z))); else if (z >= STREAM_Z1) d = Math.min(d, Math.hypot(x - streamX(STREAM_Z1), z - STREAM_Z1));
  d = Math.min(d, Math.max(0, Math.hypot(x - POND.x, z - POND.z) - POND.r)); return d;
}
function baseH(x, z) {
  let h = 1 + fbm(x * 0.0065 + 3, z * 0.0065 - 2, 4) * 19;
  const db = Math.hypot(x + 45, z - 22); h += 15 * (1 - smooth(14, 75, db));
  const hx = Math.max(0, 30 - x, x - 175), hz = Math.max(0, -230 - z, z + 80); const dh = Math.hypot(hx, hz);
  h = lerp(h, 2 + fbm(x * 0.03, z * 0.03, 2) * 2, (1 - smooth(0, 45, dh)) * 0.85);
  const dbs = Math.hypot(x - 5, z - 172); h = lerp(h, 1.6 + fbm(x * 0.04, z * 0.04, 2) * 1.6, (1 - smooth(30, 62, dbs)) * 0.85);
  // southern desert: rolling dunes and rocky hills
  const arid = smooth(70, 150, z);
  if (arid > 0) { const n1 = vnoise(x * 0.022 + 7, z * 0.034 - 3), ridge = 1 - Math.abs(2 * n1 - 1), n2 = fbm(x * 0.012 - 9, z * 0.012 + 4, 3);
    const away = smooth(34, 70, dbs) * smooth(8, 26, roadD(x, z) + 0.001);
    h += arid * away * (Math.pow(ridge, 1.6) * 5.2 + Math.max(0, n2 - 0.45) * 22); }
  // north-west rocky hills (ibex)
  const dib = Math.hypot(x + 72, z + 150); h += 9 * (1 - smooth(10, 42, dib)) * (0.6 + fbm(x * 0.05, z * 0.05, 2));
  return h;
}
for (const p of PADS) p.h = p.keep ? baseH(p.x, p.z) - 0.5 : baseH(p.x, p.z);
function height(x, z) {
  let h = baseH(x, z);
  for (const p of PADS) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r + 12) h = lerp(h, p.h, 1 - smooth(p.r, p.r + 12, d)); }
  const rd = roadD(x, z); if (rd < 5) h -= (1 - smooth(1.5, 5, rd)) * 0.15;
  const dr = Math.abs(x - riverX(z)); const ford = 1 - smooth(5, 13, Math.abs(z - 95)); const bed = lerp(-2.6, -0.75, ford);
  h = lerp(h, Math.min(h, 1.0), 1 - smooth(10, 26, dr)); h = lerp(h, bed, 1 - smooth(5.5, 13, dr));
  // Haran stream & pond
  const ds = z > STREAM_Z0 - 10 && z < STREAM_Z1 ? Math.abs(x - streamX(z)) : z >= STREAM_Z1 ? Math.hypot(x - streamX(STREAM_Z1), z - STREAM_Z1) : 99;
  const dp = Math.hypot(x - POND.x, z - POND.z) - POND.r;
  const dw = Math.min(ds, dp + 3.5);
  h = lerp(h, Math.min(h, 0.8), 1 - smooth(5, 16, dw)); h = lerp(h, -1.6, 1 - smooth(2.2, 5.5, dw));
  const e = Math.max(Math.abs(x), Math.abs(z)); h += smooth(196, 236, e) * (24 + 10 * fbm(x * 0.02, z * 0.02, 2));
  return h;
}
function aridAt(x, z) { return smooth(60, 160, z); }
function color(x, z, h, ny) {
  const n = fbm(x * 0.045, z * 0.045, 3), n2 = vnoise(x * 0.18, z * 0.18);
  const arid = smooth(60, 160, z), lush = 1 - smooth(-110, -40, z);
  let c = [lerp(0.4, 0.66, arid) + n * 0.08 - lush * 0.05, lerp(0.63, 0.6, arid) + n * 0.06 + lush * 0.04, lerp(0.27, 0.38, arid) + n2 * 0.03];
  let dens = lerp(0.95, 0.38, arid) * (0.65 + 0.35 * n);
  if (arid > 0.35 && n < 0.42) { const k = smooth(0.42, 0.3, n) * arid; c = c.map((v, i) => lerp(v, [0.86, 0.75, 0.55][i], k)); dens *= 1 - k; }
  const db = Math.hypot(x + 45, z - 22), dib = Math.hypot(x + 72, z + 150);
  const rock = (1 - smooth(10, 55, db)) * 0.65 + (1 - smooth(8, 34, dib)) * 0.55 + smooth(0.25, 0.45, 1 - ny) * 0.8;
  if (rock > 0) { c = c.map((v, i) => lerp(v, [0.66, 0.62, 0.54][i] * (0.92 + n2 * 0.12), clamp(rock, 0, 1))); dens *= 1 - clamp(rock, 0, 0.9); }
  const dw = waterDist(x, z); if (dw < 18) { const k = 1 - smooth(6, 18, dw); c = c.map((v, i) => lerp(v, arid > 0.5 ? [0.62, 0.58, 0.44][i] : [0.36, 0.56, 0.26][i], k * 0.7)); dens = lerp(dens, arid > 0.5 ? dens * 0.4 : 1, k * 0.8); }
  if (dw < 4) { const k = 1 - smooth(1.5, 4, dw); c = c.map((v, i) => lerp(v, [0.5, 0.44, 0.34][i], k)); dens *= 1 - k; }
  for (const p of PADS) if (p.set) { const d = Math.hypot(x - p.x, z - p.z); if (d < p.r) { const k = 1 - smooth(p.r * 0.55, p.r, d); c = c.map((v, i) => lerp(v, [0.74, 0.64, 0.48][i] * (0.95 + n2 * 0.08), k * 0.85)); dens *= 1 - k; } }
  const rd = roadD(x, z); if (rd < 3) { const k = 1 - smooth(1.2, 3, rd); c = c.map((v, i) => lerp(v, [0.76, 0.66, 0.5][i], k * 0.9)); dens *= 1 - k; }
  const e = Math.max(Math.abs(x), Math.abs(z)); if (e > 196) { const k = smooth(196, 225, e); c = c.map((v, i) => lerp(v, [0.6, 0.55, 0.46][i], k)); }
  return [c[0], c[1], c[2], dens];
}
const SPOTS = { well: [-8, 179], fire: [10, 168], bed: [28, 170], luz: [-44, 26], pillow: [-50, 18], sleep: [-46, 20], fieldWell: [45, -122], labanHouse: [88, -152], galeed: [166, -12], mahanaim: [178, 40],
  fordWest: [190, 95], eastBank: [226, 100], altar: [150, 130], jacobTents: [150, -108], market: [128, -186], hunterCamp: [140, -148], pond: [14, -104], pasture: [-56, 180], tamarisk: [-2, 172],
  thicket: [195, -205], bearDen: [-15, -212], grove: [35, -215], ibexRocks: [-72, -150], eastPlain: [172, -160], succoth: [150, 128], labanFire: [86, -154],
  shechem: [98, 90], shechemGate: [121, 89], haranWell: [133, -206] };
// places shown on the big map (and asked about by travelers)
const PLACES = [{ n: '브엘세바', x: 8, z: 166, k: 'town' }, { n: '루스 (벧엘)', x: -46, z: 22, k: 'town' }, { n: '하란', x: 128, z: -196, k: 'town' }, { n: '라반의 집', x: 90, z: -156 }, { n: '들의 우물', x: 45, z: -122 },
  { n: '시냇가 연못', x: 6, z: -96 }, { n: '동쪽 들판', x: 172, z: -160 }, { n: '북쪽 상수리 숲', x: 30, z: -214 }, { n: '바위 언덕', x: -72, z: -150 }, { n: '사냥꾼의 천막', x: 140, z: -150 }, { n: '사자 덤불', x: 195, z: -205 },
  { n: '갈르엣 (길르앗 산)', x: 166, z: -12 }, { n: '마하나임', x: 178, z: 40 }, { n: '얍복 나루', x: 205, z: 95 }, { n: '숙곳', x: 150, z: 128, k: 'town' }, { n: '세겜 성읍', x: 98, z: 89, k: 'town' }, { n: '남쪽 광야', x: 20, z: 112 }];
const STAIR = { x: -46, z: 14, n: 70, dz: 0.46, dy: 0.62 };
