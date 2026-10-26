
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
