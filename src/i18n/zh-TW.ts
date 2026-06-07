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
    home: '首頁',
    roster: '名單',
    matches: '賽程',
    news: '新聞',
    about: '關於',
  },
  footer: {
    site: '網站',
    follow: '追蹤',
    foundedLine: (year, region) => `${year} 年成立 · ${region}`,
    trademark: 'Overwatch 與 Overwatch Champions Series 為 Blizzard Entertainment, Inc. 之商標。',
    copyright: (year, name) => `© ${year} ${name}。版權所有。`,
    dataCredit: '資料來源：Liquipedia · CC BY-SA 3.0',
  },
  hero: {
    subhead: 'OWCS PACIFIC 2026',
    achievement: (placement, event) => `${event} ${placement}。`,
    tagline: '備戰 6 月 4 日開打的 OWCS Pacific 第二階段。',
    matchSchedule: '查看賽程',
    meetRoster: '認識選手',
  },
  home: {
    recentResults: '近期戰績',
    recentEmpty: '尚無比賽結果。第二階段 6 月 4 日開打。',
    allMatches: '所有比賽',
    nextMatchLabel: '下一場比賽',
    latest: '最新消息',
    allNews: '所有新聞',
    read: '閱讀',
  },

  pageMeta: {
    homeTitle: 'Najdorf Esports | OWCS Pacific Overwatch 戰隊',
    homeDescription: 'Najdorf Esports 是一支位於太平洋區的 Overwatch 戰隊，目前征戰 OWCS Pacific。',
    aboutDescription:
      'Najdorf Esports 在 OWCS Pacific 第二階段前收購了 Rankers 的陣容。認識現役《鬥陣特攻》選手與教練、了解我們的故事，並看看如何與我們合作。',
    rosterDescription: (headcount, countries) =>
      `Najdorf Esports 現役 OWCS Pacific 名單，共 ${headcount} 名選手，來自 ${countries.join('、')}。`,
  },

  news: {
    eyebrow: '新聞',
    heading: '來自戰隊',
    backToAll: '所有新聞',
    metaDescription:
      '來自 Najdorf Esports 的公告、選手異動與賽事回顧。我們是一支征戰 OWCS Pacific 的《鬥陣特攻》戰隊，在此閱讀戰隊的最新消息。',
  },
  roster: {
    eyebrow: '現役名單 · OWCS Pacific 2026',
    h1: '出戰陣容',
    playersLabel: '選手',
    regionLabel: '賽區',
    fullRoster: '完整名單',
    countryLabel: '國家',
    countriesLabel: '國家',
    recordLabel: '戰績',
  },
  about: {
    eyebrow: '關於',
    body: (year, region) =>
      `Najdorf Esports 是一支以${region}賽區為據點的競技型《鬥陣特攻》戰隊。隊伍於 ${year} 年成立，目前征戰 OWCS Pacific。第二階段主賽事將於 2026 年 6 月 4 日至 7 月 9 日進行。隊名取自西西里防禦的 Najdorf 變例，一個比對手多算一步而勝出的開局。`,
    previously: '我們第二階段陣容中部分選手，曾於 OWCS Pacific 第一階段代表 Rankers 出戰。',
    historyHeading: '我們的故事',
    history1:
      'Najdorf Esports 是一支全新的組織，而非 Rankers 的更名。2026 年 5 月 5 日，本組織收購了 Rankers 的陣容，將第一階段的核心班底帶入第二階段，並以全新的所有權與身分征戰。',
    history2:
      '第一階段的第 3 名成績是以 Rankers 之名取得，我們也如實標註。教練團自第一階段延續，並在第二階段主賽事前加入新簽選手；主賽事將於 2026 年 6 月 4 日至 7 月 9 日進行。',
    incorporationNote:
      '本組織背後的法律實體正在設立中；待註冊完成後，本聲明將更新以載明營運公司名稱。',
    contactHeading: '聯絡我們',
    contactNote: '合作、媒體與選手相關洽詢，請寄送至上方信箱。',
    followHeading: '追蹤我們',
  },

  partners: {
    eyebrow: '合作夥伴',
    title: '與 Najdorf Esports 合作',
    intro:
      'Najdorf Esports 是一支征戰 OWCS Pacific 的獨立《鬥陣特攻》戰隊。我們在第二階段前接手了 Rankers 的陣容，並以此為起點，打造一支登上 OWCS Pacific 官方轉播的區域型隊伍。',
    standing:
      '我們仍在起步階段，與其誇大，不如把話說清楚。這套陣容在 OWCS Pacific 第一階段（代表 Rankers）拿下第 3 名，目前正在第二階段主賽事中。以下是我們以現有規模能真正提供的內容。',
    offerHeading: '我們能提供什麼',
    offerNote:
      '我們是一支觀眾持續成長的新戰隊，而非一線聯盟戰隊。以下是我們今天就能交付的權益，並會隨著我們成長而擴大。',
    offerJersey: {
      title: '球衣與隊服露出',
      body: '在 OWCS Pacific 轉播與 LAN 現場，將您的標誌放上隊伍球衣與選手隊服。',
    },
    offerBroadcast: {
      title: '轉播與共同直播露出',
      body: '在通過聯盟轉播審核後，於我們的共同直播與內容中提供標誌與提及。',
    },
    offerDiscord: {
      title: 'Discord 置頂露出',
      body: '在我們的社群 Discord（隊伍與粉絲於賽間聚集之處）提供置頂版位與提及。',
    },
    offerLogo: {
      title: '官網標誌露出',
      body: '在本網站的合作夥伴專區放上您的標誌與連結。',
    },
    offerSocial: {
      title: '社群提及',
      body: '在賽事與公告前後，由官方 X 帳號發布標註與宣傳貼文。',
    },
    foundingHeading: '創始夥伴名額開放中',
    foundingBody:
      '我們目前尚無任何夥伴，而這是刻意為之：創始名額正開放中。我們不會放上佔位用的標誌或虛構品牌。如果您想成為球衣上的第一個名字，歡迎與我們聯繫。',
    contactHeading: '聯絡我們',
    contactResponse: '我們會在 24 至 48 小時內回覆。',
    metaDescription:
      'Najdorf Esports（征戰 OWCS Pacific 的《鬥陣特攻》戰隊）的合作與贊助洽詢。創始夥伴名額開放中。',
  },

  press: {
    eyebrow: '媒體',
    title: '媒體與品牌素材包',
    intro: '報導或介紹 Najdorf Esports 所需的一切。採訪或本頁未涵蓋的事項，請來信至',
    assetsHeading: '品牌素材',
    assetsNote:
      '請為主教標誌保留足夠留白，不要更改其顏色（標誌嚴格採用黑白），也不要拉伸或旋轉。文字標誌可使用品牌藍，或在深色背景上使用白色。',
    downloadHeading: '標誌檔案',
    colorsHeading: '品牌色',
    colorPrimary: '主色',
    colorSecondary: '輔色',
    colorBackground: '背景',
    factHeading: '基本資料',
    factOrg: '組織',
    factFounded: '成立',
    factRegion: '賽區',
    factGame: '遊戲',
    factRoster: '陣容',
    factResults: '主要成績',
    teamHeading: '團隊',
    ownerRole: '負責人',
    ownerBody: '創辦人兼經營者。Najdorf Esports 由個人獨立擁有並經營，對外以組織名義而非個人身分。',
    marksHeading: '商標的合理使用',
    marksBody:
      '您可以使用 Najdorf Esports 的名稱與標誌來報導或提及本組織。請勿更改標誌、暗示我們未曾宣布的合作或背書，或以誤導方式使用我們的商標。Overwatch 與 OWCS 相關商標屬於 Blizzard Entertainment；詳見我們的使用條款。',
    metaDescription: 'Najdorf Esports 的媒體與品牌素材包：品牌素材、基本資料與聯絡方式。',
  },
  community: {
    eyebrow: '加入社群',
    headline: '與戰隊同行。',
    body: '沒有演算法，只有戰隊本身。賽間在 Discord 同樂，在 X 搶先看到公告，並在 Twitch 與 YouTube 觀看比賽與精華。',
    discordCta: '加入 Discord',
    xCta: '在 X 上追蹤',
    twitchCta: '在 Twitch 觀看',
    youtubeCta: '在 YouTube 訂閱',
    members: '位成員',
    followers: '位追蹤者',
  },

  highlights: {
    eyebrow: '精華',
    heading: '比賽精華',
    comingSoon: '精華即將推出',
    loadVideo: '播放精華',
    loadNote: '載入後將從 YouTube 播放，並由 Google 設置其 cookies。',
  },
  live: {
    liveNow: '直播中',
    startsIn: '即將開始',
    vs: '對戰',
    watchNow: '立即觀看',
    openOnTwitch: '在 Twitch 開啟',
    loadPlayer: '載入 Twitch 播放器',
    loadPlayerNote: '載入後 Twitch 將在您的裝置上設置自己的 cookies。',
  },

  roles: {
    Tank: '坦克',
    DPS: '輸出',
    Support: '輔助',
    Flex: '自由人',
    Coach: '教練',
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
    eyebrowEmpty: '下一場比賽',
    placeholderHeadline: 'OWCS Pacific 第二階段 · 2026 年 6 月 4 日',
    placeholderBody: '對戰表確定後，賽程將公告於此。',
    watchLive: '觀看直播',
    days: '天',
    hours: '時',
    min: '分',
    sec: '秒',
  },

  match: {
    vs: (opponent) => `對戰 ${opponent}`,
    watch: '觀看',
    watchVod: '觀看回放',
    broadcastPeak: (n) => `OWCS Pacific 直播尖峰 ${n}`,
    tbd: '待定',
    win: '勝',
    loss: '負',
  },

  reach: {
    eyebrow: '直播觸及',
    peakLabel: '尖峰同時觀眾',
    context: (opponent) => `在 OWCS Pacific 對戰 ${opponent} 的官方直播中。`,
    cta: '查看比賽',
  },

  matches: {
    metaDescription: (league) =>
      `Najdorf Esports 在 ${league} 第二階段的即將賽程與近期戰績。完整賽程、地圖比分、對手資訊，以及每場系列賽的觀賽連結。`,
    eyebrow: (league, year) => `賽程 · ${league} ${year}`,
    upcoming: '即將開打',
    recordLabel: '戰績',
    record: (wins, losses) => `${wins} 勝 ${losses} 負`,
    pastResults: '過往戰績',
    attribution: {
      before: '賽事資料來自 ',
      between: '，並依 ',
      after: ' 授權釋出。賽程每週更新。',
    },
  },

  matchEmpty: {
    upcoming: (league, stage, startDate) =>
      `目前尚無即將進行的比賽。${league} ${stage}主賽事將於 ${startDate} 開打。`,
    past: (stage) => `目前尚無已完成的比賽。${stage}主賽事開打後，戰績將顯示於此。`,
  },

  ticker: {
    upcoming: (date, opponent, tournament) => `${date} · 對戰 ${opponent} · ${tournament}`,
    win: (opponent, tournament) => `勝 對戰 ${opponent} · ${tournament}`,
    loss: (opponent, tournament) => `負 對戰 ${opponent} · ${tournament}`,
    tbd: (opponent, tournament) => `對戰 ${opponent} · ${tournament}`,
    fallback: 'OWCS Pacific 第二階段主賽事將於 2026 年 6 月 4 日開打。',
    ariaLabel: '賽事跑馬燈',
  },

  player: {
    twitter: 'Twitter',
    twitch: 'Twitch',
    bilibili: 'Bilibili',
    liquipedia: 'Liquipedia',
    dnp: '未出賽',
    inactive: '非現役',
    avatarAlt: (handle, role, hero) =>
      hero ? `${handle}，${role}，代表英雄 ${hero}` : `${handle}，${role}`,
  },

  playerPage: {
    backToRoster: '返回名單',
    heroPool: '英雄池',
    links: '連結',
    realName: '本名',
    metaDescription: (handle, role) => `Najdorf Esports 的${role} ${handle}，征戰 OWCS Pacific。`,
  },

  competedAs: (name) => `代表 ${name} 出戰`,

  skipLink: '跳至主要內容',
};
