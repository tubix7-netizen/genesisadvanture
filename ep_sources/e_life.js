
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
