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
    coaching: '教練課程',
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
    aboutTitle: '關於 Najdorf Esports',
    aboutDescription:
      'Najdorf Esports 是一支征戰 OWCS 亞太賽區的《鬥陣特攻》電競組織。了解我們的故事，並與我們合作。',
    coachingTitle: 'Overwatch 教練課程',
    coachingDescription:
      '與 Najdorf Esports OWCS Pacific 名單選手 brysonbtw 進行一對一《鬥陣特攻》教學。提供單堂與多堂課程方案，預約時即以 Stripe 安全付款。',
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
    heroTagline: '在 OWCS Pacific，以紀律駕馭進攻。',
    storyHeading: '故事',
    story1:
      'Najdorf Esports 是一支征戰《鬥陣特攻》冠軍系列賽（OWCS）亞太賽區的電競組織。我們的隊名取自西洋棋西西里防禦中的納道夫變例，這是西洋棋最鋒利的開局之一：建立在深厚的準備之上，始終爭取主動，並敢於從多數人只會選擇防守的局面發動進攻。這正是我們面對《鬥陣特攻》的方式。',
    story2:
      '我們在 2026 賽季第二階段前，收購了原本以 Rankers 名義征戰的選手陣容，正式進入 OWCS Pacific。該陣容曾以 Rankers 之名贏得 2026 OWCS Pacific 第一階段公開預選賽。第二階段是這支隊伍以 Najdorf 名義征戰的首個階段，也是我們打算一個階段接著一個階段穩步建立的長期征程的起點。',
    teamHeading: '隊伍',
    teamBody:
      '我們的陣容匯聚了來自香港、台灣、韓國與中國等地的選手，並由專責的教練與管理團隊支援。',
    rosterLink: '查看目前的選手陣容',
    partnersHeading: '合作',
    partners1:
      'Najdorf Esports 正在 OWCS Pacific 建立長久的存在感，我們歡迎願意與我們一同成長的合作夥伴。我們的核心選手來自香港、台灣與中國大陸，這讓我們能夠觸及粵語與華語的《鬥陣特攻》觀眾，而這正是目前賽區轉播尚未以其母語服務的一群人。對於希望與亞太地區華語電競社群建立連結的品牌而言，這是少有電競組織能提供的機會。',
    partners2:
      '我們可以與合作夥伴在多方面合作：在各個頻道上的品牌曝光、與選手共同創作內容，以及圍繞 OWCS 賽季規劃的品牌活動。若您有意洽談合作，我們很樂意交流。',
    contactHeading: '聯絡',
    contactLabel: '合作與媒體：',
  },

  coaching: {
    hero: {
      eyebrow: '教練課程',
      heading: 'Najdorf Esports Overwatch 教練課程',
      subheading: '與我們 OWCS 亞太名單的選手進行一對一訓練。學會贏得比賽所需的站位、習慣與判斷。',
      cta: '查看課程方案',
    },
    coach: {
      eyebrow: '你的教練',
      country: '香港',
      specialtiesLabel: '代表英雄',
      languagesLabel: '語言',
      langCantonese: '粵語',
      langMandarin: '國語',
      bio: 'brysonbtw 是 Najdorf Esports OWCS Pacific 名單上的輸出選手。他以 Reaper 與 Echo 為核心，打法快速而具侵略性；在教學中，他著重於將紮實的基本功，轉化為決定勝負的站位、目標選擇與臨場判斷。每一堂課都注重實作，並依你的錄影與目標量身打造。',
    },
    offerings: {
      heading: '課程方案',
      lede: '預約單堂課程，或以課程包省下費用。每個課程包在預約時一次付清全額，並可立即預約你的第一堂課。',
      book: '預約',
      securedNote: '預約時由 PayPal 處理付款。',
      durationLabel: (sessions, minutes) =>
        sessions === 1 ? `${minutes} 分鐘` : `${sessions} 堂 x ${minutes} 分鐘`,
      items: {
        single: {
          title: '單堂課程',
          blurb: '一堂 60 分鐘的教學課程。預約時段並支付 $15。',
          badge: '',
        },
        pack2: {
          title: '2 堂課程包',
          blurb:
            '兩堂 60 分鐘課程，共 $25（每堂 $12.50）。你現在先預約第一堂，第二堂由我們直接與你安排。',
          badge: '省 $5',
        },
        pack4: {
          title: '4 堂課程包',
          blurb:
            '四堂 60 分鐘課程，共 $50（每堂 $12.50）。你現在先預約第一堂，其餘各堂由我們直接與你安排。',
          badge: '省 $10',
        },
      },
    },
    how: {
      heading: '流程說明',
      step1Title: '選擇並預約',
      step1Body: '選擇一個方案，並為你的第一堂課挑選一個開放的時段。',
      step2Title: '安全付款',
      step2Body: '安全付款。款項由 PayPal 處理。課程包於預約時一次付清全額。',
      step3Title: '在 Discord 聯繫',
      step3Body:
        '在結帳時填寫你的 Discord 帳號。我們會將它轉交給你的教練，教練會在 Discord 上加你，安排上課。課程包的其餘堂數與任何改期，都直接在 Discord 上與你的教練安排。',
    },
    faq: {
      heading: '常見問題',
      q1: '課程包的堂數如何運作？',
      a1: '你在預約時一次付清整個課程包的費用。第一堂課透過行事曆預約，之後其餘堂數由你直接在 Discord 上與教練安排。',
      q2: '我要如何進入課程？',
      a2: '預約確認後，我們會把你的 Discord 帳號轉交給你的教練，教練會在 Discord 上加你以安排課程。請在結帳時填寫你的 Discord 帳號，以便教練聯繫你。',
      q3: '付款安全嗎？',
      a3: '安全。款項由 PayPal 處理，未來會再加入更多付款方式。我們不會看到你的付款資料。',
      q4: '我需要準備什麼？',
      a4: '一個 Overwatch 帳號與一個 Discord 帳號。最好也帶上一場近期惜敗的錄影，因為這類比賽最適合用來學習。',
      q5: '我可以改期嗎？',
      a5: '可以。改期由你與教練直接在 Discord 上安排，請盡量提前通知你的教練。',
      q6: '有哪些語言可選？',
      a6: '課程提供粵語與國語。',
    },
    help: {
      text: '預約前還有疑問嗎？',
      discordCta: '在 Discord 詢問我們',
    },
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
