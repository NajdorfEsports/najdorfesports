/**
 * Traditional Chinese (zh-TW).
 *
 * Hand-written using established Overwatch / OWCS community terminology
 * (鬥陣特攻 / 鬥陣特攻冠軍系列賽 in some communities; the OWCS Pacific
 * broadcast itself uses English branding, so we keep "OWCS Pacific" and
 * proper-noun stage names in Latin script). Brand names, team names,
 * player handles, and ${var} interpolations stay as-is.
 *
 * Native speakers, please PR fixes. The dict shape is enforced by
 * `Strings` from ./en, so the type checker will catch missing keys.
 */
import type { Strings } from './en';

export const zhTW: Strings = {
  nav: {
    home:    '首頁',
    roster:  '名單',
    matches: '賽程',
    news:    '新聞',
    about:   '關於',
  },
  footer: {
    site:        '網站',
    follow:      '追蹤',
    foundedLine: (year, region) => `${year} 年成立 · ${region}`,
    trademark:
      'Overwatch 與 Overwatch Champions Series 為 Blizzard Entertainment, Inc. 之商標。',
    copyright: (year, name) => `© ${year} ${name}。版權所有。`,
    dataCredit: '資料來源：Liquipedia · CC BY-SA 3.0',
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    achievement: (placement, event) => `${event} ${placement}。`,
    tagline:        '備戰 6 月 4 日開打的 OWCS Pacific 第二階段。',
    matchSchedule:  '查看賽程',
    meetRoster:     '認識選手',
  },
  home: {
    recentResults:   '近期戰績',
    recentEmpty:     '尚無比賽結果。第二階段 6 月 4 日開打。',
    allMatches:      '所有比賽',
    nextMatchLabel:  '下一場比賽',
    latest:          '最新消息',
    allNews:         '所有新聞',
    read:            '閱讀',
  },

  news: {
    eyebrow:         '新聞',
    heading:         '來自戰隊',
    backToAll:       '所有新聞',
    metaDescription: 'Najdorf Esports 的公告、品牌動態與賽事報導。',
  },
  roster: {
    eyebrow:            '現役名單 · OWCS Pacific 2026',
    h1:                 '出戰陣容',
    playersLabel:       '選手',
    regionLabel:        '賽區',
    fullRoster:         '完整名單',
    countryLabel:       '國家',
    countriesLabel:     '國家',
    recordLabel:        '戰績',
  },
  about: {
    eyebrow: '關於',
    body: (year, region) =>
      `Najdorf Esports 是一支以${region}賽區為據點的競技型《鬥陣特攻》戰隊。隊伍於 ${year} 年成立，目前征戰 OWCS Pacific。第二階段主賽事將於 2026 年 6 月 4 日至 7 月 9 日進行。隊名取自西西里防禦的 Najdorf 變例，一個比對手多算一步而勝出的開局。`,
    previously:     '我們第二階段陣容中部分選手，曾於 OWCS Pacific 第一階段代表 Rankers 出戰。',
    contactHeading: '聯絡我們',
    contactNote:    '合作、媒體與選手相關洽詢，請寄送至上方信箱。',
    partnerNote:    '聯盟行銷與贊助合作透過 impact.com 進行。',
    followHeading:  '追蹤我們',
  },
  community: {
    eyebrow:    '加入社群',
    headline:   '與戰隊同行。',
    body:       '兩個官方頻道，沒有演算法。Discord 是賽間與隊伍同樂的地方，X 則是搶先看到公告的管道。',
    discordCta: '加入 Discord',
    xCta:       '在 X 上追蹤',
  },
  live: {
    liveNow:      '直播中',
    startsIn:     '即將開始',
    vs:           '對戰',
    watchNow:     '立即觀看',
    openOnTwitch: '在 Twitch 開啟',
    loadPlayer:     '載入 Twitch 播放器',
    loadPlayerNote: '載入後 Twitch 將在您的裝置上設置自己的 cookies。',
  },

  roles: {
    Tank:    '坦克',
    DPS:     '輸出',
    Support: '輔助',
    Flex:    '自由人',
    Coach:   '教練',
    Manager: '經理',
  },

  regions: {
    Pacific: '太平洋',
  },

  owcsBadge: {
    liveLabel: '進行中',
    badgeLine: (startMonthDay, endMonthDayYear) =>
      `OWCS Pacific 第二階段主賽事：${startMonthDay} ~ ${endMonthDayYear}`,
    descriptor: 'OWCS Pacific · 第二階段 · 2026',
  },

  rosterStrip: {
    activeRoster: '現役名單',
    countLine: (players, countries, coaches) => {
      const parts = [`${players} 名選手`, `${countries} 個國家`];
      if (coaches > 0) parts.push(`${coaches} 名教練`);
      return parts.join(' · ');
    },
    fullRoster: '完整名單',
  },

  achievement: {
    recentResults: '近期戰績',
    ariaLabel: '戰績',
    placementLabel: (placement) => `名次：${placement}`,
  },

  watch: {
    eyebrow: '觀看管道',
    heading: 'OWCS Pacific 官方轉播',
    cardAriaLabel: (name, language, platform) => `${name}，在 ${platform} 上的${language}轉播`,
  },

  nextMatch: {
    eyebrow: (tournament) => `下一場比賽 · ${tournament}`,
    vs: (opponent) => `對戰 ${opponent}`,
    eyebrowEmpty:        '下一場比賽',
    placeholderHeadline: 'OWCS Pacific 第二階段 · 2026 年 6 月 4 日',
    placeholderBody:     '對戰表確定後，賽程將公告於此。',
    watchLive:           '觀看直播',
    days:                '天',
    hours:               '時',
    min:                 '分',
    sec:                 '秒',
  },

  match: {
    vs: (opponent) => `對戰 ${opponent}`,
    watch: '觀看',
    watchVod: '觀看回放',
    tbd:   '待定',
    win:   '勝',
    loss:  '負',
  },

  matches: {
    metaDescription: (league) => `Najdorf Esports 在 ${league} 的近期賽程與最新戰績。`,
    eyebrow: (league, year) => `賽程 · ${league} ${year}`,
    upcoming:    '即將開打',
    recordLabel: '戰績',
    record: (wins, losses) => `${wins} 勝 ${losses} 負`,
    pastResults: '過往戰績',
    attribution: {
      before:  '賽事資料來自 ',
      between: '，並依 ',
      after:   ' 授權釋出。賽程每週更新。',
    },
  },

  matchEmpty: {
    upcoming: (league, stage, startDate) =>
      `目前尚無即將進行的比賽。${league} ${stage}主賽事將於 ${startDate} 開打。`,
    past: (stage) =>
      `目前尚無已完成的比賽。${stage}主賽事開打後，戰績將顯示於此。`,
  },

  ticker: {
    upcoming: (date, opponent, tournament) => `${date} · 對戰 ${opponent} · ${tournament}`,
    win:  (opponent, tournament) => `勝 對戰 ${opponent} · ${tournament}`,
    loss: (opponent, tournament) => `負 對戰 ${opponent} · ${tournament}`,
    tbd:  (opponent, tournament) => `對戰 ${opponent} · ${tournament}`,
    fallback: 'OWCS Pacific 第二階段主賽事將於 2026 年 6 月 4 日開打。',
    ariaLabel: '賽事跑馬燈',
  },

  player: {
    twitter:  'Twitter',
    twitch:   'Twitch',
    dnp:      '未出賽',
    inactive: '非現役',
  },

  competedAs: (name) => `代表 ${name} 出戰`,

  skipLink: '跳至主要內容',
};
