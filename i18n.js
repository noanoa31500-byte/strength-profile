// ═══════════════════════════════════════════════
// I18N — 多言語対応 (日本語 / English)
// ═══════════════════════════════════════════════

let currentLang = localStorage.getItem('strength_lang') || 'ja';

// ── 名称マッピング ────────────────────────────────
const VIA_NAME_EN = {
  '判断力':'Judgment','好奇心':'Curiosity','創造性':'Creativity',
  '向学心':'Love of Learning','大局観':'Perspective','勇敢さ':'Bravery',
  '忍耐力':'Perseverance','誠実さ':'Honesty','活力':'Zest',
  '愛情':'Love','親切心':'Kindness','社会的知性':'Social Intelligence',
  'チームワーク':'Teamwork','公平さ':'Fairness','リーダーシップ':'Leadership',
  '寛容':'Forgiveness','謙虚さ':'Humility','慎重さ':'Prudence',
  '自己制御':'Self-Regulation','感謝':'Gratitude',
};
const VIRTUE_EN = {
  '知恵':'Wisdom','勇気':'Courage','人間性':'Humanity',
  '正義':'Justice','節制':'Temperance','超越性':'Transcendence',
};
const BF_JA_TO_EN = {
  '開放性':'Openness','誠実性':'Conscientiousness','外向性':'Extraversion',
  '協調性':'Agreeableness','神経症傾向低':'Emotional Stability',
};

function getViaName(ja)    { return currentLang==='en' ? (VIA_NAME_EN[ja]||ja) : ja; }
function getVirtueName(ja) { return currentLang==='en' ? (VIRTUE_EN[ja]||ja)   : ja; }
function getBfName(ja)     { return currentLang==='en' ? (BF_JA_TO_EN[ja]||ja) : ja; }

// ── UI文字列 ─────────────────────────────────────
const UI_STRINGS = {
  ja: {
    badge:           'SCIENTIFIC ASSESSMENT · 40 QUESTIONS',
    heroTitle:       'あなたの<em>強み</em>を<br>科学で解き明かす',
    heroParagraph:   '心理学の2大フレームワーク「Big Five」と「VIA強み分類」を統合し、あなた固有の強みプロフィールを生成します。',
    startBtn:        '診断を始める →',
    startMeta:       '所要時間：約5分 · 40問',
    scaleLeft:       '全くそうでない',
    scaleRight:      '非常にそうだ',
    prevBtn:         '← 戻る',
    nextBtn:         '次へ →',
    kbdHint:         '<kbd>1</kbd>〜<kbd>5</kbd> で回答 &nbsp;·&nbsp; <kbd>Enter</kbd> で次へ &nbsp;·&nbsp; <kbd>←</kbd> で戻る',
    resultLogoSub:   '診断結果',
    copyLink:        'リンクをコピー',
    copyText:        'テキストをコピー',
    downloadImg:     '画像をDL',
    printPdf:        '印刷・PDF',
    retryBtn:        'もう一度診断する',
    retryConfirm:    '診断をリセットしてもう一度始めますか？',
    catchcopyLabel:  '— YOUR STRENGTH PROFILE —',
    restoreProgress: n => `途中の診断が保存されています（${n} / 40 問）`,
    restoreResult:   '以前の診断結果が保存されています',
    resumeBtn:       '続きから再開する',
    startFreshBtn:   '最初からやり直す',
    viewResultBtn:   '結果を見る',
    retryFromBtn:    'もう一度診断する',
    secConsistency:  'RELIABILITY SCORE · 診断の信頼性',
    secRadar:        'BIG FIVE · RADAR',
    secBigFive:      'BIG FIVE · DETAIL',
    secVia:          'VIA SIGNATURE STRENGTHS · TOP 5',
    secIntuition:    'INTUITION ANALYSIS · 直感 vs 熟考',
    secShadow:       'SHADOW SIDE ANALYSIS',
    secCitation:     'SCIENTIFIC BASIS',
    consistencyLabel:    '診断信頼性スコア',
    consistencyHigh:     'HIGH RELIABILITY',
    consistencyMod:      'MODERATE',
    consistencyLow:      'LOW',
    consistencyDescHigh: '回答の一貫性が高く、この結果はあなたの本質的な傾向を高精度で反映しています。',
    consistencyDescMod:  '概ね安定した回答が得られています。結果は参考値として信頼できます。',
    consistencyDescLow:  '一部の質問間で回答に乖離がみられます。もう一度診断すると精度が上がります。',
    intuitionIntro:  '各強みへの<em>回答速度</em>から、意識より先に「体が知っている直感的な強み」と、じっくり内省して自覚した「熟考型の強み」を分析します。反応が速いほど、その強みがあなたのアイデンティティに深く根付いています。',
    intuitionInsight:(fast,fSec,slow,sSec) =>
      `<strong>「${fast}」</strong>への反応が最も速く（${fSec}秒）、意識より先に体が知っている、あなたの最も本質的な強みです。`+
      (slow?` 一方、<strong>「${slow}」</strong>は時間をかけて内省してから回答しており（${sSec}秒）、自己認識が深い領域と言えます。`:''),
    badgeInstant:    '⚡ 直感的',
    badgeNormal:     '標準',
    badgeDeliberate: '🔍 熟考型',
    shadowIntro:     '強みはスコアが高いほど「過剰適用」のリスクも増す。以下は、あなたのトップ強みが<em>裏目に出るとき</em>のパターンと、その早期サインです。これは弱点ではなく、強みを意識的に扱うための地図です。',
    shadowHigh:      '強い発現リスク',
    shadowMid:       '要注意',
    shadowSignalLabel:'気づきのサイン',
    sigStrength:     'SIGNATURE STRENGTH',
    viaInstant:      '⚡ 直感的',
    viaWork:         '仕事',
    viaLearn:        '学習',
    viaRelation:     '人間関係',
    citationTitle:   '参考文献 · REFERENCES',
    soundtrackDesc:  'あなたのBig Fiveプロフィールから<br>リアルタイム生成したパーソナル音楽。外向性がテンポを、協調性がスケールを、開放性が音色を決める。',
    toastCopied:     'コピーしました ✓',
    toastCopiedLink: 'リンクをコピーしました ✓',
    toastNeedResult: '先に診断を完了してください',
    shareTitle:      '私の強みプロフィール',
    shareHashtags:   '#強み診断 #BigFive #VIA',
    profileFallback: (bf,via) => `<em>${bf}</em>の高さと<em>${via}</em>の強みを持つ、独自の強みプロフィール。`,
    radarLabels:     ['開放性','誠実性','外向性','協調性','安定性'],
  },
  en: {
    badge:           'SCIENTIFIC ASSESSMENT · 40 QUESTIONS',
    heroTitle:       'Discover your <em>strengths</em><br>through science',
    heroParagraph:   'Integrating two major psychological frameworks — Big Five and VIA Character Strengths — to generate your unique strength profile.',
    startBtn:        'Start Assessment →',
    startMeta:       'Approx. 5 min · 40 questions',
    scaleLeft:       'Strongly disagree',
    scaleRight:      'Strongly agree',
    prevBtn:         '← Back',
    nextBtn:         'Next →',
    kbdHint:         '<kbd>1</kbd>–<kbd>5</kbd> to answer &nbsp;·&nbsp; <kbd>Enter</kbd> to proceed &nbsp;·&nbsp; <kbd>←</kbd> to go back',
    resultLogoSub:   'RESULTS',
    copyLink:        'Copy Link',
    copyText:        'Copy Text',
    downloadImg:     'Download Image',
    printPdf:        'Print / PDF',
    retryBtn:        'Take Again',
    retryConfirm:    'Reset and start the assessment again?',
    catchcopyLabel:  '— YOUR STRENGTH PROFILE —',
    restoreProgress: n => `Saved progress found (${n} / 40 questions)`,
    restoreResult:   'A previous result is saved.',
    resumeBtn:       'Resume',
    startFreshBtn:   'Start over',
    viewResultBtn:   'View Result',
    retryFromBtn:    'Take Again',
    secConsistency:  'RELIABILITY SCORE',
    secRadar:        'BIG FIVE · RADAR',
    secBigFive:      'BIG FIVE · DETAIL',
    secVia:          'VIA SIGNATURE STRENGTHS · TOP 5',
    secIntuition:    'INTUITION ANALYSIS',
    secShadow:       'SHADOW SIDE ANALYSIS',
    secCitation:     'SCIENTIFIC BASIS',
    consistencyLabel:    'Reliability Score',
    consistencyHigh:     'HIGH RELIABILITY',
    consistencyMod:      'MODERATE',
    consistencyLow:      'LOW',
    consistencyDescHigh: 'Your responses are highly consistent, accurately reflecting your core personality traits.',
    consistencyDescMod:  'Your responses are fairly stable. The result is a reliable reference.',
    consistencyDescLow:  'Some inconsistencies detected. Retaking the assessment may improve accuracy.',
    intuitionIntro:  'By analyzing your <em>response time</em> for each strength, we identify strengths that resonate <em>intuitively</em> versus those reached through <em>deliberate introspection</em>. Faster responses indicate a strength more deeply rooted in your identity.',
    intuitionInsight:(fast,fSec,slow,sSec) =>
      `<strong>${fast}</strong> had the fastest response (${fSec}s) — your most core, instinctive strength.`+
      (slow?` Meanwhile, <strong>${slow}</strong> was answered more slowly (${sSec}s), reflecting conscious self-reflection.`:''),
    badgeInstant:    '⚡ Intuitive',
    badgeNormal:     'Normal',
    badgeDeliberate: '🔍 Deliberate',
    shadowIntro:     'Higher strength scores also raise the risk of "overuse." The following shows when your top strengths <em>backfire</em>, along with early warning signs. This is not a weakness — it\'s a map for using your strengths wisely.',
    shadowHigh:      'High Risk',
    shadowMid:       'Caution',
    shadowSignalLabel:'Warning Sign',
    sigStrength:     'SIGNATURE STRENGTH',
    viaInstant:      '⚡ Intuitive',
    viaWork:         'Work',
    viaLearn:        'Learning',
    viaRelation:     'Relationships',
    citationTitle:   'REFERENCES',
    soundtrackDesc:  'Your Big Five scores are mapped to musical parameters — Extraversion sets the tempo, Agreeableness the scale, Openness the timbre — generating a unique personal soundtrack in real time.',
    toastCopied:     'Copied ✓',
    toastCopiedLink: 'Link copied ✓',
    toastNeedResult: 'Please complete the assessment first',
    shareTitle:      'My Strength Profile',
    shareHashtags:   '#StrengthProfile #BigFive #VIA',
    profileFallback: (bf,via) => `A person with high <em>${bf}</em> and strong <em>${via}</em> — a unique strength profile.`,
    radarLabels:     ['Openness','Conscientiousness','Extraversion','Agreeableness','Stability'],
  },
};

function t(key) {
  const d = UI_STRINGS[currentLang];
  return (d && d[key] !== undefined) ? d[key] : (UI_STRINGS.ja[key] ?? key);
}

// ── 設問テキスト (英語) ───────────────────────────
const QUESTIONS_TEXT_EN = {
  1:  {text:'I enjoy thinking about new ideas and theories.',category:'BIG FIVE · OPENNESS'},
  2:  {text:'I find myself deeply interested in art, music, or literature.',category:'BIG FIVE · OPENNESS'},
  3:  {text:'I think about things from my own perspective, free from conventional wisdom.',category:'BIG FIVE · OPENNESS'},
  4:  {text:'Even in unfamiliar fields, I try to understand by researching on my own.',category:'BIG FIVE · OPENNESS'},
  5:  {text:'Once I commit to something, I try to see it through to the end.',category:'BIG FIVE · CONSCIENTIOUSNESS'},
  6:  {text:'I tend to make a plan before starting a task.',category:'BIG FIVE · CONSCIENTIOUSNESS'},
  7:  {text:'I place great importance on meeting deadlines and keeping promises.',category:'BIG FIVE · CONSCIENTIOUSNESS'},
  8:  {text:'When I find a small mistake, I cannot leave it alone.',category:'BIG FIVE · CONSCIENTIOUSNESS'},
  9:  {text:'I can quickly get along with people I have just met.',category:'BIG FIVE · EXTRAVERSION'},
  10: {text:'I feel energized when I am around a lot of people.',category:'BIG FIVE · EXTRAVERSION'},
  11: {text:'I actively express my opinions.',category:'BIG FIVE · EXTRAVERSION'},
  12: {text:'I get more done working alone than in a group.',category:'BIG FIVE · EXTRAVERSION'},
  13: {text:'When someone is in trouble, I naturally want to help.',category:'BIG FIVE · AGREEABLENESS'},
  14: {text:"I avoid conflict and respect the other person's perspective.",category:'BIG FIVE · AGREEABLENESS'},
  15: {text:"I am good at sensing other people's feelings and situations.",category:'BIG FIVE · AGREEABLENESS'},
  16: {text:'I take initiative to improve the atmosphere within a team.',category:'BIG FIVE · AGREEABLENESS'},
  17: {text:'Even after a failure, I can quickly bounce back emotionally.',category:'BIG FIVE · NEUROTICISM'},
  18: {text:'I can stay calm even under pressure.',category:'BIG FIVE · NEUROTICISM'},
  19: {text:'When criticized, I tend to get more discouraged than necessary.',category:'BIG FIVE · NEUROTICISM'},
  20: {text:'I tend to worry too much about the future.',category:'BIG FIVE · NEUROTICISM'},
  21: {text:'I enjoy thinking deeply to get to the root of a problem.',category:'VIA · WISDOM'},
  22: {text:"When I discover something I don't know, I want to learn more about it.",category:'VIA · WISDOM'},
  23: {text:'I find joy in coming up with and trying new approaches on my own.',category:'VIA · WISDOM'},
  24: {text:'Before consulting an expert, I first try to research it myself.',category:'VIA · WISDOM'},
  25: {text:'I prefer to grasp the overall flow and structure before taking action.',category:'VIA · WISDOM'},
  26: {text:'Even when there is a risk, I can step forward when I believe it is right.',category:'VIA · COURAGE'},
  27: {text:'Even in difficult situations, I can keep going without giving up.',category:'VIA · COURAGE'},
  28: {text:'Even when it is inconvenient, I honestly share my true feelings.',category:'VIA · COURAGE'},
  29: {text:'I commit fully to things I have decided to do.',category:'VIA · COURAGE'},
  30: {text:'I cherish deep, trustworthy relationships.',category:'VIA · HUMANITY'},
  31: {text:'I enjoy being helpful to others without expecting anything in return.',category:'VIA · HUMANITY'},
  32: {text:'I sometimes intuitively understand what others are thinking.',category:'VIA · HUMANITY'},
  33: {text:"I can put personal interests aside for the sake of the group's goals.",category:'VIA · JUSTICE'},
  34: {text:'I am conscious of treating everyone fairly.',category:'VIA · JUSTICE'},
  35: {text:'When a group is unsure, I naturally take on the role of showing direction.',category:'VIA · JUSTICE'},
  36: {text:"I forgive others' mistakes and do not hold grudges for long.",category:'VIA · TEMPERANCE'},
  37: {text:'I do not boast much about my own achievements.',category:'VIA · TEMPERANCE'},
  38: {text:'I think carefully before making decisions rather than acting impulsively.',category:'VIA · TEMPERANCE'},
  39: {text:'I can control my impulses and emotions.',category:'VIA · TEMPERANCE'},
  40: {text:'I tend to feel grateful for small things in everyday life.',category:'VIA · TRANSCENDENCE'},
};

// ── Big Five 情報 (英語) ──────────────────────────
const BIG_FIVE_INFO_EN = {
  O:{name:'Openness',        code:'OPENNESS',         desc:'Intellectual curiosity, creativity, and openness to new experiences. High scorers generate original ideas and have wide-ranging interests.'},
  C:{name:'Conscientiousness',code:'CONSCIENTIOUSNESS',desc:'Planning, self-discipline, and achievement drive. High scorers act steadily toward goals and build trust through reliability.'},
  E:{name:'Extraversion',    code:'EXTRAVERSION',     desc:'Sociability, assertiveness, and positive emotions. High scorers gain energy from social interaction and naturally energize those around them.'},
  A:{name:'Agreeableness',   code:'AGREEABLENESS',    desc:'Compassion, cooperation, and consideration for others. High scorers value relationships and strengthen team cohesion.'},
  N:{name:'Neuroticism',     code:'NEUROTICISM',      desc:'An indicator of emotional instability. Lower scores mean greater emotional stability and stress resilience. High sensitivity can also foster subtle perceptiveness.'},
};

// ── VIA 情報 (英語、英語名をキーに) ─────────────────
const VIA_INFO_EN = {
  'Judgment':{desc:'Analyzes information deeply and sees through to the essence without bias.',work:'Structures complex decisions using data and logic.',learn:'Forms hypotheses and tests them rather than accepting information at face value.',relation:'Provides fair, grounded perspectives as a trusted advisor.'},
  'Curiosity':{desc:'Actively seeks new experiences and knowledge with a spirit of exploration.',work:'Proactively adopts new technologies and drives innovation.',learn:'Interest across multiple fields creates unexpected connections and discoveries.',relation:'Genuine interest in others generates deep, meaningful dialogue.'},
  'Creativity':{desc:'Generates solutions that transcend existing frameworks with a unique perspective.',work:'Proposes creative solutions to unprecedented challenges.',learn:'Combines knowledge to build new concepts and models.',relation:"Opens new possibilities in any environment with unique ideas."},
  'Love of Learning':{desc:'A passion for systematically acquiring knowledge and skills.',work:'Continuous self-development keeps skills at the cutting edge.',learn:'Builds deep expertise steadily, developing genuine understanding.',relation:'Generously shares knowledge, inspiring those around them.'},
  'Perspective':{desc:'Grasps the big picture and thinks with a long-term outlook.',work:'Uses strategic vision to oversee entire projects and set direction.',learn:'Contextualizes individual knowledge pieces into larger systems.',relation:'Provides accurate insights and advice based on deep understanding.'},
  'Bravery':{desc:'Confronts difficulties, threats, and uncertainty without hesitation.',work:'Makes the right decisions without fear of risk, stepping into new challenges.',learn:'Accelerates growth by repeating trial and error without fear of failure.',relation:'Builds genuine trust by honestly conveying difficult truths.'},
  'Perseverance':{desc:'Keeps pursuing goals without giving up, even in the face of adversity.',work:'Steadily advances long-term projects and delivers reliable results.',learn:'Confronts difficult concepts persistently to achieve deep understanding.',relation:'Nurtures long-term relationships with sincere, sustained care.'},
  'Honesty':{desc:'Being true to yourself and conveying genuine feelings sincerely.',work:'Builds unshakable trust through transparent communication.',learn:'Honestly acknowledges weaknesses and converts them into energy for improvement.',relation:'Cultivates deep bonds by engaging authentically.'},
  'Zest':{desc:'Engages with things vividly and enthusiastically, full of energy and passion.',work:'Energetic actions inspire the team and generate momentum.',learn:'High motivation drives focused engagement that accelerates mastery.',relation:'Personal energy elevates the enthusiasm and motivation of those around them.'},
  'Love':{desc:'Nurtures and cherishes deep, meaningful human connections.',work:'Builds long-term partnerships grounded in trust.',learn:'Creates environments where people collaborate and grow together.',relation:"Forms deep bonds and becomes an irreplaceable presence in others' lives."},
  'Kindness':{desc:'Finds joy in helping others without expecting anything in return.',work:'Supports the team and elevates overall performance.',learn:'Generously shares knowledge and cultivates a culture of mutual growth.',relation:'Builds a circle of trust where people naturally support each other.'},
  'Social Intelligence':{desc:"Understands the emotions and motivations of yourself and others, and responds aptly.",work:'Reads the situation and achieves results through optimal communication.',learn:"Observes how others learn and applies insights to one's own style.",relation:"Intuitively provides the right support by attuning to others' emotions."},
  'Teamwork':{desc:"Never spares contribution for the sake of the group's goals.",work:'Combines diverse team strengths to maximize collective performance.',learn:"Deepens everyone's understanding through group learning.",relation:'Builds quality relationships centered on shared goals.'},
  'Fairness':{desc:'Treats everyone without prejudice and practices justice consistently.',work:'Provides objective, fair evaluation and judgment as an organizational foundation.',learn:'Evaluates diverse perspectives and theories fairly, cultivating broad vision.',relation:'Becomes a trusted presence for everyone through consistent impartiality.'},
  'Leadership':{desc:'Organizes groups, provides direction, and guides them toward goals.',work:'Sets a vision and powerfully guides the team toward achievement.',learn:'Leads learning groups to create effective shared learning environments.',relation:'Naturally becomes the central, organizing figure others rely on.'},
  'Forgiveness':{desc:"Forgives others' mistakes and keeps moving forward.",work:'Treats failures as learning opportunities, creating a positive workplace.',learn:'Maintains a mindset of trial and error without fear of mistakes.',relation:'Maintains good relationships long-term by not dwelling on the past.'},
  'Humility':{desc:'Does not show off achievements and always continues to learn.',work:"Openly receives others' opinions, realizing continuous improvement.",learn:'Honestly admits ignorance and maintains an attitude of constant learning.',relation:'Naturally cultivates a character admired by those around them.'},
  'Prudence':{desc:'Anticipates risks and makes decisions after careful consideration.',work:'Identifies potential problems in advance and minimizes risk.',learn:'Confirms accurate understanding while systematically acquiring knowledge.',relation:"Chooses words carefully for considerate dialogue that avoids hurting others."},
  'Self-Regulation':{desc:'Controls impulses and emotions according to the situation.',work:'Maintains calm judgment and consistent action without being swayed by emotions.',learn:'Continues learning as planned, resisting distractions and impulses.',relation:'Enables constructive communication without becoming emotional.'},
  'Gratitude':{desc:'Notices and feels grateful for the small good things in everyday life.',work:'Creates a positive workplace and continually boosts team morale.',learn:'Finds value in the learning opportunity itself, creating a fulfilling experience.',relation:'Expressing gratitude makes relationships deeper and warmer.'},
};

// ── Shadow Side (英語、英語名をキーに) ──────────────
const SHADOW_SIDE_EN = {
  'Judgment':{shadow:'Over-criticism',desc:"Analytical power can turn into 'fault-finding,' negating others' ideas. When the boundary between judgment and criticism collapses, others become reluctant to voice opinions.",signal:"Check whether 'but...' or 'that's wrong' reflexively comes to mind when hearing others' proposals."},
  'Curiosity':{shadow:'Scattered attention / superficiality',desc:"Interests spread too widely, moving to the next topic before deepening any one thing. 'Wanting to know everything' can turn into 'mastering nothing.'",signal:'Reflect on whether you repeatedly leave started projects or learning paths halfway through.'},
  'Creativity':{shadow:'Neglecting practicality',desc:"Finding pleasure in generating ideas, satisfied with ideation rather than execution. Ideas risk expanding indefinitely while ignoring real-world constraints.",signal:'Compare the number of ideas you have with the number of things you have actually completed.'},
  'Love of Learning':{shadow:'Prioritizing learning over action',desc:"The stance of 'moving after sufficient understanding' can extend preparation indefinitely. Knowledge accumulation becomes an end in itself, delaying the leap into practice.",signal:"Notice how often you say 'just a little more studying first.'"},
  'Perspective':{shadow:'Missing the details',desc:"Emphasizing the big picture can lead to overlooking details and steps needed for execution. The assumption 'they should understand this' creates communication gaps.",signal:'Develop a habit of checking whether others share the same assumptions you take for granted.'},
  'Bravery':{shadow:'Recklessness / underestimating risk',desc:"The power to confront difficulties can lead to skipping risk assessment, involving others unnecessarily in risks.",signal:"Before deciding, stop and ask: 'Is this courage, or is it insufficient preparation?'"},
  'Perseverance':{shadow:'Stubbornness / inability to cut losses',desc:"Tenacity can become 'clinging to the wrong direction.' Unable to change course when circumstances shift, continuously deferring the decision to stop.",signal:"Separate whether you're continuing because it's 'right' or because 'stopping feels scary.'"},
  'Honesty':{shadow:'Bluntness without consideration',desc:"Low resistance to conveying true feelings leads to stating candid opinions without reading timing or the atmosphere.",signal:"Distinguish between 'what should be said honestly' and 'whether this is the right time to say it.'"},
  'Zest':{shadow:'Impulsiveness / burnout',desc:'Diving in with high energy can mean starting to move before thinking deeply. Trying to always run at full throttle leads to exhaustion and risk of sudden burnout.',signal:"Reflect on whether your activity design includes not just 'intensity' but 'sustainability.'"},
  'Love':{shadow:'Dependency / loss of boundaries',desc:"Cherishing deep bonds can blur the boundary between self and others. Excessive consideration or dependency can hinder mutual independence.",signal:"Check whether things done 'for the other person' contain some that are actually relieving your own anxiety."},
  'Kindness':{shadow:'Self-sacrifice / risk of exploitation',desc:"The tendency to act whenever asked depletes your own resources. There is also risk of being taken advantage of by those who treat goodwill as a given.",signal:"Check whether you can distinguish between 'doing it because I want to' and 'doing it because I can't refuse.'"},
  'Social Intelligence':{shadow:'Over-accommodation / suppressing true feelings',desc:"Too strong an ability to read the atmosphere unconsciously suppresses your own opinions and emotions. Continuously responding to 'what others want' gradually erodes the self.",signal:'Try to recall a recent situation where you swallowed something you truly thought without saying it.'},
  'Teamwork':{shadow:'Loss of agency / individual voice',desc:"High adaptability to acting for the group leads to too closely following the group's intentions, deferring your own judgment.",signal:"Consciously make time to ask yourself — separate from the team — 'What do I personally want?'"},
  'Fairness':{shadow:'Rigid inflexibility',desc:"Applying the same rules to everyone can make flexible responses to individual circumstances difficult. When 'fair' becomes 'uniform,' it may ironically hurt someone.",signal:"Ask whether 'following the rules' and 'doing what's right for this person' currently align."},
  'Leadership':{shadow:'Control / micromanagement',desc:"The power to set direction can shift to insistence on one's own approach, taking away others' discretion. When 'pulling forward' becomes 'controlling,' the team loses its autonomy.",signal:"Compare the proportion of decisions you're making with the proportion of the team acting autonomously."},
  'Forgiveness':{shadow:'Lack of self-protection',desc:"Too strong a capacity to forgive can mean repeatedly accepting the same harm. 'Forgiving' and 'setting boundaries' can coexist, but forgetting the latter leaves the self unprotected.",signal:'Reflect on whether the same problem keeps recurring with the person you have forgiven.'},
  'Humility':{shadow:'Suppressing self-assertion / self-deprecation',desc:"Not putting achievements forward can result in failing to receive fair evaluation. Humility can also slide into the feeling that 'I have no value.'",signal:'Check whether resistance to communicating your contributions has turned into giving up on recognition.'},
  'Prudence':{shadow:'Decision paralysis / missed opportunities',desc:"The power to anticipate risks can become 'continuing to imagine the worst outcome,' perpetually delaying action. Since preparation can never be perfect, one may fall into permanent inaction.",signal:"Check how many weeks or months you've been feeling 'not quite ready yet.'"},
  'Self-Regulation':{shadow:'Emotional suppression / lack of flexibility',desc:"High ability to control emotions can lead to pushing emotions inward as 'things that must not come out.' Long-term, this leads to psychological exhaustion and an impression of 'coldness.'",signal:'Try to remember the last time you expressed your feelings openly and honestly.'},
  'Gratitude':{shadow:'Status quo bias / difficulty seeing problems',desc:"An attitude of gratitude can tip toward 'the current situation is enough,' making it hard to face problems that should be improved. When 'thankful' becomes 'this is fine,' the motivation for growth fades.",signal:"Ask whether hidden within what you're grateful for is something you actually want to change."},
};

// ── データ取得ヘルパー ────────────────────────────
function getQuestionTranslation(id) {
  if (currentLang === 'en') {
    const en = QUESTIONS_TEXT_EN[id];
    if (en) return en;
  }
  const q = QUESTIONS.find(q => q.id === id);
  return {text: q?.text || '', category: q?.category || ''};
}

function getBigFiveInfoForLang() {
  return currentLang === 'en' ? BIG_FIVE_INFO_EN : BIG_FIVE_INFO;
}

function getViaInfoForLang(jaName) {
  if (currentLang === 'en') {
    const enName = VIA_NAME_EN[jaName] || jaName;
    return VIA_INFO_EN[enName] || VIA_INFO[jaName] || {};
  }
  return VIA_INFO[jaName] || {};
}

function getShadowForLang(jaName) {
  if (currentLang === 'en') {
    const enName = VIA_NAME_EN[jaName] || jaName;
    return SHADOW_SIDE_EN[enName] || SHADOW_SIDE[jaName] || {};
  }
  return SHADOW_SIDE[jaName] || {};
}

// ── 言語切替 ─────────────────────────────────────
function applyStaticTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (typeof val === 'string') el.innerHTML = val;
  });
  document.title = currentLang === 'en'
    ? 'Scientific Strength Profile'
    : '科学的強み診断 | Strength Profile';
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('strength_lang', lang);
  document.documentElement.lang = lang;
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  applyStaticTranslations();
  // 画面ごとに再描画
  const quizActive   = document.getElementById('screen-quiz')?.classList.contains('active');
  const resultActive = document.getElementById('screen-result')?.classList.contains('active');
  if (quizActive) {
    renderQuestion();
  } else if (resultActive && window._currentResult) {
    showResult(window._currentResult);
  } else {
    updateRestoreNotice();
  }
}
