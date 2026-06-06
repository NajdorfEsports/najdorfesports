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
    home:    '首页',
    roster:  '名单',
    matches: '赛程',
    news:    '新闻',
    about:   '关于',
  },
  footer: {
    site:        '网站',
    follow:      '关注',
    foundedLine: (year, region) => `${year} 年成立 · ${region}`,
    trademark:
      'Overwatch 与 Overwatch Champions Series 为 Blizzard Entertainment, Inc. 的商标。',
    copyright: (year, name) => `© ${year} ${name}。版权所有。`,
    dataCredit: '数据来源：Liquipedia · CC BY-SA 3.0',
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    achievement: (placement, event) => `${event} ${placement}。`,
    tagline:        '备战 6 月 4 日开打的 OWCS Pacific 第二阶段。',
    matchSchedule:  '查看赛程',
    meetRoster:     '认识选手',
  },
  home: {
    recentResults:   '近期战绩',
    recentEmpty:     '暂无比赛结果。第二阶段 6 月 4 日开打。',
    allMatches:      '所有比赛',
    nextMatchLabel:  '下一场比赛',
    latest:          '最新消息',
    allNews:         '所有新闻',
    read:            '阅读',
  },

  news: {
    eyebrow:         '新闻',
    heading:         '来自战队',
    backToAll:       '所有新闻',
    metaDescription:
      '来自 Najdorf Esports 的公告、选手变动与赛事回顾。我们是一支征战 OWCS Pacific 的《守望先锋》战队，在此阅读战队的最新消息。',
  },
  roster: {
    eyebrow:            '现役名单 · OWCS Pacific 2026',
    h1:                 '出战阵容',
    playersLabel:       '选手',
    regionLabel:        '赛区',
    fullRoster:         '完整名单',
    countryLabel:       '国家',
    countriesLabel:     '国家',
    recordLabel:        '战绩',
  },
  about: {
    eyebrow: '关于',
    body: (year, region) =>
      `Najdorf Esports 是一支以${region}赛区为据点的竞技型《守望先锋》战队。战队于 ${year} 年成立，目前征战 OWCS Pacific。第二阶段主赛事将于 2026 年 6 月 4 日至 7 月 9 日进行。队名取自西西里防御的 Najdorf 变例，一个比对手多算一步而胜出的开局。`,
    previously:     '我们第二阶段阵容中部分选手，曾于 OWCS Pacific 第一阶段代表 Rankers 出战。',
    historyHeading: '我们的故事',
    history1:
      'Najdorf Esports 是一支全新的组织，而非 Rankers 的更名。2026 年 5 月 5 日，本组织收购了 Rankers 的阵容，将第一阶段的核心班底带入第二阶段，并以全新的所有权与身份征战。',
    history2:
      '第一阶段的第 3 名成绩是以 Rankers 之名取得，我们也如实标注。教练组自第一阶段延续，并在第二阶段主赛事前加入新签选手；主赛事将于 2026 年 6 月 4 日至 7 月 9 日进行。',
    incorporationNote:
      '本组织背后的法律实体正在设立中；待注册完成后，本声明将更新以载明运营公司名称。',
    contactHeading: '联系我们',
    contactNote:    '合作、媒体与选手相关咨询，请发送至上方邮箱。',
    partnerNote:    '联盟营销与赞助合作通过 impact.com 进行。',
    followHeading:  '关注我们',
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
    affiliateNote: '联盟营销与赞助合作通过 impact.com 进行。',
    contactHeading: '联系我们',
    contactResponse: '我们会在 24 至 48 小时内回复。',
    metaDescription:
      'Najdorf Esports（征战 OWCS Pacific 的《守望先锋》战队）的合作与赞助咨询。创始伙伴名额开放中。',
  },

  press: {
    eyebrow: '媒体',
    title: '媒体与品牌素材包',
    intro:
      '报道或介绍 Najdorf Esports 所需的一切。采访或本页未涵盖的事项，请来信至',
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
    ownerBody:
      '创办人兼经营者。Najdorf Esports 由个人独立拥有并经营，对外以组织名义而非个人身份。',
    marksHeading: '商标的合理使用',
    marksBody:
      '您可以使用 Najdorf Esports 的名称与标志来报道或提及本组织。请勿更改标志、暗示我们未曾宣布的合作或背书，或以误导方式使用我们的商标。Overwatch 与 OWCS 相关商标属于 Blizzard Entertainment；详见我们的使用条款。',
    metaDescription:
      'Najdorf Esports 的媒体与品牌素材包：品牌素材、基本资料与联系方式。',
  },
  community: {
    eyebrow:    '加入社群',
    headline:   '与战队同行。',
    body:       '两个官方频道，没有算法干扰。Discord 是赛间与队伍同乐的地方，X 则是抢先看到公告的渠道。',
    discordCta: '加入 Discord',
    xCta:       '在 X 上关注',
    members:    '位成员',
    followers:  '位粉丝',
  },

  highlights: {
    eyebrow:    '精彩集锦',
    heading:    '比赛集锦',
    comingSoon: '集锦即将上线',
    loadVideo:  '播放集锦',
    loadNote:   '加载后将从 YouTube 播放，并由 Google 设置其 cookies。',
  },
  live: {
    liveNow:      '直播中',
    startsIn:     '即将开始',
    vs:           '对战',
    watchNow:     '立即观看',
    openOnTwitch: '在 Twitch 打开',
    loadPlayer:     '加载 Twitch 播放器',
    loadPlayerNote: '加载后 Twitch 将在您的设备上设置自己的 cookies。',
  },

  roles: {
    Tank:    '坦克',
    DPS:     '输出',
    Support: '辅助',
    Flex:    '自由人',
    Coach:   '教练',
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
    eyebrowEmpty:        '下一场比赛',
    placeholderHeadline: 'OWCS Pacific 第二阶段 · 2026 年 6 月 4 日',
    placeholderBody:     '对阵表确定后，赛程将公告于此。',
    watchLive:           '观看直播',
    days:                '天',
    hours:               '时',
    min:                 '分',
    sec:                 '秒',
  },

  match: {
    vs: (opponent) => `对战 ${opponent}`,
    watch: '观看',
    watchVod: '观看回放',
    broadcastPeak: (n) => `OWCS Pacific 直播峰值 ${n}`,
    tbd:   '待定',
    win:   '胜',
    loss:  '负',
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
    upcoming:    '即将开打',
    recordLabel: '战绩',
    record: (wins, losses) => `${wins} 胜 ${losses} 负`,
    pastResults: '过往战绩',
    attribution: {
      before:  '赛事数据来自 ',
      between: '，并依 ',
      after:   ' 授权发布。赛程每周更新。',
    },
  },

  matchEmpty: {
    upcoming: (league, stage, startDate) =>
      `目前暂无即将进行的比赛。${league} ${stage}主赛事将于 ${startDate} 开打。`,
    past: (stage) =>
      `目前暂无已完成的比赛。${stage}主赛事开打后，战绩将显示于此。`,
  },

  ticker: {
    upcoming: (date, opponent, tournament) => `${date} · 对战 ${opponent} · ${tournament}`,
    win:  (opponent, tournament) => `胜 对战 ${opponent} · ${tournament}`,
    loss: (opponent, tournament) => `负 对战 ${opponent} · ${tournament}`,
    tbd:  (opponent, tournament) => `对战 ${opponent} · ${tournament}`,
    fallback: 'OWCS Pacific 第二阶段主赛事将于 2026 年 6 月 4 日开打。',
    ariaLabel: '赛事跑马灯',
  },

  player: {
    twitter:  'Twitter',
    twitch:   'Twitch',
    bilibili: 'Bilibili',
    liquipedia: 'Liquipedia',
    dnp:      '未出战',
    inactive: '非现役',
    avatarAlt: (handle, role, hero) =>
      hero ? `${handle}，${role}，代表英雄 ${hero}` : `${handle}，${role}`,
  },

  playerPage: {
    backToRoster: '返回名单',
    heroPool: '英雄池',
    links: '链接',
    realName: '本名',
    metaDescription: (handle, role) =>
      `Najdorf Esports 的${role} ${handle}，征战 OWCS Pacific。`,
  },

  competedAs: (name) => `代表 ${name} 出战`,

  skipLink: '跳至主内容',
};
