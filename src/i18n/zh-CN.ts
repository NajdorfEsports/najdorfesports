/**
 * Simplified Chinese (zh-CN).
 * Auto-translated via MyMemory on 2026-05-24.
 * Quality is best-effort. Brand terms (Najdorf Esports, Overwatch, OWCS,
 * Liquipedia, Twitch, etc.) are preserved in English. Native speakers
 * please review and PR fixes.
 */
import type { Strings } from './en';

export const zhCN: Strings = {
  nav: {
    home:    '主页',
    roster:  '名冊',
    matches: '比赛',
    news:    '新闻',
    about:   '关于',
  },
  footer: {
    site:        '网站',
    follow:      '关注',
    foundedLine: (year, region) => `成立${year} · ${region}`,
    trademark:   'Overwatch和Overwatch Champions Series是Blizzard Entertainment, Inc.的商标',
    copyright:   (year, name) => `© ${year} ${name}。保留所有权利。`,
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    stats: (players, countries) => `${countries}国家的${players}玩家。`,
    record: (line) => `Stage 1中的${line}。`,
    achievement: (placement, event) => `${placement}在${event}。`,
    tagline:        '前往June 4的OWCS Pacific Stage 2。',
    matchSchedule:  '比赛日程',
    meetRoster:     '认识选手',
  },
  home: {
    recentResults:  '最近的结果',
    recentEmpty:    '尚无已完成的匹配。Stage 2开始June 4。',
    allMatches:     '全部匹配',
    nextMatchLabel: '下一场比赛',
    latest:         '最新',
    allNews:        '全部新闻',
    read:           '阅读',
  },
  roster: {
    eyebrow:            '活跃名册· OWCS Pacific 2026',
    h1:                 '阵容',
    playersLabel:       '选手',
    regionLabel:        '地区',
    intro:              '每六小时从Liquipedia提取名册。单击手柄打开玩家的Liquipedia页面。',
    fullRoster:         '完整名册',
    attribution:        '玩家数据来源于',
    attributionLicense: '在下方可用',
    attributionRefresh: '名册每6小时刷新一次。',
  },
  about: {
    eyebrow:        '关于',
    body: (year, region) => `Najdorf Esports是一家位于${region}地区的竞争性Overwatch组织。我们在${year}创立了该组织，目前在OWCS Pacific竞争。Stage 2主事件运行June 4到July 9, 2026。这个名字来自Sicilian Defence的Najdorf Variation ，这是一个通过准备比另一边更深的一条线而获胜的开口。`,
    previously:     '此前在OWCS Pacific中作为Rankers竞争。',
    contactHeading: '联系方式',
    contactNote:    '如需了解合作伙伴关系、媒体或玩家查询，请通过电子邮件发送上述地址。',
  },
  live: {
    liveNow:      '直播中',
    startsIn:     '即将开始',
    vs:           'vs',
    watchNow:     '立即觀看',
    openOnTwitch: '在Twitch上打开',
  },
  skipLink: '跳到主内容',
};
