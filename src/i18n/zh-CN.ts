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
    metaDescription: 'Najdorf Esports 的公告、品牌动态与赛事报道。',
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
    contactHeading: '联系我们',
    contactNote:    '合作、媒体与选手相关咨询，请发送至上方邮箱。',
    partnerNote:    '联盟营销与赞助合作通过 impact.com 进行。',
    followHeading:  '关注我们',
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
    tbd:   '待定',
    win:   '胜',
    loss:  '负',
  },

  matches: {
    metaDescription: (league) => `Najdorf Esports 在 ${league} 的近期赛程与最新战绩。`,
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
    dnp:      '未出战',
    inactive: '非现役',
  },

  competedAs: (name) => `代表 ${name} 出战`,

  skipLink: '跳至主内容',
};
