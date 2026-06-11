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
    // DRAFT PENDING RIRI NATIVE REVIEW
    staffHeading: '教练与经理',
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
    upcoming: (date, opponent, tournament) => `${date} · 对战 ${opponent} · ${tournament}`,
    win: (opponent, tournament) => `胜 对战 ${opponent} · ${tournament}`,
    loss: (opponent, tournament) => `负 对战 ${opponent} · ${tournament}`,
    tbd: (opponent, tournament) => `对战 ${opponent} · ${tournament}`,
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
    metaDescription: (handle, role) => `Najdorf Esports 的${role} ${handle}，征战 OWCS Pacific。`,
  },

  competedAs: (name) => `代表 ${name} 出战`,

  skipLink: '跳至主内容',
};
