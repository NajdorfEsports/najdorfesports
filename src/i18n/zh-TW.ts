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
    games: '遊戲',
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
    // DRAFT PENDING RIRI NATIVE REVIEW
    matchCenterHeading: '賽事中心',
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
    // DRAFT PENDING RIRI NATIVE REVIEW
    coachingDescription:
      '與 Najdorf Esports OWCS Pacific 名單選手 brysonbtw 進行一對一《鬥陣特攻》教學。提供單堂與多堂課程方案，預約時可以信用卡或 PayPal 安全付款。',
    rosterDescription: (headcount, countries) =>
      `Najdorf Esports 現役 OWCS Pacific 名單，共 ${headcount} 名選手，來自 ${countries.join('、')}。`,
    gamesTitle: '遊戲',
    // DRAFT PENDING RIRI NATIVE REVIEW (gamesDescription update + OWdle meta)
    gamesDescription:
      'Najdorf Esports 的每日《鬥陣特攻》小遊戲：三種難度的每日迷你填字，以及每日猜英雄遊戲 OWdle。',
    crosswordTitle: '每日 Overwatch 迷你填字',
    crosswordDescription:
      'Najdorf Esports 免費的每日《鬥陣特攻》迷你填字遊戲。三種難度，美東時間午夜更新，無廣告、無追蹤。',
    owdleTitle: 'OWdle：每日 Overwatch 猜英雄遊戲',
    owdleDescription:
      '從定位、出身、生命值、攻擊類型等線索猜出隱藏的《鬥陣特攻》英雄。Najdorf Esports 的免費每日遊戲，無廣告、無追蹤。',
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

  // DRAFT PENDING RIRI NATIVE REVIEW (entire coaching block below)
  coaching: {
    hero: {
      eyebrow: '教練課程',
      heading: 'Najdorf Esports Overwatch 教練課程',
      subheading: '與我們 OWCS 亞太名單的選手進行一對一訓練。學會贏得比賽所需的站位、習慣與判斷。',
      cta: '認識教練',
    },
    browse: {
      heading: '認識教練',
      lede: '選擇一位教練，挑選你的付款方式，然後預約你的第一堂課。',
      viewSessions: '查看課程',
      filtersLabel: '篩選教練',
      filterRole: '位置',
      filterLanguage: '語言',
      filterHero: '英雄',
      allRoles: '所有位置',
      allLanguages: '所有語言',
      allHeroes: '所有英雄',
      noMatch: '目前沒有符合這些篩選條件的教練。更多教練即將加入。',
      coachAria: (name, role) => `${name}，${role}`,
    },
    coach: {
      specialtiesLabel: '代表英雄',
      languagesLabel: '語言',
      langCantonese: '粵語',
      langMandarin: '國語',
    },
    booking: {
      heading: (name) => `預約 ${name} 的課程`,
      paymentHeading: '你想如何付款？',
      paymentStep: '步驟 1',
      sessionsHeading: '選擇課程',
      sessionsStep: '步驟 2',
      payCard: '信用卡付款',
      payPaypal: '以 PayPal 付款',
      comingSoon: '即將推出',
    },
    offerings: {
      book: '預約',
      securedNote: '預約時可以信用卡或 PayPal 安全付款。我們不會看到你的付款資料。',
      packNote: '課程包在預約時一次付清。你現在先預約第一堂，其餘堂數與你的教練在 Discord 上安排。',
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
          blurb: '兩堂 60 分鐘課程，共 $25（每堂 $12.50）。',
          badge: '省 $5',
        },
        pack4: {
          title: '4 堂課程包',
          blurb: '四堂 60 分鐘課程，共 $50（每堂 $12.50）。',
          badge: '省 $10',
        },
      },
    },
    how: {
      heading: '流程說明',
      step1Title: '選擇並預約',
      step1Body: '選擇一位教練與付款方式，再為你的第一堂課挑選一個開放的時段。',
      step2Title: '安全付款',
      step2Body: '以信用卡或 PayPal 安全付款。課程包於預約時一次付清全額。',
      step3Title: '在 Discord 聯繫',
      step3Body:
        '在結帳時填寫你的 Discord 帳號。我們會將它轉交給你的教練，教練會在 Discord 上加你，安排上課。課程包的其餘堂數與任何改期，都直接在 Discord 上與你的教練安排。',
      step4Title: '分享回饋',
      step4Body: '課程結束後，我們會以電子郵件寄出一份簡短的私下回饋邀請，讓我們持續改進教學。',
    },
    faq: {
      heading: '常見問題',
      q1: '課程包的堂數如何運作？',
      a1: '你在預約時一次付清整個課程包的費用。第一堂課透過行事曆預約，之後其餘堂數由你直接在 Discord 上與教練安排。',
      q2: '我要如何進入課程？',
      a2: '預約確認後，我們會把你的 Discord 帳號轉交給你的教練，教練會在 Discord 上加你以安排課程。請在結帳時填寫你的 Discord 帳號，以便教練聯繫你。',
      q3: '我要如何付款？付款安全嗎？',
      a3: '你可以在預約時以信用卡或 PayPal 付款。款項由付款服務商安全處理，我們不會看到你的付款資料。',
      q4: '我需要準備什麼？',
      a4: '一個 Overwatch 帳號與一個 Discord 帳號。最好也帶上一場近期惜敗的錄影，因為這類比賽最適合用來學習。',
      q5: '我可以改期嗎？',
      a5: '可以。改期由你與教練直接在 Discord 上安排，請盡量提前通知你的教練。',
      q6: '有哪些語言可選？',
      a6: '課程提供粵語與國語。',
      q7: '你們的退款政策是什麼？',
      a7: '課程採預先付款，恕不退款。若你無法出席，可免費改期：請盡量提前在 Discord 上通知你的教練。',
    },
    help: {
      text: '預約前還有疑問嗎？',
      discordCta: '在 Discord 詢問我們',
      emailIntro: '想用電子郵件嗎？來信至',
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
    // DRAFT PENDING RIRI NATIVE REVIEW (the four placeholder strings below)
    placeholderTitle: '更多精華即將推出',
    placeholderBody: (opponent: string, date: string) =>
      `對戰 ${opponent} 的精華將於賽後上線（${date}）。`,
    placeholderBodyEmpty: '下一場系列賽的精華將於賽後上線。',
    subscribeCta: '訂閱 YouTube 頻道',
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
    // DRAFT PENDING RIRI NATIVE REVIEW
    mapByMap: '逐圖戰況',
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
    // Verbatim fragments of the reviewed `record` string above (no new
    // wording), split so the /matches header can color the two halves.
    recordWins: (wins) => `${wins} 勝`,
    recordLosses: (losses) => `${losses} 負`,
    recordJoin: ' ',
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
    // DRAFT PENDING RIRI NATIVE REVIEW (2026-06 ticker reorganization: rubrics + badges)
    results: (stage, record) => `${stage ? `${stage}戰績` : '戰績'}${record ? ` · ${record}` : ''}`,
    upNext: (stage) => (stage ? `即將開賽 · ${stage}` : '即將開賽'),
    upcoming: (date, opponent) => `${date} · 對戰 ${opponent}`,
    result: (opponent, date) => `${opponent} · ${date}`,
    tbd: (opponent, date) => `對戰 ${opponent} · ${date}`,
    winBadge: (score) => (score ? `勝 ${score}` : '勝'),
    lossBadge: (score) => (score ? `負 ${score}` : '負'),
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
    // DRAFT PENDING RIRI NATIVE REVIEW (the seven stats strings below)
    teamRecordHeading: '隊伍戰績',
    teamRecordNote: 'Najdorf Esports 在 OWCS Pacific 2026 的隊伍成績。個人出賽場次未作統計。',
    recentMatchesHeading: '近期比賽',
    mapRecordHeading: '地圖戰績',
    statsEmpty: '尚無完賽紀錄。',
    playedLabel: '場次',
    streakLabel: '近況',
    metaDescription: (handle, role) => `Najdorf Esports 的${role} ${handle}，征戰 OWCS Pacific。`,
  },

  games: {
    hub: {
      eyebrow: '遊戲',
      heading: '遊戲',
      sub: '來自戰隊的每日《鬥陣特攻》小遊戲。免費遊玩，無廣告，不追蹤。',
      crosswordTitle: '每日迷你填字',
      crosswordDesc:
        '一份輕巧的《鬥陣特攻》填字遊戲：英雄、地圖、術語與電競歷史。三種難度，每天更新。',
      crosswordCta: '開始今天的謎題',
      newDaily: '每日更新',
      // DRAFT PENDING RIRI NATIVE REVIEW (OWdle hub card)
      owdleTitle: 'OWdle',
      owdleDesc:
        '猜出今天的隱藏《鬥陣特攻》英雄。每次猜測會比對七項屬性：定位、出身、生命值、推出年份等。每天一位英雄，全球同題。',
      owdleCta: '猜今天的英雄',
      newHeroDaily: '每日新英雄',
    },
    crossword: {
      eyebrow: '每日遊戲',
      heading: 'Overwatch 迷你填字',
      intro: '每天一份《鬥陣特攻》主題迷你填字。選擇難度，開始填格。',
      difficultyLabel: '難度',
      easy: '簡單',
      medium: '中等',
      hard: '困難',
      easyDesc: '休閒玩家',
      mediumDesc: '資深玩家',
      hardDesc: '電競深度題',
      acrossLabel: '橫向',
      downLabel: '縱向',
      checkLabel: '檢查',
      checkLetter: '檢查字母',
      checkWord: '檢查單字',
      checkPuzzle: '檢查全部',
      revealLabel: '顯示答案',
      revealLetter: '顯示字母',
      revealWord: '顯示單字',
      revealPuzzle: '顯示全部',
      clearLabel: '清空格子',
      shareLabel: '分享成績',
      shareCopied: '已複製到剪貼簿',
      nextPuzzleLabel: '下一題倒數',
      timerLabel: '時間',
      completeHeading: '完成！',
      completeBody: (time) => `你用 ${time} 完成了今天的謎題。`,
      completeAssisted: '在提示幫助下完成。明天挑戰全靠自己！',
      statsHeading: '你的紀錄',
      statsPlayed: '已玩',
      statsWon: '完成',
      statsStreak: '連續完成',
      statsMaxStreak: '最佳連續',
      statsBestTime: '最快時間',
      statsNote: '紀錄只儲存在這個瀏覽器中，不會離開你的裝置。',
      noJsNotice:
        '互動謎題需要啟用 JavaScript。格子、提示與進度都只在你的瀏覽器中運行，不會傳送到任何地方。',
      loadError: '無法載入今天的謎題，請重新整理後再試。',
      noPuzzle: '今天的謎題尚未發布，請稍後再來。',
      zhClueNotice: '謎題提示目前僅提供英文，中文版本正在準備中。',
      howToHeading: '玩法說明',
      howTo1: '點選格子後輸入字母。方向鍵移動游標，Tab 跳到下一條提示，Enter 切換橫向與縱向。',
      howTo2:
        '卡關了嗎？「檢查」會標出錯誤的字母，「顯示答案」會直接填入。不靠提示完成，分享圖更漂亮。',
      howTo3: '三種難度每天於美東時間午夜更新。',
      ariaGrid: '填字格',
      ariaKeyboard: '螢幕鍵盤',
      ariaBackspace: '刪除字母',
    },
    // DRAFT PENDING RIRI NATIVE REVIEW (entire owdle section)
    owdle: {
      eyebrow: '每日遊戲',
      heading: 'OWdle',
      intro: '每天一位隱藏的《鬥陣特攻》英雄，全球同題。輸入猜測，每一欄都會告訴你有多接近。',
      zhValuesNotice: '英雄名稱與出身目前以英文顯示。',
      inputLabel: '猜一位英雄',
      inputPlaceholder: '輸入英雄名稱',
      guessButton: '猜',
      suggestionsLabel: '英雄建議',
      unknownHero: '請從建議清單中選擇英雄。',
      colHero: '英雄',
      colRole: '定位',
      colSubRole: '子定位',
      colGender: '性別',
      colOrigin: '出身',
      colHp: '生命值',
      colAttack: '攻擊類型',
      colYear: '年份',
      roleValues: { tank: '坦克', damage: '輸出', support: '輔助' },
      subRoleValues: {
        bruiser: '格鬥型',
        flanker: '側翼',
        initiator: '開團',
        medic: '醫療',
        recon: '偵察',
        sharpshooter: '神射手',
        specialist: '特化',
        stalwart: '坐鎮',
        survivor: '生存',
        tactician: '戰術',
      },
      genderValues: { female: '女性', male: '男性', 'non-binary': '非二元', none: '無' },
      attackValues: { hitscan: '即時命中', projectile: '彈道', beam: '光束', melee: '近戰' },
      legendHeading: '如何閱讀格子',
      legendExact: '完全相符',
      legendPartial: '接近：部分重疊，或相差 25 生命值 / 1 年以內',
      legendMiss: '不相符',
      legendHigher: '答案更高或更晚',
      legendLower: '答案更低或更早',
      winHeading: '答對了！',
      winBody: (hero, count) => `答案是 ${hero}。你用了 ${count} 次猜中。`,
      winBodyOne: (hero) => `答案是 ${hero}。一次猜中！`,
      fitToggle: '縮放至螢幕寬度',
      shareLabel: '分享成績',
      shareCopied: '已複製到剪貼簿',
      puzzleLabel: '題號',
      nextHeroLabel: '下一位英雄倒數',
      yesterdayLabel: '昨天的英雄',
      statsHeading: '你的紀錄',
      statsPlayed: '已玩',
      statsWon: '猜中',
      statsStreak: '連續猜中',
      statsMaxStreak: '最佳連續',
      statsNote: '紀錄只儲存在這個瀏覽器中，不會離開你的裝置。',
      distHeading: '猜測次數分布',
      noJsNotice:
        '互動遊戲需要啟用 JavaScript。猜測、紀錄與每日英雄都只在你的瀏覽器中運行，不會傳送到任何地方。',
      howToHeading: '玩法說明',
      howTo1:
        '輸入英雄名稱進行猜測。每次猜測會填入一列：綠色代表完全相符，橘色代表接近，紅色代表不符。',
      howTo2:
        '「出身」欄的橘色代表來自世界同一區域；「生命值」與「年份」的橘色代表相差 25 以內或一年以內。箭頭指向答案：向上代表更高或更晚，向下代表更低或更早。',
      howTo3: '猜測次數不限。每天美東時間午夜更新英雄。',
      howTo4: '連勝與紀錄只留在這部裝置上；分享只會送出色塊。',
      ariaBoard: '猜測結果格',
      ariaSolvedBoard: '已解開的結果',
      /** Legal text stays in English verbatim on every locale. */
      disclaimer:
        'This is an unofficial fan-made game. It is not affiliated with, endorsed by, or sponsored by Blizzard Entertainment. Overwatch is a trademark of Blizzard Entertainment, Inc. All hero names and related facts are the property of their respective owners.',
      dataCredit: '英雄資料來自社群 OverFast API，並輔以人工整理。',
    },
  },

  competedAs: (name) => `代表 ${name} 出戰`,

  skipLink: '跳至主要內容',
};
