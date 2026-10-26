
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
