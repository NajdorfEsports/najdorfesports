/**
 * Traditional Chinese (zh-TW).
 * Auto-translated via MyMemory on 2026-05-24.
 * Quality is best-effort. Brand terms (Najdorf Esports, Overwatch, OWCS,
 * Liquipedia, Twitch, etc.) are preserved in English. Native speakers
 * please review and PR fixes.
 */
import type { Strings } from './en';

export const zhTW: Strings = {
  nav: {
    home:    '首頁',
    roster:  '名單',
    matches: '比賽',
    news:    '新聞',
    about:   '關於',
  },
  footer: {
    site:        '網站',
    follow:      '關注',
    foundedLine: (year, region) => `成立${year} · ${region}`,
    trademark:   'Overwatch和Overwatch Champions Series是Blizzard Entertainment, Inc.的商標',
    copyright:   (year, name) => `© ${year} ${name}。保留所有權利。`,
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    stats: (players, countries) => `${countries}國家的${players}玩家。`,
    record: (line) => `Stage 1中的${line}。`,
    achievement: (placement, event) => `${placement}在${event}。`,
    tagline:        '前往June 4的OWCS Pacific Stage 2。',
    matchSchedule:  '比賽時間表',
    meetRoster:     '認識選手',
  },
  home: {
    recentResults:  '最近的結果',
    recentEmpty:    '尚無已完成的匹配。Stage 2開始June 4。',
    allMatches:     '所有比賽',
    nextMatchLabel: '下一場比賽',
    latest:         '最新',
    allNews:        '檢視所有最新資訊',
    read:           '閱讀',
  },
  roster: {
    eyebrow:            '活躍名冊· OWCS Pacific 2026',
    h1:                 '陣容',
    playersLabel:       '選手',
    regionLabel:        '地區',
    intro:              '每六小時從Liquipedia中提取名冊。點擊手柄以打開玩家的Liquipedia頁面。',
    fullRoster:         '完整名冊',
    attribution:        '玩家數據來源於',
    attributionLicense: '根據以下條款提供：',
    attributionRefresh: '名冊每6小時刷新一次。',
  },
  about: {
    eyebrow:        '關於',
    body: (year, region) => `Najdorf Esports是一家位於${region}地區的競爭型Overwatch組織。我們在${year}創立了該組織，目前在OWCS Pacific競爭。Stage 2主事件運行June 4到July 9, 2026。這個名字來自Sicilian Defence的Najdorf Variation ，一個通過準備比另一邊更深的一條線而獲勝的開口。`,
    previously:     '此前曾在OWCS Pacific中以Rankers的身份參賽。',
    contactHeading: '聯絡',
    contactNote:    '如需合作夥伴、媒體或玩家查詢，請傳送電子郵件至上方地址。',
  },
  live: {
    liveNow:      '直播中',
    startsIn:     '即將開始',
    vs:           'vs',
    watchNow:     '馬上觀看',
    openOnTwitch: '在Twitch上打開',
  },
  skipLink: '跳至主要內容',
};
