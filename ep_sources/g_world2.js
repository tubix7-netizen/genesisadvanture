
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
