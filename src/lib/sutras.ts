export interface SutraVerse {
  korean: string
  chinese?: string
}

export interface Sutra {
  id: string
  title: string
  description: string
  verses: SutraVerse[]
}

export const SUTRAS: Sutra[] = [
  {
    id: 'heart-sutra',
    title: '반야심경',
    description: '반야바라밀다심경 - 260자로 불교의 핵심을 담은 경전',
    verses: [
      { korean: '관자재보살이 깊은 반야바라밀다를 행할 때', chinese: '觀自在菩薩 行深般若波羅蜜多時' },
      { korean: '오온이 공한 것을 비추어 보고', chinese: '照見五蘊皆空' },
      { korean: '일체의 고액을 건넜느니라.', chinese: '度一切苦厄' },
      { korean: '사리자여, 색이 공과 다르지 않고', chinese: '舍利子 色不異空' },
      { korean: '공이 색과 다르지 않으며', chinese: '空不異色' },
      { korean: '색이 곧 공이요 공이 곧 색이니', chinese: '色卽是空 空卽是色' },
      { korean: '수상행식도 이와 같으니라.', chinese: '受想行識 亦復如是' },
      { korean: '사리자여, 이 모든 법은 공하여', chinese: '舍利子 是諸法空相' },
      { korean: '나지도 멸하지도 않으며', chinese: '不生不滅' },
      { korean: '더럽지도 깨끗하지도 않으며', chinese: '不垢不淨' },
      { korean: '늘지도 줄지도 않느니라.', chinese: '不增不減' },
      { korean: '그러므로 공 가운데는 색이 없고', chinese: '是故空中無色' },
      { korean: '수상행식도 없으며', chinese: '無受想行識' },
      { korean: '눈, 귀, 코, 혀, 몸, 뜻도 없고', chinese: '無眼耳鼻舌身意' },
      { korean: '색, 소리, 냄새, 맛, 감촉, 법도 없으며', chinese: '無色聲香味觸法' },
      { korean: '눈의 세계도 없고 의식의 세계까지도 없으며', chinese: '無眼界 乃至無意識界' },
      { korean: '무명도 없고 무명이 다함까지도 없으며', chinese: '無無明 亦無無明盡' },
      { korean: '늙고 죽음도 없고 늙고 죽음이 다함까지도 없으며', chinese: '乃至無老死 亦無老死盡' },
      { korean: '고, 집, 멸, 도도 없고', chinese: '無苦集滅道' },
      { korean: '지혜도 없고 얻음도 없느니라.', chinese: '無智亦無得' },
      { korean: '얻을 것이 없는 까닭에', chinese: '以無所得故' },
      { korean: '보살은 반야바라밀다에 의지하므로', chinese: '菩提薩埵 依般若波羅蜜多故' },
      { korean: '마음에 걸림이 없고', chinese: '心無罣礙' },
      { korean: '걸림이 없으므로 두려움이 없어', chinese: '無罣礙故 無有恐怖' },
      { korean: '뒤바뀐 꿈같은 생각을 멀리 여의어', chinese: '遠離顚倒夢想' },
      { korean: '마침내 열반에 이르느니라.', chinese: '究竟涅槃' },
      { korean: '삼세의 모든 부처님도 반야바라밀다에 의지하므로', chinese: '三世諸佛 依般若波羅蜜多故' },
      { korean: '아뇩다라삼먁삼보리를 얻었느니라.', chinese: '得阿耨多羅三藐三菩提' },
      { korean: '그러므로 알라. 반야바라밀다는', chinese: '故知般若波羅蜜多' },
      { korean: '가장 신비로운 주문이며', chinese: '是大神呪' },
      { korean: '가장 밝은 주문이며', chinese: '是大明呪' },
      { korean: '가장 높은 주문이며', chinese: '是無上呪' },
      { korean: '무엇과도 견줄 수 없는 주문이니', chinese: '是無等等呪' },
      { korean: '능히 일체의 고통을 없애고', chinese: '能除一切苦' },
      { korean: '진실하여 허망하지 않느니라.', chinese: '眞實不虛' },
      { korean: '이제 반야바라밀다의 주문을 말하리라.', chinese: '故說般若波羅蜜多呪' },
      { korean: '아제아제 바라아제 바라승아제 모지사바하', chinese: '揭諦揭諦 波羅揭諦 波羅僧揭諦 菩提薩婆訶' },
    ],
  },
  {
    id: 'cheonsu',
    title: '천수경 (신묘장구대다라니)',
    description: '천수천안관세음보살의 대비주',
    verses: [
      { korean: '나모라 다나다라 야야' },
      { korean: '나막 알야 바로기제 새바라야' },
      { korean: '모지 사다바야 마하사다바야' },
      { korean: '마하 가로니가야' },
      { korean: '옴 살바 바예수 다라나 가라야' },
      { korean: '다사명 나막까리다바' },
      { korean: '이맘 알야 바로기제 새바라 다바' },
      { korean: '나막 조라 나막조라 지리니' },
      { korean: '시바라야 사바하' },
    ],
  },
  {
    id: 'diamond-sutra-key',
    title: '금강경 (핵심 구절)',
    description: '금강반야바라밀경 - 핵심 사구게 모음',
    verses: [
      { korean: '무릇 형상이 있는 것은 모두 허망하니', chinese: '凡所有相 皆是虛妄' },
      { korean: '만약 모든 형상이 형상 아닌 줄 보면', chinese: '若見諸相非相' },
      { korean: '곧 여래를 보리라.', chinese: '卽見如來' },
      { korean: '', chinese: '' },
      { korean: '마땅히 머무는 바 없이 그 마음을 내라.', chinese: '應無所住而生其心' },
      { korean: '', chinese: '' },
      { korean: '과거 마음도 얻을 수 없고', chinese: '過去心不可得' },
      { korean: '현재 마음도 얻을 수 없고', chinese: '現在心不可得' },
      { korean: '미래 마음도 얻을 수 없느니라.', chinese: '未來心不可得' },
      { korean: '', chinese: '' },
      { korean: '일체의 유위법은', chinese: '一切有爲法' },
      { korean: '꿈과 같고 환상과 같고', chinese: '如夢幻泡影' },
      { korean: '이슬과 같고 번개와 같으니', chinese: '如露亦如電' },
      { korean: '마땅히 이와 같이 관하라.', chinese: '應作如是觀' },
    ],
  },
  {
    id: 'namu-amitabul',
    title: '나무아미타불',
    description: '아미타불의 명호를 부르는 염불 수행',
    verses: [
      { korean: '나무아미타불 (南無阿彌陀佛)' },
      { korean: '' },
      { korean: '한없는 빛의 부처님께 귀의합니다.' },
      { korean: '한없는 수명의 부처님께 귀의합니다.' },
      { korean: '' },
      { korean: '아미타불의 48대원에 의지하여' },
      { korean: '일체 중생이 극락정토에 왕생하기를 발원합니다.' },
      { korean: '' },
      { korean: '원컨대 이 공덕으로' },
      { korean: '일체에 두루하여' },
      { korean: '우리와 중생이' },
      { korean: '다 함께 불도를 이루어지이다.' },
    ],
  },
  {
    id: 'om-mani',
    title: '옴마니반메훔',
    description: '관세음보살의 육자대명진언',
    verses: [
      { korean: '옴 마니 반메 훔 (唵嘛呢叭咪吽)' },
      { korean: '' },
      { korean: '옴 — 신구의 삼업을 청정케 하고' },
      { korean: '마 — 인욕을 성취하게 하며' },
      { korean: '니 — 지계를 성취하게 하고' },
      { korean: '반 — 정진을 성취하게 하며' },
      { korean: '메 — 선정을 성취하게 하고' },
      { korean: '훔 — 지혜를 성취하게 하나니' },
      { korean: '' },
      { korean: '이 여섯 글자에 육바라밀의 뜻이 모두 담겨 있느니라.' },
    ],
  },
]

// 만트라 목록 (염주용)
export const MANTRAS = [
  { id: 'namu-amitabul', label: '나무아미타불', text: '나무아미타불' },
  { id: 'om-mani', label: '옴마니반메훔', text: '옴 마니 반메 훔' },
  { id: 'namu-gwaneum', label: '나무관세음보살', text: '나무관세음보살' },
  { id: 'namu-jijang', label: '나무지장보살', text: '나무지장보살' },
]
