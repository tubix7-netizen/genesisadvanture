
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
