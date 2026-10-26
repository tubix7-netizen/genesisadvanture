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

// ------------------------------------------------------------------ extra props for this episode
const ENVX = {
  forge(g, M) { g.cyl(0.9, 1.0, 0.8, 10, { m: M, at: [0, 0.4, 0], c: 0x8a7a68, flat: true, j: 0.08 }); g.cyl(0.6, 0.6, 0.06, 10, { m: M, at: [0, 0.82, 0], c: 0xff8a3a, j: 0.15 });
    g.box(0.5, 0.35, 0.25, { m: M, at: [1.4, 0.55, 0], c: 0x4a4a4e }); g.cyl(0.12, 0.16, 0.4, 6, { m: M, at: [1.4, 0.2, 0], c: 0x6a5040 }); g.box(0.6, 0.25, 0.4, { m: M, at: [-1.3, 0.4, 0.2], ry: 0.3, c: 0x7a5a3a }); },
  rack(g, M) { for (const x of [-1.2, 1.2]) g.cyl(0.05, 0.06, 1.9, 5, { m: M, at: [x, 0.95, 0], c: 0x7a5a3a }); g.cyl(0.04, 0.04, 2.6, 5, { m: M, at: [0, 1.85, 0], rz: Math.PI / 2, c: 0x7a5a3a });
    for (let i = 0; i < 3; i++) g.box(0.6, 0.9, 0.03, { m: M, at: [-0.8 + i * 0.8, 1.35, 0], c: [0xa07850, 0x8a6a48, 0xb89068][i] }); },
  hut(g, M) { g.cyl(1.4, 1.6, 1.8, 10, { m: M, at: [0, 0.9, 0], c: 0xb8a070, j: 0.06 }); g.cyl(0, 1.9, 1.3, 10, { m: M, at: [0, 2.4, 0], c: 0xc8b078, j: 0.08 }); g.box(0.7, 1.2, 0.08, { m: M, at: [0, 0.6, 1.5], c: 0x4a3222 }); },
  boat(g, M) { g.lathe([[0.05, -1.4], [0.45, -0.8], [0.55, 0], [0.45, 0.8], [0.05, 1.4]], 6, { m: M, at: [0, 0.25, 0], s: [1, 0.35, 1], rz: Math.PI / 2, c: 0x7a5a3a }); },
  hives(g, M) { for (let i = 0; i < 3; i++) g.lathe([[0.25, 0], [0.32, 0.2], [0.28, 0.45], [0.12, 0.6], [0.02, 0.62]], 8, { m: M, at: [i * 0.7, 0, (i % 2) * 0.3], c: 0xc89a5a }); },
};
const NODEX = {
  flowers: { n: '들꽃', r: 0, give: { flower: 2 }, re: 2, label: '들꽃 꺾기', env: 'flowers' },
  herbs: { n: '약초', r: 0, give: { herb: 1 }, re: 3, label: '약초 캐기', env: 'bush', envArg: 0x6aa04a },
  hive: { n: '바위틈 벌집', r: 0.6, give: { honey: 1 }, re: 4, label: '석청 따기', envX: 'hives' },
};

// ------------------------------------------------------------------ BUILD
function build(W, Game) {
  const r = rng(77); W.nodes = []; let nid = 0;
  const node = (type, x, z, s) => { if (waterDist(x, z) < 6 && type !== 'reeds' && type !== 'clay') return; W.nodes.push({ id: 'n' + (nid++), type, x, y: W.heightAt(x, z), z, ry: r() * 6, s: s || (0.85 + r() * 0.3) }); };
  const P = (fn, x, z, o) => W.place(typeof fn === 'string' && ENVX[fn] ? ENVX[fn] : fn, x, z, o);
  const ladder = (x, z) => x > -52 && x < -40 && z > STAIR.z - STAIR.n * STAIR.dz - 4 && z < STAIR.z + 3;
  const ok = (x, z, m) => roadD(x, z) > (m || 4) && PADS.every(p => Math.hypot(x - p.x, z - p.z) > p.r + 2) && waterDist(x, z) > 7 && Math.max(Math.abs(x), Math.abs(z)) < 205 && !ladder(x, z);
  const tree = { r: 0.5, h: 3 };
  // --- Beersheba camp
  P('tent', -4, 154, { ry: 0.15, s: 1.25, col: { w: 7, d: 4.6, h: 2.4, cam: true } });
  P('tent', 20, 152, { ry: -0.25, col: { w: 5.8, d: 3.8, h: 2.2, cam: true } });
  P('tent', 31, 167, { ry: -0.7, col: { w: 5.8, d: 3.8, h: 2.2, cam: true } });
  P('tent', -18, 175, { ry: 0.7, args: [0x5a3a2a], col: { w: 5.8, d: 3.8, h: 2.2, cam: true } });
  P('campfire', 10, 166, { col: { r: 0.8, h: 0.5 } }); P('pots', 14, 160); P('sacks', 0, 162); P('pots', 24, 158);
  P('well', -8, 182, { col: { r: 1.7, h: 1 } });
  P('tamarisk', -2, 173, { s: 1.35, col: { r: 0.6, h: 3 } }); // 아브라함이 심은 에셀나무 (창 21:33)
  P('acacia', -14, 190, { s: 1.2, col: tree }); P('acacia', 40, 150, { col: tree }); P('oak', -30, 195, { s: 1.1, col: tree });
  P('wallSeg', -30, 155, { args: [14, 1.0], col: { w: 14, d: 0.7, h: 1.1 } }); P('wallSeg', -30, 165, { args: [14, 1.0], col: { w: 14, d: 0.7, h: 1.1 } });
  P('wallSeg', -37, 160, { ry: Math.PI / 2, args: [10, 1.0], col: { w: 10, d: 0.7, h: 1.1, a: Math.PI / 2 } });
  P('wallSeg', -23, 157.6, { ry: Math.PI / 2, args: [5, 1.0], col: { w: 5, d: 0.7, h: 1.1, a: Math.PI / 2 } });
  P('fence', 30, 178.2, { args: [7] }); P('fence', 30, 185.8, { args: [7] });
  for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28 + r() * 0.2, d = 34 + r() * 8, x = 8 + Math.cos(a) * d, z = 166 + Math.sin(a) * d; if (ok(x, z, 3)) P('opuntia', x, z, { ry: r() * 6, s: 1 + r() * 0.5, col: { r: 0.7, h: 1.2 } }); }
  // --- Bethel
  for (let i = 0; i < 9; i++) { const a = i / 9 * 6.28, d = 14 + r() * 10, x = -47 + Math.cos(a) * d, z = 20 + Math.sin(a) * d; if (ladder(x, z)) continue; P('cliff', x, z, { s: 0.7 + r() * 0.4, col: { r: 4, h: 6 } }); }
  for (let i = 0; i < 6; i++) P('house', -86 + (i % 3) * 8, 2 + Math.floor(i / 3) * 9, { ry: r() * 0.4, args: [{ w: 5, d: 4, h: 1.2 + r() * 1.2, c: 0xb8aa94 }], col: { w: 5, d: 4, h: 2 } });
  // --- Haran
  P('house', 92, -164, { ry: 0.08, args: [{ w: 10, d: 7, h: 3.4, c: 0xcdb08a, awning: 0x9a3a2a, stair: true }], col: { w: 10, d: 7, h: 3.6, a: 0.08, cam: true } });
  P('house', 80, -168, { ry: 0.2, args: [{ w: 6, d: 5, h: 2.8, c: 0xc6aa86 }], col: { w: 6, d: 5, h: 3, a: 0.2, cam: true } });
  P('wallSeg', 92, -175, { args: [22, 1.4], col: { w: 22, d: 0.7, h: 1.5 } }); P('wallSeg', 103, -165, { ry: Math.PI / 2, args: [20, 1.4], col: { w: 20, d: 0.7, h: 1.5, a: Math.PI / 2 } });
  P('tent', 76, -150, { ry: 0.4, col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.4 } }); P('campfire', 86, -154, { col: { r: 0.8, h: 0.5 } }); P('pots', 98, -158); P('sacks', 99, -152);
  P('well', 84, -146, { col: { r: 1.7, h: 1 } }); P('fig', 104, -150, { col: tree }); P('olive', 72, -160, { col: tree });
  P('well', 45, -125, { args: [{ r: 1.4, posts: false }], col: { r: 2, h: 1 } });
  P('trough', 41, -121, { ry: 0.6, col: { w: 2.4, d: 0.8, h: 0.6, a: 0.6 } }); P('trough', 49, -121, { ry: -0.6, col: { w: 2.4, d: 0.8, h: 0.6, a: -0.6 } });
  P('wallSeg', 110, -138, { args: [24, 1.1], col: { w: 24, d: 0.7, h: 1.2 } }); P('wallSeg', 104, -122, { args: [12, 1.1], col: { w: 12, d: 0.7, h: 1.2 } }); P('wallSeg', 119, -122, { args: [6, 1.1], col: { w: 6, d: 0.7, h: 1.2 } });
  P('wallSeg', 98, -130, { ry: Math.PI / 2, args: [16, 1.1], col: { w: 16, d: 0.7, h: 1.2, a: Math.PI / 2 } }); P('wallSeg', 122, -130, { ry: Math.PI / 2, args: [16, 1.1], col: { w: 16, d: 0.7, h: 1.2, a: Math.PI / 2 } });
  P('trough', 110, -136, { col: { w: 2.4, d: 0.8, h: 0.6 } });
  // market, smith, tanner
  [[124, -188, 0xb3472e], [132, -184, 0x2c5aa0], [138, -192, 0x3e8a66], [128, -197, 0xd9a73a]].forEach(([x, z, c], i) => P('stallM', x, z, { ry: i * 0.6, args: [c], col: { w: 2.6, d: 2.2, h: 2.2, a: i * 0.6 } }));
  P('sacks', 133, -194); P('pots', 121, -192); P('forge', 120, -201, { ry: 0.3, col: { r: 1.1, h: 1 } }); P('rack', 142, -199, { ry: -0.2 }); P('pots', 145, -197);
  for (let i = 0; i < 7; i++) P('house', 120 + (i % 4) * 10, -215 - Math.floor(i / 4) * 10, { ry: r() * 0.5, args: [{ w: 6, d: 5, h: 2.8 + r(), c: [0xcdb48c, 0xd8c4a0, 0xc0a47e][i % 3] }], col: { w: 6, d: 5, h: 3, cam: true } });
  // hunter's camp (east pasture edge)
  P('tent', 141, -153, { ry: -0.3, args: [0x6a4a32], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -0.3 } }); P('campfire', 137, -146, { col: { r: 0.8, h: 0.5 } }); P('rack', 145, -145, { ry: 1.2 });
  // fisherman by the pond
  P('hut', 19, -113, { ry: 0.6, col: { r: 1.6, h: 2.5 } }); P('boat', 9, -104, { ry: 0.4, dy: -0.2 });
  // Galeed / Mahanaim / Jabbok
  P('tent', 172, 36, { ry: 0.3, args: [0x4a3e38] }); P('tent', 186, 44, { ry: -0.4, args: [0x4a3e38] }); P('campfire', 178, 40);
  // Shechem (epilogue camp)
  P('olive', 136, 118, { col: tree }); P('olive', 172, 146, { col: tree }); P('olive', 134, 150, { col: tree }); P('well', 158, 120, { col: { r: 1.7, h: 1 } });
  P('campfire', 151, 128, { col: { r: 0.8, h: 0.5 } }); P('pots', 146, 123); P('sacks', 156.5, 131);
  P('tent', 138, 138.5, { ry: 0.5, args: [0x4a3e38], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: 0.5 } }); P('tent', 164, 123, { ry: -0.6, args: [0x5a4636], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -0.6 } }); P('tent', 163, 140, { ry: -1.2, args: [0x3e342e], col: { w: 5.8, d: 3.8, h: 2.2, cam: true, a: -1.2 } });
  P('fence', 126, 127.5, { args: [12] }); P('fence', 126, 136.5, { args: [12] }); P('fence', 120, 132, { ry: Math.PI / 2, args: [9] }); P('fence', 132, 129.25, { ry: Math.PI / 2, args: [3.5] }); P('fence', 132, 135, { ry: Math.PI / 2, args: [3] });
  // reeds, willows & palms along water
  for (let z = -100; z < 210; z += 9) { const s = r() < 0.5 ? -1 : 1; node('reeds', riverX(z) + s * (8.5 + r() * 2), z); }
  for (let z = STREAM_Z0 + 6; z < STREAM_Z1; z += 7) { const s = r() < 0.5 ? -1 : 1; node('reeds', streamX(z) + s * (4.5 + r() * 1.5), z); if (r() < 0.35) node('poplar', streamX(z) - s * (7 + r() * 3), z); }
  for (let i = 0; i < 8; i++) { const a = r() * 6.28; node('reeds', POND.x + Math.cos(a) * (POND.r + 2), POND.z + Math.sin(a) * (POND.r + 2)); }
  for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28 + 0.4; P('datePalm', POND.x + Math.cos(a) * (POND.r + 8), POND.z + Math.sin(a) * (POND.r + 8), { col: tree }); }
  for (let z = -60; z < 200; z += 23) P('datePalm', riverX(z) + (r() < 0.5 ? -1 : 1) * (15 + r() * 5), z, { col: tree });
  // north oak grove (deer, bear) & bear den
  for (let i = 0; i < 44; i++) { const a = r() * 6.28, d = Math.sqrt(r()) * 30, x = 30 + Math.cos(a) * d, z = -214 + Math.sin(a) * d * 0.7; if (!ok(x, z, 3)) continue; P(r() < 0.75 ? 'oak' : 'olive', x, z, { ry: r() * 6, s: 0.9 + r() * 0.5, col: tree }); }
  for (let i = 0; i < 7; i++) P('outcrop', -15 + (r() - 0.5) * 18, -214 + (r() - 0.5) * 12, { ry: r() * 6, s: 0.8 + r() * 0.5, col: { r: 1.6, h: 2 } });
  // lion thicket
  for (let i = 0; i < 22; i++) { const x = 195 + (r() - 0.5) * 30, z = -205 + (r() - 0.5) * 26; if (!ok(x, z, 3)) continue; P(r() < 0.6 ? 'bush' : 'acacia', x, z, { ry: r() * 6, s: 1 + r() * 0.6, col: r() < 0.6 ? null : tree }); }
  for (let i = 0; i < 4; i++) P('outcrop', 195 + (r() - 0.5) * 24, -205 + (r() - 0.5) * 20, { s: 0.9, col: { r: 1.6, h: 2 } });
  // ibex rocks
  for (let i = 0; i < 12; i++) { const a = r() * 6.28, d = 6 + r() * 26, x = -72 + Math.cos(a) * d, z = -150 + Math.sin(a) * d; if (ok(x, z, 3)) P('outcrop', x, z, { ry: r() * 6, s: 0.8 + r() * 0.8, col: { r: 1.6, h: 2 } }); }
  // decorative trees & rocks across the land
  for (let i = 0; i < 420; i++) {
    const x = (r() - 0.5) * 410, z = (r() - 0.5) * 410; if (!ok(x, z, 6)) continue; const arid = smooth(60, 160, z), lush = 1 - smooth(-110, -40, z), db = Math.hypot(x + 45, z - 22);
    const k = r(); let t = 'oak';
    if (db < 60) t = k < 0.45 ? 'rock' : k < 0.75 ? 'olive' : 'bush';
    else if (arid > 0.5) t = k < 0.2 ? 'acacia' : k < 0.34 ? 'tamarisk' : k < 0.5 ? 'retama' : k < 0.64 ? 'opuntia' : k < 0.8 ? 'outcrop' : 'rock';
    else if (lush > 0.5) t = k < 0.32 ? 'oak' : k < 0.5 ? 'olive' : k < 0.62 ? 'fig' : k < 0.82 ? 'bush' : 'tamarisk';
    else t = k < 0.28 ? 'olive' : k < 0.46 ? 'oak' : k < 0.58 ? 'tamarisk' : k < 0.78 ? 'bush' : k < 0.88 ? 'opuntia' : 'rock';
    const big = t === 'oak' || t === 'olive' || t === 'acacia' || t === 'tamarisk' || t === 'fig';
    P(t, x, z, { ry: r() * 6, s: 0.8 + r() * 0.5, col: big ? tree : t === 'rock' ? { r: 1.1, h: 1.2 } : t === 'outcrop' ? { r: 1.8, h: 2 } : t === 'opuntia' ? { r: 0.6, h: 1.2 } : null });
  }
  // small details (flowers, dry grass, shrubs) — drawn only near the camera
  for (let i = 0; i < 900; i++) { const x = (r() - 0.5) * 400, z = (r() - 0.5) * 400; if (!ok(x, z, 2.5)) continue; const arid = smooth(60, 160, z);
    if (arid > 0.55) P(r() < 0.75 ? 'dryGrass' : 'retama', x, z, { ry: r() * 6, s: 0.7 + r() * 0.6, detail: 1 });
    else P(r() < 0.55 ? 'flowers' : r() < 0.7 ? 'dryGrass' : 'bush', x, z, { ry: r() * 6, s: 0.6 + r() * 0.5, detail: 1, args: [[0xd8343a, 0xd8343a, 0xf0e0f0, 0xe8c040, 0x8a6ad8][i % 5]] }); }
  // gathering nodes around settlements & paths
  const around = (cx, cz, rr, n, types) => { for (let i = 0; i < n; i++) { const a = r() * 6.28, d = rr * (0.4 + r() * 0.6), x = cx + Math.cos(a) * d, z = cz + Math.sin(a) * d; if (roadD(x, z) < 2.5 || PADS.some(p => Math.hypot(x - p.x, z - p.z) < p.r * 0.75) || ladder(x, z)) continue; node(types[i % types.length], x, z); } };
  around(8, 166, 42, 22, ['deadwood', 'rock', 'deadwood', 'olive', 'rock', 'fig']);
  around(-45, 22, 34, 16, ['rock', 'boulder', 'olive', 'deadwood']);
  around(90, -150, 55, 38, ['deadwood', 'rock', 'olive', 'oak', 'boulder', 'poplar', 'fig', 'deadwood', 'flowers']);
  around(50, -122, 18, 8, ['poplar', 'deadwood', 'clay', 'rock']);
  around(160, -100, 30, 12, ['deadwood', 'rock', 'oak', 'boulder', 'flowers']);
  around(170, 20, 40, 14, ['oak', 'rock', 'deadwood', 'boulder']);
  around(150, 130, 36, 16, ['olive', 'rock', 'deadwood', 'fig', 'flowers', 'boulder']);
  around(60, -150, 40, 14, ['flowers', 'flowers', 'herbs', 'deadwood']);
  around(30, -214, 26, 10, ['herbs', 'deadwood', 'hive', 'flowers']);
  around(-72, -150, 24, 6, ['boulder', 'rock', 'hive']);
  for (let i = 0; i < 10; i++) { const z = -60 + i * 28; node('clay', riverX(z) + (r() < 0.5 ? -1 : 1) * 10.5, z); }
  for (let i = 0; i < 6; i++) node('clay', 44 + (r() - 0.5) * 8, -117 + (r() - 0.5) * 6);
  for (let i = 0; i < 6; i++) node('clay', streamX(-120 - i * 18) + 6, -120 - i * 18);
  buildShechem(W, r, node, P); around(98, 89, 44, 16, ['olive', 'rock', 'deadwood', 'fig', 'flowers', 'boulder', 'herbs']);
}

// ------------------------------------------------------------------ LOOKS
/* Layered costumes (v4 human): tunic + woven hem border (trim/trim2), under-sleeves, sash and leather belt with buckle,
   cross strap with a shepherd's bag, bracers (wraps), leg wraps or boots, draped mantles and veils. Palette from natural
   wool, madder red, indigo, ochre and leather — the colours of patriarchal-age dress (cf. the Beni Hasan nomads). */
const KID = (o) => Object.assign({ kid: true, skin: 0xe2ab7c, top: 0xd8c8a0, trim: 0x8a5a3a, hair: 0x2a1810, hairStyle: 'curly', belt: 0x6a4428, noPouch: true }, o);
const JAC = { skin: 0xe2ab7c, top: 0x8e3c2c, trim: 0x2e4a78, trim2: 0xe8dcc0, under: 0xe4d6b8, hair: 0x4a2a16, hairStyle: 'tied', sash: 0x2e4a78, belt: 0x5a3a24,
  wraps: 0x6a4a30, legWrap: 0x9a8462, bag: 0x7a5232, roll: 0xb8a37a, eye: 0x6a3e22 };
const LOOK = {
  jacob: JAC,
  jacobH: Object.assign({}, JAC, { skin: 0xdba274, top: 0x86362a, trim2: 0xd8c49a, beard: 'short', roll: null, mantle: null }),
  esauGarb: { skin: 0xe2ab7c, top: 0x8a5232, bottom: 0x7a4a2a, trim: 0x4a2a1a, hair: 0x4a2a16, hairStyle: 'tied', goatskin: true, belt: 0x3a2618, under: 0x6a4a32, boots: 0x5a3a24, wraps: 0x4a3426, noArmor: true, eye: 0x6a3e22 },
  israel: { skin: 0xd8a070, top: 0x8a4434, trim: 0x2e4a78, trim2: 0xd8c49a, under: 0xd8c49a, hair: 0x3a2414, hairStyle: 'short', beard: 'short', beardCol: 0x4a3424, mantle: 0x6a5a48, mantleTrim: 0x2e4a78,
    headwear: 'cloth', clothCol: 0xece4d0, clothStripe: 0x3a6aa0, bandCol: 0x5a3a24, belt: 0x5a3a24, wraps: 0x6a4a30, legWrap: 0x8a7458, bag: 0x7a5232, limp: true, eye: 0x6a3e22, browAng: 0.15 },
  esau: { skin: 0xd08a5a, top: 0x7a4a2a, bottom: 0x6a4024, trim: 0x3a2214, hair: 0xa8441e, hairStyle: 'wild', beard: 'short', beardCol: 0xa8441e, sleeveless: true, goatskin: true, belt: 0x4a3022,
    boots: 0x5a3a24, wraps: 0x4a3426, bag: 0x6a4428, eye: 0x5a3a1e, browAng: 0.6 },
  isaac: { skin: 0xd8a880, top: 0xefe6d2, long: true, trim: 0x7a8aa8, trim2: 0xd8c08a, under: 0xefe6d2, hair: 0xe8e4dc, hairStyle: 'short', beard: 'long', beardCol: 0xf0ece4, headwear: 'cloth', clothCol: 0xf2ece0,
    clothStripe: 0x6a7aa0, bandCol: 0x6a5a48, mantle: 0x8a7a68, mantleTrim: 0x5a4a3a, sash: 0x6a7aa0, age: 'old', eye: 0x8a7a6a, browAng: -0.1 },
  rebekah: { skin: 0xe6b48a, top: 0xa86c32, long: true, trim: 0x2e4a78, trim2: 0xe0b040, under: 0xa86c32, hair: 0x2a1810, hairStyle: 'long', headwear: 'veil', clothCol: 0x3a6aa0, clothStripe: 0xe0b040,
    headband: 0xe0b040, sash: 0x8e2e3a, eye: 0x4a2a18, browAng: 0.2 },
  deborah: { skin: 0xd8a078, top: 0x8a7a5a, long: true, trim: 0x5a4a3a, hair: 0x9a9088, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8ccb0, clothStripe: 0x8a6a48, belt: 0x5a4030, age: 'old', browAng: -0.2, smile: 0.6 },
  rachel: { skin: 0xeab88e, top: 0xe8dcc0, long: true, trim: 0x3e8a66, trim2: 0xc8604a, under: 0xe8dcc0, hair: 0x2a1810, hairStyle: 'long', headwear: 'veil', clothCol: 0x6aa07a, clothStripe: 0xe8dcc0,
    headband: 0xd9a73a, sash: 0xc8604a, eye: 0x6a4626, browAng: 0.1, smile: 0.4, tilt: 0.0017 },
  leah: { skin: 0xe0b088, top: 0x98708e, long: true, trim: 0x5a3a5a, trim2: 0xe0c070, under: 0x98708e, hair: 0x3a2418, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8c8a0, clothStripe: 0xa86a8a,
    headband: 0x8a6a3a, sash: 0x6a4a3a, eye: 0x7a6048, browAng: -0.3, tilt: -0.0005, narrow: true, smile: 0.55 },
  bilhah: { skin: 0xd8a070, top: 0x9ab0c8, long: true, trim: 0x4a6a8a, hair: 0x2a1810, hairStyle: 'bun', headwear: 'veil', clothCol: 0xe8e0d0, clothStripe: 0x6a8aaa, belt: 0x5a4a3a, browAng: 0 },
  zilpah: { skin: 0xc8905e, top: 0x7a8048, long: true, trim: 0x8a5a2a, hair: 0x1a1410, hairStyle: 'long', headwear: 'veil', clothCol: 0x8a5a3a, clothStripe: 0xe0c070, belt: 0x6a3a22, browAng: 0.1 },
  laban: { skin: 0xd8a070, long: true, top: 0xe8dcc0, trim: 0x2c5aa0, trim2: 0xd9a73a, under: 0xe8dcc0, beard: 'long', beardCol: 0x7a6a5a, hair: 0x6a5a4a, headwear: 'turban', clothCol: 0xe8dcc0, bandCol: 0xb3472e,
    mantle: 0x2c5aa0, mantleTrim: 0xd9a73a, sash: 0xb3472e, eye: 0x5a4030, browAng: 0.05, narrow: true, smile: 0.5 },
  shep: { skin: 0xc8905e, top: 0xcab48c, trim: 0x7a5a3a, hair: 0x2a1a10, beard: 'short', headwear: 'cloth', clothCol: 0xe0d4b8, bandCol: 0x5a3a2a, mantle: 0x7a6a50, mantleShort: true, belt: 0x4a3022,
    legWrap: 0x8a7a5a, bag: 0x6a4a30, browAng: 0.2 },
  shep2: { skin: 0xb88050, top: 0x9a8a6a, trim: 0x5a4a3a, hair: 0x2a1a10, headwear: 'cloth', clothCol: 0xcab890, clothStripe: 0x7a3a2a, bandCol: 0x3a2a1a, belt: 0x4a3022, wraps: 0x5a4030, legWrap: 0x7a6a50 },
  merchant: { skin: 0xc89060, long: true, stripes: [0xe8dcc0, 0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xc8963a, 0xe8dcc0], stripesB: [0xe8dcc0, 0x7a3b2a, 0xe8dcc0, 0xe8dcc0, 0xc8963a, 0xe8dcc0, 0xe8dcc0, 0x2c5aa0], beard: 'short', hair: 0x2a1810, headwear: 'turban', clothCol: 0xd9a73a, bandCol: 0x7a3b2a, sash: 0x2c5aa0, smile: 0.7 },
  trader: { skin: 0xb8804e, top: 0x6a5a3a, bottom: 0x5a4a32, trim: 0x3a2a1a, beard: 'short', hair: 0x2a1a10, headwear: 'cloth', clothCol: 0x9a8a6a, bandCol: 0x3a2a1a, mantle: 0x4a3a2a, mantleShort: true, boots: 0x4a3426, belt: 0x3a2618 },
  hunter: { skin: 0xb07848, top: 0x6a4a30, bottom: 0x5a4028, trim: 0x3a2618, under: 0x9a8a6a, hair: 0x5a5048, hairStyle: 'short', beard: 'long', beardCol: 0x8a8278, sleeveless: true, belt: 0x3a2618,
    boots: 0x4a3426, wraps: 0x3a2a1e, bag: 0x5a3a24, eye: 0x5a4a3a, browAng: 0.5, age: 'old' },
  smith: { skin: 0xa86e44, top: 0x5a4a3a, bottom: 0x4a3a2a, trim: 0x2a1a10, hair: 0x1a1410, hairStyle: 'short', beard: 'short', sleeveless: true, belt: 0x2a1a10, headwear: 'band', bandCol: 0x8a3a2a, wraps: 0x2a2018, boots: 0x3a2a1e, browAng: 0.6 },
  tanner: { skin: 0xb88050, top: 0x8a6a48, bottom: 0x7a5a3a, trim: 0x4a3022, hair: 0x3a2a1a, beard: 'short', headwear: 'cloth', clothCol: 0xa89070, bandCol: 0x4a3022, belt: 0x4a3022, bag: 0x6a4a2a, wraps: 0x5a4030 },
  fisher: { skin: 0xa87048, top: 0xc8c0a8, bottom: 0x8a8070, trim: 0x3a6a8a, hair: 0x2a1a10, hairStyle: 'short', beard: 'short', headwear: 'band', bandCol: 0x3a6a8a, belt: 0x4a3a2a, smile: 0.6 },
  kid: KID({}),
  man: { skin: 0xd8b090, top: 0xeceaf2, long: true, trim: 0xd9c070, under: 0xeceaf2, hair: 0x3a3028, headwear: 'cloth', clothCol: 0xf2f0f8, bandCol: 0xd9b860, mantle: 0xd8d4e8, mantleTrim: 0xd9c070, sash: 0xd9c070, browAng: 0.3, eye: 0x6a6a7a },
  angel: { skin: 0xf0d8b8, top: 0xfffaf0, long: true, trim: 0xf0d070, under: 0xfffaf0, hair: 0xf0d890, hairStyle: 'long', sash: 0xf0d070, eye: 0x8aa0c8 },
  soldier: { skin: 0xc0885a, top: 0x7a4a2a, bottom: 0x6a3a22, trim: 0x3a2214, hair: 0x2a1a10, beard: 'short', headwear: 'cloth', clothCol: 0x8a5a3a, bandCol: 0x3a2214, mantle: 0x5a3a22, mantleShort: true, boots: 0x3a2a1e, wraps: 0x3a2a1e, belt: 0x2a1a10, browAng: 0.6 },
  labanSon: { skin: 0xd09868, top: 0x6a7aa0, bottom: 0x5a6a8a, trim: 0xd9a73a, under: 0xe0d4b8, beard: 'short', hair: 0x3a2a1a, hairStyle: 'short', headwear: 'band', bandCol: 0xd9a73a, belt: 0x4a3022, legWrap: 0x8a7a5a, browAng: 0.4 },
  labanSon2: { skin: 0xd09868, top: 0x8a6a9a, bottom: 0x6a5a7a, trim: 0xd9a73a, hair: 0x3a2a1a, hairStyle: 'curly', headwear: 'band', bandCol: 0xd9a73a, belt: 0x4a3022, wraps: 0x5a4030 },
  worker: { skin: 0xb88050, top: 0xb8a888, trim: 0x6a4a30, hair: 0x2a1a10, hairStyle: 'short', headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x6a4a30, belt: 0x4a3022, legWrap: 0x8a7a5a },
  herder: { skin: 0xc0885a, top: 0xb0a080, trim: 0x5a4030, hair: 0x2a1a10, beard: 'short', headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x4a3a2a, belt: 0x4a3022, legWrap: 0x8a7a5a, bag: 0x6a4a30 },
  traveler: { skin: 0xc0885a, top: 0x8a7a60, bottom: 0x6a5a48, trim: 0x4a3a2a, beard: 'long', beardCol: 0x6a5a4a, hair: 0x4a3a2a, headwear: 'cloth', clothCol: 0xb8a888, bandCol: 0x3a2a1a, mantle: 0x5a4a38, legWrap: 0x7a6a50, bag: 0x5a3a24, age: 'old' },
  caravan: { skin: 0xa86e44, long: true, stripes: [0x8a7458, 0x8a7458, 0x3a2a1a, 0x8a7458, 0xc8a050, 0x8a7458], stripesB: [0x8a7458, 0x3a2a1a, 0x8a7458, 0x8a7458, 0xc8a050, 0x8a7458], beard: 'short', hair: 0x1a1410, headwear: 'turban', clothCol: 0xf0e8d8, bandCol: 0x3a2a1a, sash: 0xb3472e, boots: 0x4a3426 },
  musician: { skin: 0xd09868, top: 0xb84a3a, trim: 0xe0b040, trim2: 0x2e4a78, hair: 0x2a1810, hairStyle: 'curly', sash: 0xe0b040, under: 0xe8dcc0, belt: 0x5a3a24, smile: 0.9 },
  boy: KID({ top: 0xc8b890, hairStyle: 'short', belt: 0x6a4428, legWrap: 0x9a8a6a }),
  oldwoman: { skin: 0xc8946a, top: 0x6a5a4a, long: true, trim: 0x3a2a22, hair: 0xb8b0a8, hairStyle: 'bun', headwear: 'veil', clothCol: 0x4a3a30, clothStripe: 0x8a6a48, fem: true, age: 'old', smile: 0.5, browAng: -0.2 },
};
const KIDLOOK = {
  reuben: KID({ top: 0xc8a070, trim: 0x6a4a2a, hairStyle: 'curly', legWrap: 0x9a8a6a }), simeon: KID({ top: 0x9a7a5a, trim: 0x4a3a2a, hairStyle: 'short' }), levi: KID({ top: 0xe0d8c0, trim: 0x3a6aa0, sash: 0x3a6aa0 }),
  judah: KID({ top: 0xb84a3a, trim: 0xe0b040, sash: 0xe0b040, hairStyle: 'wild' }), dan: KID({ top: 0x8aa0b8, trim: 0x4a5a7a }), naphtali: KID({ top: 0xa0b888, trim: 0x5a6a3a, hairStyle: 'short' }),
  gad: KID({ top: 0xb89a6a, trim: 0x5a3a22 }), asher: KID({ top: 0xe0c070, trim: 0x8a6a2a }), issachar: KID({ top: 0x8a7a5a, trim: 0x4a3a2a, hairStyle: 'short' }), zebulun: KID({ top: 0x7a9ab8, trim: 0x3a5a7a }),
  dinah: KID({ top: 0xd88a9a, trim: 0xa84a5a, long: true, hairStyle: 'long', fem: true, sash: 0xe0b040 }),
  joseph: KID({ top: 0xf0e6d0, trim: 0x8a5ac8, trim2: 0xe0b040, sash: 0x8a5ac8, skin: 0xe8b48a, eye: 0x5a3a20 }),
};

// ------------------------------------------------------------------ STEP HELPERS
let ORDER = [];
const idx = S => ORDER.indexOf(S.step);
const between = (S, a, b) => { const i = idx(S); return i >= ORDER.indexOf(a) && (b ? i <= ORDER.indexOf(b) : true); };
const before = (S, a) => idx(S) < ORDER.indexOf(a);
const built = (S, id) => !!S.built[id];
const labanN = G => G.herdCount('laban');
const jacobN = G => G.herdCount('jacob');
const qDone = (S, id) => !!(S.side && S.side.done && S.side.done[id] !== undefined);
const serveY = S => (S.q.serve || 0) - (S.q.serve0 || 0);
const heart = S => S.q.heart || 0;
const inHaran = S => between(S, 'j5_camp', 'j7_call');
function serveMetric(S) {
  const st = S.stats, h = st.harvest || {}, c = st.crafted || {}, k = (S.hero && S.hero.kills) || {};
  return (h.barley || 0) * 0.3 + (h.wheat || 0) * 0.35 + (h.lentil || 0) * 0.25 + (h.flax || 0) * 0.4 + (h.cucumber || 0) * 0.3 + (h.onion || 0) * 0.3
    + (st.troughFill || 0) + (st.sheared || 0) * 0.12 + (st.milked || 0) * 0.3 + (st.born || 0) * 0.4
    + (c.thread || 0) * 0.3 + (c.cloth || 0) * 1.5 + (c.linen || 0) * 1.2 + (c.cheese || 0) * 0.6 + ((c.grain || 0) + (c.grainW || 0)) + (c.bread || 0) * 0.4 + (c.bbread || 0) * 0.3
    + (st.earned || 0) * 0.05 + (k.wolf || 0) * 3 + (k.lion || 0) * 15 + (k.bear || 0) * 12 + (k.boar || 0) * 2 + (k.deer || 0) + (k.ibex || 0) * 1.5 + (k.gazelle || 0) * 0.6 + (k.hare || 0) * 0.3 + (k.partridge || 0) * 0.2
    + (st.quests || 0) * 4 + (st.fish || 0) * 0.4 + (S.q.bonusServe || 0);
}
const SERVE = (S, n) => { S.q.bonusServe = (S.q.bonusServe || 0) + n; };
// 가족: 태어난 해(가족의 해 번호)와 아이 크기
const BIRTHS = [['reuben'], ['simeon'], ['levi', 'dan'], ['judah', 'naphtali'], ['gad', 'asher'], ['issachar', 'zebulun'], ['dinah', 'joseph']];
const BORN = {}; BIRTHS.forEach((l, i) => l.forEach(k => BORN[k] = i + 1));
const kidAge = (S, id) => { if (!S.q.kidsBorn || !S.q.kidsBorn.includes(id)) return -1; return ((S.q.fy || 1) - BORN[id]) + (S.q.epi ? 7 : between(S, 'j7_wage') ? 1 : 0); };
const kidScale = (S, id) => clamp(0.4 + kidAge(S, id) * 0.045, 0.4, 0.8);
const BIRTHCARD = {
  reuben: ['르우벤', '"보라, 아들이라" · 여호와께서 나의 괴로움을 돌보셨다', '창세기 29:32'], simeon: ['시므온', '"들으심" · 여호와께서 내가 사랑받지 못함을 들으셨다', '창세기 29:33'],
  levi: ['레위', '"연합함" · 이제는 남편이 나와 연합하리로다', '창세기 29:34'], dan: ['단', '"억울함을 푸심" · 라헬의 여종 빌하가 낳은 아들', '창세기 30:6'],
  judah: ['유다', '"찬송함" · 내가 이제는 여호와를 찬송하리로다', '창세기 29:35'], naphtali: ['납달리', '"경쟁함" · 빌하가 낳은 둘째 아들', '창세기 30:8'],
  gad: ['갓', '"복됨" · 레아의 여종 실바가 낳은 아들', '창세기 30:11'], asher: ['아셀', '"기쁨" · 실바가 낳은 둘째 아들', '창세기 30:13'],
  issachar: ['잇사갈', '"값" · 하나님이 내게 값을 주셨다', '창세기 30:18'], zebulun: ['스불론', '"거함" · 이제는 남편이 나와 함께 거하리라', '창세기 30:20'],
  dinah: ['디나', '"판단" · 레아가 낳은 딸', '창세기 30:21'], joseph: ['요셉', '"더하심" · 하나님이 나의 부끄러움을 씻으셨다. 여호와는 또 다른 아들을 내게 더하시기를 원하노라', '창세기 30:23–24'] };

// ------------------------------------------------------------------ THE SEVEN YEARS (tycoon goals)
const SG = y => ({ t: S => `라반을 섬기기 · 섬김 ${Math.min(y, serveY(S))}/${y}`, ok: S => serveY(S) >= y });
const BG = (id, txt) => ({ t: () => txt, ok: S => built(S, id), target: 'site:' + id });
const QG = (id, txt) => ({ t: () => txt, ok: S => qDone(S, id), target: S => { const q = QUESTS[id] || {}, st = S.side && S.side.act && S.side.act[id]; if (!st || GG.Life.qOk(S, id)) return 'npc:' + (q.giver || 'laban'); return typeof q.loc === 'function' ? q.loc(S) : q.loc || null; } });
const YEARS = [
  { serve: 15, card: '첫 해. 라반의 밭에 보리가 처음으로 누렇게 익었습니다. 하란 사람들은 낯선 젊은이가 우물 돌을 홀로 옮겼다는 이야기를 오래 했습니다.', goals: [BG('trough2', '새 물구유 놓기 (돌 8, 통나무 2)')], gift: { s_barley: 8 } },
  { serve: 22, card: '둘째 해. 양털 깎는 날이면 하란 들판에 흰 털이 눈처럼 쌓였습니다.', goals: [BG('loom', '라반의 집에 베틀 짓기'), BG('hireShep', '목동 일꾼 고용하기 (매일 구유에 물을 채워요)')], gift: { s_wheat: 10 } },
  { serve: 30, card: '셋째 해. 야곱이 늑대를 쫓아낸 뒤로 라반의 양 떼는 밤에도 편히 누웠습니다.', goals: [BG('newfield', '밀밭 개간하기'), QG('wolves', '부탁 · 라반: 늑대 무리 소탕')], gift: { s_flax: 8, s_lentil: 6 } },
  { serve: 38, card: '넷째 해. 곳간이 차고, 하란 장터 사람들이 야곱이 가져오는 물건을 기다렸습니다.', goals: [BG('granary', '곳간 짓기'), { t: () => '라반에게 은 100 바치기', ok: S => !!S.q.paid4, target: 'npc:laban' }], gift: { s_wheat: 8 } },
  { serve: 45, card: '다섯째 해. "낮에는 더위와 밤에는 추위를 무릅쓰고 눈 붙일 겨를도 없이 지내었나이다." 그러나 덤불의 사자는 다시는 양 떼를 넘보지 못했습니다.', ref: '창세기 31:40', goals: [QG('lion', '부탁 · 우스: 덤불 속의 사자')], gift: { s_barley: 10 } },
  { serve: 52, card: '여섯째 해. 우리가 넓어지고, 라반의 집 여인들이 야곱이 짠 천으로 옷을 지었습니다.', goals: [BG('fold2', '양 우리 넓히기'), BG('hireHand', '밭일꾼 고용하기 (매일 라반의 밭에 물을 줘요)')], gift: { s_wheat: 10 } },
  { serve: 60, card: '일곱째 해. 야곱이 라헬을 위하여 칠 년 동안 라반을 섬겼으나, 그를 사랑하는 까닭에 칠 년을 며칠 같이 여겼더라.', ref: '창세기 29:20', goals: [{ t: (S, G) => `라반의 가축 ${Math.min(60, labanN(G))}/60마리`, ok: (S, G) => labanN(G) >= 60, target: 'pen:laban' }, { t: S => `라헬의 마음 ♥${Math.min(6, heart(S))}/6`, ok: S => heart(S) >= 6, target: 'npc:rachel' }] },
];
const FYEARS = [
  { serve: 20, goals: [BG('tents', '가족의 장막 세우기 (모직 천 2, 통나무 4)')], card: '여호와께서 레아가 사랑받지 못함을 보시고 그의 태를 여셨습니다.', ref: '창세기 29:31' },
  { serve: 24, goals: [QG('leahClothes', '부탁 · 레아: 아기 옷 지을 천')], card: '레아가 다시 임신하여 아들을 낳았습니다.', ref: '창세기 29:33' },
  { serve: 28, goals: [BG('hireWeaver', '직조공 고용하기 (매일 양털로 실을 자아요)')], card: '라헬이 자기가 야곱에게서 아들을 낳지 못함을 보고 언니를 시기하여 말했습니다. "내게 자식을 낳게 하라." 야곱이 말했습니다. "그대를 임신하지 못하게 하시는 이는 하나님이시니 내가 하나님을 대신하겠느냐." 라헬은 여종 빌하를 야곱에게 주었습니다.', ref: '창세기 30:1–4' },
  { serve: 32, goals: [QG('mandrakes', '부탁 · 르우벤: 들에서 찾은 합환채')], card: '레아가 넷째 아들을 낳고 "내가 이제는 여호와를 찬송하리로다" 했습니다.', ref: '창세기 29:35' },
  { serve: 36, goals: [BG('stall', '하란 장터에 좌판 열기 (매일 은을 벌어요)')], card: '레아도 자기의 여종 실바를 야곱에게 주었고, 실바가 아들 둘을 낳았습니다.', ref: '창세기 30:9–13' },
  { serve: 40, goals: [QG('bear', '부탁 · 라반: 북쪽 숲의 곰')], card: '하나님이 레아의 소원을 들으셨습니다.', ref: '창세기 30:17' },
  { serve: 44, goals: [{ t: (S, G) => `라반의 가축 ${Math.min(80, labanN(G))}/80마리`, ok: (S, G) => labanN(G) >= 80, target: 'pen:laban' }], card: '하나님이 라헬을 생각하신지라. 하나님이 그의 소원을 들으사 그의 태를 여셨으므로…', ref: '창세기 30:22' },
];
function yearList(S) { const Y = S.q.phase === 'family' ? FYEARS[(S.q.fy || 1) - 1] : YEARS[(S.q.year || 1) - 1]; return [SG(Y.serve)].concat(Y.goals); }
function startYear(S, G) { S.q.serve0 = S.q.serve || 0; G.UI.quest(); }

// ------------------------------------------------------------------ STEPS
const STAFF_NOTE = '지팡이는 공격 버튼(빨간 버튼)으로 휘두를 수도 있어요. 들짐승이 덤비면 점프 버튼이 "구르기"로 바뀌어요.';
const steps = {
  // ===== 1장 · 팥죽 한 그릇 (튜토리얼)
  j1_start: { ch: 1, obj: '장막 곁의 어머니 리브가와 이야기하기', target: 'npc:rebekah', enter(S, G, re) {
    if (!re) narr([{ kick: '창세기 25장', title: '쌍둥이', t: '이삭이 리브가를 아내로 맞았습니다. 리브가가 쌍둥이를 낳았는데, 먼저 나온 아이는 붉고 온몸이 털옷 같아 에서라 했고, 뒤에 나온 아이는 형의 발꿈치를 잡고 나와 야곱이라 했습니다.', ref: '창세기 25:20–26' },
      { kick: '창세기 25장', title: '들사람과 장막의 사람', t: '아이들이 자라자 에서는 능숙한 사냥꾼이 되어 들에 살았고, 야곱은 조용한 사람이 되어 장막에 머물렀습니다. 이삭은 에서를, 리브가는 야곱을 사랑했습니다.', ref: '창세기 25:27–28' },
      { kick: '1장', title: '팥죽 한 그릇', t: '왼쪽 아래를 눌러 걷고, 끝까지 밀면 뛰어요. 오른쪽 스틱이나 화면을 끌어 카메라를 돌려요. 금빛 빛기둥이 가야 할 곳이에요. A 버튼으로 말하고, 줍고, 일해요.', ref: '' }]); },
    talk: { rebekah(S, G) { say([N('rebekah', '야곱아, 네 형 에서는 오늘도 새벽부터 사냥하러 들로 나갔구나.'), N('rebekah', '장막을 지키는 너도 할 일이 많단다. 드보라에게 밭일을 배우렴. 렌틸콩을 심어 두면 요긴하게 쓰일 거야.'), J('네, 어머니.')], () => G.go('j1_deborah')); } } },
  j1_deborah: { ch: 1, obj: '유모 드보라에게 일 배우기', target: 'npc:deborah',
    talk: { deborah(S, G) { say([N('deborah', '도련님, 밭을 갈려면 괭이가 있어야지요.'), N('deborah', '들에 떨어진 마른 나뭇가지 셋과 돌 둘을 모아 오세요. 가까이 가서 A 버튼을 누르면 주울 수 있어요.', '드보라: 리브가의 유모 (창 35:8)')], () => G.go('j1_gather')); } } },
  j1_gather: { ch: 1, obj: '괭이 재료 모으기', list: (S, G) => [{ t: `마른 나뭇가지 ${Math.min(3, G.inv('branch'))}/3`, ok: G.have('branch', 3) }, { t: `돌 ${Math.min(2, G.inv('stone'))}/2`, ok: G.have('stone', 2) }],
    target: (S, G) => !G.have('branch', 3) ? 'node:deadwood' : 'node:rock', check: (S, G) => G.have('branch', 3) && G.have('stone', 2),
    done(S, G, next) { say([N('deborah', '잘 모으셨어요! 오른쪽 위 메뉴 → 제작 탭에서 괭이를 만들어 보세요.')], next); }, next: 'j1_hoe' },
  j1_hoe: { ch: 1, obj: '메뉴 → 제작에서 괭이 만들기', check: (S, G) => G.tool('hoe'), next: 'j1_till', done(S, G, next) { G.UI.toast('괭이를 손에 들었다'); next(); } },
  j1_till: { ch: 1, obj: (S, G) => `장막 옆 텃밭 6칸 갈기 (${Math.min(6, G.plotStats('lentil').tilled)}/6)`, target: 'field:lentil', check: (S, G) => G.plotStats('lentil').tilled >= 6,
    enter(S, G, re) { if (!re) G.UI.toast('밭 칸을 바라보고 A 버튼을 누르세요. 누르고 있으면 계속 일해요'); },
    done(S, G, next) { G.give('s_lentil', 6); say([N('deborah', '흙이 부드러워졌네요. 이 렌틸콩 씨앗을 한 칸에 하나씩 심으세요.')], next); }, next: 'j1_plant' },
  j1_plant: { ch: 1, obj: (S, G) => `렌틸콩 씨앗 심기 (${Math.min(6, G.plotStats('lentil').planted)}/6)`, target: 'field:lentil', check: (S, G) => G.plotStats('lentil').planted >= 6,
    done(S, G, next) { G.giveTool('jar'); say([N('deborah', '이 물항아리를 드릴게요. 우물에서 물을 길어 밭에 물을 주세요.'), N('deborah', '물을 준 렌틸콩은 하룻밤이면 여물어요.')], next); }, next: 'j1_water' },
  j1_water: { ch: 1, obj: (S, G) => `우물에서 물 길어 밭에 물 주기 (${G.plotStats('lentil').watered}/6)`, target: (S, G) => S.water > 0 ? 'field:lentil' : 'spot:well', check: (S, G) => G.plotStats('lentil').watered >= 6,
    done(S, G, next) { if (!G.tool('staff')) G.giveTool('staff'); say([N('deborah', '잘하셨어요! 렌틸콩이 물을 마시는 동안 한 가지만 더 도와주세요.'), N('deborah', '이삭 어르신의 염소 네 마리가 서쪽 풀밭으로 나가 버렸어요. 이 지팡이를 받으세요. 아버님이 젊을 적에 쓰시던 거예요.'), T('목자의 지팡이를 얻었다. 염소에게 다가가 A를 누르면 야곱을 따라와요. 우리 안까지 데려가세요.')], next); }, next: 'j1_goats' },
  j1_goats: { ch: 1, obj: S => `풀밭의 염소를 우리로 몰고 오기 (${S.q.goatsIn || 0}/4)`, target: (S, G) => G.P.follow.some(f => f.d.goat) ? 'pen:isaacGoats' : (() => { const g = ['goatA', 'goatB', 'goatC', 'goatD'].map(k => G.npc(k)).find(n => n && n.vis && !n.follow && !(S.q.gin || {})[n.id]); return g ? { x: g.x, z: g.z } : null; })(),
    enter(S, G, re) { if (!re) narr([{ kick: '목축 안내', title: '목자의 일', t: '염소에게 다가가 "몰기"를 누르면 줄지어 따라와요. 너무 빨리 뛰면 뒤처지니 천천히 걸으세요. 이삭의 염소 우리 안으로 들어가면 한 마리씩 들어가요.', ref: '' }]); },
    check: S => (S.q.goatsIn || 0) >= 4, done(S, G, next) { say([N('herder', '야곱 도련님이 염소를 다 데려왔구먼! 에서 도련님은 사냥만 좋아하시는데…'), N('deborah', '이제 젖을 짜 보세요. 우리 앞에서 "돌보기"를 누르면 돼요.')], next); }, next: 'j1_milk' },
  j1_milk: { ch: 1, obj: '이삭의 염소 젖 짜기', target: 'pen:isaacGoats', check: S => (S.stats.milked || 0) > 0,
    done(S, G, next) { say([N('deborah', '고소한 젖이네요. 아버님께 무화과와 함께 갖다 드리면 좋아하실 거예요. 장막 둘레 무화과나무 가지를 흔들면 열매가 떨어져요.')], next); }, next: 'j1_figs' },
  j1_figs: { ch: 1, obj: '아버지 이삭께 무화과와 젖 갖다 드리기', list: (S, G) => [{ t: `무화과 ${Math.min(2, G.inv('fig'))}/2`, ok: G.have('fig', 2) || S.q.isaacFed }, { t: '염소젖 1', ok: G.have('milk') || S.q.isaacFed }],
    target: (S, G) => G.have('fig', 2) ? 'npc:isaac' : 'node:fig', check: S => !!S.q.isaacFed,
    talk: { isaac(S, G) { if (!G.have('fig', 2) || !G.have('milk')) { say([N('isaac', '야곱이냐? 목소리가 들리는구나…')]); return; }
      say([J('아버지, 무화과와 염소젖을 가져왔어요.'), N('isaac', '고맙구나. 네 형은 늘 사냥한 고기를 가져오지. 나는 그 별미를 좋아한단다.', '창세기 25:28'), N('isaac', '하지만 야곱아, 하나님은 아브라함에게 이 땅을 약속하셨다. 그 약속을 가볍게 여기지 말거라.'),
        T('이삭의 말이 마음에 오래 남았다. (깨달음 +1)')], () => { G.take('fig', 2); G.take('milk', 1); S.q.isaacFed = 1; G.insight(1, '아버지의 말'); G.checkStep(); }); } },
    done(S, G, next) { say([N('deborah', '해가 많이 기울었네요. 오늘은 도련님 장막에서 쉬세요. 자고 나면 렌틸콩이 여물어 있을 거예요.')], next); }, next: 'j1_sleep' },
  j1_sleep: { ch: 1, obj: '야곱의 장막에서 자기', target: 'spot:bed', check: S => S.day > 1, next: 'j1_grow' },
  j1_grow: { ch: 1, obj: (S, G) => `여문 렌틸콩 거두기 (${Math.min(6, S.stats.harvest.lentil || 0)}/6)`, target: 'field:lentil',
    check: S => (S.stats.harvest.lentil || 0) >= 6, done(S, G, next) { say([N('deborah', '렌틸콩이 붉게 잘 여물었네요! 모닥불에서 붉은 팥죽을 끓일 수 있어요.'), T('메뉴 → 제작 → 붉은 팥죽 (렌틸콩 3, 나뭇가지 1, 물 1). 모닥불 근처에서 만들 수 있어요.')], next); }, next: 'j1_stew' },
  j1_stew: { ch: 1, obj: '모닥불 곁에서 붉은 팥죽 끓이기', target: 'spot:fire', check: (S, G) => G.have('stew'), next: 'j1_esau',
    done(S, G, next) { G.npcTo('esau', -40, 196, 0); G.npcWalk('esau', 5, 171, null, 1.6); next(); } },
  j1_esau: { ch: 1, obj: '들에서 지쳐 돌아온 에서 만나기', target: 'npc:esau',
    talk: { esau(S, G) {
      say([T('에서가 들에서 돌아왔는데 몹시 지쳐 있었습니다.', '창세기 25:29'), N('esau', '내가 피곤하니 그 붉은 것을 내가 먹게 하라.', '창세기 25:30'), T('그러므로 에서의 별명을 에돔(붉음)이라 하였습니다.', '창세기 25:30'),
        J('형의 장자의 명분을 오늘 내게 팔라.', '창세기 25:31'), N('esau', '내가 죽게 되었으니 이 장자의 명분이 내게 무엇이 유익하리요.', '창세기 25:32'), J('오늘 내게 맹세하소서.', '창세기 25:33'),
        T('에서가 맹세하고 장자의 명분을 야곱에게 팔았습니다. 야곱이 떡과 팥죽을 에서에게 주매, 에서가 먹고 마시고 일어나 갔으니 에서가 장자의 명분을 가볍게 여김이었더라.', '창세기 25:33–34')],
      () => { G.take('stew'); G.npcWalk('esau', -18, 178, null, 1.4); narr([{ kick: '1장 끝', title: '가볍게 여긴 것', t: '하나님의 약속을 이어받을 장자의 명분이 한 그릇의 팥죽과 바뀌었습니다. 이 일은 두 형제의 앞날에 오래도록 그림자를 드리웠습니다.', ref: '창세기 25:34' }], () => { G.insight(1, '1장'); G.go('j2_start'); }); }); } } },
  // ===== 2장 · 이삭의 축복
  j2_start: { ch: 2, obj: '어머니 리브가에게 가기', target: 'npc:rebekah', enter(S, G, re) {
    if (!re) narr([{ kick: '2장', title: '이삭의 축복', t: '세월이 흘러 이삭이 나이 많아 눈이 어두워 잘 보지 못하게 되었습니다. 이삭이 맏아들 에서를 불러 말했습니다. "사냥하여 내가 즐기는 별미를 만들어 오너라. 내가 죽기 전에 너를 축복하리라."', ref: '창세기 27:1–4' }, { kick: '창세기 27:5–6', t: '리브가가 그 말을 듣고, 에서가 사냥하러 들로 나가자 야곱을 불렀습니다.', ref: '' }]);
    G.npcTo('esau', -110, 190, 0, true); },
    talk: { rebekah(S, G) { say([N('rebekah', '네 아버지가 에서에게 별미를 만들어 오면 축복하겠다고 하셨다.', '창세기 27:6–7'), N('rebekah', '이제 염소 떼에 가서 좋은 염소 새끼 둘을 내게로 끌어오너라. 내가 아버지가 즐기시는 별미를 만들리라.', '창세기 27:9'),
      J('내 형 에서는 털이 많은 사람이요 나는 매끈매끈한 사람인즉, 아버지께서 나를 만지실진대 내가 속이는 자로 보일지라. 복은 고사하고 저주를 받을까 하나이다.', '창세기 27:11–12'),
      N('rebekah', '내 아들아, 너의 저주는 내게로 돌리리니 내 말만 따르라.', '창세기 27:13')], () => G.go('j2_kids')); } } },
  j2_kids: { ch: 2, obj: (S, G) => `염소 떼에서 좋은 새끼 둘 데려오기 (${G.P.follow.filter(f => f.id === 'kid1' || f.id === 'kid2').length}/2)`, target: (S, G) => G.P.follow.filter(f => f.id === 'kid1' || f.id === 'kid2').length < 2 ? 'pen:isaacGoats' : 'npc:rebekah',
    check: (S, G) => G.P.follow.filter(f => f.id === 'kid1' || f.id === 'kid2').length >= 2 && G.dist(G.npc('rebekah').x, G.npc('rebekah').z) < 5,
    talk: { kid1(S, G) { G.npcFollow('kid1', true); G.UI.toast('염소 새끼가 따라온다'); }, kid2(S, G) { G.npcFollow('kid2', true); G.UI.toast('염소 새끼가 따라온다'); } },
    done(S, G, next) { G.UI.fade(() => { ['kid1', 'kid2'].forEach(k => { G.npcFollow(k, false); G.npcShow(k, false); }); G.setOutfit('esauGarb'); G.give('meal', 1); },
      () => narr([{ kick: '창세기 27:14–17', t: '리브가가 이삭이 즐기는 별미를 만들고, 집 안에 둔 에서의 좋은 옷을 야곱에게 입히고, 염소 새끼의 가죽을 그의 손과 목의 매끈매끈한 곳에 입혔습니다. 그리고 별미와 떡을 야곱의 손에 주었습니다.', ref: '창세기 27:15–17' }], next)); }, next: 'j2_isaac' },
  j2_isaac: { ch: 2, obj: '별미를 들고 아버지 이삭의 장막으로', target: 'npc:isaac',
    talk: { isaac(S, G) { say([J('내 아버지여.'), N('isaac', '내가 여기 있노라. 아들아, 네가 누구냐?', '창세기 27:18'), J('나는 아버지의 맏아들 에서로소이다. 아버지께서 명하신 대로 하였사오니 일어나 앉아서 내가 사냥한 고기를 잡수시고 마음껏 내게 축복하소서.', '창세기 27:19'),
      N('isaac', '내 아들아, 네가 어떻게 이같이 속히 잡았느냐?', '창세기 27:20'), J('아버지의 하나님 여호와께서 나로 순조롭게 만나게 하셨음이니이다.', '창세기 27:20'), N('isaac', '내 아들아, 가까이 오라. 네가 과연 내 아들 에서인지 아닌지 내가 너를 만져 보려 하노라.', '창세기 27:21'),
      T('이삭이 그를 만지며 말했습니다.'), N('isaac', '음성은 야곱의 음성이나 손은 에서의 손이로다.', '창세기 27:22'), N('isaac', '네가 참 내 아들 에서냐?'), J('그러하니이다.', '창세기 27:24'),
      T('이삭이 먹고 마신 뒤 야곱에게 입 맞추고 그 옷의 향취를 맡으며 축복했습니다.', '창세기 27:25–27'),
      N('isaac', '내 아들의 향취는 여호와께서 복 주신 밭의 향취로다. 하나님은 하늘의 이슬과 땅의 기름짐이며 풍성한 곡식과 포도주를 네게 주시기를 원하노라. 만민이 너를 섬기고 열국이 네게 굴복하리니…', '창세기 27:27–29')],
      () => { G.take('meal'); narr([{ kick: '창세기 27:30–38', title: '소리 내어 운 에서', t: '야곱이 나가자마자 에서가 사냥하여 돌아왔습니다. 이삭은 심히 크게 떨었고, 에서는 소리 내어 울며 말했습니다. "내 아버지여, 내게 빌 복이 이 하나뿐이리이까?"', ref: '창세기 27:30–38' },
        { kick: '창세기 27:41–45', t: '에서는 아버지가 야곱에게 빈 복 때문에 야곱을 미워하여 "내가 내 아우 야곱을 죽이리라" 하였습니다. 리브가가 야곱에게 말했습니다. "너는 일어나 하란의 내 오라버니 라반에게로 피신하여, 네 형의 노가 풀리기까지 몇 날 동안 그와 함께 거주하라."', ref: '창세기 27:41–44' },
        { kick: '창세기 28:1–5', t: '이삭이 야곱을 불러 축복하고 말했습니다. "밧단아람으로 가서 네 외삼촌 라반의 딸 중에서 아내를 맞이하라. 전능하신 하나님이 네게 복을 주시기를 원하노라."', ref: '창세기 28:1–4' }], () => { G.setOutfit('jacob'); G.go('j2_pack'); }); }); } } },
  j2_pack: { ch: 2, obj: '먼 길 떠날 채비', list: (S, G) => [{ t: '목자의 지팡이 챙기기', ok: G.tool('staff') }, { t: '어머니와 작별 인사하기', ok: !!S.flags.farewell }],
    target: (S, G) => !G.tool('staff') ? (G.have('branch', 2) ? null : 'node:deadwood') : 'npc:rebekah', check: (S, G) => G.tool('staff') && S.flags.farewell, next: 'j3_start',
    talk: { rebekah(S, G) { if (!G.tool('staff')) { say([N('rebekah', '먼 길이란다. 지팡이를 하나 만들어 가거라. 길에서 너를 지켜 줄 거야.')]); return; }
      say([N('rebekah', '내 아들아… 네 형의 노가 풀리면 내가 사람을 보내어 너를 데려오리라.', '창세기 27:45'), N('rebekah', '이 기름병도 가져가렴. 하나님께 드릴 일이 생길지 모르니.'), J('어머니, 평안히 계세요.')], () => { S.flags.farewell = 1; G.give('oilFlask', 1); G.give('bread', 2); G.insight(1, '2장'); G.checkStep(); }); } } },
  // ===== 3장 · 벧엘의 꿈
  j3_start: { ch: 3, obj: '북쪽 루스 땅으로 걸어가기', target: 'spot:luz', enter(S, G, re) { if (!re) narr([{ kick: '3장', title: '벧엘의 꿈', t: '야곱이 브엘세바에서 떠나 하란으로 향하여 갔습니다. 홀로, 지팡이 하나만 들고.', ref: '창세기 28:10; 32:10' }, { kick: '여행 안내', t: '먼 길이에요. 달리기 버튼을 누르면 빨리 뛰지만 기력이 줄어요. 가방의 빵을 먹으면 기력이 차올라요. 길가의 들토끼와 자고새는 사냥할 수도 있어요.', ref: '' }]); },
    check: (S, G) => G.dist(SPOTS.luz[0], SPOTS.luz[1]) < 9, done(S, G, next) { if (G.hour() < 18.6) S.time = 18.7; narr([{ kick: '창세기 28:11', t: '한 곳에 이르러는 해가 진지라. 야곱은 거기서 밤을 지내려 했습니다.', ref: '창세기 28:11' }], next); }, next: 'j3_stone' },
  j3_stone: { ch: 3, obj: '그곳의 돌 하나를 가져다 베개로 삼기', target: 'spot:pillow', enter(S) { if (S.time % 24 < 18.6) S.time = 18.7; } },
  j3_sleep: { ch: 3, obj: '돌을 베고 누워 잠들기', target: 'spot:sleep' },
  j3_pillar: { ch: 3, obj: '베개로 삼았던 돌을 기둥으로 세우고 기름 붓기', target: 'spot:sleep' },
  // ===== 4장 · 하란의 우물
  j4_start: { ch: 4, obj: '동방 하란 들판의 우물 찾아가기', target: 'spot:fieldWell', enter(S, G, re) { if (!re) narr([{ kick: '4장', title: '하란의 우물', t: '야곱이 길을 떠나 동방 사람의 땅에 이르렀습니다. 들에 우물이 있고, 그 곁에 양 세 떼가 누워 있었습니다. 우물 아귀를 덮은 돌은 컸습니다.', ref: '창세기 29:1–2' }]); },
    check: (S, G) => G.dist(SPOTS.fieldWell[0], SPOTS.fieldWell[1]) < 14, next: 'j4_shep' },
  j4_shep: { ch: 4, obj: '우물 곁의 목자들과 이야기하기', target: 'npc:shep1',
    talk: { shep1(S, G) { say([J('내 형제여, 어디서부터 왔느냐?', '창세기 29:4'), N('shep1', '하란에서 왔노라.'), J('너희가 나홀의 손자 라반을 아느냐?', '창세기 29:5'), N('shep1', '아노라.'), J('그가 평안하냐?', '창세기 29:6'), N('shep1', '평안하니라. 보라, 그의 딸 라헬이 지금 양을 몰고 오느니라.'),
      J('해가 아직 높은즉 가축 모일 때가 아니니 양에게 물을 먹이고 가서 풀을 뜯게 하라.', '창세기 29:7'), N('shep1', '우리가 그리하지 못하겠노라. 떼가 다 모이고 목자들이 우물 아귀에서 돌을 옮겨야 우리가 양에게 물을 먹이느니라.', '창세기 29:8')],
      () => { G.npcShow('rachel', true); G.npcTo('rachel', 20, -95, 2.5, false); G.npcWalk('rachel', 40, -119, () => G.checkStep(), 1.6); G.go('j4_stone'); G.UI.toast('라헬이 양 떼를 몰고 온다'); }); } } },
  j4_stone: { ch: 4, obj: '우물 아귀의 큰 돌 굴려 내기', target: 'spot:fieldWell' },
  j4_water: { ch: 4, obj: (S, G) => `라헬의 양 떼 구유에 물 붓기 (${S.q.wtr || 0}/4)`, target: (S, G) => S.water >= 3 ? { x: 41, z: -121 } : 'spot:fieldWell', check: S => (S.q.wtr || 0) >= 4,
    done(S, G, next) { say([T('야곱이 라헬에게 입 맞추고 소리 내어 울었습니다.', '창세기 29:11'), J('나는 그대 아버지의 생질이요 리브가의 아들이라.', '창세기 29:12'), T('라헬이 달려가서 그 아버지에게 알렸습니다. 라반이 생질 야곱의 소식을 듣고 달려와서 그를 영접하여 안고 입 맞추었습니다.', '창세기 29:12–13')],
      () => { S.flags.rachelSeen = 1; G.npcShow('laban', true); G.npcTo('laban', 50, -128, 3.5, false); next(); }); }, next: 'j4_laban' },
  j4_laban: { ch: 4, obj: '외삼촌 라반과 이야기하기', target: 'npc:laban',
    talk: { laban(S, G) { say([N('laban', '너는 참으로 나의 골육이로다!', '창세기 29:14'), N('laban', '자, 우리 집으로 가자. 이곳 들판 동쪽 언덕 너머에 내 집이 있다.')], () => G.UI.fade(() => { G.npcShow('laban', undefined); G.npcShow('rachel', undefined); G.npcTo('laban', 90, -156, 0, false); G.npcTo('rachel', 96, -150, -0.5, false); G.teleport(84, -148, 2.6); S.time = 8; },
      () => narr([{ kick: '창세기 29:14', t: '야곱이 한 달 동안 라반과 함께 지냈습니다.', ref: '창세기 29:14' }], () => { G.insight(1, '4장'); G.go('j5_start'); }))); } } },
  // ===== 5장 · 라헬을 위한 칠 년 (본게임)
  j5_start: { ch: 5, obj: '라반과 품삯 이야기하기', target: 'npc:laban', enter(S, G, re) { if (!re) narr([{ kick: '5장', title: '라헬을 위한 칠 년', t: '하란에서의 날들이 시작됩니다. 밭을 갈고, 양을 치고, 들짐승을 사냥하고, 장터에서 사고팔며 라반의 집을 일으켜 보세요.', ref: '창세기 29:15–30' }]); },
    talk: { laban(S, G) { say([N('laban', '네가 비록 내 생질이나 어찌 그저 내 일을 하겠느냐? 네 품삯을 어떻게 할지 내게 말하라.', '창세기 29:15'),
      T('라반에게 두 딸이 있었습니다. 언니의 이름은 레아요 아우의 이름은 라헬이었습니다. 레아는 시력이 약하고 라헬은 곱고 아리따웠습니다. 야곱은 라헬을 사랑했습니다.', '창세기 29:16–18'),
      { n: '야곱', t: '어떻게 말할까?', choices: [{ t: '"내가 외삼촌의 작은 딸 라헬을 위하여 외삼촌에게 칠 년을 섬기리이다."', ref: '창세기 29:18' }] },
      N('laban', '그를 네게 주는 것이 타인에게 주는 것보다 나으니 나와 함께 있으라.', '창세기 29:19'),
      N('laban', '내 밭과 양 떼를 네게 맡기마. 보리 씨앗을 줄 테니 집 남쪽 밭을 일구거라. 동쪽 들판 끝에 사는 사냥꾼 우스에게도 인사하거라. 들짐승 다루는 법을 아는 사람이다.')],
      () => { G.give('s_barley', 14); G.unlock('barleyL'); G.go('j5_camp'); }); } } },
  j5_camp: { ch: 5, obj: '라반의 집 사람들과 인사하기', list: S => [{ t: '동쪽 들판의 사냥꾼 우스 만나기', ok: !!S.q.metHunter }, { t: '하란 장터 대장장이의 화덕 둘러보기', ok: !!S.q.sawSmith }, { t: '라헬과 이야기하기', ok: !!S.q.talkRachel }],
    target: S => !S.q.metHunter ? 'npc:hunter' : !S.q.sawSmith ? 'npc:smith' : 'npc:rachel', check: S => S.q.metHunter && S.q.sawSmith && S.q.talkRachel,
    talk: { hunter(S, G) { if (S.q.metHunter) return false; say([N('hunter', '네가 리브가의 아들이로구나. 우물 돌을 혼자 굴렸다는 그 젊은이!'), N('hunter', '나는 나홀 집안의 우스다. 젊을 적부터 하란 들판에서 짐승을 쫓았지.'),
        N('hunter', '이 물매를 받게. 돌을 넣고 빙빙 돌리다 놓으면 멀리 있는 짐승도 맞힐 수 있어. 돌은 들판 어디에나 있지.'),
        N('hunter', '가젤이나 토끼는 겁이 많아. 천천히 걸어 다가가면 덜 놀란다네. 하지만 멧돼지와 늑대는 먼저 덤벼들어. 짐승이 몸을 웅크리면 곧 달려든다는 뜻이니, 그때 옆으로 굴러 피하고 다시 치게.'),
        N('hunter', '잡은 짐승은 가까이 가서 손질하면 고기와 가죽과 뼈를 얻는다. 가끔 희귀한 뿔이나 뼈가 나오면 내게 보여 주게. 좋은 무기가 될 테니.'),
        T('물매를 얻었다! 가방 옆 무기 버튼으로 근접·원거리를 바꿀 수 있어요. ' + STAFF_NOTE)], () => { S.q.metHunter = 1; CB().giveGear('sling', true); G.give('stone', 10, true); G.UI.toast('물매와 돌 10개를 얻었다'); G.checkStep(); }); },
      smith(S, G) { if (S.q.sawSmith) return false; say([N('smith', '낯선 얼굴이군. 라반 집 일꾼인가?'), N('smith', '뼈든 뿔이든 가져오면 무기를 손봐 주지. 내 화덕이나 모닥불 곁에서 메뉴 → 장비를 열면 강화할 수 있네.'), N('smith', '화살촉도 팔고, 구리 칼도 있지. 구리 칼로 짐승을 손질하면 가죽을 하나 더 얻는다네.')], () => { S.q.sawSmith = 1; G.checkStep(); }); },
      rachel(S, G) { if (S.q.talkRachel) return false; say([N('rachel', '야곱… 우물가에서 처음 만났던 날을 잊지 못할 거예요.'), J('나는 그대를 위하여 일곱 해를 섬기기로 했소.'), N('rachel', '일곱 해라니요…! 들꽃을 좋아해요. 언덕에 붉은 꽃이 피면 하나 꺾어 주세요.'), T('라헬에게 선물을 주거나 부탁을 들어주면 "라헬의 마음"이 자라요.')], () => { S.q.talkRachel = 1; G.heart(1); G.checkStep(); }); } },
    done(S, G, next) { narr([{ kick: '하란의 날들', title: '섬김과 일곱 해', t: '밭일, 목축, 사냥, 낚시, 장사, 부탁… 라반의 집을 위해 하는 모든 일이 "섬김"이 돼요. 해마다 섬김을 채우고 그해의 큰일을 마치면 한 해가 지나요. 일꾼을 고용하고 건물을 지으면 일이 저절로 돌아가요. 메뉴 → 일지에서 라반 집안 장부를 볼 수 있어요.', ref: '' }], () => { S.q.year = 1; S.q.phase = 'tycoon'; S.q.lastM = serveMetric(S); startYear(S, G); next(); }); }, next: 'j5_year' },
  j5_year: { ch: 5, obj: S => `라헬을 위한 ${S.q.year || 1}년째`, list: (S, G) => yearList(S).map(g => ({ t: g.t(S, G), ok: g.ok(S, G) })),
    target: (S, G) => { const g = yearList(S).find(g => !g.ok(S, G) && g.target); return g ? (typeof g.target === 'function' ? g.target(S, G) : g.target) : null; },
    check: (S, G) => yearList(S).every(g => g.ok(S, G)),
    done(S, G, next) { const y = S.q.year, Y = YEARS[y - 1]; G.sfx && G.sfx('levelup');
      narr([{ kick: `${y}년이 지났다`, title: y < 7 ? `${y}년째의 일을 마쳤다` : '칠 년이 찼다', t: Y.card, ref: Y.ref || '' }], () => {
        G.insight(1, `${y}년째`); if (y < 7) { S.q.year++; startYear(S, G); if (Y.gift) for (const k in Y.gift) G.give(k, Y.gift[k]); G.go('j5_year'); } else G.go('j5_wedding'); }); } },
  j5_wedding: { ch: 5, obj: '라반에게 아내를 청하기', target: 'npc:laban',
    talk: { laban(S, G) { say([J('내 기한이 찼으니 내 아내를 내게 주소서.', '창세기 29:21'), N('laban', '좋다! 하란 사람들을 다 불러 잔치를 베풀자!')], () => feast(S, G)); } } },
  j5_more: { ch: 5, obj: '라헬을 위한 칠 일 채우기', target: 'npc:rachel', talk: { rachel(S, G) {
    say([N('rachel', '야곱… 언니를 원망하지 마세요. 아버지가 하신 일이에요.'), J('칠 일을 채우고, 다시 일곱 해를 섬기겠소. 그대를 위해서라면.'), T('야곱은 그대로 하여 칠 일을 채웠고, 라반은 딸 라헬도 그에게 아내로 주고 자기의 여종 빌하를 라헬에게 주어 시녀가 되게 하였습니다.', '창세기 29:28–29'),
      T('야곱이 라헬에게로 들어갔고, 그가 레아보다 라헬을 더 사랑하여 다시 칠 년 동안 라반을 섬겼더라.', '창세기 29:30')], () => { S.q.married = 1; G.heart(2); G.insight(2, '5장'); G.go('j6_start'); }); } } },
  // ===== 6장 · 열한 아들 (다시 칠 년)
  j6_start: { ch: 6, obj: S => `다시 칠 년 · ${S.q.fy || 1}년째`, enter(S, G, re) { if (!re) { narr([{ kick: '6장', title: '열한 아들', t: '다시 일곱 해. 이번에는 야곱의 가족이 늘어 갑니다. 해마다 섬김을 채우고 그해의 큰일을 마치면, 자녀가 태어나요.', ref: '창세기 29:31–30:24' }]); S.q.phase = 'family'; S.q.fy = 1; startYear(S, G); } },
    list: (S, G) => yearList(S).map(g => ({ t: g.t(S, G), ok: g.ok(S, G) })), target: (S, G) => { const g = yearList(S).find(g => !g.ok(S, G) && g.target); return g ? (typeof g.target === 'function' ? g.target(S, G) : g.target) : null; },
    check: (S, G) => yearList(S).every(g => g.ok(S, G)),
    done(S, G, next) { const fy = S.q.fy, Y = FYEARS[fy - 1], kids = BIRTHS[fy - 1];
      const cards = [{ kick: `다시 칠 년 · ${fy}년째`, title: '', t: Y.card, ref: Y.ref }].concat(kids.map(k => ({ kick: BIRTHCARD[k][2], title: BIRTHCARD[k][0], t: BIRTHCARD[k][1], ref: '' })));
      G.sfx && G.sfx('baby'); narr(cards, () => { S.q.kidsBorn = (S.q.kidsBorn || []).concat(kids); G.insight(1, BIRTHCARD[kids[0]][0]); refreshKids(S, G);
        if (fy < 7) { S.q.fy++; startYear(S, G); G.go('j6_start', true); } else { narr([{ kick: '창세기 30:24', title: '요셉', t: '열한째 아들 요셉이 태어났습니다. 훗날 꿈꾸는 자가 될 아이였습니다. 야곱의 장막은 아이들의 웃음소리로 가득 찼습니다.', ref: '' }], () => G.go('j7_wage')); } }); } },
  // ===== 7장 · 점 있고 아롱진 양
  j7_wage: { ch: 7, obj: '라반에게 고향으로 돌아가겠다고 말하기', target: 'npc:laban', enter(S, G, re) { if (!re) narr([{ kick: '7장', title: '점 있고 아롱진 양', t: '라헬이 요셉을 낳았을 때에, 야곱은 고향으로 돌아갈 생각을 했습니다.', ref: '창세기 30:25' }]); },
    talk: { laban(S, G) { say([J('나를 보내어 내 고향 나의 땅으로 가게 하소서. 내가 외삼촌을 섬기고 얻은 처자를 내게 주시어 나로 가게 하소서.', '창세기 30:25–26'),
      N('laban', '내가 너로 말미암아 여호와께서 내게 복 주신 줄을 깨달았노니… 네 품삯을 정하라. 내가 그것을 주리라.', '창세기 30:27–28'),
      J('내가 오기 전에는 외삼촌의 소유가 적더니 번성하여 떼를 이루었으니, 여호와께서 나의 발이 이르는 곳마다 외삼촌에게 복을 주셨나이다.', '창세기 30:30'),
      J('오늘 내가 외삼촌의 양 떼에 두루 다니며, 양 중에 아롱진 것과 점 있는 것과 검은 것을 가려내며, 염소 중에 점 있는 것과 아롱진 것을 가려내리니, 이 같은 것이 내 품삯이 되리이다.', '창세기 30:32'),
      N('laban', '내가 네 말대로 하리라.', '창세기 30:34'),
      T('그 날에 라반이 점 있는 것과 아롱진 것과 검은 것을 다 가려 자기 아들들의 손에 맡기고, 자기와 야곱의 사이를 사흘 길이 뜨게 하였습니다.', '창세기 30:35–36')],
      () => { G.removeAnimals('laban', 999, a => a[1] !== 'plain'); S.q.wage = ['speckled', 'spotted', 'brown']; G.go('j7_fold'); }); } } },
  j7_fold: { ch: 7, obj: '동쪽으로 떨어진 곳에 야곱의 우리 짓기', target: 'site:jacobFold', check: S => built(S, 'jacobFold'), next: 'j7_rods',
    done(S, G, next) { say([T('야곱의 품삯이 될 양과 염소는 이 우리로 모입니다.')], next); } },
  j7_rods: { ch: 7, obj: '껍질 벗긴 가지를 라반의 물구유 앞에 세우기', list: (S, G) => [{ t: `제작에서 껍질 벗긴 가지 만들기 (${Math.min(2, G.inv('rod'))}/2)`, ok: G.have('rod', 2) || !!S.flags.rodsUsed }, { t: '라반의 우리 → 가지 세우기', ok: !!S.flags.rodsUsed }],
    target: (S, G) => G.have('rod', 2) ? 'pen:laban' : (G.have('branch', 3) ? null : 'node:poplar,deadwood'),
    enter(S, G, re) { if (!re) narr([{ kick: '창세기 30:37–38', title: '흰 무늬', t: '야곱이 버드나무와 살구나무와 신풍나무의 푸른 가지를 가져다가 껍질을 벗겨 흰 무늬를 내고, 양 떼가 물을 먹으러 올 때에 그 껍질 벗긴 가지를 개천의 물구유에 세워 양 떼를 향하게 하였습니다.', ref: '창세기 30:37–38' }]); },
    check: S => !!S.flags.rodsUsed, done(S, G, next) { narr([{ kick: '창세기 30:39–42', t: '양 떼가 그 가지 앞에서 새끼를 배므로 얼룩얼룩한 것과 점 있는 것과 아롱진 것을 낳았습니다. 야곱은 튼튼한 양이 새끼를 밸 때에 가지를 세웠고, 약한 것은 라반의 것이 되었습니다.', ref: '창세기 30:39–42' },
      { kick: '목축 안내', t: '라반의 우리 구유에 물을 채우고 가지를 세운 채 밤을 보내면, 튼튼한 어미가 낳은 무늬 있는 새끼가 야곱의 우리로 옮겨져요. 가지는 사흘 동안 효과가 있어요.', ref: '' }], next); }, next: 'j7_grow1' },
  j7_grow1: { ch: 7, obj: (S, G) => `야곱의 가축 늘리기 (${Math.min(20, jacobN(G))}/20)`, target: 'pen:laban', list: (S, G) => [{ t: '라반의 구유 물 채우기', ok: G.herd('laban').trough > 0 }, { t: '가지 세우기 (사흘마다)', ok: G.herd('laban').rods > 0 }, { t: '밤에 자며 하루 보내기' }], check: (S, G) => jacobN(G) >= 20,
    done(S, G, next) { say([N('laban', '…야곱, 앞으로는 점 있는 것만 네 품삯이다.'), T('그러나 라반이 "점 있는 것이 네 삯이 되리라" 하면 온 양 떼가 낳은 것이 점 있는 것이었습니다.', '창세기 31:8')], () => { S.q.wage = ['speckled']; next(); }); }, next: 'j7_grow2' },
  j7_grow2: { ch: 7, obj: '야곱의 재산 이루기', list: (S, G) => [{ t: `야곱의 양과 염소 ${Math.min(36, jacobN(G))}/36`, ok: jacobN(G) >= 36 }, { t: `낙타 ${Math.min(2, G.countAll('jacob', 'camel'))}/2 (가축 상인)`, ok: G.countAll('jacob', 'camel') >= 2 }, { t: `나귀 ${Math.min(2, G.countAll('jacob', 'donkey'))}/2 (가축 상인)`, ok: G.countAll('jacob', 'donkey') >= 2 }],
    enter(S, G, re) { if (!re) say([N('laban', '이제는 얼룩무늬 있는 것만 네 삯이다!'), T('라반이 "얼룩무늬 있는 것이 네 삯이 되리라" 하면 온 양 떼가 낳은 것이 얼룩무늬 있는 것이었습니다.', '창세기 31:8'), J('외삼촌이 나를 속여 품삯을 열 번이나 변경하였으나, 하나님이 그를 막으사 나를 해치지 못하게 하셨도다.', '창세기 31:7')], () => { S.q.wage = ['streaked']; }); },
    target: (S, G) => jacobN(G) < 36 ? 'pen:laban' : 'npc:trader', check: (S, G) => jacobN(G) >= 36 && G.countAll('jacob', 'camel') >= 2 && G.countAll('jacob', 'donkey') >= 2,
    done(S, G, next) { narr([{ kick: '창세기 30:43', t: '이에 그 사람이 매우 번창하여 양 떼와 노비와 낙타와 나귀가 많았더라.', ref: '창세기 30:43' }], next); }, next: 'j7_call' },
  j7_call: { ch: 7, obj: '들에서 라헬과 레아에게 이야기하기', target: 'npc:rachel', enter(S, G, re) { if (!re) narr([{ kick: '창세기 31:1–3', title: '돌아가라', t: '라반의 아들들이 "야곱이 우리 아버지의 소유를 다 빼앗았다" 하고, 라반의 안색도 전과 같지 않았습니다. 여호와께서 야곱에게 이르셨습니다. "네 조상의 땅 네 족속에게로 돌아가라. 내가 너와 함께 있으리라."', ref: '창세기 31:1–3' }]); },
    talk: { rachel(S, G) { say([J('그대들의 아버지의 안색을 본즉 내게 대하여 전과 같지 아니하도다. 그러나 내 아버지의 하나님은 나와 함께 계셨느니라.', '창세기 31:5'),
      J('하나님의 사자가 꿈에 내게 말씀하셨소. "나는 벧엘의 하나님이라. 네가 거기서 기둥에 기름을 붓고 거기서 내게 서원하였도다. 지금 일어나 이 땅을 떠나서 네 출생지로 돌아가라."', '창세기 31:11–13'),
      N('leah', '우리 아버지 집에서 무슨 분깃이나 유업이 있으리요.', '창세기 31:14'), N('rachel', '하나님이 그대에게 이르신 일을 다 준행하라.', '창세기 31:16')], () => { G.insight(1, '7장'); G.go('j8_start'); }); } } },
  // ===== 8장 · 얍복 강의 새벽
  j8_start: { ch: 8, obj: '가족과 양 떼를 이끌고 길르앗 산으로', target: 'spot:galeed', enter(S, G, re) {
    if (!re) narr([{ kick: '8장', title: '얍복 강의 새벽', t: '라반이 양털을 깎으러 간 사이에, 야곱이 일어나 자식들과 아내들을 낙타들에게 태우고 모든 가축과 소유를 이끌고 길르앗 산을 향하여 떠났습니다.', ref: '창세기 31:17–21' }, { kick: '이동 안내', t: '가족과 양 떼가 야곱의 뒤를 따라와요. 너무 빨리 달리면 뒤처지니 천천히 이끌어 주세요. 길에서 들짐승이 가족을 노리면 지켜 주세요.', ref: '' }]);
    ['rachel', 'leah', 'bilhah', 'zilpah', 'reuben', 'judah', 'joseph'].forEach(k => G.npcFollow(k, true)); S.q.flock = 1; },
    check: (S, G) => G.dist(SPOTS.galeed[0], SPOTS.galeed[1]) < 12, done(S, G, next) { G.npcShow('laban', true); G.npcTo('laban', 160, -24, 0.6); G.npcShow('lson1', true); G.npcTo('lson1', 156, -26, 0.6); say([T('라반이 칠 일 길을 쫓아와 길르앗 산에서 야곱에게 이르렀습니다. 그 전날 밤 하나님이 꿈에 라반에게 나타나 "너는 삼가 야곱에게 선악 간에 말하지 말라" 하셨습니다.', '창세기 31:23–24')], next); }, next: 'j8_laban' },
  j8_laban: { ch: 8, obj: '쫓아온 라반과 이야기하기', target: 'npc:laban',
    talk: { laban(S, G) { say([N('laban', '네가 나를 속이고 내 딸들을 칼에 사로잡힌 자 같이 끌고 갔으니 어찌 이같이 하였느냐? 어찌하여 내가 내 손자들과 딸들에게 입 맞추지 못하게 하였느냐?', '창세기 31:26–28'),
      J('내가 이 이십 년을 외삼촌과 함께 하였거니와… 낮에는 더위와 밤에는 추위를 무릅쓰고 눈 붙일 겨를도 없이 지내었나이다.', '창세기 31:38–40'),
      J('내 아버지의 하나님, 아브라함의 하나님, 곧 이삭이 경외하는 이가 나와 함께 계시지 아니하셨더면 외삼촌께서 이제 나를 빈손으로 돌려보내셨으리이다.', '창세기 31:42'),
      N('laban', '이제 오라. 나와 네가 언약을 맺고 그것으로 너와 나 사이에 증거를 삼을 것이니라.', '창세기 31:44'), J('형제들이여, 돌을 모아 무더기를 쌓읍시다.', '창세기 31:46')], () => G.go('j8_heap')); } } },
  j8_heap: { ch: 8, obj: '돌을 모아 언약의 돌무더기 쌓기', list: (S, G) => [{ t: `돌 ${Math.min(8, G.inv('stone'))}/8`, ok: G.have('stone', 8) }], target: (S, G) => G.have('stone', 8) ? 'site:heap' : 'node:rock,boulder', check: S => built(S, 'heap'),
    done(S, G, next) { say([N('laban', '오늘 이 무더기가 너와 나 사이에 증거가 되느니라. 우리가 서로 떠나 있을 때에 여호와께서 나와 너 사이를 살피시옵소서.', '창세기 31:48–49'), T('그 이름을 갈르엣, 또 미스바라 하였습니다. 라반이 아침에 일찍이 일어나 손자들과 딸들에게 입 맞추고 축복하고 떠나 돌아갔습니다.', '창세기 31:47–55')],
      () => { G.npcShow('laban', false); G.npcShow('lson1', false); G.npcShow('lson2', false); next(); }); }, next: 'j8_mahanaim' },
  j8_mahanaim: { ch: 8, obj: '남쪽 마하나임으로 가기', target: 'spot:mahanaim', check: (S, G) => G.dist(SPOTS.mahanaim[0], SPOTS.mahanaim[1]) < 12,
    done(S, G, next) { S.q.angels = 1; narr([{ kick: '창세기 32:1–2', title: '하나님의 군대', t: '야곱이 길을 가는데 하나님의 사자들이 그를 만났습니다. 야곱이 그들을 보고 "이는 하나님의 군대라" 하고 그 땅 이름을 마하나임이라 했습니다.', ref: '창세기 32:1–2' },
      { kick: '창세기 32:6–8', t: '보냈던 사자들이 돌아와 말했습니다. "에서가 사백 명을 거느리고 주인을 만나려고 오더이다." 야곱이 심히 두렵고 답답하여 자기와 함께 한 사람과 양과 소와 낙타를 두 떼로 나누었습니다.', ref: '창세기 32:6–7' }],
      () => say([J('내 아버지 아브라함의 하나님, 내 아버지 이삭의 하나님 여호와여… 나는 주께서 주의 종에게 베푸신 모든 은총과 모든 진실하심을 조금도 감당할 수 없사오나, 내가 내 지팡이만 가지고 이 요단을 건넜더니 지금은 두 떼나 이루었나이다.', '창세기 32:9–10'), J('내가 주께 간구하오니 내 형의 손에서, 에서의 손에서 나를 건져내시옵소서.', '창세기 32:11')], () => { S.q.angels = 0; G.insight(1, '야곱의 기도'); next(); })); }, next: 'j8_gift' },
  j8_gift: { ch: 8, obj: '형 에서에게 보낼 예물 떼 꾸리기', list: (S, G) => [{ t: `염소 ${Math.min(10, G.countAll('jacob', 'goat'))}/10`, ok: G.countAll('jacob', 'goat') >= 10 }, { t: `양 ${Math.min(10, G.countAll('jacob', 'sheep'))}/10`, ok: G.countAll('jacob', 'sheep') >= 10 }, { t: `낙타 ${Math.min(2, G.countAll('jacob', 'camel'))}/2`, ok: G.countAll('jacob', 'camel') >= 2 }, { t: `나귀 ${Math.min(2, G.countAll('jacob', 'donkey'))}/2`, ok: G.countAll('jacob', 'donkey') >= 2 }, { t: '마하나임 진영의 예물 표지에서 떼 보내기', ok: !!S.q.gift }],
    target: { x: 182, z: 46 }, check: S => !!S.q.gift, next: 'j8_ford',
    done(S, G, next) { narr([{ kick: '창세기 32:13–16', title: '예물', t: '야곱이 형 에서를 위하여 예물을 택했습니다. 암염소가 이백이요 숫염소가 이십이요, 암양이 이백이요 숫양이 이십이요, 젖 나는 낙타 삼십과 그 새끼요, 암소가 사십이요 황소가 열이요, 암나귀가 이십이요 그 새끼 나귀가 열이었습니다. 각 떼를 따로 종들의 손에 맡겨 앞서 보냈습니다.', ref: '창세기 32:13–16' }], next); } },
  j8_ford: { ch: 8, obj: '밤에 가족을 데리고 얍복 나루 건너기', target: 'spot:eastBank', enter(S, G, re) { if (S.time % 24 < 20.5 && S.time < 24) S.time = 21; },
    check: (S, G) => G.dist(SPOTS.eastBank[0], SPOTS.eastBank[1]) < 9, done(S, G, next) { ['rachel', 'leah', 'bilhah', 'zilpah', 'reuben', 'judah', 'joseph'].forEach((k, i) => { G.npcFollow(k, false); G.npcTo(k, 228 + (i % 3) * 2, 104 + i * 1.2, -1.6, false); }); S.q.flock = 0; narr([{ kick: '창세기 32:22–23', t: '밤에 야곱이 일어나 두 아내와 두 여종과 열한 아들을 인도하여 얍복 나루를 건너가게 하며, 그의 소유도 건너가게 하였습니다.', ref: '창세기 32:22–23' }], next); }, next: 'j8_alone' },
  j8_alone: { ch: 8, obj: '홀로 나루 서쪽으로 돌아가기', target: 'spot:fordWest', check: (S, G) => G.dist(SPOTS.fordWest[0], SPOTS.fordWest[1]) < 6, next: 'j8_boss', done(S, G, next) { S.time = Math.max(S.time, 23.5); next(); } },
  j8_boss: { ch: 8, obj: S => S.q.boss && S.q.boss.on ? '날이 새도록 버티기 · 그를 붙잡으세요' : '어둠 속의 어떤 사람', target: 'npc:man', enter(S, G) { bossIntro(S, G); } },
  j8_esau: { ch: 8, obj: '동쪽 강가에서 형 에서 맞이하기', target: 'spot:eastBank', enter(S, G, re) { G.npcShow('esau', true); G.setOutfit('israel'); G.npcTo('esau', 236, 104, -1.6, false); for (let i = 1; i <= 6; i++) { G.npcShow('sold' + i, true); G.npcTo('sold' + i, 240 + (i % 3) * 2.2, 98 + Math.floor((i - 1) / 3) * 3 + i * 0.8, -1.6, false); } },
    check: (S, G) => G.dist(SPOTS.eastBank[0], SPOTS.eastBank[1]) < 8, next: 'j8_meet' },
  j8_meet: { ch: 8, obj: '형 앞에서 일곱 번 땅에 굽혀 절하기', target: 'npc:esau' },
  // ===== 에필로그 · 숙곳과 세겜의 장막
  ep_start: { ch: 9, obj: '세겜 땅에 제단 쌓기 (돌 10)', list: (S, G) => [{ t: `돌 ${Math.min(10, G.inv('stone'))}/10`, ok: G.have('stone', 10) }], target: (S, G) => G.have('stone', 10) ? 'site:altarS' : 'node:rock,boulder', check: S => built(S, 'altarS'),
    enter(S, G, re) { if (!re) narr([{ kick: '에필로그', title: '숙곳과 세겜', t: '야곱은 숙곳에 이르러 자기를 위하여 집을 짓고 가축을 위하여 우릿간을 지었습니다. 그리고 평안히 가나안 땅 세겜 성읍에 이르러 그 성 앞에 장막을 쳤습니다.', ref: '창세기 33:17–18' }]); },
    done(S, G, next) { narr([{ kick: '창세기 33:20', title: '엘엘로헤이스라엘', t: '야곱이 거기서 제단을 쌓고 그 이름을 엘엘로헤이스라엘(하나님, 이스라엘의 하나님)이라 불렀습니다.', ref: '창세기 33:18–20' }], () => { G.insight(2, '엘엘로헤이스라엘'); next(); }); }, next: 'ep_life' },
  ep_life: { ch: 9, obj: '이스라엘의 장막 · 가족과 함께 지내기', list: S => [{ t: '숙곳의 초막 짓기', ok: built(S, 'booths') }, { t: `가족의 부탁 들어주기 (${['epJoseph', 'epReuben', 'epDinah'].filter(k => qDone(S, k)).length}/3)`, ok: ['epJoseph', 'epReuben', 'epDinah'].every(k => qDone(S, k)) }],
    enter(S, G, re) { S.q.epi = 1; refreshKids(S, G); if (!re) narr([{ kick: '이스라엘의 장막', t: '이제 이스라엘의 가족은 이 땅에서 함께 살아갑니다. 아이들과 아내들과 이야기하고, 아이들의 부탁을 들어주세요. 들에는 여전히 사냥감이 있고, 시내에는 물고기가 있어요.', ref: '' }]); },
    target: (S, G) => !built(S, 'booths') ? 'site:booths' : null, check: S => built(S, 'booths') && ['epJoseph', 'epReuben', 'epDinah'].every(k => qDone(S, k)), next: 'ep_fire',
    done(S, G, next) { say([N('rachel', '여보, 오늘 밤에는 모닥불 곁에서 아이들에게 그 이야기를 해 주세요. 벧엘의 사다리 이야기요.')], next); } },
  ep_fire: { ch: 9, obj: '밤에 모닥불 곁에 가족과 둘러앉기', target: { x: 152, z: 126 }, enter(S, G, re) { if (!re && S.time % 24 < 19 && S.time < 24) S.time = 19.2; } },
  j_end: { ch: 9, obj: '야곱 편 완료 · 이스라엘의 가족과 자유롭게 지내기' },
};
ORDER = Object.keys(steps);

// ------------------------------------------------------------------ NPCs
const GG = G; const CB = () => GG.Combat;
const yr = S => S.q.phase === 'family' ? 7 + (S.q.fy || 1) : (S.q.year || 0);
const atLeast = n => S => between(S, 'j5_year') && yr(S) >= n;
const epi = S => between(S, 'ep_start');
const FAMF = ['rachel', 'leah', 'bilhah', 'zilpah', 'reuben', 'judah', 'joseph'];
const born = (S, id) => !!(S.q.kidsBorn && S.q.kidsBorn.includes(id));
const kidShow = id => S => born(S, id) && (before(S, 'j8_start') || epi(S) || (FAMF.includes(id) && before(S, 'ep_start')));
// daily schedules [hour, x, z, face, mode]
const SCH = {
  laban: S => inHaran(S) && !['j5_wedding', 'j5_more'].includes(S.step) ? [[6, 92, -157, 0, 'wander:3'], [9, 111, -126, 0, 'wander:4'], [13, 128, -190, 2.6, 'wander:2'], [17, 87, -151.4, Math.PI, 'sit'], [21.5, 93, -159, 0.4, 'sit']] : null,
  leah: S => inHaran(S) && !['j5_wedding'].includes(S.step) ? (built(S, 'tents') ? [[6, 147, -105, 0, 'wander:3'], [10, 62, -175, 0, 'wander:5'], [15, 150, -104, 0, 'wander:4'], [19, 148.6, -106.4, 0.6, 'sit']] : [[6, 98, -158, 0, 'wander:2'], [10, 62, -175, 0, 'wander:5'], [15, 99, -160, 0, 'wander:2'], [19, 84.6, -152.2, 2.2, 'sit']]) : epi(S) ? [[6, 146, 132, 0, 'wander:4'], [11, 146, 146, 0, 'act:harvest'], [16, 140, 130, 0, 'wander:3'], [19, 149.2, 126.2, 0.8, 'sit']] : null,
  rachel: S => inHaran(S) && !['j5_wedding'].includes(S.step) ? [[6, 96, -150, 0, 'wander:2'], [8, 43, -117, 0, 'wander:4'], [12, 60, -150, 0, 'wander:7'], [16, 88.4, -152.4, -2.2, 'sit'], [20, built(S, 'tents') ? 152 : 95, built(S, 'tents') ? -106 : -150.5, 0, 'sit']] : epi(S) ? [[6, 152, 136, 0, 'wander:4'], [10, 126, 124, 0, 'wander:4'], [15, 154, 134, 0, 'wander:3'], [19, 152.8, 126.4, -0.6, 'sit']] : null,
  bilhah: S => inHaran(S) ? (built(S, 'tents') ? [[6, 146, -110, 0, 'wander:3'], [11, 84, -146, 0, 'act:gather'], [14, 146, -108, 0, 'wander:3']] : [[6, 94, -152, 0, 'wander:2'], [11, 84, -146, 0, 'act:gather'], [14, 97, -156, 0, 'wander:2']]) : epi(S) ? [[6, 156, 120, 0, 'act:gather'], [12, 144, 130, 0, 'wander:3']] : null,
  zilpah: S => inHaran(S) ? (built(S, 'tents') ? [[6, 154, -110, 0, 'wander:3'], [9, 98, -168.8, 0, 'act:gather'], [15, 154, -104, 0, 'wander:3']] : [[6, 99, -153, 0, 'wander:2'], [9, 98, -166, 0, 'act:gather'], [15, 100, -158, 0, 'wander:2']]) : epi(S) ? [[6, 140, 136, 0, 'wander:3'], [13, 150, 124, 0, 'act:gather']] : null,
  lson1: S => inHaran(S) ? [[7, 110, -126, 0, 'wander:5'], [12, 128, -190, 0, 'wander:4'], [18, 85, -156.4, 2.6, 'sit']] : null,
  lson2: S => inHaran(S) ? [[7, 64, -178, 0, 'act:hoe'], [12, 130, -183, 0, 'wander:3'], [18, 83.8, -153.6, 1.6, 'sit']] : null,
  hunter: S => inHaran(S) ? [[6, 141, -148, 0, 'wander:3'], [9, 168, -160, 0, 'wander:9'], [15, 137, -144.6, Math.PI, 'sit'], [21, 139, -150, 0, 'sit']] : null,
  smith: S => [[7, 121.6, -198.8, -2.54, 'act:mine'], [12, 122.6, -196.6, -2.4, 'sit'], [13.5, 121.6, -198.8, -2.54, 'act:mine'], [19, 126, -210, 0, 'hide']],
  tanner: S => [[7, 143, -196.6, -2.76, 'act:gather'], [12, 146, -194, 0, 'wander:2'], [14, 143, -196.6, -2.76, 'act:gather'], [19, 136, -214, 0, 'hide']],
  fisher: S => [[5.5, 14.2, -104.2, -0.785, 'act:fish'], [11, 19.5, -110.5, 0.6, 'sit'], [14, 12.6, -105.6, -0.6, 'act:fish'], [20, 19.5, -110.5, 0.6, 'sit']],
  shepW: S => [[6, 113, -119, 0, 'wander:3'], [11, 43, -118, 0, 'wander:4'], [15, 112, -118, 0, 'wander:3'], [20, 124, -114, 0, 'sit']],
  handW: S => [[6, 60, -180, 0, 'act:hoe'], [11, 70, -182, 0, 'sit'], [13, 64, -192, 0, 'act:water'], [18, 72, -184, 0, 'sit']],
  weaverW: S => [[7, 98, -168.8, Math.PI, 'act:gather'], [17, 95, -171, 0, 'sit']],
  stallW: S => [[7, 134, -179.6, Math.PI, 'wander:1'], [18, 134, -179.6, Math.PI, 'sit']],
  oldwoman: S => [[7, 126, -207.5, 0.3, 'sit'], [10, 84, -146, 0, 'act:gather'], [12, 126, -207.5, 0.3, 'sit']],
};
const KS = id => S => {
  const a = kidAge(S, id); if (a < 0) return null; const i = Object.keys(KIDLOOK).indexOf(id), ox = (i % 4) * 2 - 3, oz = Math.floor(i / 4) * 2 - 2;
  if (epi(S)) return a >= 7 ? [[6, 126 + ox, 132 + oz, 0, 'wander:4'], [12, 150 + ox, 128 + oz, 0, 'wander:5'], [19, 151 + Math.cos(i) * 3.2, 128 + Math.sin(i) * 3.2, Math.atan2(-Math.cos(i), -Math.sin(i)), 'sit']] : [[6, 150 + ox, 132 + oz, 0, 'wander:4'], [19, 151 + Math.cos(i) * 3.4, 128 + Math.sin(i) * 3.4, Math.atan2(-Math.cos(i), -Math.sin(i)), 'sit']];
  if (!inHaran(S)) return null;
  return a >= 3 ? [[6, 150 + ox, -104 + oz, 0, 'wander:4'], [9, 112 + ox, -118, 0, 'wander:4'], [14, 150 + ox, -103 + oz, 0, 'wander:5']] : [[6, 150 + ox * 0.6, -105 + oz * 0.6, 0, 'wander:2.5']];
};
const show = (a, b) => S => between(S, a, b);
const npcs = [
  // Beersheba
  { id: 'rebekah', name: '리브가', look: LOOK.rebekah, x: 16, z: 157, face: 2.6, show: S => before(S, 'j3_start') },
  { id: 'deborah', name: '드보라', look: LOOK.deborah, x: 25, z: 175, face: 0.3, show: S => before(S, 'j3_start') },
  { id: 'isaac', name: '이삭', look: LOOK.isaac, x: -3, z: 157.6, face: 0.3, sit: true, fixedFace: true, talkR: 3.2, show: S => before(S, 'j3_start') },
  { id: 'esau', name: '에서', look: LOOK.esau, x: -110, z: 190, face: 0, prop: 'bow', show: S => between(S, 'j1_stew', 'j2_kids') || between(S, 'j8_esau', 'j8_meet') },
  { id: 'herder', name: '이삭의 목자', look: LOOK.herder, x: -24, z: 168, face: 2.2, prop: 'staff', show: S => before(S, 'j3_start') },
  ...['goatA', 'goatB', 'goatC', 'goatD'].map((id, i) => ({ id, name: '이삭의 염소', animal: 'goat', pattern: ['plain', 'brown', 'speckled', 'plain'][i], x: -62 + (i % 2) * 7, z: 176 + Math.floor(i / 2) * 8, wander: 3, label: '몰고 가기', show: S => S.step === 'j1_goats' && !(S.q.gin && S.q.gin[id]) })),
  { id: 'kid1', name: '염소 새끼', animal: 'goat', pattern: 'plain', scale: 0.62, x: -32, z: 158, wander: 3, label: '데려가기', show: S => S.step === 'j2_kids' },
  { id: 'kid2', name: '염소 새끼', animal: 'goat', pattern: 'brown', scale: 0.6, x: -27, z: 162, wander: 3, label: '데려가기', show: S => S.step === 'j2_kids' },
  { id: 'trader2', name: '떠돌이 상인', look: LOOK.trader, x: 14, z: 171.8, face: 2.8, show: S => before(S, 'j3_start'), chat: ['남쪽 길로 이스마엘 사람들 대상이 지나간다더군.', '렌틸콩은 하룻밤이면 여물지. 씨앗 사 가게.', '브엘세바 우물 물맛은 어디에도 없지.'] },
  // Haran — field well
  { id: 'shep1', name: '하란의 목자', look: LOOK.shep, x: 52, z: -118, face: -2.2, prop: 'staff' },
  { id: 'shep2', name: '하란의 목자', look: LOOK.shep2, x: 38, z: -130, face: 0.8, prop: 'staff', wander: 3 }, { id: 'shep3', name: '하란의 목자', look: LOOK.shep, x: 54, z: -131, face: -0.8, prop: 'staff' },
  // Laban's household
  { id: 'rachel', name: '라헬', look: LOOK.rachel, x: 96, z: -150, face: -0.5, prop: 'staff', show: S => (between(S, 'j4_stone') || S.flags.rachelSeen) && !S.q.feast, sched: SCH.rachel },
  { id: 'leah', name: '레아', look: LOOK.leah, x: 100, z: -156, face: -0.8, show: show('j5_start'), sched: SCH.leah },
  { id: 'laban', name: '라반', look: LOOK.laban, x: 90, z: -156, face: 0, show: show('j4_laban', 'j7_call'), sched: SCH.laban },
  { id: 'bilhah', name: '빌하', look: LOOK.bilhah, x: 94, z: -152, face: 0.4, show: S => between(S, 'j5_more'), sched: SCH.bilhah },
  { id: 'zilpah', name: '실바', look: LOOK.zilpah, x: 99, z: -153, face: -0.4, show: S => between(S, 'j5_more'), sched: SCH.zilpah },
  { id: 'lson1', name: '라반의 큰아들', look: LOOK.labanSon, x: 116, z: -141, face: 0.3, show: S => between(S, 'j6_start', 'j7_call') && S.q.fy >= 2 || S.step === 'j8_laban' || S.step === 'j8_heap', sched: SCH.lson1 },
  { id: 'lson2', name: '라반의 작은아들', look: LOOK.labanSon2, x: 104, z: -142, face: -0.3, show: S => between(S, 'j6_start', 'j7_call') && S.q.fy >= 4, sched: SCH.lson2 },
  // Haran town
  { id: 'hunter', name: '사냥꾼 우스', look: LOOK.hunter, x: 140, z: -148, face: 0.8, prop: 'spear', show: show('j5_start', 'j7_call'), sched: SCH.hunter },
  { id: 'smith', name: '대장장이', look: LOOK.smith, x: 121.6, z: -198.8, face: -2.54, show: show('j4_laban'), sched: SCH.smith },
  { id: 'tanner', name: '가죽 장인', look: LOOK.tanner, x: 143, z: -196.6, face: -2.76, show: show('j4_laban'), sched: SCH.tanner },
  { id: 'fisher', name: '시냇가 어부', look: LOOK.fisher, x: 14.2, z: -104.2, face: -0.785, prop: 'fishrod', sched: SCH.fisher },
  { id: 'merchant', name: '하란의 상인', look: LOOK.merchant, x: 132, z: -186.5, face: 2.6, chat: ['양털이면 은을 후히 쳐주지.', '다메섹에서 온 대상이 치즈를 찾더군.', '라반 영감이 요즘 웃음이 많아졌어. 다 자네 덕이라던데.'] },
  { id: 'trader', name: '가축 상인', look: LOOK.trader, x: 138, z: -188, face: -2.3, prop: 'staff', chat: ['낙타는 비싸지만 먼 길엔 그만한 게 없지.', '튼튼한 암양이 새끼를 잘 낳는다네.'] },
  { id: 'oldwoman', name: '하란의 할머니', look: LOOK.oldwoman, x: 126, z: -207.5, face: 0.3, show: show('j5_start'), sched: SCH.oldwoman },
  { id: 'boy', name: '양치는 아이', look: LOOK.boy, scale: 0.72, x: 60, z: -150, wander: 9, prop: 'staff', show: show('j5_start', 'j7_call'), chat: ['형, 물매 쏘는 거 보여 줘요!', '라헬 누나가 형 얘기만 해요.', '해 질 녘엔 늑대가 울어요. 무서워요.'] },
  // hired hands
  { id: 'shepW', name: '목동 일꾼', look: LOOK.worker, x: 113, z: -119, prop: 'staff', show: S => built(S, 'hireShep') && inHaran(S), sched: SCH.shepW, chat: ['구유는 제가 아침마다 채워 둘게요.', '오늘은 새끼 양이 둘이나 태어났어요!'] },
  { id: 'handW', name: '밭일꾼', look: LOOK.worker, x: 60, z: -180, show: S => built(S, 'hireHand') && inHaran(S), sched: SCH.handW, chat: ['밭에 물은 제가 다 줬어요. 거두기만 하세요.', '올해 보리가 실하네요.'] },
  { id: 'weaverW', name: '직조공', look: Object.assign({}, LOOK.oldwoman, { top: 0x8a6a7a, clothCol: 0xd8c8b0 }), x: 98, z: -168.8, show: S => built(S, 'hireWeaver') && inHaran(S), sched: SCH.weaverW, chat: ['양털은 제가 실로 자아 둘게요.', '레아 마님이 아기 옷을 손수 지으셨어요.'] },
  { id: 'stallW', name: '좌판 일꾼', look: LOOK.worker, x: 134, z: -179.6, show: S => built(S, 'stall') && inHaran(S), sched: SCH.stallW, chat: ['오늘도 치즈가 다 팔렸어요!', '장터 사람들이 야곱 집안 양털을 알아봐요.'] },
  // feast musician
  { id: 'musician', name: '하란의 악사', look: LOOK.musician, x: 82, z: -156, face: 1.0, show: S => !!S.q.feast },
  // children
  ...Object.keys(KIDLOOK).map((id, i) => ({ id, name: NM[id], look: KIDLOOK[id], scale: 0.5, x: 148 + (i % 4) * 2, z: -105 + Math.floor(i / 4) * 2, wander: 3, show: kidShow(id), sched: KS(id) })),
  // Jabbok
  { id: 'man', name: '어떤 사람', look: LOOK.man, x: 186, z: 93, face: 0.9, emis: [0.18, 0.17, 0.14], show: S => S.step === 'j8_boss', talkR: 0.01 },
  { id: 'camel1', name: '낙타', animal: 'camel', extra: { saddle: 0xb3472e }, x: 176, z: 46, face: 1, noTalk: true, noTag: true, show: S => between(S, 'j8_mahanaim', 'j8_gift') },
  ...[1, 2, 3, 4, 5, 6].map(i => ({ id: 'sold' + i, name: '에서의 사람', look: LOOK.soldier, x: 240, z: 100, face: -1.6, noTalk: true, noTag: true, prop: 'spear', show: S => between(S, 'j8_esau', 'j8_meet') })),
];
const angelsDef = [[2, 0.1], [5, 0.33], [8, 0.55], [11, 0.75], [14, 0.9], [3, 0.65]];

// ------------------------------------------------------------------ SITES
const SITE = (id, n, x, z, cost, model, o) => Object.assign({ id, n, x, z, cost, model }, o || {});
const leanTo = (col) => (g, M, r) => { for (const [x, z] of [[-1.2, -0.8], [1.2, -0.8]]) g.cyl(0.05, 0.06, 1.8, 5, { m: M, at: [x, 0.9, z], c: 0x7a5a3a }); g.box(2.8, 0.06, 2.0, { m: M, at: [0, 1.25, 0.1], rx: 0.5, c: col }); g.box(0.6, 0.35, 0.4, { m: M, at: [0.6, 0.18, 0.4], c: 0xd8c49a }); G.env.pots(g, m4mul(m4(), M, m4trs(m4(), -0.7, 0, 0.5, 0)), r); };
const sites = [
  SITE('trough2', '새 물구유', 116, -126, { stone: 8, wood: 2 }, (g, M, r) => { G.env.trough(g, M, r); }, { d: '라반의 우리에 물구유를 하나 더 놓아요. 우리가 15마리 더 넓어져요.', w: 3, d2: 1, effect: { cap: ['laban', 15] }, avail: atLeast(1), col: { w: 2.4, d: 0.8, h: 0.6 } }),
  SITE('loom', '베틀', 98, -170, { wood: 3, branch: 6 }, (g, M) => { g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [-0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.06, 0.06, 2, 6, { m: M, at: [0, 2.1, 0], rz: Math.PI / 2, c: 0x7a5a3a }); g.box(1.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: (x, y) => (Math.floor((y + 2) * 8) % 2 ? 0xb8946a : 0xe8dcc0) }); g.box(1.8, 0.1, 0.1, { m: M, at: [0, 0.35, 0], c: 0x6a4a30 }); },
    { d: '양털로 자은 실을 모직 천으로, 아마를 세마포로 짤 수 있어요.', w: 2.4, d2: 1, avail: atLeast(2), col: { w: 2, d: 0.6, h: 2.2 } }),
  SITE('hireShep', '목동 일꾼 고용', 124, -115, { bread: 3 }, leanTo(0x9a8a6a), { silver: 40, d: '매일 아침 라반의 구유에 물을 채우고, 밤에 늑대가 덜 와요. (매일 섬김 +2)', w: 3, d2: 2.4, avail: atLeast(2) }),
  SITE('newfield', '밀밭 개간', 62, -197, { stone: 10, branch: 8 }, (g, M) => { G.env.fence(g, M, rng(3), 13); }, { d: '돌을 골라내고 가시를 걷어 밀밭을 새로 엽니다. 밀 씨앗 10개도 받아요.', w: 13, effect: { field: 'wheatL' }, avail: atLeast(3), onBuilt: (S, G) => G.give('s_wheat', 10) }),
  SITE('granary', '곳간', 108, -179, { wood: 6, stone: 12, clay: 4 }, (g, M, r) => G.env.granary(g, M, r, true), { d: '거둔 곡식을 쌓아 둘 곳간이에요. 곡식이 상하지 않아 매일 섬김이 2씩 쌓여요.', w: 4, d2: 4, avail: atLeast(4), col: { w: 3.6, d: 3.6, h: 3 } }),
  SITE('fold2', '양 우리 넓히기', 126, -130, { stone: 16, wood: 4 }, (g, M, r) => { G.env.wallSeg(g, M, r, 8, 1.1); }, { d: '우리를 넓혀 30마리를 더 키울 수 있어요.', w: 8, ry: Math.PI / 2, effect: { cap: ['laban', 45] }, avail: atLeast(6) }),
  SITE('hireHand', '밭일꾼 고용', 73, -184, { bread: 4 }, leanTo(0xb8a070), { silver: 60, d: '매일 라반의 밭에 물을 줘요. (매일 섬김 +2)', w: 3, d2: 2.4, avail: atLeast(6) }),
  SITE('tents', '가족의 장막', 150, -112, { cloth: 2, wood: 4 }, (g, M, r) => { G.env.tent(g, M, r, 0x4a3e38); G.env.tent(g, m4mul(m4(), M, m4trs(m4(), -7.5, 0, 4, 0.6)), r, 0x5a4636); G.env.tent(g, m4mul(m4(), M, m4trs(m4(), 7.5, 0, 4.5, -0.5)), r, 0x3e342e); G.env.campfire(g, m4mul(m4(), M, m4trs(m4(), 0, 0, 6.5, 0)), r); }, { d: '레아와 라헬과 자녀들이 지낼 장막이에요.', w: 6, d2: 4, avail: show('j5_more'), col: { w: 5.8, d: 3.8, h: 2.2, cam: true } }),
  SITE('hireWeaver', '직조공 고용', 94, -172.4, { wool: 6 }, (g, M, r) => { G.env.sacks(g, M, r); g.box(0.5, 0.4, 0.5, { m: M, at: [0.9, 0.2, 0.2], c: 0x7a5a3a }); }, { silver: 50, d: '매일 양털을 실로 자아 줘요. (매일 섬김 +2)', w: 2, d2: 1.6, avail: S => S.q.phase === 'family' && (S.q.fy || 1) >= 3 && inHaran(S) }),
  SITE('stall', '장터 좌판', 134, -178, { wood: 4, cloth: 1 }, (g, M, r) => G.env.stallM(g, M, r, 0x6a8a3a), { silver: 80, d: '하란 장터에 야곱 집안의 좌판을 열어요. 매일 가축 수에 따라 은을 벌어요.', w: 3, d2: 2.4, avail: S => S.q.phase === 'family' && (S.q.fy || 1) >= 5 && inHaran(S), col: { w: 2.6, d: 2.2, h: 2.2 } }),
  SITE('jacobFold', '야곱의 우리', 165, -95, { stone: 14, wood: 4 }, (g, M, r) => { for (const [x, z, l, a] of [[0, -7, 20, 0], [0, 7, 20, 0], [-10, 0, 14, Math.PI / 2], [10, -3.5, 7, Math.PI / 2]]) G.env.wallSeg(g, m4trs(m4(), x, 0, z, a), r, l, 1.1); G.env.trough(g, m4trs(m4(), 0, 0, -5.5), r); },
    { d: '야곱의 품삯이 될 양과 염소의 우리예요.', w: 20, d2: 14, r: 7, avail: show('j7_fold') }),
  SITE('heap', '언약의 돌무더기', 166, -14, { stone: 8 }, (g, M, r) => { G.env.altar(g, M, r); g.box(0.5, 1.4, 0.4, { m: M, at: [1.4, 0.7, 0], c: 0xb8ac98 }); }, { d: '갈르엣, 곧 증거의 무더기 (창 31:46–48)', w: 3, avail: show('j8_heap') }),
  SITE('altarS', '엘엘로헤이스라엘 제단', 144, 114, { stone: 10 }, (g, M, r) => { G.env.altar(g, M, r); }, { d: '하나님, 이스라엘의 하나님 (창 33:20)', w: 3, avail: show('ep_start') }),
  SITE('booths', '가축의 초막', 126, 123.6, { branch: 10, reed: 6 }, (g, M, r) => G.env.booth(g, M, r), { d: '야곱이 숙곳에 이르러 가축을 위하여 우릿간을 지었으므로 (창 33:17)', w: 3.4, d2: 2.6, avail: show('ep_start'), col: { w: 3.2, d: 2.4, h: 2.4 } }),
];

// ------------------------------------------------------------------ SPECIALS
const specials = [
  { id: 'pillow', x: SPOTS.pillow[0], z: SPOTS.pillow[1], r: 2.4, label: '돌을 들어 베개로 삼기', on: S => S.step === 'j3_stone', use(S, G) { G.P.carry = 'stone'; G.P.carryArms = true; G.go('j3_sleep'); } },
  { id: 'sleep', x: SPOTS.sleep[0], z: SPOTS.sleep[1], r: 2.6, label: '돌을 베고 눕기', on: S => S.step === 'j3_sleep', use(S, G) { dreamCine(S, G); } },
  { id: 'pillar', x: SPOTS.sleep[0], z: SPOTS.sleep[1] - 1, r: 2.8, label: '돌기둥 세우고 기름 붓기', on: S => S.step === 'j3_pillar', use(S, G) {
    G.take('oilFlask'); S.flags.pillar = 1; G.FX.burst(SPOTS.sleep[0], G.W().heightAt(SPOTS.sleep[0], SPOTS.sleep[1]) + 1.4, SPOTS.sleep[1] - 1, 30, { c: [1, 0.85, 0.4], sp: 1.2, up: 2 }); G.P.kneel = true;
    say([T('야곱이 아침에 일찍이 일어나 베개로 삼았던 돌을 가져다가 기둥으로 세우고 그 위에 기름을 붓고, 그곳 이름을 벧엘(하나님의 집)이라 하였습니다.', '창세기 28:18–19'),
      { n: '야곱', t: '야곱이 서원했습니다.', choices: [{ t: '"하나님이 나와 함께 계셔서 내가 가는 이 길에서 나를 지키시고 먹을 떡과 입을 옷을 주사, 내가 평안히 아버지 집으로 돌아가게 하시오면, 여호와께서 나의 하나님이 되실 것이요 하나님께서 내게 주신 모든 것에서 십분의 일을 내가 반드시 하나님께 드리겠나이다."', ref: '창세기 28:20–22' }] }],
      () => { G.P.kneel = false; narr([{ kick: '3장 끝', title: '하나님의 집', t: '돌베개는 기둥이 되었습니다. 도망치던 길 위에서, 야곱은 처음으로 하나님을 "나의 하나님"이라 불렀습니다.', ref: '창세기 28:21' }], () => { G.insight(2, '벧엘의 서원'); G.go('j4_start'); }); }); } },
  { id: 'wellStone', x: 45, z: -122.6, r: 3, label: '돌 굴리기', on: S => S.step === 'j4_stone', use(S, G) {
    G.UI.minigame('push', { title: '우물 아귀의 큰 돌', hint: 'A 버튼을 누르고 있으면 밀어요. 기운이 바닥나면 잠깐 놓았다가 다시 미세요.', rate: 16 }, () => { S.flags.stoneRolled = 1; G.FX.burst(45, G.W().heightAt(45, -125) + 1, -125, 26, { c: [0.8, 0.75, 0.6], sp: 2, up: 2 }); G.sfx('mine', { pitch: 0.6 });
      say([T('야곱이 나아가 우물 아귀에서 돌을 옮기고, 외삼촌 라반의 양 떼에게 물을 먹였습니다.', '창세기 29:10'), N('shep1', '혼자서 저 돌을…! 셋이 붙어야 겨우 움직이는 돌인데!')], () => { if (!G.tool('jar')) G.giveTool('jar'); G.go('j4_water'); }); }); } },
  { id: 'wellTrough', x: 41, z: -121, r: 2.6, label: S => S.water >= 3 ? '구유에 물 붓기' : '물이 부족해요', on: S => S.step === 'j4_water', use(S, G) { if (S.water < 3) { G.UI.toast('우물에서 물을 길어 오세요'); return; } S.water -= 3; S.q.wtr = (S.q.wtr || 0) + 1; G.P.act = 'water'; G.P.actT = 0; G.P.actDur = 0.7; G.P.actProp = 'jar'; G.P.actHits = 1; G.P.fired = true; G.sfx('pour'); G.FX.burst(41, G.W().heightAt(41, -121) + 0.7, -121, 14, { c: [0.6, 0.8, 1], sp: 1, up: 0.5 }); G.UI.hud(); G.checkStep(); } },
  { id: 'gift', x: 182, z: 46, r: 3, label: '예물 떼를 보내기', on: S => S.step === 'j8_gift' && !S.q.gift, use(S, G) {
    const need = [['goat', 10], ['sheep', 10], ['camel', 2], ['donkey', 2]]; const miss = need.filter(([sp, n]) => G.countAll('jacob', sp) < n);
    if (miss.length) { G.UI.toast(`아직 부족해요: ${miss.map(([sp, n]) => G.SPN[sp] + ' ' + (n - G.countAll('jacob', sp))).join(', ')} · 가축 상인은 하란 장터에 있어요`); return; }
    for (const [sp, n] of need) G.removeAnimals('jacob', n, a => a[0] === sp); S.q.gift = 1; RT.flock.length = 0; G.checkStep(); } },
  { id: 'mandrake', x: 70, z: -199, r: 2.2, label: '합환채 캐기', on: S => !!(S.side && S.side.act && S.side.act.mandrakes) && !G.Game.have('mandrake'), use(S, G) { G.give('mandrake', 1); G.P.act = 'gather'; G.P.actT = 0; G.P.actDur = 0.8; G.P.actHits = 1; G.P.fired = true; G.UI.quest(); } },
  { id: 'starHill', x: 176, z: 154, r: 4, label: '언덕에 앉아 별 보기', on: S => !!(S.side && S.side.act && S.side.act.epJoseph) && !S.q.stars, use(S, G) {
    if (G.hour() > 5 && G.hour() < 19.5) { G.UI.toast('별은 밤에 떠요. 해가 진 뒤에 오세요'); return; } G.P.sit = true;
    say([N('joseph', '아버지, 별이 정말 많아요. 셀 수가 없어요!'), J('할아버지의 할아버지, 아브라함께 하나님이 이렇게 말씀하셨단다. "하늘을 우러러 뭇별을 셀 수 있나 보라. 네 자손이 이와 같으리라."', '창세기 15:5'),
      N('joseph', '그럼 우리가 그 별이에요?'), J('그래. 너와 네 형들 모두.'), N('joseph', '아버지… 저는 가끔 이상한 꿈을 꿔요. 해와 달과 별들이 나오는 꿈이요.'), T('야곱은 그 말을 마음에 담아 두었습니다.', '창세기 37:11 참고')], () => { G.P.sit = false; S.q.stars = 1; G.UI.quest(); G.checkStep(); }); } },
  { id: 'epFire', x: 151, z: 128, r: 3.4, label: '가족과 둘러앉기', on: S => S.step === 'ep_fire', use(S, G) { if (G.hour() > 5 && G.hour() < 18.8) { G.UI.toast('해가 지면 가족이 모닥불 곁에 모여요'); return; } finaleCine(S, G); } },
];

// ------------------------------------------------------------------ SHOPS & STATIONS
const shops = {
  camp: { n: '떠돌이 상인', buy: [{ n: '렌틸콩 씨앗 ×5', item: 's_lentil', qty: 5, price: 8, d: '하룻밤이면 거둬요' }, { n: '보리 씨앗 ×5', item: 's_barley', qty: 5, price: 8 }, { n: '빵 ×2', item: 'bread', qty: 2, price: 18, d: '먹으면 기력이 차올라요' }] },
  haran: { n: '하란 장터', buy: [{ n: '보리 씨앗 ×10', item: 's_barley', qty: 10, price: 14 }, { n: '밀 씨앗 ×10', item: 's_wheat', qty: 10, price: 22 }, { n: '렌틸콩 씨앗 ×10', item: 's_lentil', qty: 10, price: 14 }, { n: '아마 씨앗 ×10', item: 's_flax', qty: 10, price: 16 },
    { n: '오이 씨앗 ×6', item: 's_cucumber', qty: 6, price: 16 }, { n: '양파 씨앗 ×6', item: 's_onion', qty: 6, price: 16 }, { n: '꼴 ×10', item: 'hay', qty: 10, price: 14 },
    { n: '양털 가위', tool: 'shears', price: 30, d: '양털을 깎을 수 있어요', when: (S, G) => !G.tool('shears') }, { n: '낫', tool: 'sickle', price: 20, d: '보리와 밀을 벨 수 있어요', when: (S, G) => !G.tool('sickle') }, { n: '큰 물항아리', tool: 'bigjar', price: 45, d: '물을 20번 담아요', when: (S, G) => !G.tool('bigjar') }, { n: '빵 ×3', item: 'bread', qty: 3, price: 24 }],
    mul: { good: 1.15 } },
  animals: { n: '가축 상인', buy: [
    { n: '흰 암양', animal: 'sheep', pattern: 'plain', sex: 0, price: 28, d: '라반의 우리로 보내요', pen: () => 'laban', when: S => before(S, 'j7_wage') },
    { n: '흰 숫양', animal: 'sheep', pattern: 'plain', sex: 1, price: 30, d: '라반의 우리로 보내요', pen: () => 'laban', when: S => before(S, 'j7_wage') },
    { n: '검은 암염소', animal: 'goat', pattern: 'plain', sex: 0, price: 24, pen: () => 'laban', when: S => before(S, 'j7_wage') },
    { n: '낙타', animal: 'camel', pattern: 'plain', price: 110, d: '야곱의 우리로 보내요', pen: S => S.built.jacobFold ? 'jacob' : null, when: S => between(S, 'j7_fold', 'j7_call') },
    { n: '나귀', animal: 'donkey', pattern: 'plain', price: 60, d: '야곱의 우리로 보내요', pen: S => S.built.jacobFold ? 'jacob' : null, when: S => between(S, 'j7_fold', 'j7_call') },
    { n: '점 있는 염소', animal: 'goat', pattern: 'speckled', price: 34, d: '야곱의 우리로 보내요', pen: S => S.built.jacobFold ? 'jacob' : null, when: S => between(S, 'j7_fold', 'j7_call') },
    { n: '점 있는 양', animal: 'sheep', pattern: 'speckled', price: 38, d: '야곱의 우리로 보내요', pen: S => S.built.jacobFold ? 'jacob' : null, when: S => between(S, 'j7_fold', 'j7_call') }] },
  smith: { n: '대장장이', sells: ['hunt', 'rare'], mul: { hunt: 1.15, rare: 1.1 }, buy: [{ n: '구리 칼', gear: 'knife', price: 60, d: '빠른 칼 · 손질할 때 가죽을 하나 더 얻어요', when: () => !CB().owns('knife') }, { n: '화살 ×10', item: 'arrow', qty: 10, price: 18 }, { n: '돌 ×10 (물맷돌)', item: 'stone', qty: 10, price: 6 }] },
  tanner: { n: '가죽 장인', sells: ['hunt'], mul: { hunt: 1.3 }, buy: [{ n: '무두질한 가죽', item: 'leather', qty: 1, price: 30 }, { n: '힘줄 ×2', item: 'sinew', qty: 2, price: 14 }, { n: '실 ×2', item: 'thread', qty: 2, price: 26 }] },
  hunter: { n: '사냥꾼 우스', sells: ['hunt', 'food'], mul: { hunt: 1.1, food: 1.25 }, buy: [{ n: '화살 ×10', item: 'arrow', qty: 10, price: 16 }, { n: '힘줄 ×2', item: 'sinew', qty: 2, price: 12 }, { n: '약초 ×3', item: 'herb', qty: 3, price: 12, d: '먹으면 체력이 회복돼요' }] },
  fisher: { n: '시냇가 어부', sells: ['fish', 'food'], mul: { fish: 1.2 }, buy: [{ n: '낚싯대', tool: 'fishrod', price: 35, d: '물가를 바라보고 A를 누르면 낚시해요', when: (S, G) => !G.tool('fishrod') }, { n: '구운 생선 ×2', item: 'roastfish', qty: 2, price: 22 }] },
};
const stations = [
  { id: 'w1', type: 'well', x: -8, z: 179.6 }, { id: 'w2', type: 'well', x: 84, z: -143.6 }, { id: 'w3', type: 'well', x: 45, z: -122.4, on: S => !!S.flags.stoneRolled && S.step !== 'j4_stone' },
  { id: 'w4', type: 'well', x: 13.6, z: -103.4, r: 2.6 }, { id: 'w5', type: 'well', x: 158, z: 122.4 }, { id: 'w6', type: 'well', x: 166, z: -98, r: 3, on: S => built(S, 'jacobFold') },
  { id: 'f1', type: 'fire', x: 10, z: 166, r: 3 }, { id: 'f2', type: 'fire', x: 86, z: -154, r: 3 }, { id: 'f3', type: 'fire', x: 178, z: 40, r: 3 }, { id: 'f4', type: 'fire', x: 137, z: -146, r: 3 }, { id: 'f5', type: 'fire', x: 151, z: 128, r: 3, on: S => S.step !== 'ep_fire' }, { id: 'f6', type: 'fire', x: 150, z: -105.5, r: 3, on: S => built(S, 'tents') && inHaran(S) },
  { id: 'b1', type: 'bed', x: 30, z: 169.5, on: S => before(S, 'j3_start') }, { id: 'b2', type: 'bed', x: 77.6, z: -152.6, on: S => between(S, 'j4_laban', 'j7_call') && !built(S, 'tents') }, { id: 'b3', type: 'bed', x: 150, z: -109.2, on: S => built(S, 'tents') && before(S, 'j8_start') },
  { id: 'b4', type: 'bed', x: 140.6, z: 134.6, on: epi },
  { id: 'loom', type: 'loom', x: 98, z: -168.6, r: 2.6, on: S => built(S, 'loom') },
  { id: 'forge', type: 'smith', x: 121, z: -199.6, r: 2.8 }, { id: 'tan', type: 'tan', x: 142.4, z: -197.8, r: 2.6 },
  { id: 'shopCamp', type: 'shop', shop: 'camp', label: '떠돌이 상인과 거래하기', x: 14, z: 173.4, r: 2.4, on: S => before(S, 'j3_start') },
  { id: 'shopH', type: 'shop', shop: 'haran', label: '장터에서 사고팔기', x: 131, z: -184.6, r: 2.4 },
  { id: 'shopA', type: 'shop', shop: 'animals', label: '가축 사기', x: 138.6, z: -186.2, r: 2.4 },
  { id: 'shopS', type: 'shop', shop: 'smith', label: '대장장이와 거래하기', x: 123.4, z: -197.2, r: 2.2 },
  { id: 'shopT', type: 'shop', shop: 'tanner', label: '가죽 장인과 거래하기', x: 145, z: -195.2, r: 2.2 },
  { id: 'shopU', type: 'shop', shop: 'hunter', label: '사냥꾼과 거래하기', x: 144.6, z: -147.6, r: 2.2, on: show('j5_camp', 'j7_call') },
  { id: 'shopF', type: 'shop', shop: 'fisher', label: '어부와 거래하기', x: 17.8, z: -108.6, r: 2.2 },
];
const pens = [
  { id: 'isaacGoats', n: '이삭의 염소 우리', x: -30, z: 160, w: 13, d: 9, gx: -22, gz: 161.5, owner: 'isaac', cap: 40, init: [['goat', 'plain', 0, 20], ['goat', 'plain', 1, 20], ['goat', 'brown', 0, 20], ['goat', 'plain', 0, 3], ['goat', 'brown', 0, 2], ['goat', 'plain', 0, 20], ['goat', 'speckled', 0, 20]], trough0: 12 },
  { id: 'laban', n: '라반의 우리', x: 110, z: -130, w: 23, d: 15, gx: 113, gz: -120.6, owner: 'laban', cap: 40, rods: true, trough0: 6,
    init: [...Array(14)].map((_, i) => ['sheep', i % 5 === 0 ? 'spotted' : 'plain', i < 10 ? 0 : 1, 12]).concat([...Array(8)].map((_, i) => ['goat', i === 3 ? 'speckled' : 'plain', i < 6 ? 0 : 1, 12])), hidden: S => before(S, 'j4_laban') },
  { id: 'jacob', n: '야곱의 우리', x: 165, z: -95, w: 19, d: 13, gx: 172, gz: -92, owner: 'jacob', cap: 140, trough0: 12, hidden: S => !S.built.jacobFold || S.q.flock || epi(S) },
  { id: 'israel', n: '이스라엘의 우리', x: 126, z: 132, w: 12, d: 9, gx: 133, gz: 132, owner: 'jacob', cap: 120, trough0: 12, hidden: S => !epi(S) },
];
const fields = [
  { id: 'lentil', x: 30, z: 182, cols: 4, rows: 3 },
  { id: 'barleyL', x: 62, z: -178, cols: 8, rows: 5, lock: true },
  { id: 'wheatL', x: 62, z: -192, cols: 8, rows: 4, lock: true },
  { id: 'garden', x: 147, z: 147, cols: 5, rows: 3, lock: true },
];

// ------------------------------------------------------------------ SIDE QUESTS ("부탁")
const LF = () => GG.Life;
const has = (k, n) => GG.Game.have(k, n);
const cnt = (k, n) => `${Math.min(n, GG.Game.inv(k))}/${n}`;
const bring = (k, n, label) => ({ t: () => `${label || GG.Game.ITEMS[k].n} ${cnt(k, n)}`, ok: () => has(k, n) });
const killQ = (sp, n, label) => ({ t: (S, G, st) => `${label} ${Math.min(n, LF().killsSince(st, sp))}/${n}`, ok: (S, G, st) => LF().killsSince(st, sp) >= n });
const ALLWILD = ['hare', 'partridge', 'gazelle', 'deer', 'ibex', 'boar', 'wolf', 'bear', 'lion'];
const QUESTS = {
  // --- fisherman
  fisherRod: { loc: 'node:reeds', giver: 'fisher', title: '낚싯대 엮기', desc: '시냇가 갈대 4개', when: (S, G) => between(S, 'j5_camp') && !G.tool('fishrod'),
    offer: ['갈대가 우거진 시냇가는 고기가 잘 잡히지. 자네도 한번 해 보겠나?', '시냇가 갈대 넷만 꺾어다 주게. 낚싯대를 하나 엮어 주지.'], obj: [bring('reed', 4)], take: { reed: 4 }, prog: '갈대는 시냇가와 연못 둘레에 많아.',
    done: ['좋은 갈대로군. 자, 받게.', T('낚싯대를 얻었다! 물가에서 물을 바라보고 A를 누르면 낚시해요. 찌가 잠기면 바로 A, 줄이 빨개지면 손을 떼요.')], reward: { xp: 10 }, finish: (S, G) => G.giveTool('fishrod') },
  firstFish: { giver: 'fisher', title: '첫 물고기', desc: '아무 물고기나 3마리', when: S => qDone(S, 'fisherRod'),
    offer: ['낚싯대를 쥐었으면 손맛을 봐야지. 세 마리만 낚아 보게. 잡은 건 자네 것일세.'], obj: [{ t: (S, G, st) => `물고기 낚기 ${Math.min(3, LF().fishSince(st))}/3`, ok: (S, G, st) => LF().fishSince(st) >= 3 }],
    done: ['허허, 제법이군! 잉어는 모닥불에 구우면 기운이 나지.'], reward: { silver: 25, xp: 20, items: { roastfish: 1 } } },
  goldFish: { giver: 'fisher', title: '연못의 황금 잉어', desc: '황금 잉어 1마리', when: S => qDone(S, 'firstFish') && yr(S) >= 2,
    offer: ['내 할아버지 때부터 내려오는 이야기가 있지. 연못 깊은 곳에 해처럼 빛나는 잉어가 산다고.', '평생 한 번 봤다네. 자네가 잡아 온다면 내 은을 아끼지 않겠네.'], obj: [bring('gfish', 1, '황금 잉어')], take: { gfish: 1 }, prog: '황금 잉어는 아주 드물어. 끈기가 필요하지.',
    done: ['오오…! 살아생전 다시 보는구나. 이건 자네의 끈기에 대한 값일세.'], reward: { silver: 120, insight: 1, xp: 40 } },
  // --- hunter
  hareHunt: { loc: 'spot:eastPlain', giver: 'hunter', title: '물매 연습', desc: '들토끼 3마리', when: S => !!S.q.metHunter,
    offer: ['물매는 손에 익어야 하네. 동쪽 들판의 들토끼 셋을 잡아 보게.', '토끼는 겁이 많으니 천천히 다가가. 손질해서 고기와 가죽을 챙기는 것도 잊지 말고.'], obj: [killQ('hare', 3, '들토끼')],
    done: ['좋아, 이제 사냥꾼 눈이 생겼군. 이 힘줄과 돌을 가져가게.'], reward: { silver: 20, xp: 20, items: { sinew: 2, stone: 10 } } },
  hunterBow: { loc: 'spot:eastPlain', giver: 'hunter', title: '가젤과 활', desc: '가젤 2마리', when: S => qDone(S, 'hareHunt'),
    offer: ['가젤은 바람보다 빠르지. 물매로 둘을 잡아 오면 내 젊을 적 활을 주겠네.', '네 형 에서가 활을 잘 쏜다고? 하하, 하란의 활도 만만치 않다네.'], obj: [killQ('gazelle', 2, '가젤')],
    done: ['훌륭해! 약속대로 이 활을 주지. 화살은 대장장이에게 사거나 깃털로 만들 수 있어.', T('사냥 활을 얻었다! 무기 버튼으로 근접·원거리를 바꿔요.')], reward: { gear: 'bow', xp: 30, items: { arrow: 15 } } },
  boarHunt: { loc: { x: 22, z: -150 }, giver: 'hunter', title: '갈대밭의 멧돼지', desc: '멧돼지 1마리', when: S => qDone(S, 'hunterBow') || yr(S) >= 2,
    offer: ['서쪽 시냇가 갈대밭에 멧돼지가 내려와 밭을 엎고 있네.', '멧돼지는 먼저 덤벼들어. 몸을 웅크리면 곧 달려든다는 뜻이니, 그때 옆으로 굴러 피하고 쳐야 하네.'], obj: [killQ('boar', 1, '멧돼지')],
    done: ['겁먹지 않았구먼! 짐승 앞에서 물러서지 않는 것, 그게 담대함이지.'], reward: { silver: 35, xp: 30, insight: 1, items: { bone: 3 } } },
  lion: { main: 1, loc: 'spot:thicket', giver: 'hunter', title: '덤불 속의 사자', desc: '동북쪽 덤불의 사자', when: S => yr(S) >= 5 && inHaran(S),
    offer: ['야곱, 큰일일세. 동북쪽 덤불에 늙은 사자가 자리를 잡았어. 벌써 목동 하나가 다쳤네.', '사자는 화살 몇 대로는 쓰러지지 않아. 장비를 단단히 손보고, 약초와 구운 고기를 넉넉히 챙겨 가게.'],
    obj: [killQ('lion', 1, '사자')], prog: '사자는 덤불 깊은 곳에 있네. 달려들 때 굴러 피하는 걸 잊지 말게.',
    start: (S, G) => spawnSpecial('lion', SPOTS.thicket[0], SPOTS.thicket[1], { name: '덤불의 늙은 사자', hpMul: 1.0 }),
    done: ['자네가… 사자를 잡았다고? 하란에서 이 이야기는 오래도록 전해질 걸세.', T('"낮에는 더위와 밤에는 추위를 무릅쓰고…" 야곱은 라반의 양 떼를 지켰습니다.', '창세기 31:40')], reward: { silver: 80, xp: 60, insight: 2 } },
  // --- Laban
  wolves: { main: 1, loc: 'spot:eastPlain', giver: 'laban', title: '늑대 무리 소탕', desc: '늑대 4마리', when: S => yr(S) >= 3 && inHaran(S),
    offer: ['요즘 밤마다 늑대가 우리를 넘본다. 벌써 양이 몇 마리 물려 갔어.', '동쪽 들판과 북쪽 숲에 늑대 굴이 있다더구나. 넷만 잡아 다오.'], obj: [killQ('wolf', 4, '늑대')], prog: '늑대는 밤에 더 많이 나온다. 조심하거라.',
    start: S => { S.q.wolfQ = 1; }, done: ['고맙다, 야곱. 이제 양들이 편히 잠들겠구나.', T('"물려 찢긴 것은 내가 물어냈으며…"', '창세기 31:39')], reward: { silver: 40, insight: 1, xp: 30 }, finish: S => { S.q.wolfQ = 0; SERVE(S, 4); } },
  bear: { main: 1, loc: 'spot:bearDen', giver: 'laban', title: '북쪽 숲의 곰', desc: '곰 굴의 큰곰', when: S => S.q.phase === 'family' && (S.q.fy || 1) >= 6 && inHaran(S),
    offer: ['북쪽 숲 바위 굴에 큰곰이 깨어났다. 꿀을 따러 간 아이들이 쫓겨 왔어.', '네 아이들도 이제 들에 나가지 않느냐. 곰을 잡아 다오.'], obj: [killQ('bear', 1, '큰곰')],
    start: () => spawnSpecial('bear', SPOTS.bearDen[0], SPOTS.bearDen[1] + 4, { name: '굴의 큰곰' }), done: ['곰 가죽이 아주 실하구나! 하란에 너만 한 목자가 없다.'], reward: { silver: 60, insight: 1, xp: 50 } },
  labanWool: { giver: 'laban', title: '장사꾼의 양털', desc: '양털 24', repeat: 5, when: (S, G) => yr(S) >= 2 && inHaran(S) && G.tool('shears'),
    offer: ['다메섹 장사꾼이 양털을 넉넉히 원한다는구나. 24근만 모아 다오.'], obj: [bring('wool', 24)], take: { wool: 24 }, done: ['좋은 털이야! 네 몫도 챙겨 주마.'], reward: { silver: 50, xp: 15 }, finish: S => SERVE(S, 3) },
  labanGrain: { giver: 'laban', title: '곡식 자루', desc: '곡식 자루 5', repeat: 6, when: S => yr(S) >= 3 && inHaran(S),
    offer: ['흉년을 대비해 곡식을 쌓아 두어야 한다. 곡식 자루 다섯을 만들어 오너라. (제작 탭)'], obj: [bring('grain', 5)], take: { grain: 5 }, done: ['곳간이 든든하구나.'], reward: { silver: 60, xp: 15 }, finish: S => SERVE(S, 4) },
  // --- Rachel
  rachelLamb: { loc: { x: -58, z: -142 }, giver: 'rachel', title: '길 잃은 어린 양', desc: '서북쪽 바위 언덕', when: S => yr(S) >= 1 && heart(S) >= 1 && inHaran(S),
    offer: ['야곱, 어린 양 하나가 무리에서 떨어졌어요. 서북쪽 바위 언덕 쪽으로 갔나 봐요.', '그 언덕엔 산양과 들짐승이 많아요… 찾아 줄래요?'],
    obj: [{ t: (S, G, st) => st.found ? '✓ 어린 양을 찾았다' : '서북쪽 바위 언덕에서 어린 양 찾기', ok: (S, G, st) => !!st.found }, { t: '라반의 우리로 데려오기', ok: (S, G, st) => !!st.home }],
    start: (S, G, st) => spawnLamb(), prog: '바위 언덕은 시냇가 너머 서북쪽이에요.',
    done: [N('rachel', '찾았군요! 고마워요, 야곱. 당신은 정말 좋은 목자예요.'), T('라헬이 어린 양을 품에 안고 웃었다.')], reward: { heart: 1, insight: 1, xp: 25 } },
  rachelFlowers: { loc: 'node:flowers', giver: 'rachel', title: '들꽃 화관', desc: '들꽃 6송이', when: S => yr(S) >= 2 && inHaran(S),
    offer: ['언니에게 화관을 만들어 주고 싶어요. 들꽃 여섯 송이만 꺾어다 줄래요?', '언니는… 늘 나보다 먼저 일어나 일해요. 고맙다는 말을 하고 싶어서요.'], obj: [bring('flower', 6, '들꽃')], take: { flower: 6 },
    done: [N('rachel', '예뻐요! 언니가 좋아할 거예요.'), T('그날 저녁, 레아는 동생이 씌워 준 화관을 쓰고 오래 웃었다.')], reward: { heart: 1, xp: 15 } },
  rachelGraze: { loc: { x: 43, z: -121 }, giver: 'rachel', title: '들 우물로 양 떼 몰기', desc: '양 여섯 마리', repeat: 2, when: S => yr(S) >= 1 && inHaran(S),
    offer: ['오늘은 같이 양 떼를 몰고 들 우물에 가요. 우리 처음 만났던 그 우물이요.', '양들이 따라오게 천천히 걸어야 해요. 너무 빨리 뛰면 흩어져요.'],
    obj: [{ t: '들 우물 구유에서 양에게 물 먹이기', ok: (S, G, st) => !!st.drank }, { t: '양 떼를 라반의 우리로 데려오기', ok: (S, G, st) => !!st.back }],
    start: (S, G, st) => spawnGraze(st), prog: '우물은 서쪽, 처음 만났던 곳이에요.',
    done: [N('rachel', '양들이 배불리 마셨어요. 오늘은 참 좋은 날이에요.')], reward: { silver: 10, xp: 20 }, finish: (S, G) => { SERVE(S, 3); const h = G.herd('laban'); if (h) h.joy = Math.min(100, h.joy + 25); if (!S.q.grazed) { S.q.grazed = 1; G.heart(1); } } },
  // --- Leah
  leahBread: { giver: 'leah', title: '일꾼들의 빵', desc: '빵 4', when: S => yr(S) >= 2 && inHaran(S),
    offer: ['추수하는 일꾼들이 먹을 빵이 모자라요. 빵 넷만 구워 줄 수 있어요?', '…고마워요, 야곱. 다들 나한테는 잘 부탁하지 않거든요.'], obj: [bring('bread', 4)], take: { bread: 4 },
    done: [N('leah', '덕분에 일꾼들이 배불리 먹었어요.')], reward: { silver: 15, xp: 20 }, finish: S => { S.q.leahKind = (S.q.leahKind || 0) + 1; SERVE(S, 2); } },
  leahClothes: { main: 1, loc: null, giver: 'leah', title: '아기 옷 지을 천', desc: '모직 천 2', when: S => S.q.phase === 'family' && (S.q.fy || 1) >= 2 && inHaran(S),
    offer: ['르우벤이 금세 자라서 옷이 작아졌어요. 곧 아기가 또 태어날 거고요.', '모직 천 두 필만 짜 줄래요? 베틀에서 짤 수 있어요.'], obj: [bring('cloth', 2)], take: { cloth: 2 },
    done: [N('leah', '고마워요, 여보. 이 천으로 아이들 옷을 지을게요.'), T('"이제는 남편이 나와 연합하리로다."', '창세기 29:34')], reward: { insight: 1, xp: 20 }, finish: S => { S.q.leahKind = (S.q.leahKind || 0) + 1; } },
  // --- Reuben (Gen 30:14)
  mandrakes: { main: 1, loc: { x: 70, z: -199 }, giver: 'reuben', title: '들에서 찾은 합환채', desc: '밀밭 가장자리', when: S => S.q.phase === 'family' && (S.q.fy || 1) >= 4 && inHaran(S),
    offer: ['아버지! 밀 거두는 밭 가장자리에서 이상한 풀을 봤어요. 노란 열매가 달렸어요!', '어머니께 드리고 싶은데, 같이 캐러 가요!'], obj: [bring('mandrake', 1, '합환채')], take: { mandrake: 1 }, prog: '밀밭 남쪽 끝이에요, 아버지!',
    done: [N('reuben', '어머니! 이거 보세요!'), T('밀 거둘 때에 르우벤이 들에 나가서 합환채를 얻어 그 어머니 레아에게 드렸습니다.', '창세기 30:14'),
      T('라헬이 레아에게 말했습니다. "언니의 아들의 합환채를 청구하노라." 레아가 말했습니다. "네가 내 남편을 빼앗은 것이 작은 일이냐?"', '창세기 30:14–15'), T('두 자매의 마음은 쉽게 풀리지 않았습니다. 야곱은 두 사람 사이에서 오래 말이 없었습니다.')], reward: { insight: 1, xp: 20 } },
  // --- town folk
  oldHerbs: { loc: 'node:herbs', giver: 'oldwoman', title: '할머니의 약초', desc: '약초 4', when: S => yr(S) >= 1 && inHaran(S),
    offer: ['젊은이, 무릎이 쑤셔서 들에 못 나가겠네. 북쪽 숲가에서 약초 넷만 캐다 주겠나?'], obj: [bring('herb', 4)], take: { herb: 4 },
    done: ['고맙네. 자네를 보니 옛날 생각이 나는구먼.', '내가 아주 어릴 적에, 데라 어른의 아들 아브람이 이 하란을 떠났지. 일흔다섯 살 노인이 낯선 땅으로 간다고 다들 혀를 찼어.', T('아브람이 하란을 떠날 때에 칠십오 세였더라.', '창세기 12:4'),
      '그런데 들어 보니 그 손자가 바로 자네라지? 허허… 그 노인이 들은 약속이 헛것은 아니었나 보구먼.', T('할머니가 석청을 손에 쥐여 주었다.')], reward: { insight: 1, items: { honey: 1 }, xp: 15 } },
  merchantCaravan: { giver: 'merchant', title: '다메섹 대상의 주문', desc: '치즈 4 · 모직 천 2', when: S => yr(S) >= 3 && inHaran(S), repeat: 7,
    offer: ['다메섹으로 가는 대상이 치즈와 모직 천을 찾네. 치즈 넷, 모직 천 둘이면 은 백오십을 쳐주지!'], obj: [bring('cheese', 4), bring('cloth', 2)], take: { cheese: 4, cloth: 2 },
    done: ['거래 성사일세! 자네 집안 물건은 믿을 수가 있어.'], reward: { silver: 150, xp: 20 }, finish: S => SERVE(S, 3) },
  smithClub: { giver: 'smith', title: '뼈 몽둥이', desc: '뼈 6', when: S => !!S.q.sawSmith && !CB().owns('club'),
    offer: ['지팡이로는 멧돼지 가죽도 못 뚫지. 뼈 여섯만 가져오게. 묵직한 몽둥이를 만들어 주지.'], obj: [bring('bone', 6)], take: { bone: 6 }, done: ['자, 받게. 한 방이면 늑대도 나가떨어질 걸세.'], reward: { gear: 'club', xp: 15 } },
  smithSpear: { giver: 'smith', title: '사냥 창', desc: '짐승 뿔 2 · 힘줄 1', when: S => qDone(S, 'smithClub') && !CB().owns('spear'),
    offer: ['뿔 둘과 힘줄 하나를 가져오면 창끝을 달아 주지. 멀리서 찌르는 창은 사자 앞에서도 든든하네.'], obj: [bring('horn', 2), bring('sinew', 1)], take: { horn: 2, sinew: 1 }, done: ['좋은 창이 됐어. 길게 잡고 찌르게.'], reward: { gear: 'spear', xp: 20 } },
  tannerVest: { giver: 'tanner', title: '가죽 조끼', desc: '짐승 가죽 3', when: S => between(S, 'j5_camp') && !CB().owns('vest'),
    offer: ['들짐승 앞에 그 얇은 옷으로 나선다고? 가죽 셋만 가져오게. 조끼를 지어 주지.'], obj: [bring('hide', 3)], take: { hide: 3 }, done: ['입어 보게. 이빨 자국 몇 개쯤은 막아 줄 걸세.'], reward: { gear: 'vest', xp: 15 } },
  tannerHides: { giver: 'tanner', title: '가죽 납품', desc: '짐승 가죽 4', repeat: 3, when: S => qDone(S, 'tannerVest'),
    offer: ['장터에 가죽 물통 주문이 밀려 있어. 가죽 넷을 가져오면 값을 후히 치지.'], obj: [bring('hide', 4)], take: { hide: 4 }, done: ['고맙네. 무두질한 가죽도 하나 얹어 주지.'], reward: { silver: 45, items: { leather: 1 }, xp: 10 } },
  shepFeathers: { giver: 'shep2', title: '자고새 깃털', desc: '깃털 6', when: S => yr(S) >= 1 && inHaran(S),
    offer: ['내 아들 화살에 깃을 달아 주려는데, 자고새 깃털 여섯만 구해 주게.'], obj: [bring('feather', 6, '깃털')], take: { feather: 6 }, done: ['고맙네! 이건 우리 집 빵이야.'], reward: { silver: 12, items: { bread: 2 }, xp: 10 } },
  boySling: { giver: 'boy', title: '물매 구경', desc: '자고새 2마리', when: S => !!S.q.metHunter && inHaran(S),
    offer: ['형! 물매로 새를 잡을 수 있어요? 진짜요? 두 마리만 보여 줘요!'], obj: [killQ('partridge', 2, '자고새')], done: ['우와아! 나도 크면 형처럼 될 거예요!'], reward: { xp: 15, items: { fig: 3 } } },
  // --- epilogue
  epJoseph: { loc: { x: 176, z: 154 }, giver: 'joseph', title: '요셉과 별 보기', desc: '동쪽 언덕, 밤', when: epi,
    offer: ['아버지! 오늘 밤에 동쪽 언덕에 같이 가요. 거기선 별이 아주 잘 보여요!'], obj: [{ t: '밤에 동쪽 언덕에서 요셉과 별 보기', ok: S => !!S.q.stars }],
    start: (S, G) => { S.q.stars = 0; G.npcFollow('joseph', true); }, prog: '언덕은 장막 동쪽이에요! 해가 지면 가요.',
    done: [N('joseph', '아버지, 오늘 별 이야기 평생 안 잊을 거예요.')], reward: { insight: 1, xp: 20 }, finish: (S, G) => G.npcFollow('joseph', false) },
  epReuben: { giver: 'reuben', title: '맏아들의 사냥', desc: '들짐승 2마리', when: epi,
    offer: ['아버지, 저도 이제 맏아들이에요. 들짐승에게서 양 떼를 지키는 법을 가르쳐 주세요!'], obj: [{ t: (S, G, st) => `들짐승 사냥 ${Math.min(2, LF().killsSince(st, ALLWILD))}/2`, ok: (S, G, st) => LF().killsSince(st, ALLWILD) >= 2 }],
    start: (S, G) => G.npcFollow('reuben', true), done: [N('reuben', '아버지처럼 될게요!'), J('르우벤아, 힘보다 중요한 건 양을 아끼는 마음이란다.')], reward: { insight: 1, xp: 25 }, finish: (S, G) => G.npcFollow('reuben', false) },
  epDinah: { loc: 'node:flowers', giver: 'dinah', title: '디나의 화관', desc: '들꽃 5송이', when: epi,
    offer: ['아버지, 어머니들께 화관을 만들어 드리고 싶어요. 들꽃 다섯 송이만요!'], obj: [bring('flower', 5, '들꽃')], take: { flower: 5 },
    done: [N('dinah', '레아 어머니, 라헬 어머니, 빌하 어머니, 실바 어머니… 다 하나씩!'), T('그날 저녁, 장막의 여인들은 모두 화관을 쓰고 있었다.')], reward: { insight: 1, xp: 15 } },
  epJudah: { giver: 'judah', title: '형제들의 저녁거리', desc: '물고기 3', when: epi,
    offer: ['아버지, 오늘은 저희가 저녁을 차릴래요. 시내에서 물고기 셋만 같이 잡아요!'], obj: [{ t: (S, G, st) => `물고기 낚기 ${Math.min(3, LF().fishSince(st))}/3`, ok: (S, G, st) => LF().fishSince(st) >= 3 }],
    done: [N('judah', '형제들아, 오늘은 생선 잔치다!')], reward: { xp: 25, items: { roastfish: 2 } } },
  buyField: { giver: 'hamor', title: '장막 친 밭을 사다', desc: '은 100', when: epi,
    offer: ['나그네여, 그대가 장막을 친 이 밭은 우리 아버지 하몰의 것이오.', '그대 가족이 이 땅에 머물고자 한다면, 은 백에 이 밭을 넘기겠소.'], obj: [{ t: S => `은 ${Math.min(100, S.silver)}/100`, ok: S => S.silver >= 100 }],
    done: [T('야곱이 장막을 친 밭을 세겜의 아버지 하몰의 아들들의 손에서 백 크시타에 샀습니다.', '창세기 33:19'), T('텃밭을 일굴 수 있게 되었다. 오이와 양파 씨앗을 받았다.')], reward: { insight: 1, items: { s_cucumber: 6, s_onion: 6 } },
    finish: (S, G) => { G.silver(-100); G.unlock('garden'); } },
};

// ------------------------------------------------------------------ CHATTER (NPC ↔ NPC bubbles)
const C2 = (a, b, when, lines, o) => Object.assign({ a, b, when, lines }, o || {});
const tut = S => before(S, 'j3_start'), har = S => inHaran(S), fam = S => inHaran(S) && S.q.phase === 'family';
const kidOk = (...ids) => S => ids.every(id => born(S, id)) && (inHaran(S) || epi(S));
const chatter = [
  C2('rebekah', 'deborah', tut, [[0, '드보라, 야곱이 밭일을 곧잘 하는구나.'], [1, '손이 야무지세요, 마님. 에서 도련님은 괭이를 들면 사흘을 못 가시는데.']]),
  C2('isaac', 'rebekah', tut, [[0, '에서는 아직 들에 있느냐?'], [1, '사냥감이 많은 날이면 늘 늦지요.'], [0, '그 아이가 잡아 온 고기 맛이 그립구나…']], { r: 16 }),
  C2('herder', 'deborah', tut, [[0, '염소들이 요즘 자꾸 서쪽 풀밭으로 나가요.'], [1, '야곱 도련님께 부탁해 봐요. 지팡이를 드렸으니.']], { r: 50 }),
  C2('trader2', 'rebekah', tut, [[0, '마님, 하란에서 온 소식이 있습니다. 라반 어른 댁이 평안하답니다.'], [1, '오라버니가…! 고맙소.']], { r: 16 }),
  C2('shep1', 'shep2', S => between(S, 'j4_start'), [[0, '라반 집 양들이 요새 살이 올랐어.'], [1, '그 낯선 젊은이 덕이라지. 우물 돌도 혼자 굴렸다며?']]),
  C2('shep2', 'shep3', S => between(S, 'j4_start'), [[0, '해 지기 전에 우리로 몰아야 해.'], [1, '어젯밤에도 늑대 소리가 들렸어.']]),
  C2('laban', 'leah', har, [[0, '레아야, 양털 값이 올랐다는구나.'], [1, '아버지, 야곱이 깎은 털이 장터에서 제일 좋대요.'], [0, '허허, 그 녀석 손이 복이야.']]),
  C2('rachel', 'leah', S => har(S) && !S.q.married, [[0, '언니, 야곱이 오늘도 우물가에 왔었어.'], [1, '…그래, 좋은 사람이지.'], [0, '언니도 좋은 사람 만날 거야.']]),
  C2('rachel', 'leah', fam, [[0, '르우벤이 벌써 저렇게 컸네.'], [1, '네게도 곧 하나님이 아이를 주실 거야.'], [0, '…그랬으면 좋겠어, 언니.']]),
  C2('laban', 'rachel', har, [[0, '라헬아, 오늘은 들 우물까지 양을 몰았느냐?'], [1, '네, 아버지. 야곱이 돌을 굴려 줬어요.']]),
  C2('laban', 'lson1', fam, [[0, '네 매부가 양 떼를 두 배로 불렸다.'], [1, '…아버지 재산이 늘어나는 건지, 그 사람 재산이 늘어나는 건지.']]),
  C2('lson1', 'lson2', S => between(S, 'j7_wage', 'j7_call'), [[0, '야곱이 우리 아버지의 소유를 다 빼앗았어.'], [1, '아버지의 것으로 이 모든 재물을 모았다니까.']], { ref: '창 31:1' }),
  C2('smith', 'tanner', har, [[0, '오늘 들어온 뼈는 단단하더군. 늑대 것이야.'], [1, '가죽도 상처가 적어. 야곱이 손질을 잘해.']], { r: 26 }),
  C2('merchant', 'trader', S => true, [[0, '다메섹 대상이 내일 온다더군.'], [1, '낙타 값이 오르겠구먼.']]),
  C2('hunter', 'boy', har, [[0, '바람을 등지고 다가가야 짐승이 냄새를 못 맡지.'], [1, '바람을 등지고… 알았어요, 우스 할아버지!']], { r: 30 }),
  C2('bilhah', 'zilpah', S => between(S, 'j5_more') && har(S), [[0, '오늘은 우물 물이 차가워.'], [1, '그래도 아이들 씻기기엔 좋아.']]),
  C2('rachel', 'bilhah', S => fam(S) && !born(S, 'joseph'), [[0, '빌하, 단이 오늘 웃었어. 나를 보고.'], [1, '마님의 아들이에요. 마님 품에서 자랐으니까요.']], { ref: '창 30:6' }),
  C2('leah', 'zilpah', S => fam(S) && born(S, 'gad'), [[0, '실바, 갓이 아셀을 업고 다니더라.'], [1, '복된 아이들이에요, 마님.']]),
  C2('oldwoman', 'merchant', har, [[0, '장사꾼 양반, 그 저울 좀 똑바로 다시게.'], [1, '할머니도 참, 하란에서 제일 정직한 저울이에요!']], { r: 26 }),
  C2('shepW', 'shep1', S => har(S) && built(S, 'hireShep'), [[0, '야곱 어른은 양 이름을 다 외우세요.'], [1, '하하, 목자는 그래야지.']], { r: 60 }),
  C2('reuben', 'simeon', kidOk('reuben', 'simeon'), [[0, '시므온, 오늘은 내가 양을 몰 거야!'], [1, '형만 맨날 해! 나도 할래!']]),
  C2('levi', 'judah', kidOk('levi', 'judah'), [[0, '유다, 아버지가 그러는데 우리 할아버지는 이삭이래.'], [1, '그럼 할아버지의 아버지는?'], [0, '아브라함!']]),
  C2('dan', 'naphtali', kidOk('dan', 'naphtali'), [[0, '납달리, 경주하자! 저 무화과나무까지!'], [1, '이번엔 안 질 거야!']]),
  C2('gad', 'asher', kidOk('gad', 'asher'), [[0, '아셀, 메뚜기 잡았어!'], [1, '우와, 크다!']]),
  C2('issachar', 'zebulun', kidOk('issachar', 'zebulun'), [[0, '나는 커서 밭을 많이 가질 거야.'], [1, '나는 바닷가에 살 거야. 배를 타고!']]),
  C2('joseph', 'rachel', kidOk('joseph'), [[0, '어머니, 오늘 꿈에 별이 내려왔어요.'], [1, '그래? 우리 요셉은 꿈이 참 많구나.']]),
  C2('joseph', 'dinah', kidOk('joseph', 'dinah'), [[0, '디나 누나, 이 색실 예쁘다.'], [1, '네 옷에 달아 줄까?']]),
  C2('rachel', 'leah', epi, [[0, '언니, 이 땅은 바람이 부드러워.'], [1, '그래. 여기서는 우리 아이들이 다 함께 자랄 수 있겠지.']]),
  C2('reuben', 'judah', epi, [[0, '유다, 아버지가 다리를 저시는 거 봤어?'], [1, '그날 밤 얍복 강에서 하나님과 씨름하셨대.'], [0, '…하나님과?']]),
  C2('leah', 'bilhah', epi, [[0, '빌하, 오늘 저녁엔 렌틸콩 죽을 끓이자.'], [1, '붉은 죽이요? 주인어른이 좋아하시겠어요.']]),
];

// ------------------------------------------------------------------ NPCs WHO COME UP TO JACOB
const AP = (key, id, when, call, say, o) => Object.assign({ key, id, when, call, say }, o || {});
const approach = [
  AP('debFig', 'deborah', S => S.step === 'j1_figs', '도련님!', () => [N('deborah', '무화과는 장막 둘레 나무 가지를 흔들면 떨어져요. 염소젖은 이미 가방에 있지요?')], { once: 1 }),
  AP('herdTip', 'herder', S => S.step === 'j1_goats', '도련님, 잠깐만요!', () => [N('herder', '염소는 앞서 가는 목자를 따라요. 천천히 걸으면 줄지어 따라온답니다.')], { once: 1 }),
  AP('rebLove', 'rebekah', S => between(S, 'j1_water', 'j1_sleep'), '야곱아!', () => [N('rebekah', '네가 밭을 일구는 모습을 보니 아브라함 어른 생각이 나는구나. 그분도 손으로 우물을 파셨지.'), N('rebekah', '하나님은 사람의 겉모습이 아니라 마음을 보신단다. 잊지 말거라.')], { once: 1 }),
  AP('labanYear', 'laban', S => S.step === 'j5_year' || S.step === 'j6_start', '야곱! 이리 오너라.', (S, G) => { const g = yearList(S).find(g => !g.ok(S, G)); return [N('laban', g ? `올해는 "${g.t(S, G)}" 이 일을 부탁한다.` : '올해 일도 거의 다 되었구나!'), N('laban', ['밭과 양 떼가 네 손에서 번성하는구나.', '장터 사람들이 우리 집 양털을 찾는다.', '여호와께서 너로 말미암아 내게 복을 주신 줄 깨달았노라.'][S.day % 3], S.day % 3 === 2 ? '창세기 30:27' : '')]; }, { range: 40, cool: 30 }),
  AP('rachelHi', 'rachel', S => har(S) && heart(S) >= 1, '야곱!', (S, G) => rachelChat(S, G), { range: 40, cool: 20 }),
  AP('leahHi', 'leah', S => har(S) && S.q.married, '여보…', (S, G) => leahChat(S, G), { range: 34, cool: 30 }),
  AP('hunterTip', 'hunter', S => har(S) && S.q.metHunter, '야곱, 들었나?', (S, G) => [N('hunter', ['동쪽 들판에 가젤 떼가 내려왔네. 물매로 한번 노려 보게.', '서쪽 갈대밭에 멧돼지 발자국이 새로 났어.', yr(S) >= 3 ? '북쪽 숲가에 곰 발톱 자국이 있더군. 아직은 가까이 가지 말게.' : '서북쪽 바위 언덕엔 산양이 사네. 뿔이 귀하지.', '희귀한 뿔이나 뼈는 장비 탭에서 좋은 무기가 된다네.'][(S.day + Math.floor(S.time)) % 4])], { range: 30, cool: 24 }),
  AP('shepDusk', 'shep1', S => har(S) && S.time % 24 > 17 && S.time % 24 < 20.5, '여보게!', () => [N('shep1', '해가 지면 늑대가 우리를 노린다네. 양들을 잘 지키게.')], { cool: 30 }),
  AP('oldStory', 'oldwoman', S => har(S) && yr(S) >= 1, '젊은이, 이리 좀 와 보게.', () => [N('oldwoman', '자네가 리브가의 아들이라지? 리브가가 이 우물가에서 낙타 열 마리에게 물을 다 길어 먹였다네.'), N('oldwoman', '아브라함 어른의 늙은 종이 그걸 보고 무릎을 꿇었지. 그렇게 리브가가 가나안으로 시집을 갔어.'), T('리브가가 급히 물동이의 물을 구유에 붓고 다시 길으려고 우물로 달려가서 모든 낙타를 위하여 길었습니다.', '창세기 24:20')], { once: 1 }),
  AP('boyAsk', 'boy', S => har(S), '형!', (S) => [N('boy', ['형, 라헬 누나 좋아하죠? 다 알아요!', '어제 늑대 눈이 반짝이는 걸 봤어요!', '형은 왜 하란에 왔어요? 형의 형이 무서워요?'][S.day % 3])], { range: 26, cool: 30 }),
  AP('reubenRun', 'reuben', S => kidAge(S, 'reuben') >= 2 && (har(S) || epi(S)), '아버지!', (S) => [N('reuben', kidAge(S, 'reuben') < 5 ? '아버지! 양이 또 새끼를 낳았어요! 하얀 거요!' : '아버지, 오늘은 제가 형제들을 데리고 양을 몰았어요.')], { range: 30, cool: 22 }),
  AP('josephStar', 'joseph', S => kidAge(S, 'joseph') >= 0 && (har(S) || epi(S)), '아버지!', (S) => [N('joseph', kidAge(S, 'joseph') < 2 ? '아-빠! (요셉이 두 팔을 벌린다)' : ['아버지, 업어 주세요!', '아버지, 꿈에서 곡식 단이 절을 했어요. 이상하죠?', '아버지가 하나님을 만났던 이야기 또 해 주세요!'][S.day % 3])], { range: 30, cool: 26 }),
  AP('judahHi', 'judah', S => kidAge(S, 'judah') >= 2 && (har(S) || epi(S)), '아버지, 보세요!', () => [N('judah', '형들이랑 씨름했는데 제가 이겼어요! …딱 한 번이요.')], { range: 26, cool: 40 }),
  AP('dinahHi', 'dinah', S => kidAge(S, 'dinah') >= 1 && (har(S) || epi(S)), '아버지!', () => [N('dinah', '아버지, 머리에 꽃 꽂아 드릴게요. 가만히 계세요!')], { range: 26, cool: 40 }),
  AP('lsonGrr', 'lson1', S => between(S, 'j7_wage', 'j7_call'), '야곱!', () => [N('lson1', '점 있는 양이 왜 다 네 우리로 가는 거지? 우리 아버지를 속이는 건 아니겠지?'), J('하나님께서 그대 아버지의 가축을 빼앗아 내게 주셨소.', '창세기 31:9')], { cool: 40 }),
  AP('rachelEp', 'rachel', epi, '여보!', () => [N('rachel', ['요셉이 형들 뒤를 졸졸 따라다녀요. 형들이 귀찮아해도요.', '이 땅은 하란보다 바람이 따뜻해요.', '당신, 다리는 괜찮아요? 오늘도 많이 걸었잖아요.'][Math.floor(Math.random() * 3)])], { range: 36, cool: 24 }),
];
function rachelChat(S, G) {
  const lines = [[N('rachel', '오늘도 들에 나갔다 왔어요? 얼굴이 볕에 그을렸네요.')], [N('rachel', '양들이 당신만 보면 따라가요. 신기해요.')], [N('rachel', '언덕에 붉은 꽃이 피었어요. 봄이 왔나 봐요.')],
    [N('rachel', S.q.married ? '하나님이 언니에게만 아이를 주시는 것 같아요…' : `일곱 해 중에 벌써 ${S.q.year || 1}년이 지나가요.`)]];
  const l = lines[(S.day + (S.q.heart || 0)) % lines.length];
  return l.concat([giftChoice(S, G)]);
}
function giftChoice(S, G) {
  const ch = []; const can = S.q.giftDay !== S.day;
  if (can && G.have('flower')) ch.push({ t: '들꽃을 건넨다', then: () => { G.take('flower'); gift(S, G, '들꽃'); } });
  if (can && G.have('honey')) ch.push({ t: '석청을 건넨다', then: () => { G.take('honey'); gift(S, G, '석청'); } });
  if (can && G.have('linen')) ch.push({ t: '세마포를 건넨다', then: () => { G.take('linen'); gift(S, G, '세마포'); } });
  ch.push({ t: ch.length ? '이야기만 나눈다' : '웃어 준다' });
  return { n: '야곱', t: can ? '무엇을 할까?' : '(오늘은 이미 선물을 주었다)', choices: ch };
}
function gift(S, G, what) { S.q.giftDay = S.day; G.heart(1); GG.Life.bubble('rachel', what === '들꽃' ? '어머, 예뻐요!' : '고마워요, 야곱!', 2.6); }
function leahChat(S, G) {
  const k = (S.q.kidsBorn || []).filter(id => ['reuben', 'simeon', 'levi', 'judah', 'issachar', 'zebulun', 'dinah'].includes(id)).length;
  const L = k >= 4 ? ['아이들이 당신을 닮아 고집이 세요. 후후.', '이제는 내가 여호와를 찬송하리로다… 유다를 낳고 그렇게 말했지요.', '라헬을 미워하지 않아요. 그 애도 아파하니까요.']
    : k >= 1 ? ['이번에는 남편이 나를 사랑하리라… 르우벤을 낳았을 때 그렇게 생각했어요.', '아이들이 아버지를 찾아요. 오늘 저녁엔 장막에 일찍 와요.'] : ['아버지가 하신 일… 미안해요, 야곱.', '나는 라헬처럼 곱지 않아요. 알아요.'];
  return [N('leah', L[S.day % L.length], k >= 1 && S.day % L.length === 0 ? '창세기 29:32' : '')];
}

// ------------------------------------------------------------------ PASSING TRAVELERS
const TV = (key, name, look, at, when, say, o) => Object.assign({ key, name, look, at, when, say }, o || {});
const travelers = [
  TV('caravan', '다메섹 대상', LOOK.caravan, S => [182, -176, 132, -164], har, (S, G, n, c) => {
    const ch = [];
    if (G.have('hide', 3)) ch.push({ t: '가죽 3장을 은 45에 판다', then: () => { G.take('hide', 3); G.silver(45); c.done = true; } });
    if (G.have('cheese', 2)) ch.push({ t: '치즈 2개를 은 48에 판다', then: () => { G.take('cheese', 2); G.silver(48); c.done = true; } });
    if (G.have('meat', 4)) ch.push({ t: '생고기 4덩이를 은 36에 판다', then: () => { G.take('meat', 4); G.silver(36); c.done = true; } });
    if (S.silver >= 40) ch.push({ t: '은 40에 사냥 화살 20개를 산다', then: () => { G.silver(-40); G.give('arrow', 20); c.done = true; } });
    ch.push({ t: '그냥 보낸다', then: () => { c.done = true; } });
    return [{ n: '다메섹 대상', t: '하란의 젊은이여, 우리는 다메섹으로 가는 길이오. 좋은 물건이 있으면 값을 후히 치겠소.' }, { n: '야곱', t: '어떻게 할까?', choices: ch }]; }, { cool: 30, call: '여보시오, 하란의 젊은이!' }),
  TV('thirsty', '목마른 나그네', LOOK.traveler, S => [10, -168, 40, -128], har, (S, G, n, c) => [{ n: '목마른 나그네', t: '광야를 건너왔소… 물 한 모금만 나눠 주시겠소?' },
    { n: '야곱', t: '어떻게 할까?', choices: S.water >= 2 ? [{ t: '항아리의 물을 나눈다', then: () => { S.water -= 2; c.done = true; if (!S.flags.hosp) { S.flags.hosp = 1; setTimeout(() => G.insight(1, '나그네 대접'), 300); } else G.addXP(10); G.UI.hud(); }, reply: '드시오. 먼 길에 평안하시기를.' }, { t: '물이 넉넉지 않다', then: () => { c.done = true; } }]
      : [{ t: '항아리가 비었다고 미안해한다', then: () => { c.done = true; } }] },
    { n: '목마른 나그네', t: '하나님이 그대의 집에 복을 주시기를.' }], { cool: 36, call: '여보시오, 젊은이…' }),
  TV('news', '가나안에서 온 나그네', LOOK.traveler, S => [70, -100, 88, -144], S => har(S) && yr(S) >= 3, (S, G, n, c) => [{ n: '가나안에서 온 나그네', t: '그대가 브엘세바 이삭의 아들 야곱이오? 남쪽에서 소식을 들고 왔소.' },
    { n: '가나안에서 온 나그네', t: '그대의 아버지 이삭은 아직 살아 계시오. 눈은 어두우나 정신은 맑으시더이다.' },
    { n: '가나안에서 온 나그네', t: '그리고 그대의 형 에서는 세일 땅 에돔 들에서 크게 되었다 하오. 사람을 많이 거느렸다더군.', ref: '창세기 32:3' },
    J('…형님이.'), T('야곱은 그날 밤 오래 잠들지 못했습니다.')], { once: 1, call: '혹시 야곱이라는 분이오?', fin: (S, G) => G.insight(1, '고향 소식') }),
  TV('hunters', '사냥꾼 일행', LOOK.hunter, S => [200, -150, 160, -150], S => har(S) && yr(S) >= 2, (S, G, n, c) => [{ n: '사냥꾼 일행', t: '우스 영감 제자라고? 우리는 북쪽 산에서 내려왔소. 고기가 떨어졌는데 좀 팔겠소?' },
    { n: '야곱', t: '어떻게 할까?', choices: (G.have('roast', 2) ? [{ t: '구운 고기 2덩이를 은 40에 판다', then: () => { G.take('roast', 2); G.silver(40); c.done = true; } }] : []).concat(G.have('meat', 3) ? [{ t: '생고기 3덩이를 은 27에 판다', then: () => { G.take('meat', 3); G.silver(27); c.done = true; } }] : [], [{ t: '나눌 고기가 없다', then: () => { c.done = true; } }]) }], { cool: 40, call: '어이, 거기 젊은 사냥꾼!' }),
  TV('minstrel', '떠돌이 악사', LOOK.musician, S => [60, -120, 84, -150], S => har(S), (S, G, n, c) => [{ n: '떠돌이 악사', t: '하란의 저녁이 쓸쓸하구려! 내 수금 소리 한번 들어 보시오.' }, { n: '', t: '악사가 수금을 타며 노래했다. 밭의 일꾼들이 하나둘 모여 박자를 맞추었다.', fn: () => { GG.Game.musicOverride = 'festival'; setTimeout(() => { if (GG.Game.musicOverride === 'festival' && !S.q.feast) GG.Game.musicOverride = null; }, 40000); } }, { n: '떠돌이 악사', t: '그대 얼굴에 근심이 있구려. 그러나 사랑하는 이를 기다리는 일곱 해는 며칠 같다지 않소?' }], { cool: 60, call: '음악 한 곡 어떠시오!' }),
  TV('epTrader', '이스마엘 사람 상인', LOOK.caravan, S => [190, 160, 160, 134], epi, (S, G, n, c) => [{ n: '이스마엘 사람 상인', t: '길르앗에서 향품과 유향과 몰약을 싣고 애굽으로 가는 길이오.', ref: '창세기 37:25 참고' }, { n: '야곱', t: '어떻게 할까?', choices: [{ t: '가죽을 판다', then: () => { const n = Math.min(4, G.inv('hide')); if (n) { G.take('hide', n); G.silver(n * 14); } c.done = true; } }, { t: '그냥 보낸다', then: () => { c.done = true; } }] }], { cool: 40 }),
];
travelers.forEach(t => { if (t.fin) { const s = t.say; t.say = (S, G, n, c) => { const r = s(S, G, n, c); c.done = true; setTimeout(() => t.fin(S, G), 200); return r; }; } });

// ------------------------------------------------------------------ DEFAULT TALK
const talk = {
  rebekah(S, G) { say([N('rebekah', before(S, 'j2_start') ? '드보라가 밭일을 잘 가르쳐 줄 거야.' : '서두르렴, 아들아.')]); },
  deborah(S, G) { say([N('deborah', ['도련님, 밤이 되면 꼭 장막에서 주무세요.', '물은 우물에서 길어요. 항아리 하나로 열두 번 줄 수 있어요.', '떠돌이 상인에게 씨앗을 살 수 있어요.'][S.day % 3])]); },
  isaac(S, G) { say([N('isaac', before(S, 'j2_isaac') ? '야곱이냐…? 장막을 잘 지키거라.' : '하나님이 너와 함께 하시기를…')]); },
  herder(S, G) { say([N('herder', ['염소는 바위 위를 좋아하지요.', '이삭 어르신의 염소는 브엘세바에서 제일 튼튼해요.'][S.day % 2])]); },
  esau(S, G) { say([N('esau', between(S, 'j8_esau') ? '내 동생아!' : '사냥감이 영 보이지 않는구나.')]); },
  shep1(S, G) { say([N('shep1', '라반의 양은 하란에서 손꼽히지. 요즘은 더 불어났어.')]); }, shep3(S, G) { say([N('shep1', '우물 돌은 여럿이 함께 옮기는 법이지.')]); },
  shep2(S, G) { say([N('shep1', '해가 지면 늑대를 조심하게.')]); },
  rachel(S, G) { const l = between(S, 'j8_start') ? [N('rachel', epi(S) ? '여보, 아이들이 당신을 기다려요.' : '아버지 집을 떠나는 게… 두렵지는 않아요. 당신이 있으니까.')] : rachelChat(S, G); say(l); },
  leah(S, G) { say(S.q.married ? leahChat(S, G) : [N('leah', ['야곱, 오늘도 수고했어요.', '라헬은 아버지 양을 몰고 들 우물에 갔어요.'][S.day % 2])]); },
  laban(S, G) {
    if (S.step === 'j5_year' && S.q.year === 4 && !S.q.paid4) { if (S.silver >= 100) { say([N('laban', '은 백 세겔이라! 장터에서 잘 팔았구나.'), J('외삼촌의 집이 번성하기를 바랍니다.')], () => { G.silver(-100); S.q.paid4 = 1; G.checkStep(); }); } else say([N('laban', `장터에서 은 100을 마련해 오너라. (지금 은 ${S.silver}) 양털, 치즈, 사냥한 가죽을 팔면 돼.`)]); return; }
    say([N('laban', ['밭과 양 떼를 부탁한다, 야곱.', '장터 상인들이 네 양털을 좋아하더구나.', '여호와께서 너로 말미암아 내게 복을 주셨구나.'][S.day % 3], S.day % 3 === 2 ? '창세기 30:27' : '')]);
  },
  lson1(S, G) { say([N('lson1', between(S, 'j7_wage') ? '야곱이 우리 아버지의 소유를 다 빼앗았다니까.' : '매부, 오늘은 어느 들로 가오?', between(S, 'j7_wage') ? '창세기 31:1' : '')]); },
  lson2(S, G) { say([N('lson2', between(S, 'j7_wage') ? '점 있는 양이 왜 이리 많이 태어나지?' : '밭일은 지겨워. 나도 사냥이나 하고 싶다.')]); },
  bilhah(S, G) { say([{ n: '빌하', t: born(S, 'dan') ? '단과 납달리가 아버지를 찾아요.' : '라헬 마님을 잘 모실게요.' }]); },
  zilpah(S, G) { say([{ n: '실바', t: born(S, 'gad') ? '갓과 아셀이 오늘 밭에서 놀았어요.' : '레아 마님을 잘 모실게요.' }]); },
  hunter(S, G) { say([N('hunter', ['짐승이 웅크리면 곧 달려든다. 그때 굴러!', '희귀한 뿔이나 뼈가 나오면 장비 탭을 열어 보게.', '내 천막 곁에서 화살과 힘줄을 팔지.'][S.day % 3])]); },
  smith(S, G) { say([N('smith', '내 화덕 곁에서 메뉴 → 장비를 열면 무기를 강화할 수 있네. 뼈와 힘줄, 그리고 은이 들지.')]); },
  tanner(S, G) { say([N('tanner', '가죽은 내 작업대에서 무두질할 수 있네. 가죽 둘과 나뭇가지 하나면 돼. (제작 탭)')]); },
  fisher(S, G) { say([N('fisher', ['물가를 바라보고 서면 낚시를 할 수 있지.', '찌가 쏙 들어가면 바로 챔질하게!', '메기는 힘이 세. 줄이 빨개지면 잠깐 놓아 주게.'][S.day % 3])]); },
  oldwoman(S, G) { say([N('oldwoman', ['하란은 데라 어른 때부터 장사꾼의 도시였지.', '나홀 집안 사람들은 다 손이 커.', '젊은이, 사랑은 기다리는 거라네.'][S.day % 3])]); },
  boy(S, G) { say([N('boy', '형, 물매 쏘는 거 보여 줘요!')]); },
  hamor(S, G) { say([{ n: '하몰의 아들', t: '세겜 성에 오신 것을 환영하오, 나그네여.' }]); },
};
const KIDTALK = { reuben: ['아버지, 저 오늘 양 열 마리 셌어요!', '맏아들은 형제들을 지켜야 한대요.'], simeon: ['레위가 또 제 막대기를 가져갔어요!', '아버지, 저도 물매 갖고 싶어요.'], levi: ['아버지, 할아버지 이삭은 어떤 분이에요?', '시므온 형이랑 같이 다닐래요.'],
  judah: ['저 힘세죠? 형들도 이겨요!', '아버지, 사자 이야기 해 주세요!'], dan: ['라헬 어머니가 저를 단이라고 지으셨대요.', '아버지, 무화과 따 주세요.'], naphtali: ['저 빨라요! 사슴보다 빨라요!', '경주해요, 아버지!'],
  gad: ['메뚜기 잡았어요!', '아셀이 자꾸 따라와요.'], asher: ['아버지, 이 꿀 맛있어요!', '갓 형 기다려!'], issachar: ['밭에 씨앗 심는 거 도와드릴게요.', '저는 소처럼 힘이 세요.'], zebulun: ['아버지, 바다는 얼마나 커요?', '배 타고 싶어요.'],
  dinah: ['아버지, 머리 땋아 줄게요!', '오빠들은 맨날 저만 빼고 놀아요.'], joseph: ['아버지, 업어 주세요!', '꿈에서 별을 봤어요!', '라헬 어머니가 제일 좋아요.'] };
Object.keys(KIDTALK).forEach(id => { talk[id] = (S, G) => say([N(id, kidAge(S, id) < 1 ? '(방긋 웃는다)' : KIDTALK[id][S.day % KIDTALK[id].length])]); });

// ================================================================== v7 · 살아 있는 세상
// 세겜 성읍과 주민들, 들판의 낯선 사람들, 단계별로 열리는 기능, 그림책 오프닝, 끝없이 이어지는 에필로그

// ------------------------------------------------------------------ extra props
Object.assign(ENVX, {
  tower(g, M) { g.box(3, 3.8, 3.2, { m: M, at: [0, 1.9, 0], c: 0xbca88a, j: 0.03 }); for (const [x, z] of [[-1.2, -1.3], [0, -1.3], [1.2, -1.3], [-1.2, 1.3], [0, 1.3], [1.2, 1.3]]) g.box(0.6, 0.5, 0.6, { m: M, at: [x, 4.05, z], c: 0xb09a7a, j: 0.04 }); g.box(0.5, 0.9, 0.08, { m: M, at: [0, 2.6, 1.62], c: 0x2a2018, j: 0 }); },
  press(g, M) { g.cyl(1.3, 1.4, 0.7, 14, { m: M, at: [0, 0.35, 0], c: 0xa89c88, flat: true, j: 0.06 }); g.cyl(1.0, 1.0, 0.05, 14, { m: M, at: [0, 0.71, 0], c: 0x6a7a3a, j: 0 });
    g.cyl(0.55, 0.55, 0.35, 12, { m: M, at: [0.35, 1.05, 0], rz: Math.PI / 2, c: 0xb8ac98, flat: true }); g.cyl(0.08, 0.08, 2.6, 6, { m: M, at: [0, 1.05, 0], rz: Math.PI / 2, c: 0x7a5a3a }); g.cyl(0.12, 0.12, 0.6, 6, { m: M, at: [0, 0.95, 0], c: 0x6a4a30 });
    for (let i = 0; i < 3; i++) g.lathe([[0.08, 0], [0.22, 0.12], [0.24, 0.36], [0.12, 0.6], [0.13, 0.66]], 10, { m: M, at: [1.8 + i * 0.5, 0, -0.6 + (i % 2) * 0.5], c: [0xb5673a, 0xa85a30, 0xc0784a][i] }); },
  thresh(g, M, r) { g.cyl(4.2, 4.3, 0.12, 20, { m: M, at: [0, 0.05, 0], c: 0xc8b48a, j: 0.04 }); for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; g.sph(0.28, 5, 4, { m: M, at: [Math.cos(a) * 4.3, 0.12, Math.sin(a) * 4.3], s: [1.3, 0.6, 1], c: 0xa89c88, flat: true }); }
    for (let i = 0; i < 4; i++) g.cyl(0.2, 0.26, 0.9, 8, { m: M, at: [5.2 + (i % 2) * 0.6, 0.45, -1.5 + i * 1.0], c: 0xe2b844, j: 0.08 }); g.box(1.6, 0.06, 0.6, { m: M, at: [1, 0.15, 0.5], ry: 0.6, c: 0x8a6a48 }); },
  crops(g, M, r, w, d, ripe) { for (let i = 0; i < Math.round(w / 1.1); i++) { const x = -w / 2 + (i + 0.5) * w / Math.round(w / 1.1); g.box(0.7, 0.08, d, { m: M, at: [x, 0.03, 0], c: 0x6a4a32, j: 0.03 });
      for (let k = 0; k < Math.round(d / 0.5); k++) { const z = -d / 2 + (k + 0.5) * 0.5, h = 0.5 + r() * 0.3; g.cyl(0.02, 0.05, h, 3, { m: M, at: [x + (r() - 0.5) * 0.3, h / 2, z], c: ripe ? [0xd8b850, 0xe0c060][k % 2] : [0x7aa848, 0x88b050][k % 2], sw: 0.6 }); } } },
  fold(g, M, r) { const n = 14; for (let i = 0; i < n; i++) { if (i === 3) continue; const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, R = 6; const ax = Math.cos(a0) * R, az = Math.sin(a0) * R, bx = Math.cos(a1) * R, bz = Math.sin(a1) * R;
      G.env.wallSeg(g, m4mul(m4(), M, m4trs(m4(), (ax + bx) / 2, 0, (az + bz) / 2, -Math.atan2(bz - az, bx - ax))), r, Math.hypot(bx - ax, bz - az) + 0.2, 1.0); } G.env.trough(g, m4mul(m4(), M, m4trs(m4(), 0, 0, -3, 0)), r); },
  wheel(g, M) { g.cyl(0.4, 0.45, 0.5, 10, { m: M, at: [0, 0.25, 0], c: 0x7a5a3a }); g.cyl(0.45, 0.45, 0.08, 12, { m: M, at: [0, 0.54, 0], c: 0x8a6a48 }); g.lathe([[0.05, 0], [0.18, 0.08], [0.2, 0.22], [0.1, 0.32]], 10, { m: M, at: [0, 0.58, 0], c: 0xa86a44 }); },
  loomX(g, M) { g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [-0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.07, 0.08, 2.2, 6, { m: M, at: [0.9, 1.1, 0], c: 0x7a5a3a }); g.cyl(0.06, 0.06, 2, 6, { m: M, at: [0, 2.1, 0], rz: Math.PI / 2, c: 0x7a5a3a });
    g.box(1.6, 1.6, 0.03, { m: M, at: [0, 1.2, 0], c: (x, y) => (Math.floor((y + 2) * 8) % 2 ? 0x2e6a8a : 0xe8dcc0) }); },
});
function buildShechem(W, r, node, P) {
  const H = 2.1, wc = 0xc4b294;
  const wall = (ax, az, bx, bz) => { const L = Math.hypot(bx - ax, bz - az), a = -Math.atan2(bz - az, bx - ax); P('wallSeg', (ax + bx) / 2, (az + bz) / 2, { ry: a, args: [L, H, wc], col: { w: L, d: 0.8, h: H + 0.2, a, cam: true } }); };
  wall(76, 70, 120, 70); wall(76, 108, 120, 108); wall(76, 70, 76, 94.5); wall(76, 99.5, 76, 108); wall(120, 70, 120, 85.6); wall(120, 92.4, 120, 108);
  P('tower', 121, 84, { col: { w: 3, d: 3.2, h: 4.2, cam: true } }); P('tower', 121, 94, { col: { w: 3, d: 3.2, h: 4.2, cam: true } });
  const house = (x, z, ry, o) => P('house', x, z, { ry, args: [Object.assign({ w: 6, d: 5, h: 2.8, c: 0xcdb48c }, o)], col: { w: (o && o.w) || 6, d: (o && o.d) || 5, h: ((o && o.h) || 2.8) + 0.2, a: ry, cam: true } });
  house(87, 77, 0, { w: 10, d: 7, h: 3.4, c: 0xd2b48a, awning: 0x9a3a2a, stair: true }); house(101, 76, 0, { c: 0xc6aa86 }); house(112, 77, 0, { c: 0xd8c4a0, awning: 0x2e6a8a });
  house(83, 102, Math.PI, { c: 0xcdb48c, awning: 0x7a5a2a }); house(95, 103, Math.PI, { c: 0xc0a47e }); house(107, 103, Math.PI, { c: 0xd8c4a0 }); house(80.5, 88, Math.PI / 2, { w: 5, d: 4, c: 0xc6aa86 }); house(115, 101.5, Math.PI, { w: 5, d: 4, c: 0xcdb08a, awning: 0x9a7a3a });
  P('well', 98, 89, { col: { r: 1.7, h: 1 } }); P('campfire', 91, 84.6, { col: { r: 0.8, h: 0.5 } }); P('datePalm', 102.5, 84.5, { col: { r: 0.5, h: 3 } }); P('fig', 93, 95, { s: 0.8, col: { r: 0.5, h: 3 } });
  P('stallM', 111, 83.2, { ry: 0.1, args: [0x8a3a5a], col: { w: 2.6, d: 2.2, h: 2.2, a: 0.1 } }); P('stallM', 111, 95.4, { ry: Math.PI - 0.1, args: [0x3e8a66], col: { w: 2.6, d: 2.2, h: 2.2, a: Math.PI - 0.1 } });
  P('sacks', 114.5, 82.6); P('pots', 106.5, 82); P('press', 90, 96.4, { col: { r: 1.4, h: 1 } }); P('wheel', 84.6, 85.2, { col: { r: 0.45, h: 0.6 } }); P('pots', 84.4, 83.2); P('loomX', 87.2, 99, { ry: Math.PI, col: { w: 2, d: 0.5, h: 2.2, a: Math.PI } });
  P('thresh', 64, 83); P('crops', 57, 104, { args: [12, 8, true] }); P('crops', 56, 70, { args: [10, 7, false] }); P('fence', 57, 108.6, { args: [12] }); P('fence', 56, 74.2, { args: [10] });
  P('fold', 98, 60, { col: null }); for (let i = 0; i < 13; i++) { if (i === 3) continue; const a = (i + 0.5) / 14 * Math.PI * 2; W.addCol({ x: 98 + Math.cos(a) * 6, z: 60 + Math.sin(a) * 6, r: 1.15, h: 1.1 }); }
  for (let i = 0; i < 9; i++) { const x = 82 + (i % 5) * 7.5 + (r() - 0.5) * 2, z = 116 + Math.floor(i / 5) * 7 + (r() - 0.5) * 2; node('olive', x, z); }
  P('oak', 70, 64, { s: 1.2, col: { r: 0.6, h: 3 } }); P('oak', 128, 74, { col: { r: 0.6, h: 3 } }); P('acacia', 66, 112, { col: { r: 0.5, h: 3 } });
  // Haran town: a well and an evening fire in the middle of the houses
  P('well', 133, -206, { col: { r: 1.7, h: 1 } }); P('campfire', 126, -205, { col: { r: 0.8, h: 0.5 } });
}

// ------------------------------------------------------------------ villages & their people
const V_LOOK = {
  hamor: { skin: 0xc8905e, long: true, top: 0xe8dcc0, trim: 0x7a2a4a, trim2: 0xe0b040, under: 0xe8dcc0, beard: 'long', beardCol: 0x9a8e84, hair: 0x8a8078, headwear: 'turban', clothCol: 0xf0e6d4, bandCol: 0x7a2a4a, mantle: 0x7a2a4a, mantleTrim: 0xe0b040, sash: 0xe0b040, age: 'old', narrow: true, smile: 0.4 },
  farmerA: { skin: 0xb07848, top: 0xa8946a, trim: 0x5a4030, hair: 0x2a1a10, beard: 'short', headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x5a4030, belt: 0x4a3022, legWrap: 0x8a7a5a, sleeveless: true },
  farmerB: { skin: 0xc08458, top: 0x7a8a5a, trim: 0x3a4a2a, hair: 0x3a2414, hairStyle: 'curly', beard: 'short', headwear: 'band', bandCol: 0x8a5a2a, belt: 0x4a3022, wraps: 0x6a5038 },
  waterA: { skin: 0xd8a070, top: 0x5a7a9a, long: true, trim: 0xe0c070, under: 0x5a7a9a, hair: 0x2a1810, hairStyle: 'bun', headwear: 'veil', clothCol: 0xe8dcc0, clothStripe: 0x5a7a9a, sash: 0xb3472e, smile: 0.6 },
  waterB: { skin: 0xc8905e, top: 0xb86a4a, long: true, trim: 0x5a3a2a, under: 0xb86a4a, hair: 0x1a1410, hairStyle: 'long', headwear: 'veil', clothCol: 0x8a5a7a, clothStripe: 0xe0c070, sash: 0x3e6a4a, smile: 0.3 },
  potter: { skin: 0xa86e44, top: 0x9a7a5a, bottom: 0x7a5a3a, trim: 0x4a3022, hair: 0x2a1a10, hairStyle: 'short', beard: 'short', sleeveless: true, belt: 0x3a2618, headwear: 'band', bandCol: 0xb5673a, wraps: 0x6a4a30 },
  weaver: { skin: 0xe0a878, top: 0xe8dcc0, long: true, trim: 0x2e6a8a, trim2: 0xb3472e, under: 0xe8dcc0, hair: 0x3a2418, hairStyle: 'long', headwear: 'veil', clothCol: 0x2e6a8a, clothStripe: 0xe8dcc0, headband: 0xd9a73a, sash: 0xb3472e, smile: 0.5 },
  merchant: { skin: 0xc89060, long: true, stripes: [0xe8dcc0, 0x2e6a8a, 0xe8dcc0, 0xe8dcc0, 0xb3472e, 0xe8dcc0], stripesB: [0xe8dcc0, 0xe8dcc0, 0x2e6a8a, 0xe8dcc0, 0xb3472e, 0xe8dcc0, 0xe8dcc0, 0x2e6a8a], beard: 'short', hair: 0x2a1810, headwear: 'turban', clothCol: 0xe8dcc0, bandCol: 0x2e6a8a, sash: 0xb3472e, smile: 0.7 },
  trader: { skin: 0xb8804e, top: 0x6a5a3a, bottom: 0x5a4a32, trim: 0x8a3a2a, beard: 'long', beardCol: 0x3a2a1a, hair: 0x2a1a10, headwear: 'cloth', clothCol: 0xc8b890, bandCol: 0x8a3a2a, mantle: 0x5a4a38, mantleShort: true, boots: 0x4a3426, belt: 0x3a2618 },
  shep: { skin: 0xc8905e, top: 0xcab48c, trim: 0x7a5a3a, hair: 0x2a1a10, hairStyle: 'curly', headwear: 'cloth', clothCol: 0xe8dcc0, bandCol: 0x3a2a1a, mantle: 0x8a7a5a, mantleShort: true, belt: 0x4a3022, legWrap: 0x8a7a5a, bag: 0x6a4a30 },
  hunter: { skin: 0xa86e44, top: 0x6a5a3a, bottom: 0x4a3a28, trim: 0x3a2618, under: 0x8a7a5a, hair: 0x1a1410, hairStyle: 'tied', beard: 'short', sleeveless: true, belt: 0x3a2618, boots: 0x4a3426, wraps: 0x3a2a1e, bag: 0x5a3a24, browAng: 0.4 },
  oldW: { skin: 0xc8946a, top: 0x5a4a5a, long: true, trim: 0x3a2a3a, hair: 0xd0c8c0, hairStyle: 'bun', headwear: 'veil', clothCol: 0x6a5a4a, clothStripe: 0xb8a070, fem: true, age: 'old', smile: 0.7, browAng: -0.25 },
  kidA: KID({ top: 0xd8b878, trim: 0x8a3a2a, hairStyle: 'curly', legWrap: 0x9a8a6a }), kidB: KID({ top: 0xb86a8a, trim: 0xe0c070, long: true, hairStyle: 'long', fem: true, sash: 0xe0c070 }), kidC: KID({ top: 0x8ab0c8, trim: 0x3a5a7a, hairStyle: 'short' }),
  maid: { skin: 0xc8905e, top: 0x8a7a5a, long: true, trim: 0x5a4a3a, hair: 0x1a1410, hairStyle: 'bun', headwear: 'veil', clothCol: 0xd8ccb0, clothStripe: 0x8a6a48, belt: 0x5a4030, smile: 0.5 },
  servant: { skin: 0xb88050, top: 0xb8a888, trim: 0x6a4a30, hair: 0x2a1a10, hairStyle: 'short', beard: 'short', headwear: 'cloth', clothCol: 0xd8ccb0, bandCol: 0x6a4a30, belt: 0x4a3022, legWrap: 0x8a7a5a },
  elderH: { skin: 0xd09868, long: true, top: 0xd8ccb0, trim: 0x5a4a3a, trim2: 0xb8a070, under: 0xd8ccb0, beard: 'long', beardCol: 0xc8c0b8, hair: 0xc8c0b8, headwear: 'cloth', clothCol: 0xe8e0d0, bandCol: 0x5a4a3a, mantle: 0x6a5a48, age: 'old' },
};
const F = (id, name, role, look, home, o) => Object.assign({ id, name, role, look: V_LOOK[look] || look, home }, o || {});
const QUIET_STEPS = new Set(['j1_start', 'j1_deborah', 'j2_isaac', 'j3_stone', 'j3_sleep', 'j3_pillar', 'j4_shep', 'j4_stone', 'j4_water', 'j4_laban', 'j5_wedding', 'j5_more', 'j7_call', 'j8_laban', 'j8_ford', 'j8_alone', 'j8_boss', 'j8_esau', 'j8_meet', 'ep_fire']);
const villages = [
  { id: 'beersheba', n: '브엘세바 장막', x: 8, z: 166, r: 26, when: S => before(S, 'j3_start'),
    spots: { hub: [6, 168, 3], well: [-8, 182, 3.3], fire: [10, 166, 2.8], market: [14, 172, 2], play: [6, 174, 4], gate: [16, 160, 2], work: [-30, 168, 2] },
    homes: [[19.4, 154.6, Math.PI], [-16.5, 176.9, 0.7], [27.6, 168.6, -0.7]], about: ['아브라함 어른 때부터 이 우물가에 장막을 쳤다오.', '광야 바람이 세지만 우물 물맛은 최고지요.'],
    folk: [F('bs_maid', '이삭의 여종 아마', 'water', 'maid', 0, { persona: '리브가 마님을 모시는 상냥하고 부지런한 여종. 야곱 도련님을 어릴 때부터 보아 왔다.' }),
      F('bs_serv', '이삭의 종 엘닷', 'farmer', 'servant', 1, { work: [-30, 168, 0, 2.5], persona: '이삭의 가축과 밭을 돌보는 성실한 종. 말수가 적지만 농담을 좋아한다.' }),
      F('bs_kid', '종의 아이 나바', 'child', 'kidC', 0, { age: 'kid', persona: '여종 아마의 어린 아들. 호기심이 많고 야곱 도련님을 잘 따른다.' })] },
  { id: 'haran', n: '하란 성읍', x: 130, z: -200, r: 30, when: S => between(S, 'j4_laban'),
    spots: { hub: [130, -200, 3], well: [133, -206, 3.3], market: [130, -189, 4], fire: [126, -205, 2.6], play: [129, -199, 4], gate: [122, -192, 1.5] },
    homes: [[120.8, -210.8, 0.25], [130.8, -210.8, 0.25], [140.8, -210.8, 0.25], [150.8, -210.8, 0.25], [120.8, -220.8, 0.25], [130.8, -220.8, 0.25]], about: ['하란은 큰 장사꾼 길이 지나는 성읍이라오.', '라반 집안은 이 근방에서 양이 제일 많지요.'],
    folk: [F('hr_water', '하란의 여인 도다', 'water', 'waterA', 0, { persona: '하란 성읍에 사는 수다스럽고 정 많은 여인. 우물가 소문을 모두 안다.' }),
      F('hr_elder', '하란의 장로 엘닷', 'elder', 'elderH', 1, { age: 'old', persona: '하란 성문에서 사람들의 다툼을 들어 주는 지혜로운 장로. 라반을 오래 알았다.' }),
      F('hr_kid', '아이 야립', 'child', 'kidA', 0, { age: 'kid', persona: '도다의 아들. 장터를 뛰어다니며 낙타 구경하는 걸 좋아한다.' }),
      F('hr_weaver', '베 짜는 여인 세라', 'weaver', 'weaver', 2, { work: [134, -213, 0, 1], persona: '하란에서 제일가는 솜씨의 베 짜는 여인. 조용하고 꼼꼼하다.' }),
      F('hr_potter', '토기장이 하밀', 'potter', 'potter', 3, { work: [146, -207, 0, 1.2], persona: '물동이와 기름 항아리를 빚는 토기장이. 손이 늘 진흙투성이지만 마음은 넉넉하다.' })] },
  { id: 'shechem', n: '세겜 성읍', x: 98, z: 89, r: 26, gate: [123, 89],
    spots: { hub: [104, 89, 2.4], well: [98, 89, 3.3], market: [108.5, 89.5, 2.2], gate: [117.6, 89, 1.4], fire: [91, 84.6, 2.3], play: [106, 91, 3.5], fold: [98, 65, 3], pasture: [100, 42, 10], shade: [70, 66, 2], hunt: [44, 52, 12], field: [57, 104, 4], thresh: [64, 83, 3] },
    homes: [[87, 82.2, 0], [101, 79.4, 0], [112, 80.4, 0], [83, 98.6, Math.PI], [95, 99.6, Math.PI], [107, 99.6, Math.PI], [83.4, 88, Math.PI / 2], [115, 98.6, Math.PI]],
    shelters: [[111, 85.6, Math.PI], [111, 93, 0], [87, 82.4, Math.PI]], about: ['세겜은 두 산 사이 골짜기에 있어 물이 넉넉하고 올리브가 잘 자란다오.', '성문에서 하몰 어른이 송사를 들어 주신다오.', '동쪽 문으로 나가면 숙곳과 마하나임으로 가는 길이 있소.'],
    folk: [F('sh_hamor', '세겜 성주 하몰', 'elder', 'hamor', 0, { age: 'old', persona: '세겜 성읍을 다스리는 히위 사람 하몰. 위엄 있지만 너그럽고, 성문에 앉아 백성의 일을 돌본다.' }),
      F('sh_far1', '농부 엘론', 'farmer', 'farmerA', 1, { work: [57, 104, 0, 4], persona: '세겜 서쪽 밭을 일구는 우직한 농부. 날씨와 땅 이야기를 좋아한다.' }),
      F('sh_far2', '농부 마할랄', 'farmer', 'farmerB', 4, { work: [64, 83, 0, 3], persona: '타작마당을 맡은 쾌활한 농부. 노래를 흥얼거리며 일한다.' }),
      F('sh_wat1', '물 긷는 여인 아다', 'water', 'waterA', 2, { work: [91.6, 97.6, Math.PI, 1], persona: '세겜에 사는 다정한 여인. 올리브기름 짜는 일도 돕는다.' }),
      F('sh_wat2', '물 긷는 여인 바스맛', 'water', 'waterB', 5, { work: [96, 102, Math.PI, 1], persona: '말이 빠르고 웃음이 많은 젊은 여인. 우물가 소식통이다.' }),
      F('sh_pot', '토기장이 요밥', 'potter', 'potter', 6, { work: [85.6, 85.6, Math.PI / 2, 0.5], persona: '성읍의 토기장이. 그릇 빚는 솜씨를 자랑스러워한다.' }),
      F('sh_wea', '베 짜는 여인 나아마', 'weaver', 'weaver', 3, { work: [87.2, 97.6, Math.PI, 0.4], persona: '파란 무늬 천으로 이름난 베 짜는 여인.' }),
      F('sh_mer', '세겜 상인 메셀', 'merchant', 'merchant', 7, { work: [111, 85.4, Math.PI, 0.8], persona: '세겜 장터 상인. 흥정을 좋아하고 먼 곳 소식을 즐겨 전한다.' }),
      F('sh_tra', '가축 상인 야단', 'merchant', 'trader', 7, { work: [111, 93.3, 0, 0.8], persona: '양과 염소와 나귀를 사고파는 가축 상인. 짐승 보는 눈이 정확하다.' }),
      F('sh_shep', '목자 하봇', 'shepherd', 'shep', 3, { prop: 'staff', persona: '성읍의 양 떼를 치는 젊은 목자. 양 한 마리 한 마리를 이름으로 부른다.' }),
      F('sh_hun', '사냥꾼 에벨', 'hunter', 'hunter', 1, { prop: 'bow', persona: '서쪽 들에서 가젤과 토끼를 잡는 사냥꾼.' }),
      F('sh_old', '할머니 드다', 'oldwoman', 'oldW', 6, { age: 'old', persona: '토기장이 요밥의 어머니. 옛날이야기와 약초를 잘 안다.' }),
      F('sh_kid1', '아이 미가', 'child', 'kidA', 2, { age: 'kid', persona: '아다의 아들. 나귀와 낙타를 무척 좋아한다.' }),
      F('sh_kid2', '아이 엘리', 'child', 'kidB', 5, { age: 'kid', persona: '바스맛의 딸. 들꽃으로 화관 만드는 걸 좋아한다.' })] },
];
// a few sheep in Shechem's fold
for (let i = 0; i < 5; i++) npcs.push({ id: 'shSheep' + i, name: '세겜의 양', animal: 'sheep', pattern: i === 2 ? 'black' : 'plain', x: 96 + (i % 3) * 2, z: 58 + Math.floor(i / 3) * 2.5, wander: 3, noTalk: true, noTag: true });
stations.push({ id: 'w7', type: 'well', x: 98, z: 91.4 }, { id: 'w8', type: 'well', x: 133, z: -203.6 }, { id: 'f7', type: 'fire', x: 91, z: 84.6, r: 3 }, { id: 'f8', type: 'fire', x: 126, z: -205, r: 3 },
  { id: 'pressSh', type: 'press', x: 91.4, z: 97.8, r: 2.6 }, { id: 'b5', type: 'bed', x: 115, z: 97.4, shelter: 4, label: '나그네 집에서 자기' },
  { id: 'shopSh', type: 'shop', shop: 'shechem', label: '세겜 장터에서 사고팔기', x: 111, z: 85.8, r: 2.4 }, { id: 'shopShA', type: 'shop', shop: 'shechemA', label: '가축과 탈것 사기', x: 111, z: 92.9, r: 2.4 });
const homePen = (S, G) => GG.Build && GG.Build.homePen(S);
const HOME_ANIMALS = [
  { n: '흰 암양 · 내 우리로', animal: 'sheep', pattern: 'plain', sex: 0, price: 30, pen: homePen, noPen: '먼저 메뉴 → 짓기에서 가축 우리를 지으세요', when: () => GG.Game.feat('herd2') },
  { n: '흰 숫양 · 내 우리로', animal: 'sheep', pattern: 'plain', sex: 1, price: 32, pen: homePen, noPen: '먼저 메뉴 → 짓기에서 가축 우리를 지으세요', when: () => GG.Game.feat('herd2') },
  { n: '검은 염소 · 내 우리로', animal: 'goat', pattern: 'plain', sex: 0, price: 26, d: '젖을 짤 수 있어요', pen: homePen, noPen: '먼저 메뉴 → 짓기에서 가축 우리를 지으세요', when: () => GG.Game.feat('herd2') },
  { n: '숫염소 · 내 우리로', animal: 'goat', pattern: 'brown', sex: 1, price: 28, pen: homePen, noPen: '먼저 메뉴 → 짓기에서 가축 우리를 지으세요', when: () => GG.Game.feat('herd2') },
  { n: '젖소 · 내 우리로', animal: 'cow', pattern: 'plain', sex: 0, price: 70, d: '젖을 많이 줘요', pen: homePen, noPen: '먼저 메뉴 → 짓기에서 가축 우리를 지으세요', when: () => GG.Game.feat('herd2') },
  { n: '타는 나귀', mount: 'donkey', mname: '나귀', price: 75, d: '타고 다니면 빨라요 · 짐도 지고 사람도 태워요', when: S => GG.Game.feat('build2') || between(S, 'j5_year') },
  { n: '타는 낙타', mount: 'camel', mname: '낙타', price: 170, d: '먼 길도 지치지 않아요 · 높이 앉아 멀리 보여요', when: S => GG.Game.feat('build2') || between(S, 'j5_year') }];
shops.shechem = { n: '세겜 장터', mul: { good: 1.1, crop: 1.05 }, buy: [{ n: '보리 씨앗 ×10', item: 's_barley', qty: 10, price: 14 }, { n: '밀 씨앗 ×10', item: 's_wheat', qty: 10, price: 22 }, { n: '오이 씨앗 ×6', item: 's_cucumber', qty: 6, price: 16 }, { n: '양파 씨앗 ×6', item: 's_onion', qty: 6, price: 16 },
  { n: '빵 ×3', item: 'bread', qty: 3, price: 24 }, { n: '올리브기름', item: 'oil', qty: 1, price: 18 }, { n: '흙벽돌 ×10', item: 'brick', qty: 10, price: 28, d: '집 짓는 데 써요' }, { n: '통나무 ×4', item: 'wood', qty: 4, price: 18 }, { n: '모직 천', item: 'cloth', qty: 1, price: 46 },
  { n: '털겉옷', tool: 'cloak', price: 70, d: '추위를 절반으로 줄여요', when: (S, G) => !G.tool('cloak') }, { n: '꼴 ×10', item: 'hay', qty: 10, price: 14 }, { n: '양털 가위', tool: 'shears', price: 30, when: (S, G) => !G.tool('shears') }] };
shops.shechemA = { n: '가축 상인 야단', buy: HOME_ANIMALS };
shops.animals.buy.push(...HOME_ANIMALS);
shops.haran.buy.push({ n: '털겉옷', tool: 'cloak', price: 70, d: '추위를 절반으로 줄여요', when: (S, G) => !G.tool('cloak') && G.feat('warm') }, { n: '흙벽돌 ×10', item: 'brick', qty: 10, price: 30, when: (S, G) => G.feat('build2') }, { n: '통나무 ×4', item: 'wood', qty: 4, price: 20, when: (S, G) => G.feat('build2') });
shops.camp.buy.push({ n: '돌 ×6', item: 'stone', qty: 6, price: 4, d: '모닥불 짓는 데 써요', when: (S, G) => G.feat('build') });

// ------------------------------------------------------------------ what people say about the times
function rumors(S, n) {
  const V = n && n.village ? n.village.id : null;
  if (before(S, 'j3_start')) return ['에서 도련님은 오늘도 새벽같이 사냥을 나갔대요.', '이삭 어른 눈이 요즘 더 침침해지셨대요.', '아브라함 어른이 심으신 에셀나무가 올해도 무성하네요.', '리브가 마님이 야곱 도련님 칭찬을 그렇게 하시더라고요.'];
  if (V === 'shechem' && !epi(S)) return ['세겜 성은 두 산 사이에 있어 물이 넉넉하다오.', '하몰 어른은 성문에 앉아 사람들 송사를 들어 주시지.', '올리브 열매를 짜면 기름이 금빛이오.', '동쪽 숙곳 들판은 비어 있소. 언젠가 큰 무리가 장막을 치겠지.'];
  if (between(S, 'j4_start', 'j4_laban')) return ['라반 어른의 딸 라헬이 양 떼를 몰고 우물에 오는 시간이오.', '우물 아귀 돌은 목자들이 다 모여야 굴린다오.'];
  if (between(S, 'j5_start', 'j5_more')) return ['라반 어른 집에 새 일꾼이 왔는데, 우물 돌을 혼자 굴렸대요!', '라헬 아가씨 양 떼가 제일 살쪘다니까요.', '칠 년을 며칠같이 일한다지 뭐예요. 사랑이 그렇게 무섭다오.', '밤마다 동쪽 들에서 늑대가 운대요.'];
  if (between(S, 'j6_start', 'j7_wage')) return ['야곱의 아이들이 벌써 몇이나 된다지요?', '레아 마님이 아들을 또 낳았대요!', '라반 어른 가축이 몇 해 사이에 몇 배로 늘었다니까요.', '야곱 집 장막에서 아기 우는 소리가 끊이질 않네요.'];
  if (between(S, 'j7_fold', 'j7_call')) return ['야곱이 점 있고 아롱진 양만 품삯으로 받기로 했대요. 이상하지요?', '라반 아들들이 수군거리더군요. 야곱이 아버지 재산을 다 차지한다고.', '그런데 정말로 점박이 새끼만 태어난다지 뭐요!'];
  if (between(S, 'j8_start', 'j8_meet')) return ['야곱이 가족을 이끌고 고향으로 떠났다더군요.', '얍복 나루 건너편에 에서라는 사람이 사백 명을 거느리고 온대요!', '길르앗 산에서 라반과 야곱이 돌무더기를 쌓고 언약을 맺었대요.'];
  if (epi(S)) return ['이스라엘 어른이 세겜 성 앞에 장막을 치셨대요.', '하몰 어른의 아들들에게서 장막 친 밭을 은 백 크시타에 사셨다지요?', '엘엘로헤이스라엘, "이스라엘의 하나님"이라는 제단을 쌓으셨대요.', '이스라엘 어른 다리가 불편하신 건 무슨 일 때문이래요?', '그 집 열한째 아들 요셉이 그렇게 영리하다지요.'];
  return [];
}
function worldFacts(S) {
  if (before(S, 'j3_start')) return '야곱은 브엘세바 장막에 사는 이삭과 리브가의 아들이고, 쌍둥이 형 에서가 있다. 조용히 장막에 머물며 일하는 젊은이다.';
  if (before(S, 'j4_laban')) return '야곱은 형 에서를 피해 외삼촌 라반이 사는 하란으로 혼자 길을 가는 중이다. 지팡이 하나만 들었다.';
  if (between(S, 'j4_laban', 'j5_more')) return '야곱은 하란에서 외삼촌 라반의 양을 치며, 라헬과 결혼하려고 칠 년을 일하고 있다. 부지런하고 힘이 세다는 소문이 났다.';
  if (between(S, 'j6_start', 'j7_wage')) return '야곱은 레아와 라헬과 결혼했고 아이들이 늘어 간다. 라반의 집 일을 맡아 부지런히 일하며 라반의 재산이 크게 늘었다.';
  if (between(S, 'j7_wage', 'j7_call')) return '야곱은 점 있고 아롱진 양과 염소를 품삯으로 받아 자기 가축을 늘리고 있다. 라반의 아들들이 시기한다.';
  if (between(S, 'j8_start', 'j8_boss')) return '야곱은 가족과 가축을 이끌고 고향 가나안으로 돌아가는 길이며, 형 에서를 만날 일을 두려워하고 있다.';
  if (between(S, 'j8_esau', 'j8_meet')) return '야곱은 얍복 나루에서 밤새 어떤 분과 씨름한 뒤 "이스라엘"이라는 새 이름을 얻었고 다리를 전다. 곧 형 에서를 만난다.';
  return '이스라엘(야곱)은 형 에서와 화해했고, 가족과 함께 숙곳을 지나 세겜 성 앞에 장막을 치고 산다. 장막 친 밭을 은 백 크시타에 사서 제단을 쌓았다. 아들이 열하나, 딸 디나가 있다.';
}
function villageChat(S) {
  if (epi(S)) return [[[0, '성 앞에 장막 친 이스라엘 사람들 봤소?'], [1, '가축이 셀 수도 없이 많더군요.']], [[0, '그 집 아이들이 우물가에서 우리 애들이랑 놀더군요.'], [1, '사이좋게 지내면 좋지요.']]];
  if (inHaran(S)) return [[[0, '라반 어른 집 일꾼 이야기 들었소?'], [1, '일을 셋 몫은 한다지요.']], [[0, '다메섹 대상이 내일 온대요.'], [1, '치즈를 넉넉히 만들어 둬야겠네.']]];
  return [];
}
// open-country strangers
const strangers = { max: 2, when: S => between(S, 'j3_start') && !between(S, 'j8_ford', 'j8_meet') && !S.q.dream,
  looks: { beggar: { skin: 0xb88050, top: 0x8a7a68, trim: 0x5a4a3a, hair: 0x6a6058, hairStyle: 'wild', beard: 'long', beardCol: 0x7a7068, belt: 0x5a4a3a, age: 'old', browAng: -0.3 },
    hunter: LOOK.hunter, traveler: LOOK.traveler, caravan: LOOK.caravan, shepherd: LOOK.shep2, elder: Object.assign({}, LOOK.traveler, { beardCol: 0xe8e4dc, hair: 0xe0dcd4, top: 0xd8ccb0, mantle: 0x7a6a58 }),
    wounded: { skin: 0xc8905e, top: 0x9a8a6a, trim: 0x5a4a3a, hair: 0x2a1a10, hairStyle: 'short', beard: 'short', headwear: 'band', bandCol: 0x8a3a2a, legWrap: 0xe8e0d0, belt: 0x4a3022 },
    waterwoman: V_LOOK.waterB, driver: LOOK.worker, default: LOOK.traveler } };

// ------------------------------------------------------------------ features, step by step
const featAt = { surv: 'j1_deborah', ride: 'j1_goats', build: 'j1_grow', warm: 'j3_start', build2: 'j5_year', herd2: 'j5_year', ride2: 'j6_start' };
const featText = {
  surv: { n: '배고픔', ic: 'bread', d: '드보라: "도련님, 일을 하면 배가 고파지는 법이에요." 왼쪽 위 빵 표시를 누르면 가진 음식을 바로 먹어요. 무화과·젖·빵으로 배를 채우세요.' },
  ride: { n: '탈것 · 이삭의 나귀', ic: 'donkey', d: '이삭의 목자가 늙은 나귀를 빌려주었어요. 나귀 곁에서 A를 누르면 타고, 달리기 버튼으로 빨리 달려요. 브엘세바에서만 탈 수 있어요.' },
  build: { n: '짓기', ic: 'hammer', d: '렌틸콩이 자라는 동안 메뉴 → 짓기에서 모닥불이나 움막을 원하는 곳에 지어 보세요. 돌과 나뭇가지만 있으면 돼요.' },
  warm: { n: '체온', ic: 'fire', d: '"낮에는 더위와 밤에는 추위를 무릅쓰고" (창 31:40). 밤길과 비바람에 몸이 식어요. 모닥불 곁이나 지붕 아래에서 몸을 녹이세요.' },
  build2: { n: '집과 농장', ic: 'house', d: '이제 장막·흙벽돌 집·가축 우리·밭·우물·화덕·베틀·제단까지 지을 수 있어요. 마음에 드는 땅에 나만의 집을 지어 보세요.' },
  herd2: { n: '내 가축', ic: 'wool', d: '내 우리를 지으면 가축 상인에게 양·염소·소를 사서 직접 키울 수 있어요. 타는 나귀와 낙타도 팔아요.' },
  ride2: { n: '함께 타기', ic: 'donkey', d: '탈것에 탄 채 가족이나 아이들 곁에 가면 「태우기」로 뒤에 태울 수 있어요. 내리면 함께 내려요.' },
};
function onFeat(k, S, G, quiet) {
  if (k === 'surv' && !quiet) { G.give('bread', 2); G.give('fig', 1); }
  if (k === 'ride' && !S.flags.loanDonkey && before(S, 'j3_start')) { S.flags.loanDonkey = 1; const r = GG.Ride.add('donkey', '이삭의 나귀', -27, 171); r.m.loan = 1; }
  if (k === 'build' && !quiet) { G.give('stone', 3); }
}

// ------------------------------------------------------------------ endless epilogue: life goals
const lifeGoals = (S, G) => { const home = GG.Build ? GG.Build.homePens(S).reduce((a, p) => a + (S.herds[p.id] ? S.herds[p.id].list.length : 0), 0) : 0, fr = S.fr || {};
  return [{ t: '내 집 짓기 (장막이나 흙벽돌 집)', ok: (S.bld || []).some(b => b.k === 'house' || b.k === 'tent') }, { t: `내 우리의 가축 ${Math.min(10, home)}/10`, ok: home >= 10 }, { t: '내 탈것 갖기', ok: (S.mounts || []).some(m => !m.loan) },
    { t: `세겜 사람들과 친해지기 (${Math.min(5, Object.keys(fr).filter(k => k.startsWith('sh_') && fr[k] >= 4).length)}/5)`, ok: Object.keys(fr).filter(k => k.startsWith('sh_') && fr[k] >= 4).length >= 5 },
    { t: `부탁 들어주기 (${Math.min(20, S.stats.quests || 0)}/20)`, ok: (S.stats.quests || 0) >= 20 }, { t: `노인의 옛이야기 (${Math.min(5, S.flags.taleN || 0)}/5)`, ok: (S.flags.taleN || 0) >= 5 }, { t: `나그네 대접하기 (${Math.min(5, S.stats.kind || 0)}/5)`, ok: (S.stats.kind || 0) >= 5 }]; };
steps.j_end.obj = '이스라엘의 장막 · 자유롭게 살기'; steps.j_end.list = lifeGoals;
steps.j1_start.enter = function (S, G, re) { if (!re) narr([CH1_CARD]); };
const CH1_CARD = { kick: '1장', title: '팥죽 한 그릇', t: '왼쪽 아래를 눌러 걷고, 끝까지 밀면 뛰어요. 오른쪽 스틱이나 화면을 끌어 카메라를 돌려요. 금빛 빛기둥이 가야 할 곳이에요. A 버튼으로 말하고, 줍고, 일해요. 오른쪽 위 작은 지도를 누르면 큰 지도가 열려요.', ref: '' };
function canBuild(x, z, S, k) {
  for (const v of villages) if (Math.hypot(x - v.x, z - v.z) < v.r * 0.85 && (!v.when || v.when(S))) return '마을 안에는 지을 수 없어요 · 성 밖 들판에 지어 보세요';
  if (Math.hypot(x - 98, z - 89) < 30) return '세겜 성 안에는 지을 수 없어요';
  if (Math.hypot(x - 90, z + 152) < 18) return '라반의 집 마당이에요';
  if (Math.hypot(x - ARENA.x, z - ARENA.z) < 18 || (x > -54 && x < -38 && z > -20 && z < 26)) return '여기에는 지을 수 없어요';
  return null;
}
function quietEP(S) { return !!(S.q.dream || S.q.feast || BOSS.on || QUIET_STEPS.has(S.step)); }
const CALM_WX = new Set(['j3_stone', 'j3_sleep', 'j3_pillar', 'j4_shep', 'j4_stone', 'j4_water', 'j4_laban', 'j5_wedding', 'j5_more', 'j8_ford', 'j8_alone', 'j8_boss', 'j8_esau', 'j8_meet', 'ep_fire']);
function calmWeather(S) { return !!(S.q.dream || S.q.angels || BOSS.on || CALM_WX.has(S.step) || (GG.Opening && GG.Opening.on)); }
function calmSurv(S) { return !!(S.q.dream || BOSS.on || S.step === 'j8_boss' || S.q.feast || (GG.Opening && GG.Opening.on)); }

// ------------------------------------------------------------------ storybook opening (Gen 25:19–28), told by the nurse Deborah
const SV = (body, sky) => `<svg viewBox="0 0 320 200" xmlns="http://www.w3.org/2000/svg">${sky || ''}${body}</svg>`;
const STARS = (n, seed) => { let s = '', r = rng(seed); for (let i = 0; i < n; i++) s += `<circle cx="${(r() * 320).toFixed(1)}" cy="${(r() * 110).toFixed(1)}" r="${(0.4 + r() * 1.1).toFixed(2)}" fill="#fff6dc" opacity="${(0.4 + r() * 0.6).toFixed(2)}"/>`; return s; };
const NIGHT = `<defs><linearGradient id="ns" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1230"/><stop offset=".72" stop-color="#2b3b70"/><stop offset="1" stop-color="#6a5274"/></linearGradient><radialGradient id="fg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffcf70" stop-opacity=".85"/><stop offset="1" stop-color="#ff9a40" stop-opacity="0"/></radialGradient></defs><rect width="320" height="200" fill="url(#ns)"/>`;
const OPEN_ART = [
  // 1 · Isaac and Rebekah by the fire before their tent at Beersheba
  SV(`${STARS(70, 3)}<path d="M262 26a15 15 0 1 0 11 26a12 12 0 1 1-11-26z" fill="#f6ebcf"/>
    <path d="M0 150Q70 128 140 146T320 142V200H0z" fill="#3b2f48"/><path d="M0 168Q90 150 170 165T320 160V200H0z" fill="#271f33"/>
    <path d="M40 152L62 114L150 106L178 148z" fill="#17121e"/><path d="M62 114L58 152M150 106L154 150" stroke="#3a2a22" stroke-width="2"/><path d="M98 150L104 122L120 121L124 150z" fill="#f2b45a"/><path d="M98 150L104 122L120 121L124 150z" fill="url(#fg)" opacity=".6"/>
    <circle cx="220" cy="160" r="40" fill="url(#fg)"/><path d="M212 166Q214 150 220 142Q224 152 228 156Q230 150 229 146Q236 156 230 166z" fill="#ffb347"/><path d="M216 166Q218 156 221 151Q224 158 226 166z" fill="#fff0a0"/><path d="M205 167L235 167" stroke="#4a3426" stroke-width="3" stroke-linecap="round"/>
    <g fill="#1d1622"><circle cx="186" cy="134" r="7"/><path d="M178 128Q186 120 195 128L197 140L176 140z"/><path d="M176 140Q186 136 197 140L206 168L170 168z"/><path d="M181 140L185 150L188 140z" fill="#d8d0c8"/></g>
    <g fill="#1d1622"><circle cx="256" cy="136" r="6.4"/><path d="M247 132Q256 122 265 132L268 150L246 150z" fill="#2a3a6a"/><path d="M247 146Q256 141 266 146L272 168L242 168z"/></g>`, NIGHT),
  // 2 · Rebekah asks the LORD — two nations
  SV(`<defs><linearGradient id="d2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a2458"/><stop offset=".6" stop-color="#8a5a7a"/><stop offset="1" stop-color="#f0b070"/></linearGradient><radialGradient id="l2" cx=".5" cy="0" r="1"><stop offset="0" stop-color="#fff2c0" stop-opacity=".95"/><stop offset=".6" stop-color="#ffd27a" stop-opacity=".15"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs>
    <rect width="320" height="200" fill="url(#d2)"/><path d="M160 -10L70 200H250z" fill="url(#l2)"/><g stroke="#fff4c8" stroke-width="1.2" opacity=".55"><path d="M160 0L120 120M160 0L200 120M160 0L95 160M160 0L225 160M160 0L160 110"/></g>
    <path d="M0 168Q80 158 160 166T320 164V200H0z" fill="#3a2a3a"/>
    <g fill="#24182a"><path d="M150 168Q148 150 156 140L170 140Q176 152 174 168z"/><circle cx="163" cy="128" r="7.5"/><path d="M154 124Q163 112 172 124L176 146L150 146z" fill="#2c4a86"/><path d="M156 140Q150 120 142 104L146 102Q156 118 162 134z"/><path d="M170 140Q176 120 184 104L180 102Q170 118 164 134z"/></g>
    <g fill="#ffe9a8"><circle cx="128" cy="78" r="3"/><circle cx="196" cy="74" r="3"/></g><g fill="none" stroke="#ffe9a8" stroke-width="1"><circle cx="128" cy="78" r="7" opacity=".5"/><circle cx="196" cy="74" r="7" opacity=".5"/></g>`),
  // 3 · the first came out red and hairy
  SV(`<defs><radialGradient id="w3" cx=".5" cy=".55" r=".65"><stop offset="0" stop-color="#ffe2b0"/><stop offset=".6" stop-color="#d89a62"/><stop offset="1" stop-color="#5a3a3a"/></radialGradient></defs><rect width="320" height="200" fill="url(#w3)"/>
    <ellipse cx="160" cy="150" rx="96" ry="30" fill="#b89068"/><path d="M78 150Q160 118 242 150Q200 176 160 176Q118 176 78 150z" fill="#e8dcc0"/><path d="M90 152Q160 132 230 152" stroke="#c8b48c" stroke-width="2" fill="none"/>
    <g>${Array.from({ length: 34 }, (_, i) => { const a = i / 34 * Math.PI * 2, R = 34 + (i % 3) * 3; return `<circle cx="${(160 + Math.cos(a) * R).toFixed(1)}" cy="${(108 + Math.sin(a) * R * 0.92).toFixed(1)}" r="${(6 + (i % 4)).toFixed(1)}" fill="${i % 2 ? '#b84a26' : '#c85a30'}"/>`; }).join('')}</g>
    <circle cx="160" cy="110" r="32" fill="#e88a66"/><path d="M146 104q5-4 10 0M164 104q5-4 10 0" stroke="#7a3a2a" stroke-width="2.4" fill="none" stroke-linecap="round"/><ellipse cx="160" cy="122" rx="7" ry="6" fill="#9a2a2a"/><circle cx="141" cy="116" r="5" fill="#f4a08a" opacity=".7"/><circle cx="179" cy="116" r="5" fill="#f4a08a" opacity=".7"/>
    <g fill="#c85a30">${Array.from({ length: 16 }, (_, i) => `<path d="M${118 + i * 5.5} ${140 + (i % 2) * 3}q2 -7 4 0" stroke="#a8401e" stroke-width="1.4" fill="none"/>`).join('')}</g>
    <g font-family="Gowun Batang,serif" font-weight="700" fill="#7a2a1a"><text x="214" y="70" font-size="20" transform="rotate(12 214 70)">응애!</text></g><path d="M200 82l10-8M206 90l12-4M196 76l4-11" stroke="#7a2a1a" stroke-width="2" stroke-linecap="round"/>`),
  // 4 · the little hand holding the heel
  SV(`<defs><radialGradient id="w4" cx=".5" cy=".5" r=".7"><stop offset="0" stop-color="#fff2d8"/><stop offset=".7" stop-color="#f0c890"/><stop offset="1" stop-color="#c8905a"/></radialGradient></defs><rect width="320" height="200" fill="url(#w4)"/><g fill="#fff" opacity=".55"><path d="M60 40l3-8 3 8 8 3-8 3-3 8-3-8-8-3z"/><path d="M250 46l3-8 3 8 8 3-8 3-3 8-3-8-8-3z"/><path d="M270 120l2-6 2 6 6 2-6 2-2 6-2-6-6-2z"/><path d="M48 150l2-6 2 6 6 2-6 2-2 6-2-6-6-2z"/></g><path d="M-14 58Q60 62 128 92" stroke="#e88a66" stroke-width="36" stroke-linecap="round" fill="none"/><g stroke="#b84a26" stroke-width="1.3" fill="none" opacity=".6"><path d="M10 48q2-5 4 0M26 47q2-5 4 0M42 49q2-5 4 0M58 52q2-5 4 0M74 56q2-5 4 0M90 62q2-5 4 0M104 69q2-5 4 0"/></g><g transform="translate(150 100) rotate(-24)"><ellipse cx="2" cy="0" rx="32" ry="18" fill="#e88a66"/><circle cx="-20" cy="7" r="14" fill="#e88a66"/><g fill="#e88a66" stroke="#c86a4a" stroke-width="1"><circle cx="31" cy="-13" r="6.5"/><circle cx="36" cy="-4" r="5.6"/><circle cx="37" cy="4.5" r="5"/><circle cx="34" cy="12" r="4.4"/><circle cx="29" cy="17" r="3.8"/></g><path d="M-14 -6q10 4 26 2" stroke="#c86a4a" stroke-width="1.2" fill="none" opacity=".6"/></g><path d="M332 214Q250 176 168 142" stroke="#f3b896" stroke-width="24" stroke-linecap="round" fill="none"/><ellipse cx="156" cy="134" rx="17" ry="13" fill="#f3b896" transform="rotate(-25 156 134)"/><g stroke-linecap="round" fill="none"><g stroke="#d08a6a" stroke-width="8.5"><path d="M146 130Q132 128 128 117"/><path d="M150 126Q138 118 137 108"/><path d="M155 123Q147 111 149 102"/><path d="M161 122Q158 110 162 102"/></g><g stroke="#f3b896" stroke-width="6.5"><path d="M146 130Q132 128 128 117"/><path d="M150 126Q138 118 137 108"/><path d="M155 123Q147 111 149 102"/><path d="M161 122Q158 110 162 102"/></g><path d="M170 138Q178 128 172 118" stroke="#d08a6a" stroke-width="8"/><path d="M170 138Q178 128 172 118" stroke="#f3b896" stroke-width="5.5"/></g><g stroke="#7a3a2a" stroke-width="2.4" stroke-linecap="round"><path d="M118 70l-7-10M132 64l-2-12M146 66l4-11"/></g><text x="98" y="50" font-family="Gowun Batang,serif" font-weight="700" font-size="24" fill="#7a3a2a">꼭!</text>`),
  // 5 · the field man and the tent man
  SV(`<defs><linearGradient id="d5" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f0a860"/><stop offset=".5" stop-color="#e8c890"/><stop offset=".5" stop-color="#5a6aa0"/><stop offset="1" stop-color="#2a3a6a"/></linearGradient></defs><rect width="320" height="200" fill="url(#d5)"/>
    <circle cx="60" cy="70" r="22" fill="#fff0c0" opacity=".9"/><path d="M0 150Q60 132 160 146V200H0z" fill="#8a6a3a"/><path d="M160 146Q240 136 320 148V200H160z" fill="#3a2e44"/><path d="M160 0V200" stroke="#f4e8cc" stroke-width="2" opacity=".6"/>
    <g fill="#3a1e14"><circle cx="86" cy="96" r="8"/><path d="M76 90Q86 80 96 90L94 98L78 98z" fill="#a8441e"/><path d="M74 104Q86 98 98 104L104 150L70 150z"/><path d="M80 150L76 172M92 150L96 172" stroke="#3a1e14" stroke-width="7" stroke-linecap="round"/>
      <path d="M100 108Q120 96 128 70" stroke="#3a1e14" stroke-width="4" fill="none"/><path d="M126 58Q146 84 128 112" stroke="#5a3a24" stroke-width="2.4" fill="none"/><path d="M126 58L128 112" stroke="#e8dcc0" stroke-width="0.8"/></g>
    ${STARS(26, 9).replace(/cx="(\d+)/g, (m, x) => `cx="${160 + (+x % 160)}`)}
    <path d="M190 150L206 120L276 114L298 148z" fill="#17121e"/><path d="M232 148L236 126L248 125L251 148z" fill="#f2b45a"/>
    <g fill="#1d1622"><circle cx="212" cy="124" r="6.5"/><path d="M204 120Q212 110 220 120L222 132L203 132z" fill="#8e3c2c"/><path d="M203 130Q212 126 222 130L226 162L198 162z"/><path d="M226 112L228 166" stroke="#5a3a24" stroke-width="2.4"/></g>
    <g><ellipse cx="180" cy="160" rx="10" ry="4" fill="#4a3426"/><path d="M171 159Q180 172 189 159z" fill="#5a3a2a"/><ellipse cx="180" cy="158" rx="8" ry="2.4" fill="#b5402a"/><path d="M176 152q2 -6 0 -10M182 152q2 -6 0 -10" stroke="#f4e8cc" stroke-width="1.2" fill="none" opacity=".7"/></g>`),
  // 6 · the road of the promise
  SV(`${STARS(90, 21)}<path d="M0 140Q80 120 160 132T320 128V200H0z" fill="#2f2a44"/><path d="M0 160Q100 144 200 156T320 152V200H0z" fill="#211c30"/>
    <path d="M150 200Q170 170 150 150Q132 136 168 126Q196 118 178 108Q170 103 176 98" stroke="#d8c490" stroke-width="10" fill="none" stroke-linecap="round" opacity=".85"/><path d="M150 200Q170 170 150 150Q132 136 168 126Q196 118 178 108Q170 103 176 98" stroke="#f7dd98" stroke-width="2" fill="none" stroke-dasharray="4 7" opacity=".9"/>
    <circle cx="178" cy="90" r="16" fill="url(#fg)"/><path d="M178 78l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" fill="#fff4c8"/>
    <g fill="#1d1622"><circle cx="146" cy="168" r="5"/><path d="M140 172Q146 168 152 172L155 192L137 192z"/><path d="M154 160L156 194" stroke="#5a3a24" stroke-width="2"/></g>`, NIGHT),
];
const OPENING = {
  pages: [
    { art: OPEN_ART[0], who: '유모 드보라의 이야기', kick: '창세기 25장', title: '아이를 기다린 이십 년', t: '옛날, 브엘세바 장막에 이삭 도련님과 리브가 아씨가 살았지요. 그런데 아무리 기다려도 아기가 생기지 않는 거예요. 이삭 도련님이 아씨를 위해 여호와께 간절히 기도했더니, 여호와께서 그 기도를 들어주셨답니다!', ref: '창세기 25:20–21' },
    { art: OPEN_ART[1], who: '유모 드보라의 이야기', kick: '창세기 25장', title: '배 속의 씨름', t: '그런데 글쎄, 배 속에서 아기들이 어찌나 서로 밀치고 다투던지! 아씨가 여호와께 여쭈었더니 이렇게 말씀하셨어요. "두 국민이 네 태중에 있구나. 큰 자가 어린 자를 섬기리라."', ref: '창세기 25:22–23' },
    { art: OPEN_ART[2], who: '유모 드보라의 이야기', kick: '창세기 25장', title: '먼저 나온 아이', t: '드디어 해산하는 날! 먼저 나온 아이는 몸이 붉고 온몸이 털옷 같았어요. 그래서 이름을 에서라 했지요. 울음소리가 얼마나 우렁찬지 장막이 다 흔들렸다니까요, 호호.', ref: '창세기 25:25' },
    { art: OPEN_ART[3], who: '유모 드보라의 이야기', kick: '창세기 25장', title: '발꿈치를 잡은 손', t: '그런데 진짜 놀라운 건 그다음이에요. 동생이 형의 발꿈치를 꼭 붙잡고 따라 나오지 뭐예요! 그래서 이름을 야곱, "발꿈치를 잡은 자"라 했답니다. 그때 이삭 도련님 나이가 예순이었지요.', ref: '창세기 25:26' },
    { art: OPEN_ART[4], who: '유모 드보라의 이야기', kick: '창세기 25장', title: '들사람과 장막의 사람', t: '아이들이 자라서 에서는 익숙한 사냥꾼, 들사람이 되었고, 야곱은 조용한 사람이라 장막에 머물렀어요. 이삭 도련님은 에서가 잡아 온 고기를 좋아해 에서를, 리브가 아씨는 야곱을 사랑했지요.', ref: '창세기 25:27–28' },
    { art: OPEN_ART[5], kick: '야곱 편', title: '약속의 길', t: '하나님은 아브라함에게 하신 약속을 이삭에게, 그리고 이 아이들에게 이어 가셨어요. 형의 발꿈치를 붙잡던 아이는 앞으로 어떤 길을 걷게 될까요? 이제 그 길을 직접 걸어 보세요!', ref: '창세기 26:3–4; 28:13–15' }],
  setup: true, setupArt: OPEN_ART[5],
  after(S, G) {
    const h = GG.Game.W().heightAt(18, 164);
    GG.Cine.play([{ hour: 7.5, cam: [70, h + 46, 228], cam2: [34, h + 9, 186], look: [8, h + 1, 166], look2: [16, h + 1.2, 166], dur: 6, t: '그리고 세월이 흘러, 두 아이는 어른이 되었습니다.', ref: '창세기 25:27' },
      { cam: [24.5, h + 2.6, 158.5], cam2: [22.6, h + 2.0, 160.4], look: [18, h + 1.5, 164.2], dur: 4.5, n: '야곱', t: '오늘도 장막의 하루가 시작되는구나.' }], () => narr([CH1_CARD]), { skip: true });
  },
};

// ------------------------------------------------------------------ ITEMS / RECIPES / NODES registered at load
Object.assign(GG.Game.ITEMS, { mandrake: { n: '합환채', cat: 'key', p: 0, ic: 'herb', c: '#d8b040' } });
GG.Game.TOOLS.fishrod = '낚싯대';
for (const k in NODEX) { GG.Game.NODE[k] = Object.assign({ key: k }, NODEX[k]); }
GG.Game.RECIPES.push(
  { id: 'leather', n: '무두질한 가죽', out: { leather: 1 }, in: { hide: 2, branch: 1 }, st: 'tan', d: '가죽 장인의 작업대에서 무두질해요' },
  { id: 'roast', n: '구운 고기', out: { roast: 1 }, in: { meat: 1, branch: 1 }, st: 'fire', d: '체력과 기력을 채워요' },
  { id: 'roastfish', n: '구운 잉어', out: { roastfish: 1 }, in: { carp: 1, branch: 1 }, st: 'fire' },
  { id: 'roastfish2', n: '구운 생선', out: { roastfish: 1 }, in: { barbel: 1, branch: 1 }, st: 'fire' },
  { id: 'roastfish3', n: '구운 틸라피아', out: { roastfish: 2 }, in: { tilapia: 1, branch: 1 }, st: 'fire' },
  { id: 'arrow', n: '화살 ×5', out: { arrow: 5 }, in: { branch: 2, feather: 1, stone: 1 }, d: '깃털을 단 사냥 화살' },
  { id: 'fishrod', n: '낚싯대', tool: 'fishrod', in: { branch: 2, thread: 1 }, d: '물가에서 낚시해요' },
);
const H24 = S => S.day * 24 + S.time % 24;
GG.Game.heart = function (n) { const S = GG.Game.S(); S.q.heart = clamp((S.q.heart || 0) + n, 0, 10); GG.UI.toast(`라헬의 마음 ${'♥'.repeat(S.q.heart)} (${S.q.heart})`); GG.Game.sfx('insight', { pitch: 1.3 }); GG.UI.quest(); };
GG.Game.trust = function (n) { SERVE(GG.Game.S(), n); };

// ------------------------------------------------------------------ RUNTIME STATE
const RT = { angels: [], flock: [], tw: [], raidT: 30 };
const BOSS = { on: false };

// special animals & followers for quests
function spawnSpecial(sp, x, z, o) { const C = CB(); if (C.wild().some(a => a.special && a.sp === sp && a.st !== 'gone' && a.st !== 'dead')) return; const a = C.spawn(sp, x, z, Object.assign({ special: 1, scale: 1.12, hpMul: 1.2 }, o || {})); a.home = [x, z]; }
function spawnLamb() { const Gm = GG.Game; if (Gm.npc('lostLamb')) return; Gm.spawnNPC({ id: 'lostLamb', name: '길 잃은 어린 양', animal: 'sheep', pattern: 'plain', scale: 0.55, x: -58, z: -142, wander: 2, label: '안아 데려가기' }); }
function spawnGraze(st) { const Gm = GG.Game; for (let i = 1; i <= 6; i++) { const id = 'gs' + i; if (Gm.npc(id)) continue; Gm.spawnNPC({ id, name: '라반의 양', animal: 'sheep', pattern: i === 3 ? 'spotted' : 'plain', x: 113 + (i % 3) - 1, z: -118 + Math.floor(i / 3), noTag: true, label: '몰기' }); Gm.npcFollow(id, true); } }
talk.lostLamb = (S, G) => { G.npcFollow('lostLamb', true); const st = S.side && S.side.act && S.side.act.rachelLamb; if (st) st.found = 1; G.UI.toast('어린 양이 야곱을 따라온다'); G.UI.quest(); };
for (let i = 1; i <= 6; i++) talk['gs' + i] = (S, G) => { G.npcFollow('gs' + i, true); };
steps.j5_year.talk = { laban(S, G) { if (S.q.year !== 4 || S.q.paid4) return false;
  if (S.silver >= 100) say([N('laban', '은 백 세겔이라! 장터에서 잘 팔았구나.'), J('외삼촌의 집이 번성하기를 바랍니다.')], () => { G.silver(-100); S.q.paid4 = 1; G.checkStep(); });
  else say([N('laban', `장터에서 은 100을 마련해 오너라. (지금 은 ${S.silver}) 양털, 치즈, 사냥한 가죽을 팔면 돼.`)]); } };
steps.j1_goats.talk = {}; ['goatA', 'goatB', 'goatC', 'goatD'].forEach(k => { steps.j1_goats.talk[k] = (S, G) => { G.npcFollow(k, true); G.sfx('goat'); G.UI.toast('염소가 야곱을 따라온다 · 우리까지 천천히 걸어가세요'); }; });

function refreshKids(S, G) { for (const id in KIDLOOK) { const n = G.npc(id); if (n) n.scale = kidScale(S, id); } }

// ------------------------------------------------------------------ CUTSCENES
const hAt = (x, z) => GG.Game.W().heightAt(x, z);
function dreamCine(S, G) {
  const sx = SPOTS.sleep[0], sz = SPOTS.sleep[1], h = hAt(sx, sz), bx = STAIR.x, bz = STAIR.z, by = hAt(bx, bz), top = by + STAIR.n * STAIR.dy, tz = bz - STAIR.n * STAIR.dz;
  G.UI.fade(() => { G.P.carry = null; G.P.carryArms = false; G.teleport(sx, sz, 0); G.P.sleeping = true; S.time = 23.6; S.q.dream = 1; }, () => GG.Cine.play([
    { cam: [sx + 3.2, h + 1.3, sz + 2.6], cam2: [sx + 2.4, h + 1.8, sz + 3.4], look: [sx, h + 0.3, sz], dur: 4.5, t: '야곱이 돌을 베고 누워 잠이 들었습니다. 그리고 꿈을 꾸었습니다.', ref: '창세기 28:11–12' },
    { cam: [bx + 1.5, by + 1.6, bz + 10], cam2: [bx + 4, by + 16, bz + 4], look: [bx, by + 4, bz - 4], look2: [bx, top * 0.8, tz + 4], dur: 7, t: '보니, 사닥다리가 땅 위에 서 있는데 그 꼭대기가 하늘에 닿았고, 하나님의 사자들이 그 위에서 오르락내리락하고 있었습니다.', ref: '창세기 28:12' },
    { cam: [bx + 18, by + 18, bz - 6], cam2: [bx + 14, by + 26, bz - 12], look: [bx, by + 20, bz - 14], dur: 6 },
    { cam: [bx + 3, top - 8, tz + 9], look: [bx, top + 6, tz - 6], dur: 9, n: '여호와', t: '나는 여호와니 너의 조부 아브라함의 하나님이요 이삭의 하나님이라. 네가 누워 있는 땅을 내가 너와 네 자손에게 주리니, 네 자손이 땅의 티끌 같이 되어 동서남북으로 퍼져 나갈지며, 땅의 모든 족속이 너와 네 자손으로 말미암아 복을 받으리라.', ref: '창세기 28:13–14' },
    { cam: [bx - 2, top - 14, tz + 14], cam2: [sx + 2, h + 2.2, sz + 3], look: [bx, top, tz], look2: [sx, h + 0.3, sz], dur: 9, n: '여호와', t: '내가 너와 함께 있어 네가 어디로 가든지 너를 지키며 너를 이끌어 이 땅으로 돌아오게 할지라. 내가 네게 허락한 것을 다 이루기까지 너를 떠나지 아니하리라.', ref: '창세기 28:15' },
    { fn: (S2, G2) => { S2.q.dream = 0; S2.time = 6.1; G2.P.sleeping = false; G2.P.kneel = true; }, cam: [sx + 3, h + 1.5, sz + 3], cam2: [sx + 2.4, h + 1.7, sz + 2.2], look: [sx, h + 0.8, sz], dur: 5, n: '야곱', t: '여호와께서 과연 여기 계시거늘 내가 알지 못하였도다.', ref: '창세기 28:16' },
    { cam: [sx - 3, h + 2, sz + 4], look: [sx, h + 1, sz - 3], dur: 5, n: '야곱', t: '두렵도다 이곳이여! 이것은 다른 것이 아니라 하나님의 집이요 이는 하늘의 문이로다.', ref: '창세기 28:17' },
  ], () => { G.P.kneel = false; G.snapCam(); G.go('j3_pillar'); }));
}
function feast(S, G) {
  const fx = 86, fz = -154, h = hAt(fx, fz);
  G.UI.fade(() => { S.q.feast = 1; S.time = 19.6; GG.Game.musicOverride = 'festival';
    G.npcTo('laban', fx + 2.4, fz + 2.2, -2.3, false); G.npcTo('leah', fx - 2.6, fz + 2.6, 2.4, false); G.npcTo('musician', fx - 3.6, fz - 1.4, 1.2, false); G.npcTo('shep1', fx + 2.8, fz - 2.6, -0.8, false); G.npcTo('shep2', fx, fz - 3.6, 0, false); G.npcTo('shep3', fx - 1.6, fz - 3.2, 0.4, false);
    const L = G.npc('musician'); if (L) L.act = 'gather'; G.teleport(fx, fz + 3.4, Math.PI); },
  () => GG.Cine.play([
    { cam: [fx + 10, h + 5, fz + 9], cam2: [fx + 7, h + 3.5, fz + 7], look: [fx, h + 1, fz], dur: 6, t: '라반이 그곳 사람들을 다 모아 잔치를 베풀었습니다.', ref: '창세기 29:22' },
    { cam: [fx - 5, h + 1.8, fz + 1], look: [fx + 1, h + 1.3, fz], dur: 5, t: '수금과 소고 소리가 밤늦도록 하란 들판에 울렸습니다. 야곱은 일곱 해 동안 기다린 날을 맞았습니다.' },
    { cam: [fx - 1, h + 1.7, fz + 6], look: [fx - 2.6, h + 1.4, fz + 2.6], dur: 6, t: '저녁에 라반이 그의 딸 레아를 야곱에게로 데려갔습니다. 신부는 얼굴을 가리고 있었습니다. 라반은 또 그의 여종 실바를 딸 레아에게 시녀로 주었습니다.', ref: '창세기 29:23–24' },
    { fn: (S2, G2) => { S2.time = 6.4; S2.q.feast = 0; GG.Game.musicOverride = null; G2.npcTo('leah', 79.6, -150.4, 0.8, false); G2.npcTo('laban', 83, -147.6, -2.4, false); G2.teleport(78.2, -148.6, 2.6); ['shep1', 'shep2', 'shep3'].forEach((k, i) => G2.npcTo(k, [52, 38, 54][i], [-118, -130, -131][i], 0, false)); },
      cam: [81, h + 1.8, -146], look: [79, h + 1.2, -150.6], dur: 5, t: '아침에 보니 레아라!', ref: '창세기 29:25' },
  ], () => say([J('외삼촌이 어찌하여 내게 이같이 행하셨나이까? 내가 라헬을 위하여 외삼촌을 섬기지 아니하였나이까? 외삼촌이 나를 속이심은 어찌됨이니이까?', '창세기 29:25'),
    N('laban', '언니보다 아우를 먼저 주는 것은 우리 지방에서 하지 아니하는 바이라.', '창세기 29:26'), N('laban', '이를 위하여 칠 일을 채우라. 우리가 그도 네게 주리니, 네가 또 나와 함께 칠 년 동안 섬길지니라.', '창세기 29:27'),
    T('아버지의 눈을 속였던 야곱이, 이번에는 어둠 속에서 속았습니다.'), N('leah', '…미안해요, 야곱.')], () => G.go('j5_more'))));
}
function finaleCine(S, G) {
  const fx = 151, fz = 128, h = hAt(fx, fz);
  G.UI.fade(() => { S.time = Math.max(19.6, S.time % 24); FAMF.concat(['simeon', 'levi', 'dan', 'naphtali', 'gad', 'asher', 'issachar', 'zebulun', 'dinah']).forEach((id, i, arr) => { const a = i / arr.length * Math.PI * 2; G.npcTo(id, fx + Math.cos(a) * 3.4, fz + Math.sin(a) * 3.4, Math.atan2(-Math.cos(a), -Math.sin(a)), false); const n = G.npc(id); if (n) n.sit = true; });
    G.teleport(fx + 0.4, fz - 3.2, 0); G.P.sit = true; GG.Game.musicOverride = 'epilogue'; },
  () => GG.Cine.play([
    { cam: [fx + 14, h + 7, fz + 12], cam2: [fx + 8, h + 4, fz + 8], look: [fx, h + 1, fz], dur: 6, t: '그날 밤, 이스라엘의 장막 앞에 모닥불이 피어올랐습니다.' },
    { cam: [fx + 3.5, h + 1.5, fz + 1], look: [fx, h + 1.1, fz - 2.6], dur: 5, n: '요셉', t: '아버지, 벧엘의 사다리 이야기 해 주세요!' },
    { cam: [fx - 2.6, h + 1.4, fz - 0.6], look: [fx + 0.4, h + 1.2, fz - 3.2], dur: 7, n: '이스라엘', t: '나는 형을 피해 도망치던 사람이었단다. 지팡이 하나만 들고, 돌을 베고 잠들었지. 그런데 하나님이 거기 계셨어.' },
    { cam: [fx - 1.6, h + 2.4, fz + 3], look: [fx, h + 1, fz - 1], dur: 7, n: '이스라엘', t: '"내가 너와 함께 있어 네가 어디로 가든지 너를 지키며 너를 이끌어 이 땅으로 돌아오게 할지라." 그 약속을, 하나님은 한 번도 잊지 않으셨단다.', ref: '창세기 28:15' },
    { cam: [fx + 3, h + 1.6, fz - 4], look: [fx - 1, h + 1, fz + 2], dur: 5, n: '르우벤', t: '아버지 다리는 그때 다치신 거예요?' },
    { cam: [fx - 3.2, h + 1.5, fz - 4.6], look: [fx + 0.4, h + 1.3, fz - 3.2], dur: 7, n: '이스라엘', t: '그건 얍복 강에서였지. 나는 그날 밤 그분을 붙들고 놓지 않았단다. 그리고 새 이름을 받았지. 이스라엘.', ref: '창세기 32:28' },
    { cam: [fx, h + 2, fz + 6], cam2: [fx, h + 3, fz + 7], look: [fx, h + 30, fz - 30], dur: 8, t: '야곱의 아들들은 훗날 이스라엘 열두 지파의 조상이 되었습니다. 열두째 아들 베냐민은 가나안으로 가는 길, 베들레헴 근처에서 태어나게 됩니다.', ref: '창세기 35:16–18; 49:28' },
    { cam: [fx + 2, h + 1.4, fz - 1.4], look: [fx + 3.4, h + 0.9, fz], dur: 7, t: '그리고 모닥불 곁에서 별을 올려다보던 소년 요셉의 이야기가, 이제 곧 시작됩니다.', ref: '창세기 37장' },
  ], () => { G.P.sit = false; FAMF.concat(Object.keys(KIDLOOK)).forEach(id => { const n = G.npc(id); if (n) { n.sit = false; n.schedSlot = -1; } });
    const H = S.hero; narr([{ kick: '야곱 편 끝', title: '이스라엘', t: '발꿈치를 잡던 자 야곱은 하나님을 붙들고 놓지 않는 자 이스라엘이 되었습니다. 팥죽 한 그릇에서 시작된 이야기가, 열두 지파의 시작이 되었습니다.', ref: '창세기 25–33장' },
      { kick: '나의 여정', title: `${S.day}일의 기록`, t: `깨달음 ${H.insight} · 체력 Lv ${H.lvl} · 사냥 ${Object.values(H.kills).reduce((a, b) => a + b, 0)}마리 · 물고기 ${S.stats.fish || 0}마리 · 마친 부탁 ${S.stats.quests || 0}개 · 자녀 ${(S.q.kidsBorn || []).length}명`, ref: '' },
      { kick: '계속', title: '자유롭게 지내기', t: '야곱 편의 이야기는 여기까지예요. 하지만 약속의 길은 계속됩니다. 집을 짓고, 가축을 키우고, 세겜 사람들과 어울리며 이스라엘의 가족과 마음껏 살아 보세요.', ref: '' }], () => { GG.Game.musicOverride = null; G.go('j_end'); }); }));
}

// ------------------------------------------------------------------ BOSS · 얍복 강의 씨름
const ARENA = { x: 190, z: 95, r: 13 };
function bossIntro(S, G) {
  if (S.q.bossWon) return; G.npcShow('man', true); G.npcTo('man', ARENA.x - 4, ARENA.z - 2, 0.9, false); S.time = Math.max(S.time % 24 < 6 ? 23.6 : S.time, 23.6);
  setTimeout(() => say([T('야곱은 홀로 남았더니, 어떤 사람이 날이 새도록 야곱과 씨름하였습니다.', '창세기 32:24'),
    T('씨름 안내 · 그가 몸을 낮추고 빛나면 곧 달려들어요. 점프 버튼(구르기)으로 피하면 그가 비틀거려요. 그때 A 버튼(붙잡기)! 붙잡은 동안 A를 계속 누르면 동이 터 와요. 빨간 공격 버튼도 붙잡기로 쓸 수 있어요.')], () => bossStart(S, G)), 120);
}
function bossStart(S, G) {
  const q = S.q.boss || (S.q.boss = { dawn: 0 }); q.on = 1; Object.assign(BOSS, { on: true, st: 'circle', t: 2.2, ang: Math.atan2(G.P.x - ARENA.x, G.P.z - ARENA.z), dawn: q.dawn || 0, hold: 0, hitDone: false, lim: !!S.flags.limp });
  if (!S.q.bossDay) { S.q.bossDay = 1; S.day++; } GG.Game.musicOverride = 'boss'; bossBar(true); G.UI.quest();
}
function bossBar(on) {
  let el = document.getElementById('bossBar');
  if (!el && on) { el = document.createElement('div'); el.id = 'bossBar'; el.innerHTML = '<div>어떤 사람 · 날이 새도록</div><div class="bb"><i id="bbFill"></i></div><small id="bbHint"></small>'; document.body.appendChild(el); }
  if (el) el.hidden = !on; document.body.classList.toggle('boss', !!on); RT.bar = !!on;
}
function bossHint(t) { const e = document.getElementById('bbHint'); if (e && e.textContent !== t) e.textContent = t; }
function bossPress() {
  if (!BOSS.on) return false; const P = GG.Game.P, n = GG.Game.npc('man'); if (!n) return false; const d = Math.hypot(n.x - P.x, n.z - P.z);
  if (BOSS.st === 'open' && d < 3.8) { BOSS.st = 'hold'; BOSS.t = 3.4; P.lock = true; P.face = Math.atan2(n.x - P.x, n.z - P.z); GG.Game.sfx('grunt', { pitch: 0.9 }); GG.Game.CAM.shake = 0.4; return true; }
  if (BOSS.st === 'hold') { BOSS.dawn += BOSS.lim ? 2.0 : 2.4; GG.Game.sfx('hit', { pitch: 0.6 + Math.random() * 0.2, vol: 0.5 }); GG.FX.burst(P.x + Math.sin(P.face) * 0.5, P.y + 1.2, P.z + Math.cos(P.face) * 0.5, 6, { c: [1, 0.9, 0.6], sp: 1.6, up: 1 }); return true; }
  return BOSS.st === 'open';
}
{ const _pa = GG.Game.pressAction; GG.Game.pressAction = function () { if (BOSS.on && !GG.UI.busy() && !(GG.Cine && GG.Cine.on) && bossPress()) return; _pa(); }; }
{ const _atk = GG.Combat.attack; GG.Combat.attack = function () { if (BOSS.on) { if (!GG.UI.busy()) bossPress(); return; } _atk(); }; }
{ const _ft = GG.Combat.faint; GG.Combat.faint = function () { if (BOSS.on) { const S = GG.Game.S(); BOSS.st = 'recover'; BOSS.t = 3; BOSS.dawn = Math.max(0, BOSS.dawn - 12); GG.Game.P.lock = false;
  say([T('야곱이 땅에 쓰러졌다… 그러나 다시 일어나 그를 붙들었다. (동틀 녘 −12)')], () => { S.hero.hp = Math.round(S.hero.hpMax * 0.6); GG.UI.hud(); }); return; } _ft(); }; }
function bossUpdate(dt, S, G, t) {
  const P = G.P, n = G.npc('man'); if (!n) return; const C = CB(); C.inCombat = true;
  if (GG.UI.busy() || GG.Cine.on) { n.walk = null; return; }
  const dx = P.x - n.x, dz = P.z - n.z, d = Math.hypot(dx, dz) || 0.01, face = Math.atan2(dx, dz);
  const CAM = G.CAM; if (CAM.last > 0.6 && d > 0.8) CAM.yaw += G.angDiff(CAM.yaw, Math.atan2(dx, dz)) * Math.min(1, dt * 2.6); // soft lock-on: keep him in view
  BOSS.dawn += dt * 0.22; BOSS.t -= dt; const lim = BOSS.lim;
  S.time = 0.2 + Math.min(1, BOSS.dawn / 100) * 5.2; S.q.boss.dawn = BOSS.dawn; n.tint = null;
  if (BOSS.st === 'circle') { n.act = null; BOSS.ang += dt * (lim ? 0.9 : 0.65); const R0 = 3.8; const tx = P.x + Math.sin(BOSS.ang) * R0, tz = P.z + Math.cos(BOSS.ang) * R0;
    n.walk = { x: tx, z: tz, sp: Math.min(5.5, 2.4 + Math.hypot(tx - n.x, tz - n.z) * 0.9) }; bossHint('그가 빙빙 돌며 틈을 노린다…');
    if (BOSS.t <= 0 && d < 5.4) { BOSS.st = 'windup'; BOSS.t = lim ? 0.55 : 0.75; BOSS.dodged = false; BOSS.hurt = false; n.walk = null; GG.Game.sfx('grunt', { pitch: 0.7 }); } }
  else if (BOSS.st === 'windup') { n.walk = null; n.face += G.angDiff(n.face, face) * Math.min(1, dt * 12); n.act = 'push'; n.tint = [1.7, 1.55, 1.2]; bossHint('몸을 낮췄다 — 구르기!');
    if (P.dodgeT > 0 && BOSS.t < 0.28) BOSS.dodged = true;
    if (BOSS.t <= 0) { BOSS.st = 'lunge'; BOSS.t = clamp((d + 1.0) / (lim ? 12 : 10.5), 0.3, 0.62); BOSS.dir = [dx / d, dz / d]; BOSS.hitDone = false; } }
  else if (BOSS.st === 'lunge') { const sp = lim ? 12 : 10.5; n.walk = null; n.act = 'grab'; n.x += BOSS.dir[0] * sp * dt; n.z += BOSS.dir[1] * sp * dt; n.face = Math.atan2(BOSS.dir[0], BOSS.dir[1]);
    if (P.dodgeT > 0) BOSS.dodged = true;
    if (!BOSS.hitDone && d < 1.35) { BOSS.hitDone = true; if (!BOSS.dodged) { BOSS.hurt = true; const dmg = Math.round(10 + S.hero.hpMax * (lim ? 0.1 : 0.08)); C.hurtPlayer(dmg, { x: n.x - BOSS.dir[0], z: n.z - BOSS.dir[1] }); } }
    if (BOSS.t <= 0) { if (BOSS.dodged && !BOSS.hurt) { BOSS.st = 'open'; BOSS.t = lim ? 1.4 : 1.7; GG.UI.dmg && GG.UI.dmg(P.x, P.y + 2, P.z, 0, 'dodge'); GG.Game.sfx('dodge'); } else { BOSS.st = 'recover'; BOSS.t = 0.7; } } }
  else if (BOSS.st === 'open') { n.walk = null; n.act = 'bow'; bossHint('비틀거린다 — 지금 A로 붙잡기!'); if (BOSS.t <= 0) { BOSS.st = 'circle'; BOSS.t = 1.6 + Math.random() * 1.6; } }
  else if (BOSS.st === 'hold') { n.walk = null; n.act = 'grab'; P.act = null; P.lock = true; P.atkPose = 'grab'; BOSS.dawn += dt * 1.0; const fx = Math.sin(P.face), fz = Math.cos(P.face); n.x = P.x + fx * 0.95; n.z = P.z + fz * 0.95; n.face = P.face + Math.PI;
    P.x += Math.sin(t * 2.2) * 0.004; bossHint('붙잡았다! A를 연타해 버티기'); if (BOSS.t <= 0) { BOSS.st = 'thrown'; BOSS.t = 0.4; P.lock = false; P.atkPose = null; P.vx = -fx * 7; P.vz = -fz * 7; GG.Game.CAM.shake = 0.5; GG.Game.sfx('grunt', { pitch: 0.75 }); } }
  else if (BOSS.st === 'thrown' || BOSS.st === 'recover') { n.act = null; n.walk = null; if (BOSS.t <= 0) { BOSS.st = 'circle'; BOSS.t = 1.8 + Math.random() * 1.5; } }
  n.y = G.W().heightAt(n.x, n.z); const ad = Math.hypot(n.x - ARENA.x, n.z - ARENA.z); if (ad > ARENA.r + 1) { n.x = ARENA.x + (n.x - ARENA.x) / ad * (ARENA.r + 1); n.z = ARENA.z + (n.z - ARENA.z) / ad * (ARENA.r + 1); }
  const f = document.getElementById('bbFill'); if (f) f.style.width = Math.min(100, BOSS.dawn).toFixed(1) + '%';
  // phase: the hip
  if (BOSS.dawn >= 55 && !S.flags.limp) { S.flags.limp = 1; BOSS.lim = true; BOSS.st = 'recover'; BOSS.t = 2; P.lock = false; P.atkPose = null; G.refreshLook(); GG.Game.CAM.shake = 1; GG.Game.sfx('hurt');
    say([T('그 사람이 자기가 야곱을 이기지 못함을 보고 야곱의 허벅지 관절을 치매, 야곱의 허벅지 관절이 그 사람과 씨름할 때에 어긋났더라.', '창세기 32:25'), J('(다리가… 그래도 놓을 수 없다!)')]); }
  if (BOSS.dawn >= 100) bossWin(S, G);
}
function bossWin(S, G) {
  BOSS.on = false; S.q.boss.on = 0; const P = G.P, n = G.npc('man'); P.lock = false; P.atkPose = 'grab'; if (n) { n.walk = null; n.act = 'grab'; n.x = P.x + Math.sin(P.face) * 0.95; n.z = P.z + Math.cos(P.face) * 0.95; n.face = P.face + Math.PI; }
  S.time = 5.4; bossHint('');
  say([N('man', '날이 새려 하니 나로 가게 하라.', '창세기 32:26'), J('당신이 내게 축복하지 아니하면 가게 하지 아니하겠나이다.', '창세기 32:26')], () =>
    G.UI.minigame('count', { title: '붙들고 놓지 않기', hint: '축복하기 전에는 놓지 않아요. 버튼을 계속 누르세요!', need: 14, btn: '붙들기', onPress: () => { GG.Game.CAM.shake = 0.25; GG.Game.sfx('hit', { pitch: 0.55, vol: 0.4 }); } }, () =>
      say([N('man', '네 이름이 무엇이냐?', '창세기 32:27'), J('야곱이니이다.', '창세기 32:27'), N('man', '네 이름을 다시는 야곱이라 부를 것이 아니요 이스라엘이라 부를 것이니, 이는 네가 하나님과 및 사람들과 겨루어 이겼음이니라.', '창세기 32:28'),
        J('청하건대 당신의 이름을 알려 주소서.', '창세기 32:29'), N('man', '어찌하여 내 이름을 묻느냐?', '창세기 32:29'), T('그가 거기서 야곱에게 축복하였습니다.', '창세기 32:29')], () => peniel(S, G))));
}
function peniel(S, G) {
  const h = hAt(ARENA.x, ARENA.z); bossBar(false); G.P.atkPose = null;
  GG.Cine.play([
    { fn: (S2, G2) => { G2.npcShow('man', false); S2.time = 5.5; GG.Game.musicOverride = 'dream'; G2.P.kneel = true; }, cam: [ARENA.x - 6, h + 2.2, ARENA.z + 5], cam2: [ARENA.x - 7, h + 3.5, ARENA.z + 6], look: [ARENA.x + 20, h + 3, ARENA.z - 2], dur: 7, t: '야곱이 그 곳 이름을 브니엘이라 하였으니, "내가 하나님과 대면하여 보았으나 내 생명이 보전되었다" 함이더라.', ref: '창세기 32:30' },
    { fn: (S2) => { S2.time = 6.2; }, cam: [ARENA.x + 6, h + 1.6, ARENA.z + 3], look: [ARENA.x, h + 1.2, ARENA.z], dur: 6, t: '그가 브니엘을 지날 때에 해가 돋았고, 그의 허벅다리로 말미암아 절었더라.', ref: '창세기 32:31' },
  ], () => { G.P.kneel = false; S.q.bossWon = 1; GameMusic(null); G.setOutfit('israel');
    narr([{ kick: '이스라엘', title: '하나님과 겨루어 이긴 자', t: '발꿈치를 잡던 자 야곱은, 이제 하나님을 붙들고 놓지 않는 자 이스라엘이 되었습니다.', ref: '창세기 32:28' }], () => { G.insight(3, '이스라엘'); G.go('j8_esau'); }); });
}
const GameMusic = m => { GG.Game.musicOverride = m; };
steps.j8_boss.list = S => [{ t: `동틀 녘 ${Math.min(100, Math.round((S.q.boss && S.q.boss.dawn) || 0))}%`, ok: false }, { t: '달려들 때 구르기 → 비틀거리면 A로 붙잡기 → A 연타' }];

// ------------------------------------------------------------------ ESAU · EPILOGUE TRANSITION
steps.j8_meet.talk = { esau(S, G) {
  G.UI.minigame('count', { title: '일곱 번 절하기', hint: '형에게 가까이 가며 일곱 번 땅에 굽혀 절해요.', need: 7, btn: '절하기', onPress: () => { G.P.act = 'bow'; G.P.actT = 0; G.P.actDur = 0.6; G.P.actHits = 1; G.P.fired = true; } }, () => {
    T0(() => say([T('야곱이 앞서 나아가되 그의 형에게 가까이 가기까지 일곱 번 땅에 굽혔더니, 에서가 달려와서 그를 맞이하여 안고 목을 어긋맞추어 그와 입 맞추고 서로 울었습니다.', '창세기 33:3–4'), N('esau', '너와 함께 한 이들은 누구냐?', '창세기 33:5'), J('하나님이 주의 종에게 은혜로 주신 자식들이니이다.', '창세기 33:5'),
      N('esau', '내 동생아, 내게 있는 것이 족하니 네 소유는 네게 두라.', '창세기 33:9'), J('아니니이다. 내가 형님의 얼굴을 뵈온즉 하나님의 얼굴을 본 것 같사오며, 형님도 나를 기뻐하심이니이다. 하나님이 내게 은혜를 베푸셨으니 청하건대 내가 형님께 드리는 예물을 받으소서.', '창세기 33:10–11'),
      T('야곱이 강권하매 에서가 받았습니다. 그 날에 에서는 세일로 돌아갔습니다.', '창세기 33:11, 16')], () => { G.npcWalk('esau', 262, 104, () => G.npcShow('esau', false), 2); for (let i = 1; i <= 6; i++) G.npcWalk('sold' + i, 262 + i, 100 + i, null, 2);
        G.insight(2, '형제의 화해'); toEpilogue(S, G); }), G.npcWalk('esau', G.P.x + 1.2, G.P.z + 0.4, null, 5));
  });
} };
function T0(fn, pre) { setTimeout(fn, 1500); }
function toEpilogue(S, G) {
  narr([{ kick: '창세기 33:17–18', title: '숙곳과 세겜', t: '야곱은 숙곳에 이르러 자기를 위하여 집을 짓고 가축을 위하여 우릿간을 지었습니다. 그리고 가나안 땅 세겜 성읍에 평안히 이르러 그 성 앞에 장막을 쳤습니다.', ref: '창세기 33:17–18' }], () => G.UI.fade(() => {
    S.q.epi = 1; S.q.flock = 0; RT.flock.length = 0; const hj = G.herd('jacob'), hi = G.herd('israel'); if (hj && hi) { hi.list = hi.list.concat(hj.list); hj.list = []; } G.refreshAnimals();
    FAMF.forEach(k => G.npcFollow(k, false)); for (const id in KIDLOOK) { const n = G.npc(id); if (n) n.schedSlot = -1; } ['rachel', 'leah', 'bilhah', 'zilpah'].forEach(k => { const n = G.npc(k); if (n) n.schedSlot = -1; });
    refreshKids(S, G); G.teleport(156, 132, -2.2); S.time = 8; G.unlock('garden');
  }, () => G.go('ep_start')));
}
npcs.push({ id: 'hamor', name: '하몰의 아들', look: Object.assign({}, LOOK.merchant, { clothCol: 0xe8dcc0, stripes: [0x6a3a2a, 0xe0c070], stripesB: [0x6a3a2a, 0xe0c070] }), x: 170, z: 134, face: -1.8, show: epi, sched: S => epi(S) ? [[7, 170, 134, -1.8, 'wander:3'], [19, 186, 140, 0, 'hide']] : null });

// ------------------------------------------------------------------ WORLD RUNTIME
const wildZones = [
  { id: 'south', x: 20, z: 112, r: 48, sp: [['gazelle', 3], ['hare', 4], ['partridge', 3]], max: 5, on: S => before(S, 'j3_start') || epi(S) },
  { id: 'road', x: -12, z: -10, r: 46, sp: [['hare', 3], ['partridge', 3], ['gazelle', 2]], max: 4, on: S => between(S, 'j3_start', 'j7_call') },
  { id: 'eastPlain', x: 172, z: -160, r: 32, sp: [['gazelle', 4], ['hare', 3], ['partridge', 3], ['wolf', 4, 'night']], max: 6, nightMax: 5, on: inHaran },
  { id: 'reeds', x: 22, z: -150, r: 22, sp: [['boar', 3], ['partridge', 2], ['hare', 2]], max: 4, on: inHaran },
  { id: 'grove', x: 35, z: -218, r: 24, sp: [['deer', 4], ['hare', 2], ['boar', 2], ['wolf', 3, 'night']], max: 5, on: inHaran },
  { id: 'ibex', x: -72, z: -150, r: 26, sp: [['ibex', 4], ['partridge', 2], ['hare', 1]], max: 4, on: inHaran },
  { id: 'thicket', x: 195, z: -205, r: 16, sp: [['boar', 2], ['hare', 2], ['wolf', 1, 'night']], max: 3, on: inHaran },
  { id: 'gilead', x: 182, z: 0, r: 40, sp: [['deer', 2], ['gazelle', 2], ['hare', 2], ['partridge', 2], ['wolf', 2, 'night']], max: 4, on: S => between(S, 'j8_start', 'j8_gift') },
  { id: 'succoth', x: 172, z: 158, r: 40, sp: [['gazelle', 3], ['hare', 3], ['partridge', 2], ['boar', 1], ['wolf', 2, 'night']], max: 5, on: epi },
];
function wildOk(x, z) { if (PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 8)) return false; if (Math.abs(x - 110) < 16 && Math.abs(z + 130) < 12) return false; return roadD(x, z) > 2; }
function fishAt(x, z) {
  if (Math.abs(x - riverX(z)) < 16) return [['tilapia', 5], ['barbel', 3], ['catfish', 2], ['gfish', 0.25]];
  if (Math.hypot(x - POND.x, z - POND.z) < POND.r + 4) return [['carp', 6], ['catfish', 1.4], ['barbel', 1], ['gfish', 0.6]];
  return [['carp', 6], ['barbel', 4], ['catfish', 1.5], ['gfish', 0.2]];
}
function music(S, G, hr) {
  if (S.q.dream) return 'dream'; if (BOSS.on || S.step === 'j8_boss') return 'boss'; if (S.q.feast) return 'festival';
  if (CB().inCombat) return 'combat'; if (S.q.angels) return 'dream';
  if (hr < 5.2 || hr > 20.6) return 'night'; if (epi(S)) return 'epilogue';
  if (G.P.z > 60) return before(S, 'j3_start') && G.dist(8, 166) < 45 ? 'camp' : 'desert';
  if (inHaran(S) && S.q.phase === 'family' && G.dist(150, -108) < 26) return 'camp';
  return 'haran';
}
function ledger(S, G) {
  const rows = []; const Y = S.q.phase === 'family' ? FYEARS[(S.q.fy || 1) - 1] : YEARS[(S.q.year || 1) - 1];
  if ((S.step === 'j5_year' || S.step === 'j6_start') && Y) rows.push([S.q.phase === 'family' ? `다시 칠 년 · ${S.q.fy}년째 섬김` : `라헬을 위한 ${S.q.year}년째 섬김`, `${Math.min(Y.serve, serveY(S))}/${Y.serve}`, serveY(S) / Y.serve]);
  rows.push(['라헬의 마음', '♥'.repeat(heart(S)) || '·']); rows.push(['라반의 가축', labanN(G)]); if (built(S, 'jacobFold')) rows.push(['야곱의 가축', jacobN(G)]);
  rows.push(['일꾼', ['hireShep', 'hireHand', 'hireWeaver', 'stall'].filter(k => built(S, k)).length + '명']); rows.push(['자녀', (S.q.kidsBorn || []).length + '명']); rows.push(['마친 부탁', S.stats.quests || 0]);
  return { title: epi(S) ? '이스라엘의 장막' : '라반 집안 장부', rows };
}
function onDay(S, G) {
  const msgs = [];
  if (inHaran(S)) {
    const h = G.herd('laban');
    if (built(S, 'hireShep') && h) { h.trough = 12; S.stats.troughFill = (S.stats.troughFill || 0) + 1; SERVE(S, 1); }
    if (built(S, 'hireHand')) { for (const id in S.plots) { const p = S.plots[id]; if (p.s === 2 && (id.startsWith('barleyL:') || id.startsWith('wheatL:'))) p.w = 1; } SERVE(S, 2); }
    if (built(S, 'hireWeaver')) { const n = Math.min(4, Math.floor(G.inv('wool') / 2)); if (n) { G.take('wool', n * 2); G.give('thread', n, true); msgs.push(`직조공이 실 ${n}타래를 자았다`); } SERVE(S, 2); }
    if (built(S, 'stall')) { const e = 6 + Math.floor(labanN(G) / 8); G.silver(e); msgs.push(`장터 좌판에서 은 ${e}을 벌었다`); SERVE(S, 1); }
    if (built(S, 'granary')) SERVE(S, 2);
    if (h && h.list.length > 16 && !built(S, 'hireShep') && Math.random() < 0.18) { G.removeAnimals('laban', 1); msgs.push('밤사이 들짐승이 양 한 마리를 물어 갔다… "물려 찢긴 것은 내가 물어냈으며" (창 31:39)'); }
  }
  if (msgs.length) setTimeout(() => { let i = 0; const nx = () => { if (i < msgs.length) { G.UI.toast(msgs[i++]); setTimeout(nx, 2700); } }; nx(); }, 2200);
}
function onLoad(S, G) {
  if (!steps[S.step]) { S.step = { j1: 'j1_start', j2: 'j2_start', j3: 'j3_start', j4: 'j4_start', j5: 'j5_start', j6: 'j7_wage', j7: 'j8_start' }[String(S.step).slice(0, 2)] || 'j1_start'; S.q.migrated = 1; } // saves from the older story layout
  G.CROPS.lentil.days = [1];
  if (S.day === 1 && !S.q.milkInit) { S.q.milkInit = 1; const h = G.herd('isaacGoats'); if (h) h.milk = true; }
  S.q.feast = 0; GG.Game.musicOverride = null; BOSS.on = false; bossBar(false); RT.flock.length = 0; RT.angels.length = 0; RT.tw.length = 0;
  const act = (S.side && S.side.act) || {};
  if (act.rachelLamb && !act.rachelLamb.home) { spawnLamb(); if (act.rachelLamb.found) G.npcFollow('lostLamb', true); }
  if (act.rachelGraze && !act.rachelGraze.back) spawnGraze(act.rachelGraze);
  if (act.lion) spawnSpecial('lion', SPOTS.thicket[0], SPOTS.thicket[1], { name: '덤불의 늙은 사자' }); if (act.bear) spawnSpecial('bear', SPOTS.bearDen[0], SPOTS.bearDen[1] + 4, { name: '굴의 큰곰' });
  if (act.epJoseph) G.npcFollow('joseph', true); if (act.epReuben) G.npcFollow('reuben', true);
  if (between(S, 'j8_start', 'j8_ford') && S.step !== 'j8_ford' || S.step === 'j8_ford') { FAMF.forEach(k => G.npcFollow(k, true)); S.q.flock = 1; }
  refreshKids(S, G); dropLoan(S, G);
}
function dropLoan(S, G) { if (!before(S, 'j3_start') && GG.Ride) for (const m of (S.mounts || []).filter(m => m.loan)) GG.Ride.remove(m.id); }
function canSleep(S) { return S.step === 'j1_sleep'; }
function bounds(P, S) { if (!BOSS.on) return; const d = Math.hypot(P.x - ARENA.x, P.z - ARENA.z); if (d > ARENA.r) { P.x = ARENA.x + (P.x - ARENA.x) / d * ARENA.r; P.z = ARENA.z + (P.z - ARENA.z) / d * ARENA.r; } }
function context(S, G) { if (!BOSS.on || BOSS.st !== 'open') return null; const n = G.npc('man'); if (!n || G.dist(n.x, n.z) > 3.8) return null; return [{ d: -9, label: '붙잡기!', x: n.x, z: n.z, y: 2.2, use: () => bossPress(), key: 'boss' }]; }
function mood(S, G) {
  if (S.q.dream) return { mod(e) { e.skyTop = [0.08, 0.06, 0.22]; e.skyHor = [0.55, 0.38, 0.5]; e.fogCol = [0.28, 0.2, 0.36]; e.sunCol = [1.0, 0.85, 0.6]; e.skyAmb = [0.5, 0.42, 0.6]; e.gndAmb = [0.25, 0.18, 0.3]; e.night = 1; e.sunDir = [0.2, 0.75, -0.6]; e.fogDen = 1 / 160; e.cloudCol = [0.6, 0.45, 0.7]; } };
  if (BOSS.on || S.step === 'j8_boss') return { mod(e) { const k = 1 - Math.min(1, (BOSS.dawn || 0) / 100) * 0.6; e.skyAmb = e.skyAmb.map((v, i) => v * (1 + 1.1 * k) + [0.05, 0.06, 0.1][i] * k); e.gndAmb = e.gndAmb.map((v, i) => v * (1 + 0.9 * k) + [0.04, 0.04, 0.07][i] * k); e.sunCol = e.sunCol.map((v, i) => v + [0.08, 0.1, 0.16][i] * k); } };
  return null;
}

function update(dt, S, G, t) {
  const P = G.P, W = G.W(), hr = S.time % 24, night = hr > 20.2 || hr < 5.2;
  if (inHaran(S)) S.q.serve = Math.floor(serveMetric(S));
  if (S.step === 'j3_start' && (S.mounts || []).some(m => m.loan)) { if (G.P.ride && G.P.ride.m.loan) GG.Ride.dismount(true); dropLoan(S, G); G.UI.toast('이삭의 나귀는 브엘세바에 두고 지팡이 하나만 들고 떠나요 (창 32:10)'); }
  if (RT.bar && !BOSS.on && !GG.UI.busy()) bossBar(false);
  // ch1: goats into Isaac's pen
  if (S.step === 'j1_goats') for (const f of P.follow.slice()) { if (!/^goat[A-D]$/.test(f.id)) continue; if (Math.hypot(f.x + 22, f.z - 161.5) < 5.5) { G.npcFollow(f.id, false); (S.q.gin = S.q.gin || {})[f.id] = 1; S.q.goatsIn = (S.q.goatsIn || 0) + 1; G.addAnimal('isaacGoats', 'goat', f.d.pattern || 'plain', 0, 12); G.sfx('goat'); G.UI.toast(`염소가 우리로 들어갔다 (${S.q.goatsIn}/4)`); G.UI.quest(); G.checkStep(); } }
  // quests with followers
  const act = (S.side && S.side.act) || {};
  if (act.rachelLamb && G.npc('lostLamb') && G.npc('lostLamb').follow && Math.hypot(G.npc('lostLamb').x - 113, G.npc('lostLamb').z + 120.6) < 6) { G.removeNPC('lostLamb'); G.addAnimal('laban', 'sheep', 'plain', 0, 3); act.rachelLamb.home = 1; G.sfx('bleat'); G.UI.quest(); }
  if (act.rachelGraze && !act.rachelGraze.back) { const st = act.rachelGraze, fl = P.follow.filter(f => /^gs\d$/.test(f.id));
    if (!st.drank && fl.length && fl.every(f => Math.hypot(f.x - 43, f.z + 121) < 10)) { st.drank = 1; G.sfx('bleat'); GG.Life.bubble(fl[0].id, '매애~', 2); G.UI.toast('양들이 구유의 물을 마셨다'); G.UI.quest(); }
    if (st.drank && fl.length && Math.hypot(P.x - 113, P.z + 120.6) < 6) { fl.forEach(f => G.removeNPC(f.id)); st.back = 1; G.UI.quest(); }
    for (const f of fl) if (Math.hypot(f.x - P.x, f.z - P.z) > 30) { f.x = P.x - 2; f.z = P.z - 2; } }
  // night wolf raids on Laban's fold
  if (inHaran(S) && night && yr(S) >= 2 && G.dist(110, -125) < 130 && !GG.UI.busy()) { RT.raidT -= dt;
    if (RT.raidT <= 0) { RT.raidT = (built(S, 'hireShep') ? 150 : 80) * (S.q.wolfQ ? 0.6 : 1) * (0.7 + Math.random() * 0.6);
      const live = CB().wild().filter(a => a.raid && a.st !== 'dead' && a.st !== 'gone').length;
      if (live < 2) { const a0 = Math.random() * 6.28; const x = 113 + Math.cos(a0) * 46, z = -120 + Math.sin(a0) * 46; if (W.heightAt(x, z) > (W.water ? W.water.level + 0.2 : -9)) { const n = 1 + (Math.random() < 0.5 ? 1 : 0); for (let i = 0; i < n; i++) { const w = CB().spawn('wolf', x + i * 1.6, z + i, { zone: 'raid' }); w.raid = 1; } G.sfx('howl'); G.UI.toast('늑대가 라반의 양 떼를 노린다! 우리로 달려가세요'); } } } }
  for (const a of CB().wild()) { if (!a.raid || a.st === 'dead' || a.st === 'gone') continue;
    if (a.st === 'idle' || a.st === 'wander') { a.st = 'wander'; a.tx = 113; a.tz = -117; a.t = 8; const dx = 113 - a.x, dz = -117 - a.z, d = Math.hypot(dx, dz) || 1; a.x += dx / d * 1.6 * dt; a.z += dz / d * 1.6 * dt;
      if (d < 4.5) { if (G.removeAnimals('laban', 1)) G.UI.toast('늑대가 양 한 마리를 물어 갔다… (창 31:39)'); a.st = 'gone'; } }
    if (!night && a.st !== 'chase') a.st = 'gone'; }
  // tumbleweeds in the southern desert
  tumble(dt, S, G, t);
  // angels (dream & Mahanaim)
  if (S.q.dream || S.q.angels) {
    if (!RT.angels.length) for (let i = 0; i < (S.q.dream ? 10 : 8); i++) RT.angels.push({ rig: new Rig(HB), k: i / 10, sp: (i % 2 ? 1 : -1) * 0.028, mesh: G.lookMesh(LOOK.angel), st: { phase: 0, long: true, speed: 1.1 } });
    const by = W.heightAt(STAIR.x, STAIR.z);
    for (const a of RT.angels) { a.k = (a.k + a.sp * dt + 1) % 1; let x, y, z, face;
      if (S.q.dream) { const i = a.k * STAIR.n; x = STAIR.x + (a.sp > 0 ? 0.65 : -0.65); z = STAIR.z - i * STAIR.dz; y = by + 0.42 + Math.floor(i) * STAIR.dy; face = a.sp > 0 ? Math.PI : 0; }
      else { const ang = a.k * Math.PI * 2 * (a.sp > 0 ? 1 : -1); x = 178 + Math.cos(ang) * 9; z = 40 + Math.sin(ang) * 9; y = W.heightAt(x, z) + 0.2 + Math.sin(t * 2 + a.k * 9) * 0.15; face = ang + Math.PI / 2 * (a.sp > 0 ? 1 : -1); }
      a.st.phase += dt * 3; a.st.face = face; animHuman(a.rig, a.st, t); a.rig.update(m4trs(a.M || (a.M = m4()), x, y, z, face)); }
  } else if (RT.angels.length) RT.angels.length = 0;
  // following flock (ch8)
  if (S.q.flock) {
    if (!RT.flock.length) { const list = G.herd('jacob') ? G.herd('jacob').list : []; const n = Math.min(14, list.length); for (let i = 0; i < n; i++) { const a = list[Math.floor(i * list.length / n)]; RT.flock.push({ sp: a[0], rig: new Rig(AB[a[0]]), mesh: G.animalMesh(a[0], a[1], a[0] === 'camel' ? { saddle: 0xb3472e } : null), x: P.x - 4 - Math.random() * 6, z: P.z + Math.random() * 6 - 3, face: 0, ph: 0, off: [Math.random() * 7 - 3.5, -6 - Math.random() * 8] }); } }
    for (const f of RT.flock) { const tx = P.x - Math.sin(P.face) * (-f.off[1]) + Math.cos(P.face) * f.off[0], tz = P.z - Math.cos(P.face) * (-f.off[1]) - Math.sin(P.face) * f.off[0];
      const dx = tx - f.x, dz = tz - f.z, d = Math.hypot(dx, dz); let sp = 0; if (d > 0.6) { sp = Math.min(d * 1.4, 5.5); f.x += dx / d * sp * dt; f.z += dz / d * sp * dt; f.face += G.angDiff(f.face, Math.atan2(dx, dz)) * Math.min(1, dt * 5); } if (d > 40) { f.x = tx; f.z = tz; }
      f.ph += sp * dt * 3.5; animAnimal(f.rig, { speed: sp, phase: f.ph, graze: !sp && Math.sin(t + f.off[0]) > 0 }, t); f.rig.update(m4trs(f.M || (f.M = m4()), f.x, W.heightAt(f.x, f.z), f.z, f.face)); }
  } else if (RT.flock.length) RT.flock.length = 0;
  if (BOSS.on) bossUpdate(dt, S, G, t);
}
function tumble(dt, S, G, t) {
  const P = G.P, W = G.W(); const want = aridAt(P.x, P.z) > 0.45 && !S.q.dream ? 7 : 0;
  while (RT.tw.length < want) { const a = Math.random() * 6.28, r = 18 + Math.random() * 30; RT.tw.push({ x: P.x + Math.cos(a) * r - 25, z: P.z + Math.sin(a) * r, y: 0, vy: 0, rot: Math.random() * 6, s: 0.7 + Math.random() * 0.7, ph: Math.random() * 6 }); }
  if (!want) { RT.tw.length = 0; return; }
  for (let i = RT.tw.length - 1; i >= 0; i--) { const w = RT.tw[i]; const gust = 1.6 + Math.sin(t * 0.4 + w.ph) * 1.1 + Math.max(0, Math.sin(t * 1.3 + w.ph * 2)) * 1.4;
    w.x += gust * dt; w.z += Math.sin(t * 0.3 + w.ph) * 0.5 * dt; w.rot += gust * dt / (0.42 * w.s); const g = W.heightAt(w.x, w.z) + 0.42 * w.s; w.vy -= 14 * dt; w.y += w.vy * dt; if (w.y < g) { w.y = g; w.vy = Math.random() < 0.04 ? 2.5 + Math.random() * 2 : Math.abs(w.vy) * 0.25; }
    if (Math.hypot(w.x - P.x, w.z - P.z) > 60 || aridAt(w.x, w.z) < 0.3) RT.tw.splice(i, 1); }
}
let twMesh = null, stairMesh = null, stairM = null;
function skinned(list, S, G) {
  for (const a of RT.angels) list.push({ mesh: a.mesh, bones: a.rig.bones, emis: [0.55, 0.5, 0.35], outline: false });
  for (const f of RT.flock) { if (Math.hypot(f.x - G.CAM.x, f.z - G.CAM.z) < 0.9) continue; list.push({ mesh: f.mesh, bones: f.rig.bones, outline: true }); }
}
function dyn(list, S, G, t) {
  const W = G.W();
  if (S.q.dream) { if (!stairMesh) { const g = new GG.GB(4); for (let i = 0; i < STAIR.n; i++) g.box(2.6, 0.18, 0.5, { at: [0, 0.3 + i * STAIR.dy, -i * STAIR.dz], c: 0xfff0c0, j: 0 });
      for (let i = 0; i < STAIR.n; i += 3) for (const s of [1, -1]) g.cyl(0.06, 0.06, 1.6, 6, { at: [1.35 * s, 1.0 + i * STAIR.dy, -i * STAIR.dz], c: 0xffe6a0 });
      for (const s of [1, -1]) for (let i = 0; i < STAIR.n; i += 2) g.cyl(0.07, 0.07, Math.hypot(STAIR.dy, STAIR.dz) * 2.05, 5, { at: [1.35 * s, 1.75 + i * STAIR.dy + STAIR.dy, -i * STAIR.dz - STAIR.dz], rx: -Math.atan2(STAIR.dz, STAIR.dy), c: 0xfff4c8 });
      stairMesh = R.mesh(g); stairM = m4trs(m4(), STAIR.x, W.heightAt(STAIR.x, STAIR.z), STAIR.z, 0); } list.push({ mesh: stairMesh, m: stairM, emis: [0.55, 0.48, 0.25], shadow: false }); }
  if (S.flags.pillar) { if (!RT.pillar) { const g = new GG.GB(4); GG.env.pillar(g, m4()); RT.pillar = R.mesh(g); RT.pillarM = m4trs(m4(), SPOTS.sleep[0], W.heightAt(SPOTS.sleep[0], SPOTS.sleep[1] - 1), SPOTS.sleep[1] - 1, 0.3); } list.push({ mesh: RT.pillar, m: RT.pillarM, outline: true }); }
  else if (!between(S, 'j3_sleep')) { if (!RT.pstone) { const g = new GG.GB(4); g.sph(0.3, 7, 5, { s: [1.3, 0.8, 1], at: [0, 0.2, 0], c: 0xb8ac98, flat: true }); RT.pstone = R.mesh(g); RT.pstoneM = m4trs(m4(), SPOTS.pillow[0], W.heightAt(SPOTS.pillow[0], SPOTS.pillow[1]), SPOTS.pillow[1], 0); } list.push({ mesh: RT.pstone, m: RT.pstoneM, emis: S.step === 'j3_stone' ? [0.25, 0.2, 0.08] : null }); }
  if (!RT.wstone) { const g = new GG.GB(6); g.cyl(1.6, 1.7, 0.45, 14, { at: [0, 0.22, 0], c: 0xa89c88, flat: true }); RT.wstone = R.mesh(g); }
  const ws = S.flags.stoneRolled ? [48.5, -124.8] : [45, -125]; const wy = S.flags.stoneRolled ? W.heightAt(ws[0], ws[1]) : W.heightAt(45, -125) + 0.8;
  RT.wsM = m4trs(RT.wsM || m4(), ws[0], wy, ws[1], S.flags.stoneRolled ? 0.4 : 0, 0, S.flags.stoneRolled ? 0.1 : 0); list.push({ mesh: RT.wstone, m: RT.wsM, outline: true });
  if (S.step === 'j8_gift' && !S.q.gift) { if (!RT.post) { const g = new GG.GB(3); g.cyl(0.08, 0.1, 2, 6, { at: [0, 1, 0], c: 0x7a5a3a }); g.box(0.9, 0.5, 0.05, { at: [0, 1.7, 0.06], c: 0xd8c8a0 }); RT.post = R.mesh(g); } list.push({ mesh: RT.post, m: m4trs(RT.postM || (RT.postM = m4()), 182, W.heightAt(182, 46), 46, 0) }); }
  if (S.side && S.side.act && S.side.act.mandrakes && !G.have('mandrake')) { if (!RT.mand) { const g = new GG.GB(5); for (let i = 0; i < 7; i++) g.sph(0.12, 6, 4, { at: [Math.cos(i) * 0.22, 0.08, Math.sin(i) * 0.22], s: [1.6, 0.4, 0.7], ry: i, c: 0x5a8a3a }); for (let i = 0; i < 4; i++) g.sph(0.06, 6, 5, { at: [Math.cos(i * 1.6) * 0.1, 0.14, Math.sin(i * 1.6) * 0.1], c: 0xe8b830 }); RT.mand = R.mesh(g); } list.push({ mesh: RT.mand, m: m4trs(RT.mandM || (RT.mandM = m4()), 70, W.heightAt(70, -199), -199, 0), emis: [0.2, 0.16, 0.04] }); }
  if (RT.tw.length) { if (!twMesh) { const g = new GG.GB(9); GG.env.tumbleweed(g, m4trs(m4(), 0, -0.42, 0, 0), rng(9), 1); twMesh = R.mesh(g); }
    for (const w of RT.tw) list.push({ mesh: twMesh, m: m4trs(w.m || (w.m = m4()), w.x, w.y, w.z, Math.PI / 2, w.rot, 0, w.s, w.s, w.s), outline: true }); }
}

// ------------------------------------------------------------------ REGISTER
G.EP.jacob = {
  id: 'jacob', title: '야곱 편 · 이스라엘이 되기까지', hero: '야곱', sub: '창세기 25–33장',
  blurb: '발꿈치를 잡고 태어난 아이, 팥죽 한 그릇, 벧엘의 꿈, 하란에서의 이십 년. 집을 짓고 가축을 키우며 마을 사람들과 어울려 살다가, 얍복 강에서 이스라엘이 되기까지.',
  chapters: [{ t: '1장 · 팥죽 한 그릇', r: '창 25' }, { t: '2장 · 이삭의 축복', r: '창 27–28:5' }, { t: '3장 · 벧엘의 꿈', r: '창 28:10–22' }, { t: '4장 · 하란의 우물', r: '창 29:1–14' }, { t: '5장 · 라헬을 위한 칠 년', r: '창 29:15–30' },
    { t: '6장 · 열한 아들', r: '창 29:31–30:24' }, { t: '7장 · 점 있고 아롱진 양', r: '창 30:25–31:16' }, { t: '8장 · 얍복 강의 새벽', r: '창 31:17–33:16' }, { t: '에필로그 · 이스라엘의 장막', r: '창 33:17–20' }],
  spec: { size: SIZE, cell: 2, seed: 7, height, color, water: { level: -0.35, shallow: [0.36, 0.66, 0.62], deep: [0.12, 0.34, 0.4] } },
  build, npcs, pens, fields, sites, specials, shops, stations, spots: SPOTS, steps, talk, quests: QUESTS, chatter, approach, travelers, envx: ENVX,
  outfits: { default: LOOK.jacob, jacob: LOOK.jacob, esauGarb: LOOK.esauGarb, jacobH: LOOK.jacobH, israel: LOOK.israel },
  start: { step: 'j1_start', x: 18, z: 164, face: Math.PI * 0.9, time: 7.5, silver: 10, inv: {}, tools: {}, outfit: 'jacob' },
  recipes: ['hoe', 'staff', 'sickle', 'axe', 'hammer', 'shears', 'jar', 'rod', 'stew', 'bread', 'bbread', 'cheese', 'thread', 'cloth', 'linen', 'hay', 'grain', 'grainW', 'leather', 'roast', 'roastfish', 'roastfish2', 'roastfish3', 'arrow', 'fishrod', 'brick', 'oil', 'cloak'],
  rods: true, rain: 0.1, showStaff: true, sleepFrom: 16, titleCam: { x: 8, z: 166, r: 34, h: 9, ty: 1.5 }, titleTime: 17.4,
  mood, update, skinned, dyn, bounds, context, onDay, onLoad, canSleep, music, ledger, wildZones, wildOk, fishAt, aridAt, waterDist,
  timeScale: 1,
  villages, strangers, featAt, featText, onFeat, opening: OPENING, places: PLACES, roads: ROADS, roadD, rumors, worldFacts, villageChat, canBuild, quiet: quietEP, calmWeather, calmSurv,
  heroName: S => between(S, 'j8_esau') ? '이스라엘' : '야곱', settled: (x, z) => PADS.some(p => p.set && Math.hypot(x - p.x, z - p.z) < p.r + 10),
  rodPattern(sp, S) { const w = S.q.wage || []; const opts = sp === 'goat' ? w.filter(p => p !== 'brown') : w; if (!opts.length) return null; return Math.random() < 0.72 ? opts[Math.floor(Math.random() * opts.length)] : null; },
  birthDest(pen, baby, S) { if (pen.id !== 'laban' || !S.built.jacobFold || !S.q.wage) return pen.id; return S.q.wage.includes(baby[1]) ? 'jacob' : pen.id; },
  _dbg: { BOSS, RT },
  onKill(a, S, G) { if (a.special) G.UI.toast(`${a.name}을(를) 쓰러뜨렸다! 가까이 가서 손질하세요`); },
};
GG.NpcAI && GG.NpcAI.register(G.EP.jacob);
})(window.G);
