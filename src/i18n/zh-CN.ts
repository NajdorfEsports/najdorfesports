/**
 * Simplified Chinese (zh-CN).
 *
 * Hand-written using established Overwatch / OWCS community terminology.
 * The OWCS Pacific broadcast itself uses English branding, so we keep
 * "OWCS Pacific" and proper-noun stage names in Latin script. Brand names,
 * team names, player handles, and ${var} interpolations stay as-is.
 *
 * Native speakers, please PR fixes. The dict shape is enforced by
 * `Strings` from ./en, so the type checker will catch missing keys.
 */
import type { Strings } from './en';

export const zhCN: Strings = {
  nav: {
    home: '首页',
    roster: '名单',
    matches: '赛程',
    news: '新闻',
    coaching: '教练课程',
    games: '游戏',
    about: '关于',
  },
  footer: {
    site: '网站',
    follow: '关注',
    foundedLine: (year, region) => `${year} 年成立 · ${region}`,
    trademark: 'Overwatch 与 Overwatch Champions Series 为 Blizzard Entertainment, Inc. 的商标。',
    copyright: (year, name) => `© ${year} ${name}。版权所有。`,
    dataCredit: '数据来源：Liquipedia · CC BY-SA 3.0',
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    achievement: (placement, event) => `${event} ${placement}。`,
    tagline: '备战 6 月 4 日开打的 OWCS Pacific 第二阶段。',
    matchSchedule: '查看赛程',
    meetRoster: '认识选手',
  },
  home: {
    recentResults: '近期战绩',
    recentEmpty: '暂无比赛结果。第二阶段 6 月 4 日开打。',
    allMatches: '所有比赛',
    nextMatchLabel: '下一场比赛',
    // DRAFT PENDING RIRI NATIVE REVIEW
    matchCenterHeading: '赛事中心',
    latest: '最新消息',
    allNews: '所有新闻',
    read: '阅读',
  },

  pageMeta: {
    homeTitle: 'Najdorf Esports | OWCS Pacific Overwatch 战队',
    homeDescription:
      'Najdorf Esports 是一支位于太平洋赛区的 Overwatch 战队，目前征战 OWCS Pacific。',
    aboutTitle: '关于 Najdorf Esports',
    aboutDescription:
      'Najdorf Esports 是一支征战 OWCS 亚太赛区的《守望先锋》电竞组织。了解我们的故事，并与我们合作。',
    coachingTitle: 'Overwatch 教练课程',
    // DRAFT PENDING RIRI NATIVE REVIEW
    coachingDescription:
      '与 Najdorf Esports OWCS Pacific 名单选手 brysonbtw 进行一对一《守望先锋》教学。提供单节与多节课程方案，预约时可使用信用卡或 PayPal 安全付款。',
    rosterDescription: (headcount, countries) =>
      `Najdorf Esports 现役 OWCS Pacific 名单，共 ${headcount} 名选手，来自 ${countries.join('、')}。`,
    gamesTitle: '游戏',
    // DRAFT PENDING RIRI NATIVE REVIEW (gamesDescription update + OWdle meta)
    gamesDescription:
      'Najdorf Esports 的每日《守望先锋》小游戏：三种难度的每日迷你填字，以及每日猜英雄游戏 OWdle。',
    crosswordTitle: '每日 Overwatch 迷你填字',
    crosswordDescription:
      'Najdorf Esports 免费的每日《守望先锋》迷你填字游戏。三种难度，美东时间午夜更新，无广告、无跟踪。',
    owdleTitle: 'OWdle：每日 Overwatch 猜英雄游戏',
    owdleDescription:
      '从定位、出身、生命值、攻击类型等线索猜出隐藏的《守望先锋》英雄。Najdorf Esports 的免费每日游戏，无广告、无跟踪。',
    // DRAFT PENDING RIRI NATIVE REVIEW (Gambit meta)
    gambitTitle: 'Gambit：每日生存 Roguelite',
    gambitDescription:
      'Gambit 是 Najdorf Esports 推出的免费国际象棋主题生存 Roguelite。撑过敌潮、升级并打造你的 build。每日新的固定种子对局，无广告、无跟踪。',
  },

  news: {
    eyebrow: '新闻',
    heading: '来自战队',
    backToAll: '所有新闻',
    metaDescription:
      '来自 Najdorf Esports 的公告、选手变动与赛事回顾。我们是一支征战 OWCS Pacific 的《守望先锋》战队，在此阅读战队的最新消息。',
  },
  roster: {
    eyebrow: '现役名单 · OWCS Pacific 2026',
    h1: '出战阵容',
    playersLabel: '选手',
    regionLabel: '赛区',
    fullRoster: '完整名单',
    countryLabel: '国家',
    countriesLabel: '国家',
    recordLabel: '战绩',
  },
  about: {
    eyebrow: '关于',
    heroTagline: '在 OWCS Pacific，以纪律驾驭进攻。',
    storyHeading: '故事',
    story1:
      'Najdorf Esports 是一支征战《守望先锋》冠军系列赛（OWCS）亚太赛区的电竞组织。我们的队名取自国际象棋西西里防御中的纳道夫变例，这是国际象棋最锋利的开局之一：建立在深厚的准备之上，始终争取主动，并敢于从多数人只会选择防守的局面发动进攻。这正是我们对待《守望先锋》的方式。',
    story2:
      '我们在 2026 赛季第二阶段前，收购了原本以 Rankers 名义征战的选手阵容，正式进入 OWCS Pacific。该阵容曾以 Rankers 之名赢得 2026 OWCS Pacific 第一阶段公开预选赛。第二阶段是这支队伍以 Najdorf 名义征战的首个阶段，也是我们计划一个阶段接着一个阶段稳步建立的长期征程的起点。',
    teamHeading: '队伍',
    teamBody:
      '我们的阵容汇聚了来自香港、台湾、韩国与中国等地的选手，并由专职的教练与管理团队提供支持。',
    rosterLink: '查看当前的选手阵容',
    partnersHeading: '合作',
    partners1:
      'Najdorf Esports 正在 OWCS Pacific 建立长久的存在感，我们欢迎愿意与我们共同成长的合作伙伴。我们的核心选手来自香港、台湾与中国大陆，这使我们能够触及粤语与普通话的《守望先锋》观众，而这正是目前赛区转播尚未以其母语服务的一群人。对于希望与亚太地区中文电竞社区建立联系的品牌而言，这是少有电竞组织能够提供的机会。',
    partners2:
      '我们可以与合作伙伴在多方面合作：在各个频道上的品牌曝光、与选手共同创作内容，以及围绕 OWCS 赛季打造的品牌活动。若您有意洽谈合作，我们很乐意交流。',
    contactHeading: '联系',
    contactLabel: '合作与媒体：',
  },

  // DRAFT PENDING RIRI NATIVE REVIEW (entire coaching block below)
  coaching: {
    hero: {
      eyebrow: '教练课程',
      heading: 'Najdorf Esports Overwatch 教练课程',
      subheading: '与我们 OWCS 亚太名单的选手进行一对一训练。学会赢得比赛所需的站位、习惯与判断。',
      cta: '认识教练',
    },
    browse: {
      heading: '认识教练',
      lede: '选择一位教练，挑选你的付款方式，然后预约你的第一节课。',
      viewSessions: '查看课程',
      filtersLabel: '筛选教练',
      filterRole: '位置',
      filterLanguage: '语言',
      filterHero: '英雄',
      allRoles: '所有位置',
      allLanguages: '所有语言',
      allHeroes: '所有英雄',
      noMatch: '目前没有符合这些筛选条件的教练。更多教练即将加入。',
      coachAria: (name, role) => `${name}，${role}`,
    },
    coach: {
      specialtiesLabel: '代表英雄',
      languagesLabel: '语言',
      langCantonese: '粤语',
      langMandarin: '普通话',
    },
    booking: {
      heading: (name) => `预约 ${name} 的课程`,
      paymentHeading: '你想如何付款？',
      paymentStep: '步骤 1',
      sessionsHeading: '选择课程',
      sessionsStep: '步骤 2',
      payCard: '信用卡付款',
      payPaypal: '以 PayPal 付款',
      comingSoon: '即将推出',
    },
    offerings: {
      book: '预约',
      securedNote: '预约时可使用信用卡或 PayPal 安全付款。我们不会看到你的付款信息。',
      packNote: '课程包在预约时一次付清。你现在先预约第一节，其余节数与你的教练在 Discord 上安排。',
      durationLabel: (sessions, minutes) =>
        sessions === 1 ? `${minutes} 分钟` : `${sessions} 节 x ${minutes} 分钟`,
      items: {
        single: {
          title: '单节课程',
          blurb: '一节 60 分钟的教学课程。预约时段并支付 $15。',
          badge: '',
        },
        pack2: {
          title: '2 节课程包',
          blurb: '两节 60 分钟课程，共 $25（每节 $12.50）。',
          badge: '省 $5',
        },
        pack4: {
          title: '4 节课程包',
          blurb: '四节 60 分钟课程，共 $50（每节 $12.50）。',
          badge: '省 $10',
        },
      },
    },
    how: {
      heading: '流程说明',
      step1Title: '选择并预约',
      step1Body: '选择一位教练与付款方式，再为你的第一节课挑选一个开放的时段。',
      step2Title: '安全付款',
      step2Body: '以信用卡或 PayPal 安全付款。课程包于预约时一次付清全额。',
      step3Title: '在 Discord 联系',
      step3Body:
        '在结账时填写你的 Discord 账号。我们会把它转交给你的教练，教练会在 Discord 上加你，安排上课。课程包的其余节数与任何改期，都直接在 Discord 上与你的教练安排。',
      step4Title: '分享反馈',
      step4Body: '课程结束后，我们会通过电子邮件发送一份简短的私下反馈邀请，让我们持续改进教学。',
    },
    faq: {
      heading: '常见问题',
      q1: '课程包的节数如何运作？',
      a1: '你在预约时一次付清整个课程包的费用。第一节课通过日历预约，之后其余节数由你直接在 Discord 上与教练安排。',
      q2: '我要如何进入课程？',
      a2: '预约确认后，我们会把你的 Discord 账号转交给你的教练，教练会在 Discord 上加你以安排课程。请在结账时填写你的 Discord 账号，以便教练联系你。',
      q3: '我要如何付款？付款安全吗？',
      a3: '你可以在预约时以信用卡或 PayPal 付款。款项由付款服务商安全处理，我们不会看到你的付款信息。',
      q4: '我需要准备什么？',
      a4: '一个 Overwatch 账号与一个 Discord 账号。最好也带上一场近期惜败的录像，因为这类比赛最适合用来学习。',
      q5: '我可以改期吗？',
      a5: '可以。改期由你与教练直接在 Discord 上安排，请尽量提前通知你的教练。',
      q6: '有哪些语言可选？',
      a6: '课程提供粤语与普通话。',
      q7: '你们的退款政策是什么？',
      a7: '课程采用预先付款，恕不退款。若你无法出席，可免费改期：请尽量提前在 Discord 上通知你的教练。',
    },
    help: {
      text: '预约前还有疑问吗？',
      discordCta: '在 Discord 询问我们',
      emailIntro: '想用电子邮件吗？来信至',
    },
  },

  partners: {
    eyebrow: '合作伙伴',
    title: '与 Najdorf Esports 合作',
    intro:
      'Najdorf Esports 是一支征战 OWCS Pacific 的独立《守望先锋》战队。我们在第二阶段前接手了 Rankers 的阵容，并以此为起点，打造一支登上 OWCS Pacific 官方转播的区域型队伍。',
    standing:
      '我们仍在起步阶段，与其夸大，不如把话说清楚。这套阵容在 OWCS Pacific 第一阶段（代表 Rankers）拿下第 3 名，目前正在第二阶段主赛事中。以下是我们以现有规模能真正提供的内容。',
    offerHeading: '我们能提供什么',
    offerNote:
      '我们是一支观众持续增长的新战队，而非一线联盟战队。以下是我们今天就能交付的权益，并会随着我们成长而扩大。',
    offerJersey: {
      title: '球衣与队服露出',
      body: '在 OWCS Pacific 转播与 LAN 现场，将您的标志放上队伍球衣与选手队服。',
    },
    offerBroadcast: {
      title: '转播与共同直播露出',
      body: '在通过联盟转播审核后，于我们的共同直播与内容中提供标志与提及。',
    },
    offerDiscord: {
      title: 'Discord 置顶露出',
      body: '在我们的社群 Discord（队伍与粉丝于赛间聚集之处）提供置顶版位与提及。',
    },
    offerLogo: {
      title: '官网标志露出',
      body: '在本网站的合作伙伴专区放上您的标志与链接。',
    },
    offerSocial: {
      title: '社交媒体提及',
      body: '在赛事与公告前后，由官方 X 账号发布标注与宣传帖子。',
    },
    foundingHeading: '创始伙伴名额开放中',
    foundingBody:
      '我们目前尚无任何伙伴，而这是刻意为之：创始名额正开放中。我们不会放上占位用的标志或虚构品牌。如果您想成为球衣上的第一个名字，欢迎与我们联系。',
    contactHeading: '联系我们',
    contactResponse: '我们会在 24 至 48 小时内回复。',
    metaDescription:
      'Najdorf Esports（征战 OWCS Pacific 的《守望先锋》战队）的合作与赞助咨询。创始伙伴名额开放中。',
  },

  press: {
    eyebrow: '媒体',
    title: '媒体与品牌素材包',
    intro: '报道或介绍 Najdorf Esports 所需的一切。采访或本页未涵盖的事项，请来信至',
    assetsHeading: '品牌素材',
    assetsNote:
      '请为主教标志保留足够留白，不要更改其颜色（标志严格采用黑白），也不要拉伸或旋转。文字标志可使用品牌蓝，或在深色背景上使用白色。',
    downloadHeading: '标志文件',
    colorsHeading: '品牌色',
    colorPrimary: '主色',
    colorSecondary: '辅色',
    colorBackground: '背景',
    factHeading: '基本资料',
    factOrg: '组织',
    factFounded: '成立',
    factRegion: '赛区',
    factGame: '游戏',
    factRoster: '阵容',
    factResults: '主要成绩',
    teamHeading: '团队',
    ownerRole: '负责人',
    ownerBody: '创办人兼经营者。Najdorf Esports 由个人独立拥有并经营，对外以组织名义而非个人身份。',
    marksHeading: '商标的合理使用',
    marksBody:
      '您可以使用 Najdorf Esports 的名称与标志来报道或提及本组织。请勿更改标志、暗示我们未曾宣布的合作或背书，或以误导方式使用我们的商标。Overwatch 与 OWCS 相关商标属于 Blizzard Entertainment；详见我们的使用条款。',
    metaDescription: 'Najdorf Esports 的媒体与品牌素材包：品牌素材、基本资料与联系方式。',
  },
  community: {
    eyebrow: '加入社群',
    headline: '与战队同行。',
    body: '没有算法干扰，只有战队本身。赛间在 Discord 同乐，在 X 抢先看到公告，并在 Twitch 与 YouTube 观看比赛与集锦。',
    discordCta: '加入 Discord',
    xCta: '在 X 上关注',
    twitchCta: '在 Twitch 观看',
    youtubeCta: '在 YouTube 订阅',
    members: '位成员',
    followers: '位粉丝',
  },

  highlights: {
    eyebrow: '精彩集锦',
    heading: '比赛集锦',
    comingSoon: '集锦即将上线',
    loadVideo: '播放集锦',
    loadNote: '加载后将从 YouTube 播放，并由 Google 设置其 cookies。',
    // DRAFT PENDING RIRI NATIVE REVIEW (the four placeholder strings below)
    placeholderTitle: '更多集锦即将上线',
    placeholderBody: (opponent: string, date: string) =>
      `对阵 ${opponent} 的集锦将于赛后上线（${date}）。`,
    placeholderBodyEmpty: '下一场系列赛的集锦将于赛后上线。',
    subscribeCta: '订阅 YouTube 频道',
  },
  live: {
    liveNow: '直播中',
    startsIn: '即将开始',
    vs: '对战',
    watchNow: '立即观看',
    openOnTwitch: '在 Twitch 打开',
    loadPlayer: '加载 Twitch 播放器',
    loadPlayerNote: '加载后 Twitch 将在您的设备上设置自己的 cookies。',
  },

  roles: {
    Tank: '坦克',
    DPS: '输出',
    Support: '辅助',
    Flex: '自由人',
    Coach: '教练',
    Manager: '经理',
  },

  regions: {
    Pacific: '太平洋',
  },

  owcsBadge: {
    liveLabel: '进行中',
    badgeLine: (startMonthDay, endMonthDayYear) =>
      `OWCS Pacific 第二阶段主赛事：${startMonthDay} ~ ${endMonthDayYear}`,
    descriptor: 'OWCS Pacific · 第二阶段 · 2026',
  },

  rosterStrip: {
    activeRoster: '现役名单',
    countLine: (players, countries, coaches) => {
      const parts = [`${players} 名选手`, `${countries} 个国家`];
      if (coaches > 0) parts.push(`${coaches} 名教练`);
      return parts.join(' · ');
    },
    fullRoster: '完整名单',
  },

  achievement: {
    recentResults: '近期战绩',
    ariaLabel: '战绩',
    placementLabel: (placement) => `名次：${placement}`,
  },

  watch: {
    eyebrow: '观看渠道',
    heading: 'OWCS Pacific 官方转播',
    cardAriaLabel: (name, language, platform) => `${name}，在 ${platform} 上的${language}转播`,
  },

  nextMatch: {
    eyebrow: (tournament) => `下一场比赛 · ${tournament}`,
    vs: (opponent) => `对战 ${opponent}`,
    eyebrowEmpty: '下一场比赛',
    placeholderHeadline: 'OWCS Pacific 第二阶段 · 2026 年 6 月 4 日',
    placeholderBody: '对阵表确定后，赛程将公告于此。',
    watchLive: '观看直播',
    days: '天',
    hours: '时',
    min: '分',
    sec: '秒',
  },

  match: {
    vs: (opponent) => `对战 ${opponent}`,
    watch: '观看',
    watchVod: '观看回放',
    broadcastPeak: (n) => `OWCS Pacific 直播峰值 ${n}`,
    tbd: '待定',
    win: '胜',
    loss: '负',
    // DRAFT PENDING RIRI NATIVE REVIEW
    mapByMap: '逐图战况',
  },

  reach: {
    eyebrow: '直播触达',
    peakLabel: '峰值同时观众',
    context: (opponent) => `在 OWCS Pacific 对战 ${opponent} 的官方直播中。`,
    cta: '查看比赛',
  },

  matches: {
    metaDescription: (league) =>
      `Najdorf Esports 在 ${league} 第二阶段的即将赛程与近期战绩。完整赛程、地图比分、对手信息，以及每场系列赛的观赛链接。`,
    eyebrow: (league, year) => `赛程 · ${league} ${year}`,
    upcoming: '即将开打',
    recordLabel: '战绩',
    record: (wins, losses) => `${wins} 胜 ${losses} 负`,
    // Verbatim fragments of the reviewed `record` string above (no new
    // wording), split so the /matches header can color the two halves.
    recordWins: (wins) => `${wins} 胜`,
    recordLosses: (losses) => `${losses} 负`,
    recordJoin: ' ',
    pastResults: '过往战绩',
    attribution: {
      before: '赛事数据来自 ',
      between: '，并依 ',
      after: ' 授权发布。赛程每周更新。',
    },
  },

  matchEmpty: {
    upcoming: (league, stage, startDate) =>
      `目前暂无即将进行的比赛。${league} ${stage}主赛事将于 ${startDate} 开打。`,
    past: (stage) => `目前暂无已完成的比赛。${stage}主赛事开打后，战绩将显示于此。`,
  },

  ticker: {
    // DRAFT PENDING RIRI NATIVE REVIEW (2026-06 ticker reorganization: rubrics + badges)
    results: (stage, record) => `${stage ? `${stage}战绩` : '战绩'}${record ? ` · ${record}` : ''}`,
    upNext: (stage) => (stage ? `即将开赛 · ${stage}` : '即将开赛'),
    upcoming: (date, opponent) => `${date} · 对战 ${opponent}`,
    result: (opponent, date) => `${opponent} · ${date}`,
    tbd: (opponent, date) => `对战 ${opponent} · ${date}`,
    winBadge: (score) => (score ? `胜 ${score}` : '胜'),
    lossBadge: (score) => (score ? `负 ${score}` : '负'),
    fallback: 'OWCS Pacific 第二阶段主赛事将于 2026 年 6 月 4 日开打。',
    ariaLabel: '赛事跑马灯',
  },

  player: {
    twitter: 'Twitter',
    twitch: 'Twitch',
    bilibili: 'Bilibili',
    liquipedia: 'Liquipedia',
    dnp: '未出战',
    inactive: '非现役',
    avatarAlt: (handle, role, hero) =>
      hero ? `${handle}，${role}，代表英雄 ${hero}` : `${handle}，${role}`,
  },

  playerPage: {
    backToRoster: '返回名单',
    heroPool: '英雄池',
    links: '链接',
    realName: '本名',
    // DRAFT PENDING RIRI NATIVE REVIEW (the seven stats strings below)
    teamRecordHeading: '队伍战绩',
    teamRecordNote: 'Najdorf Esports 在 OWCS Pacific 2026 的队伍成绩。个人出场场次未作统计。',
    recentMatchesHeading: '近期比赛',
    mapRecordHeading: '地图战绩',
    statsEmpty: '暂无完赛记录。',
    playedLabel: '场次',
    streakLabel: '近况',
    metaDescription: (handle, role) => `Najdorf Esports 的${role} ${handle}，征战 OWCS Pacific。`,
  },

  games: {
    hub: {
      eyebrow: '游戏',
      heading: '游戏',
      sub: '来自战队的每日小游戏。免费游玩，无广告，不跟踪。',
      crosswordTitle: '每日迷你填字',
      crosswordDesc:
        '一份轻巧的《守望先锋》填字游戏：英雄、地图、术语与电竞历史。三种难度，每天更新。',
      crosswordCta: '开始今天的谜题',
      newDaily: '每日更新',
      // DRAFT PENDING RIRI NATIVE REVIEW (OWdle hub card)
      owdleTitle: 'OWdle',
      owdleDesc:
        '猜出今天的隐藏《守望先锋》英雄。每次猜测会比对七项属性：定位、出身、生命值、推出年份等。每天一位英雄，全球同题。',
      owdleCta: '猜今天的英雄',
      newHeroDaily: '每日新英雄',
      // DRAFT PENDING RIRI NATIVE REVIEW (Gambit hub card)
      gambitTitle: 'Gambit',
      gambitDesc:
        '以国际象棋为主题的生存类 Roguelite。在棋盘上撑过敌潮、升级并打造你的 build。每日一局固定种子，人人相同。',
      gambitCta: '开始游戏',
      newDailyRun: '每日新对局',
    },
    crossword: {
      eyebrow: '每日游戏',
      heading: 'Overwatch 迷你填字',
      intro: '每天一份《守望先锋》主题迷你填字。选择难度，开始填格。',
      difficultyLabel: '难度',
      easy: '简单',
      medium: '中等',
      hard: '困难',
      easyDesc: '休闲玩家',
      mediumDesc: '资深玩家',
      hardDesc: '电竞深度题',
      acrossLabel: '横向',
      downLabel: '纵向',
      checkLabel: '检查',
      checkLetter: '检查字母',
      checkWord: '检查单词',
      checkPuzzle: '检查全部',
      revealLabel: '显示答案',
      revealLetter: '显示字母',
      revealWord: '显示单词',
      revealPuzzle: '显示全部',
      clearLabel: '清空格子',
      shareLabel: '分享成绩',
      shareCopied: '已复制到剪贴板',
      nextPuzzleLabel: '下一题倒计时',
      timerLabel: '时间',
      completeHeading: '完成！',
      completeBody: (time) => `你用 ${time} 完成了今天的谜题。`,
      completeAssisted: '在提示帮助下完成。明天挑战全靠自己！',
      statsHeading: '你的记录',
      statsPlayed: '已玩',
      statsWon: '完成',
      statsStreak: '连续完成',
      statsMaxStreak: '最佳连续',
      statsBestTime: '最快时间',
      statsNote: '记录只保存在这个浏览器中，不会离开你的设备。',
      noJsNotice:
        '互动谜题需要启用 JavaScript。格子、提示与进度都只在你的浏览器中运行，不会发送到任何地方。',
      loadError: '无法加载今天的谜题，请刷新后再试。',
      noPuzzle: '今天的谜题尚未发布，请稍后再来。',
      zhClueNotice: '谜题提示目前仅提供英文，中文版本正在准备中。',
      howToHeading: '玩法说明',
      howTo1: '点击格子后输入字母。方向键移动光标，Tab 跳到下一条提示，Enter 切换横向与纵向。',
      howTo2:
        '卡住了吗？“检查”会标出错误的字母，“显示答案”会直接填入。不靠提示完成，分享图更漂亮。',
      howTo3: '三种难度每天于美东时间午夜更新。',
      ariaGrid: '填字格',
      ariaKeyboard: '屏幕键盘',
      ariaBackspace: '删除字母',
    },
    // DRAFT PENDING RIRI NATIVE REVIEW (entire owdle section)
    owdle: {
      eyebrow: '每日游戏',
      heading: 'OWdle',
      intro: '每天一位隐藏的《守望先锋》英雄，全球同题。输入猜测，每一栏都会告诉你有多接近。',
      zhValuesNotice: '英雄名称与出身目前以英文显示。',
      inputLabel: '猜一位英雄',
      inputPlaceholder: '输入英雄名称',
      guessButton: '猜',
      suggestionsLabel: '英雄建议',
      unknownHero: '请从建议列表中选择英雄。',
      colHero: '英雄',
      colRole: '定位',
      colSubRole: '子定位',
      colGender: '性别',
      colOrigin: '出身',
      colHp: '生命值',
      colAttack: '攻击类型',
      colYear: '年份',
      roleValues: { tank: '坦克', damage: '输出', support: '辅助' },
      subRoleValues: {
        bruiser: '格斗型',
        flanker: '侧翼',
        initiator: '开团',
        medic: '医疗',
        recon: '侦察',
        sharpshooter: '神射手',
        specialist: '特化',
        stalwart: '坐镇',
        survivor: '生存',
        tactician: '战术',
      },
      genderValues: { female: '女性', male: '男性', 'non-binary': '非二元', none: '无' },
      attackValues: { hitscan: '即时命中', projectile: '弹道', beam: '光束', melee: '近战' },
      legendHeading: '如何阅读格子',
      legendExact: '完全相符',
      legendPartial: '接近：部分重叠，或相差 25 生命值 / 1 年以内',
      legendMiss: '不相符',
      legendHigher: '答案更高或更晚',
      legendLower: '答案更低或更早',
      winHeading: '答对了！',
      winBody: (hero, count) => `答案是 ${hero}。你用了 ${count} 次猜中。`,
      winBodyOne: (hero) => `答案是 ${hero}。一次猜中！`,
      fitToggle: '缩放至屏幕宽度',
      shareLabel: '分享成绩',
      shareCopied: '已复制到剪贴板',
      puzzleLabel: '题号',
      nextHeroLabel: '下一位英雄倒计时',
      yesterdayLabel: '昨天的英雄',
      statsHeading: '你的记录',
      statsPlayed: '已玩',
      statsWon: '猜中',
      statsStreak: '连续猜中',
      statsMaxStreak: '最佳连续',
      statsNote: '记录只保存在这个浏览器中，不会离开你的设备。',
      distHeading: '猜测次数分布',
      noJsNotice:
        '互动游戏需要启用 JavaScript。猜测、记录与每日英雄都只在你的浏览器中运行，不会发送到任何地方。',
      howToHeading: '玩法说明',
      howTo1:
        '输入英雄名称进行猜测。每次猜测会填入一行：绿色代表完全相符，橙色代表接近，红色代表不符。',
      howTo2:
        '“出身”栏的橙色代表来自世界同一区域；“生命值”与“年份”的橙色代表相差 25 以内或一年以内。箭头指向答案：向上代表更高或更晚，向下代表更低或更早。',
      howTo3: '猜测次数不限。每天美东时间午夜更新英雄。',
      howTo4: '连胜与记录只留在这台设备上；分享只会发送色块。',
      ariaBoard: '猜测结果格',
      ariaSolvedBoard: '已解开的结果',
      /** Legal text stays in English verbatim on every locale. */
      disclaimer:
        'This is an unofficial fan-made game. It is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc. All hero names and related facts are the property of their respective owners.',
      dataCredit: '英雄数据来自社区 OverFast API，并辅以人工整理。',
    },

    // DRAFT PENDING RIRI NATIVE REVIEW (Gambit game)
    gambit: {
      eyebrow: '每日游戏',
      heading: 'Gambit',
      intro:
        '以国际象棋为主题的生存类 Roguelite。在棋盘上撑过敌潮、升级并打造你的 build。每日一局固定种子，人人相同。',
      noJsNotice:
        '本游戏需要 JavaScript，完全在你的浏览器内运行；不会发送任何数据，只有最佳时间与升级会保存在这台设备上。',
      controlsHint: '使用 WASD 或方向键移动。触控时在画面任意处拖动即可移动。武器会自动开火。',
      playLabel: '开始游戏',
      retryLabel: '再玩一次',
      backLabel: '返回',
      dailyLabel: '每日一局',
      bestLabel: '最佳',
      noBest: '暂无记录',
      standardLabel: '标准模式',
      standardHint: '关闭永久升级：纯技术对局。',
      currencyLabel: '碎片',
      shopHeading: '永久升级',
      shopHint: '花费对局获得的碎片。这些只会降低下限，永不提高上限：每一局不靠升级也能取胜。',
      buyLabel: '购买',
      maxedLabel: '已满级',
      pauseLabel: '暂停',
      resumeLabel: '继续',
      pausedHeading: '已暂停',
      giveUpLabel: '结束对局',
      levelUpHeading: '升级',
      levelUpSub: '择一',
      hudLevel: '等级',
      hudKills: '击倒',
      overHeading: '对局结束',
      survivedLabel: '存活',
      levelReachedLabel: '达到等级',
      killsLabel: '击倒',
      earnedLabel: '获得碎片',
      newBest: '最佳时间刷新！',
      victoryLabel: '胜利',
      nextLabel: '下一局倒计时',
      heroLabel: '英雄',
      heroLocked: '赢得一局以解锁',
      zoomInLabel: '放大',
      zoomOutLabel: '缩小',
      fullscreenLabel: '全屏',
      reaperWarning: '死神逼近',
      endlessTag: '无尽',
      winHeading: '你撑住了！',
      winBody: '你撑过了 20 分钟大关。继续进入无尽模式，或在此结束。',
      continueLabel: '继续挑战',
      finishLabel: '结束本局',
      unlockHeading: '解锁新英雄',
      howToHeading: '玩法',
      howTo1: '移动以闪避。武器会自动朝最近的敌人开火。尽量撑得更久。',
      howTo2: '被击倒的敌人会掉落经验碎片。收集以升级，再从三个升级中择一，打造你的 build。',
      howTo3:
        '难度全程持续攀升，因此强力升级换来的是时间而非安全。每日新的固定种子对局于美东午夜更新。',
      howTo4: '最佳时间与永久升级仅保存在此浏览器，永不离开你的设备。',
      disclaimer:
        'Gambit 是 Najdorf Esports 原创的游戏，与任何其他游戏均无隶属、背书或衍生关系；所有名称、角色与美术皆为原创。',
      upgrades: {
        damage: { name: '利刃', desc: '弩矢造成更多伤害。' },
        firerate: { name: '疾发', desc: '更频繁地发射弩矢。' },
        multishot: { name: '分裂矢', desc: '额外发射一支弩矢。' },
        pierce: { name: '穿刺', desc: '弩矢可多贯穿一名敌人。' },
        area: { name: '重矢', desc: '更大的弩矢，并对附近敌人造成溅射伤害。' },
        crit: { name: '锐眼', desc: '有几率打出暴击，造成大量额外伤害。' },
        orbiters: { name: '环刃', desc: '增加一把环绕飞刃，撕裂附近敌人。' },
        velocity: { name: '疾飞', desc: '弩矢飞行更快。' },
        swift: { name: '疾步', desc: '移动更快。' },
        magnet: { name: '广纳', desc: '从更远处吸取碎片。' },
        fortify: { name: '强化', desc: '提升生命上限并回复。' },
        regen: { name: '愈合', desc: '随时间缓慢回复生命。' },
      },
      powerups: {
        might: { name: '威力', desc: '每局开始时拥有更多伤害。' },
        vigor: { name: '活力', desc: '每局开始时拥有更多生命。' },
        haste: { name: '迅捷', desc: '每局开始时移动更快。' },
        greed: { name: '贪婪', desc: '每局开始时从更远处吸取碎片。' },
      },
      heroes: {
        bishop: { name: '主教', desc: '精准的远程射手。均衡而可靠。' },
        knight: { name: '骑士', desc: '快速且具侵略性，使用近距离散射攻击。赢得一局以解锁。' },
      },
    },
  },

  competedAs: (name) => `代表 ${name} 出战`,

  skipLink: '跳至主内容',
};
