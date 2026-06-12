/**
 * Hand-authored Overwatch crossword corpus. Every fact is either base-game
 * knowledge, OWL/OWCS public history, or the 2026 research corpus supplied
 * with the feature brief. Entries with any unconfirmed fact carry
 * verified: false and are listed in REVIEW.md; the generator skips them.
 *
 * Authoring rules (enforced by schema.ts + entries.test.ts):
 * - answer: uppercase A-Z, 3-7 letters (JETPACKCAT is the lone reserved
 *   exception for future larger grids).
 * - a clue never contains its own answer, and never an em-dash.
 * - presence of a difficulty key makes the entry eligible for that tier.
 * - exclusion rules from the brief: no personal-misconduct content, no
 *   RYUJEHONG; SHU is Korean and SEICOE Austrian (neither is clued here);
 *   HADI is clued as a tank pro; pre-acquisition results credit Rankers.
 *
 * zh-TW / zh-CN clue text is deliberately absent: per the owner decision
 * of 2026-06-11, Chinese clues ship only after native (RiRi) review.
 */
import type { Category, CrosswordEntry, Difficulty } from './types';

function def(
  answer: string,
  category: Category,
  clues: Partial<Record<Difficulty, string>>,
  sourceNote: string,
  verified = true,
): CrosswordEntry {
  return { answer, category, clues, verified, sourceNote };
}

export const crosswordEntries: CrosswordEntry[] = [
  // ------------------------------------------------------------------
  // Heroes
  // ------------------------------------------------------------------
  def(
    'ANA',
    'hero',
    {
      easy: 'Egyptian sniper who heals with her rifle',
      medium: 'Support whose grenade blocks enemy healing',
      hard: 'Founding Overwatch member Amari, by hero name',
    },
    'Base game hero',
  ),
  def(
    'ASHE',
    'hero',
    {
      easy: 'Deadlock Gang leader with an omnic butler',
      medium: 'DPS who calls in B.O.B. as her ultimate',
      hard: 'Elizabeth Caledonia ___',
    },
    'Base game hero',
  ),
  def(
    'DVA',
    'hero',
    {
      easy: "Hana Song's call sign, dot dropped",
      medium: 'Tank who ejects and keeps fighting on foot',
      hard: "Her 'Nerf this!' precedes a mech explosion",
    },
    'Base game hero',
  ),
  def(
    'ECHO',
    'hero',
    {
      easy: 'Adaptive omnic who can copy other heroes',
      medium: 'Flying DPS built by Dr. Mina Liao',
      hard: "Her Duplicate borrows someone else's whole kit",
    },
    'Base game hero; Liao link per lore',
  ),
  def(
    'JUNO',
    'hero',
    {
      easy: 'Support hero raised on Mars',
      medium: 'Space-ranger support added in July 2024',
      hard: 'Her Orbital Ray beams the team from above',
    },
    '2024 hero; date per research corpus',
  ),
  def(
    'GENJI',
    'hero',
    {
      easy: 'Cyborg ninja with a sword ultimate',
      medium: 'Shimada brother who returns your bullets',
      hard: 'Blackwatch agent rebuilt by Dr. Ziegler',
    },
    'Base game hero',
  ),
  def(
    'HANZO',
    'hero',
    {
      easy: 'Bow-wielding Shimada brother',
      medium: 'Archer whose ultimate releases twin dragons',
      hard: 'He left the clan after striking down his brother',
    },
    'Base game hero',
  ),
  def(
    'MERCY',
    'hero',
    {
      easy: 'Winged healer who can resurrect',
      medium: 'Doctor whose suit lets her glide to allies',
      hard: 'Hero name of Dr. Angela Ziegler',
    },
    'Base game hero',
  ),
  def(
    'MOIRA',
    'hero',
    {
      easy: 'Geneticist who heals and drains with her hands',
      medium: 'Support who Fades out of danger',
      hard: "O'Deorain with a seat at Talon's table",
    },
    'Base game hero; Talon council per lore',
  ),
  def(
    'ORISA',
    'hero',
    {
      easy: 'Guardian robot built by a girl genius in Numbani',
      medium: 'Tank assembled by Efi Oladele',
      hard: 'Her OW2 rework traded a barrier for a javelin',
    },
    'Base game hero',
  ),
  def(
    'SIGMA',
    'hero',
    {
      easy: 'Gravity-bending scientist tank',
      medium: 'Astrophysicist undone by his own experiment',
      hard: 'Hero name of Dr. Siebren de Kuiper',
    },
    'Base game hero',
  ),
  def(
    'ZARYA',
    'hero',
    {
      easy: 'Russian strongwoman with a particle cannon',
      medium: 'Tank whose bubbles turn damage into energy',
      hard: 'Aleksandra who carries the particle cannon, by hero name',
    },
    'Base game hero',
  ),
  def(
    'MAUGA',
    'hero',
    {
      easy: 'Samoan tank with twin chainguns',
      medium: 'Talon heavy added in November 2023',
      hard: 'He named his guns Gunny and Cha-Cha',
    },
    '2023 hero; date per research corpus',
  ),
  def(
    'FREJA',
    'hero',
    {
      easy: 'Danish bounty hunter with an explosive crossbow',
      medium: 'DPS added in April 2025',
      hard: 'Former search-and-rescue operative from Denmark',
    },
    '2025 hero; date per research corpus',
  ),
  def(
    'LUCIO',
    'hero',
    {
      easy: 'Brazilian DJ who heals with music',
      medium: 'Support who skates walls and swaps songs',
      hard: 'His drop is a Sound Barrier',
    },
    'Base game hero',
  ),
  def(
    'ANRAN',
    'hero',
    {
      medium: 'Hero from the Reign of Talon launch season',
      hard: "One of 2026's Season 1 hero quartet, with Emre, Domina, and Mizuki",
    },
    'Research corpus 2026 (Reign of Talon S1)',
  ),
  def(
    'EMRE',
    'hero',
    {
      medium: 'Hero added in the February 2026 relaunch season',
      hard: 'Reign of Talon Season 1 hero alongside Anran',
    },
    'Research corpus 2026 (Reign of Talon S1)',
  ),
  def(
    'DOMINA',
    'hero',
    {
      medium: 'Hero who arrived with the 2026 relaunch',
      hard: 'Reign of Talon Season 1 hero with a commanding name',
    },
    'Research corpus 2026 (Reign of Talon S1)',
  ),
  def(
    'MIZUKI',
    'hero',
    {
      medium: 'Hero added when the game dropped the 2 from its name',
      hard: 'Reign of Talon Season 1 hero alongside Domina',
    },
    'Research corpus 2026 (Reign of Talon S1)',
  ),
  def(
    'SIERRA',
    'hero',
    {
      medium: "Recon DPS added in 2026's second season",
      hard: "Reign of Talon Season 2's scouting damage hero",
    },
    'Research corpus 2026 (Reign of Talon S2)',
  ),
  def(
    'SHION',
    'hero',
    {
      medium: "Hero added in 2026's Reign of Talon Season 3",
      hard: 'Third-season addition to the year-long 2026 arc',
    },
    'Research corpus 2026 (Reign of Talon S3)',
  ),
  def(
    'JETPACKCAT',
    'hero',
    {
      medium: "Feline flier of 2026's relaunch season",
      hard: 'Famously scrapped hero concept made real in the Reign of Talon',
    },
    'Research corpus 2026; needs an 8+ grid, reserved for future sizes',
  ),
  def(
    'HAZARD',
    'hero',
    {
      easy: 'Spiky Scottish tank',
      medium: 'Tank from the Phreaks, added November 2024',
      hard: "Findlay Docherty's hero name",
    },
    '2024 hero; date and Phreaks per research corpus',
  ),
  def(
    'REAPER',
    'hero',
    {
      easy: 'Shotgun-toting wraith in a skull mask',
      medium: 'Death Blossom is his spin of doom',
      hard: 'What Gabriel Reyes became after Zurich',
    },
    'Base game hero',
  ),
  def(
    'SOMBRA',
    'hero',
    {
      easy: 'Hacker who turns invisible',
      medium: 'Her EMP wipes barriers and locks abilities',
      hard: 'Alias of Olivia Colomar',
    },
    'Base game hero',
  ),
  def(
    'TRACER',
    'hero',
    {
      easy: 'Time-jumping Brit on the box art',
      medium: 'She blinks forward and rewinds back',
      hard: "Lena Oxton's call sign, kept stable by a chronal accelerator",
    },
    'Base game hero',
  ),
  def(
    'PHARAH',
    'hero',
    {
      easy: 'Rocket-launcher hero who rains justice from above',
      medium: "Helix Security captain and Ana's daughter",
      hard: "Fareeha Amari's call sign",
    },
    'Base game hero',
  ),
  def(
    'KIRIKO',
    'hero',
    {
      easy: 'Fox-spirit healer with paper talismans',
      medium: 'Support whose Suzu cleanses debuffs',
      hard: 'Kamori who protects Kanezaka',
    },
    'OW2 launch hero',
  ),
  def(
    'ILLARI',
    'hero',
    {
      easy: 'Peruvian support empowered by the sun',
      medium: 'Support whose pylon heals while she shoots',
      hard: 'Last of the Inti Warriors',
    },
    '2023 hero',
  ),
  def(
    'WUYANG',
    'hero',
    {
      medium: 'Water-wielding support added in August 2025',
      hard: 'Support who joined between Freja and Vendetta',
    },
    '2025 hero; date per research corpus',
  ),
  def(
    'WINSTON',
    'hero',
    {
      easy: 'Genetically engineered gorilla scientist',
      medium: 'Tank who leaps in and zaps with a Tesla Cannon',
      hard: 'He grew up on the Horizon Lunar Colony',
    },
    'Base game hero',
  ),
  def(
    'JUNKRAT',
    'hero',
    {
      easy: 'Australian demolitions maniac',
      medium: 'His tire rolls in for the highlight',
      hard: 'Jamison Fawkes, one half of the Junkertown duo',
    },
    'Base game hero',
  ),
  def(
    'SOJOURN',
    'hero',
    {
      easy: 'Railgun-wielding Canadian DPS',
      medium: 'Her railgun charges as she lands shots',
      hard: "Vivian Chase's call sign",
    },
    'OW2 launch hero',
  ),
  def(
    'VENTURE',
    'hero',
    {
      easy: 'Drill-toting archaeologist hero',
      medium: 'They/them hero added in March 2024',
      hard: 'Sloane Cameron of the Wayfinder Society',
    },
    '2024 hero; date per research corpus',
  ),
  def(
    'BASTION',
    'hero',
    {
      easy: 'Transforming robot with a pet bird',
      medium: 'Omnic who reconfigures into an assault turret',
      hard: 'Siege automaton unit E54',
    },
    'Base game hero',
  ),
  def(
    'CASSIDY',
    'hero',
    {
      easy: 'Cowboy DPS with a six-shooter',
      medium: 'His Peacekeeper fans the hammer',
      hard: 'Surname the cowboy adopted in late 2021',
    },
    'Base game hero; 2021 rename',
  ),
  def(
    'ROADHOG',
    'hero',
    {
      easy: 'Hook-slinging Junker tank',
      medium: 'He huffs a canister to Take a Breather',
      hard: "Mako Rutledge's Junker name",
    },
    'Base game hero',
  ),
  def(
    'SOLDIER',
    'hero',
    {
      easy: '___: 76, the visored vigilante',
      medium: 'Sprinting DPS with rockets in his rifle',
      hard: 'What Jack Morrison became after the fall',
    },
    'Base game hero',
  ),
  def(
    'MEI',
    'hero',
    {
      easy: 'Climatologist who freezes her foes',
      medium: 'She walls off chokes with ice',
      hard: "Ecopoint: Antarctica's cryosleep survivor",
    },
    'Base game hero',
  ),

  // ------------------------------------------------------------------
  // Real names
  // ------------------------------------------------------------------
  def(
    'COLE',
    'realname',
    { medium: "Cassidy's first name", hard: 'First name the 2021 cowboy rename introduced' },
    'Official rename, 2021',
  ),
  def(
    'HANA',
    'realname',
    { easy: "D.Va's first name", medium: 'Song who pilots a mech for her country' },
    'Base game lore',
  ),
  def(
    'ANGELA',
    'realname',
    { medium: "Dr. Ziegler's first name", hard: 'Mercy, on her medical license' },
    'Base game lore',
  ),
  def(
    'MAKO',
    'realname',
    { medium: "Roadhog's real first name", hard: 'Rutledge behind the pig mask' },
    'Base game lore',
  ),
  def(
    'AKANDE',
    'realname',
    { medium: "Doomfist's first name", hard: "Ogundimu who leads Talon's council" },
    'Base game lore',
  ),
  def(
    'NIRAN',
    'realname',
    { medium: "Lifeweaver's first name", hard: 'Pruksamanee who grows Biolight' },
    'Base game lore; corpus',
  ),
  def(
    'SLOANE',
    'realname',
    { medium: "Venture's first name", hard: 'Cameron who digs for a living' },
    'Base game lore; corpus',
  ),
  def(
    'VIVIAN',
    'realname',
    { medium: "Sojourn's first name", hard: 'Chase with a railgun' },
    'Base game lore; corpus',
  ),
  def(
    'OLIVIA',
    'realname',
    { medium: "Sombra's real first name", hard: 'Colomar, before the alias' },
    'Base game lore; corpus',
  ),
  def(
    'AMELIE',
    'realname',
    { medium: "Widowmaker's first name", hard: 'Lacroix, the widow in question' },
    'Base game lore; corpus',
  ),
  def(
    'ODESSA',
    'realname',
    { medium: "The Junker Queen's first name", hard: 'Stone who rules Junkertown' },
    'Base game lore; corpus',
  ),
  def(
    'KAMORI',
    'realname',
    { medium: "Kiriko's family name", hard: 'Family of shrine guardians in Kanezaka' },
    'Base game lore; corpus',
  ),
  def(
    'MARZIA',
    'realname',
    { medium: "Vendetta's first name", hard: 'Bartalotti behind the December 2025 hero' },
    'Research corpus (Vendetta, Dec 2025)',
  ),
  def(
    'FINDLAY',
    'realname',
    { medium: "Hazard's first name", hard: 'Docherty with the spikes' },
    'Base game lore; corpus',
  ),
  def(
    'LENA',
    'realname',
    { easy: "Tracer's first name", medium: 'Oxton out of time' },
    'Base game lore',
  ),
  def(
    'JACK',
    'realname',
    {
      medium: "First name of Overwatch's first Strike Commander",
      hard: 'Morrison, before the visor',
    },
    'Base game lore',
  ),
  def(
    'GABRIEL',
    'realname',
    { medium: 'Reyes who became Reaper', hard: "Blackwatch's commander, by first name" },
    'Base game lore',
  ),
  def(
    'JAMISON',
    'realname',
    { medium: "Junkrat's first name", hard: 'Fawkes, fittingly explosive' },
    'Base game lore',
  ),
  def(
    'SATYA',
    'realname',
    { medium: "Symmetra's first name", hard: 'Vaswani of Vishkar' },
    'Base game lore',
  ),
  def(
    'EFI',
    'realname',
    { easy: 'Girl genius who built Orisa', medium: "Oladele, Numbani's robotics prodigy" },
    'Base game lore',
  ),
  def(
    'MINA',
    'realname',
    {
      medium: 'First name of the founder who created Echo',
      hard: 'Dr. ___ Liao, one of the six Overwatch founders',
    },
    'Base game lore; corpus (founders)',
  ),
  def(
    'LIAO',
    'realname',
    { hard: 'Founding Overwatch member Mina ___' },
    'Base game lore; corpus (founders)',
  ),
  def(
    'FAREEHA',
    'realname',
    { medium: "Pharah's first name", hard: 'Amari the younger' },
    'Base game lore',
  ),
  def(
    'SIEBREN',
    'realname',
    { medium: "Sigma's first name", hard: 'De Kuiper who heard the melody of the universe' },
    'Base game lore; corpus',
  ),
  def('OXTON', 'realname', { medium: "Tracer's surname" }, 'Base game lore'),
  def(
    'AMARI',
    'realname',
    {
      medium: 'Family name shared by Ana and Pharah',
      hard: 'Surname on two generations of Overwatch service',
    },
    'Base game lore',
  ),
  def(
    'REYES',
    'realname',
    { medium: "Reaper's surname", hard: 'Gabriel who ran Blackwatch' },
    'Base game lore',
  ),
  def(
    'SHIMADA',
    'realname',
    { easy: 'Clan name of Genji and Hanzo', medium: 'Dragon-blooded family of Hanamura' },
    'Base game lore',
  ),
  def(
    'WILHELM',
    'realname',
    { medium: "Reinhardt's surname", hard: 'Crusader surname out of Stuttgart' },
    'Base game lore',
  ),
  def(
    'LACROIX',
    'realname',
    { medium: "Widowmaker's surname", hard: "Gerard's surname, and his widow's" },
    'Base game lore',
  ),
  def('FAWKES', 'realname', { medium: "Junkrat's surname" }, 'Base game lore'),
  def('COLOMAR', 'realname', { hard: "Sombra's surname" }, 'Base game lore'),
  def('ZIEGLER', 'realname', { medium: "Mercy's surname" }, 'Base game lore'),
  def(
    'SONG',
    'realname',
    { easy: 'Hana ___, MEKA pilot', medium: "What Lucio switches mid-fight, or D.Va's surname" },
    'Base game lore',
  ),
  def(
    'CHASE',
    'realname',
    { medium: "Sojourn's surname", hard: "Vivian on Overwatch's roster of captains" },
    'Base game lore; corpus',
  ),
  def('STONE', 'realname', { medium: "The Junker Queen's surname" }, 'Base game lore; corpus'),

  // ------------------------------------------------------------------
  // Abilities
  // ------------------------------------------------------------------
  def(
    'SLEEP',
    'ability',
    { easy: "What Ana's dart makes you do", medium: 'Dart that cancels a channeled ultimate' },
    'Base game kit',
  ),
  def(
    'SUZU',
    'ability',
    {
      easy: "Kiriko's cleansing bell",
      medium: 'Charm that grants brief invulnerability',
      hard: "The hard counter to Ana's purple",
    },
    'Base game kit',
  ),
  def(
    'LAMP',
    'ability',
    {
      medium: "Community name for Baptiste's Immortality Field",
      hard: 'Shoot the drone, not the glow, to break this save',
    },
    'Community jargon for Baptiste kit',
  ),
  def(
    'BEAT',
    'ability',
    { easy: "Lucio's big save, to fans", medium: 'Sound Barrier, in caster speak' },
    'Community jargon for Lucio kit',
  ),
  def(
    'HOOK',
    'ability',
    {
      easy: "Roadhog's signature grab",
      medium: 'Chain that pulls you into point-blank range',
      hard: "The first half of Overwatch's oldest one-shot complaint",
    },
    'Base game kit',
  ),
  def(
    'SHATTER',
    'ability',
    {
      easy: "Reinhardt's hammer-down ultimate, in callouts",
      medium: 'Slam that floors everyone in front of the hammer',
    },
    'Base game kit',
  ),
  def(
    'BLINK',
    'ability',
    { easy: "Tracer's short teleport", medium: 'Three charges of forward zip' },
    'Base game kit',
  ),
  def(
    'RECALL',
    'ability',
    {
      easy: "Tracer's rewind through time",
      medium: 'Three seconds back, health included',
      hard: 'Also the animated short where Winston reassembles Overwatch',
    },
    'Base game kit; Recall short',
  ),
  def(
    'DEADEYE',
    'ability',
    {
      easy: "Cassidy's high-noon ultimate",
      medium: 'Lock-on ult you dodge by breaking line of sight',
    },
    'Base game kit',
  ),
  def(
    'HELIX',
    'ability',
    {
      easy: "Soldier: 76's ___ Rockets",
      hard: 'Security International that employs Pharah',
    },
    'Base game kit; Helix Security lore',
  ),
  def(
    'VISOR',
    'ability',
    {
      easy: 'What Soldier: 76 pops to stop missing',
      medium: "Soldier: 76's lock-on ultimate, casually",
    },
    'Community jargon for Soldier kit',
  ),
  def(
    'NANO',
    'ability',
    { easy: "Ana's ___ Boost", medium: 'Buff that turns a teammate into a raid boss' },
    'Base game kit',
  ),
  def(
    'RALLY',
    'ability',
    { easy: "Brigitte's marching ultimate", medium: "Brigitte's armor-building ultimate" },
    'Base game kit',
  ),
  def(
    'GRIP',
    'ability',
    { medium: "Lifeweaver's Life ___, the rescue (or the grief)" },
    'Base game kit',
  ),
  def(
    'BARRIER',
    'ability',
    { easy: 'Shield, in hero-shooter speak', medium: 'What Reinhardt holds while the team works' },
    'Base game kit',
  ),
  def(
    'TURRET',
    'ability',
    { easy: "Torbjorn's pet gun", medium: "Bastion's stationary configuration" },
    'Base game kit',
  ),
  def(
    'TRAP',
    'ability',
    { easy: "Junkrat's snapping snare", medium: "Junkrat's Steel ___" },
    'Base game kit',
  ),
  def(
    'MINE',
    'ability',
    { easy: "Junkrat's pocket bomb", medium: "Junkrat's Concussion ___, escape tool and finisher" },
    'Base game kit',
  ),
  def(
    'EMP',
    'ability',
    {
      easy: "Sombra's everything-off ultimate",
      medium: 'Blast that strips shields and locks kits',
    },
    'Base game kit',
  ),
  def(
    'HACK',
    'ability',
    { easy: "Sombra's specialty", medium: 'It locks your abilities for a moment' },
    'Base game kit',
  ),
  def(
    'STEALTH',
    'ability',
    { easy: "Sombra's disappearing act", medium: "Sombra's invisibility, formally" },
    'Base game kit',
  ),
  def(
    'GRAV',
    'ability',
    {
      medium: "Zarya's ultimate, in callouts",
      hard: "'___ dragon' was the classic OW1 wombo combo",
    },
    'Community jargon for Zarya kit',
  ),
  def(
    'PULSE',
    'ability',
    { medium: "Tracer's ___ Bomb", hard: 'Stick this and the highlight is yours' },
    'Base game kit',
  ),
  def('STORM', 'ability', { medium: "Hanzo's ___ Arrows" }, 'Base game kit'),
  def(
    'SONIC',
    'ability',
    { medium: "Hanzo's wallhack arrow, or Lucio's gun" },
    'Base game kits (Hanzo, Lucio)',
  ),
  def(
    'DEFLECT',
    'ability',
    { easy: "Genji's bullet-return move", medium: 'Why you stop shooting at the ninja' },
    'Base game kit',
  ),
  def('FORTIFY', 'ability', { medium: "Orisa's brace that shrugs off stuns" }, 'Base game kit'),
  def(
    'JAVELIN',
    'ability',
    { medium: "Orisa's throwable spear", hard: 'The Energy ___ that replaced her barrier in OW2' },
    'OW2 rework kit',
  ),
  def(
    'HALT',
    'ability',
    { hard: "Orisa's OW1 mini-graviton, removed in her rework" },
    'OW1 kit history',
  ),
  def(
    'PRIMAL',
    'ability',
    { easy: "Winston's ___ Rage", medium: 'Rage mode that trades damage for knockback' },
    'Base game kit',
  ),
  def(
    'BUBBLE',
    'ability',
    {
      easy: "Zarya's or Winston's pocket shield, casually",
      medium: "What feeds Zarya's energy when you shoot it",
    },
    'Community jargon for base kits',
  ),
  def(
    'FADE',
    'ability',
    { easy: "Moira's ghost-dash escape", medium: "Moira's slippery escape, formally" },
    'Base game kit',
  ),
  def(
    'ORB',
    'ability',
    { easy: "Zenyatta's floating sphere", medium: "Harmony or Discord, for Zenyatta's targets" },
    'Base game kit',
  ),
  def(
    'TRANCE',
    'ability',
    { medium: "Zenyatta's giant heal ultimate, abbreviated by casters" },
    'Community jargon for Zenyatta kit',
  ),
  def(
    'KITSUNE',
    'ability',
    { easy: "Kiriko's ___ Rush", medium: 'Fox-spirit ultimate that speeds the whole team' },
    'OW2 kit',
  ),
  def(
    'DASH',
    'ability',
    { medium: "Genji's Swift Strike, in shorthand", hard: 'It resets on elimination during Blade' },
    'Base game kit',
  ),
  def(
    'WRAITH',
    'ability',
    { easy: "Reaper's smoke-form escape", medium: "Reaper's untouchable form" },
    'Base game kit',
  ),
  def(
    'WALL',
    'ability',
    {
      easy: "Mei's choke-blocking ice ___",
      medium: "Five pillars of 'why is my team split in half'",
    },
    'Base game kit',
  ),
  def('CRYO', 'ability', { medium: "Mei's self-freeze tube, for short" }, 'Base game kit'),
  def('WHIP', 'ability', { medium: "Brigitte's ___ Shot, the boop on a chain" }, 'Base game kit'),
  def(
    'BASH',
    'ability',
    { medium: "Brigitte's Shield ___", hard: 'GOATS-era stun that ate nerf after nerf' },
    'Base game kit; balance history',
  ),
  def('INSPIRE', 'ability', { medium: "Brigitte's healing passive" }, 'Base game kit'),
  def('REPAIR', 'ability', { medium: "Brigitte's ___ Pack, armor by airmail" }, 'Base game kit'),
  def('OVERRUN', 'ability', { medium: "Mauga's stampeding charge" }, 'Base game kit'),
  def(
    'CHARGE',
    'ability',
    {
      easy: "Reinhardt's pin rush",
      medium: "The ability behind every scream into a wall, or Guangzhou's OWL team",
    },
    'Base game kit; OWL franchise',
  ),
  def('PUNCH', 'ability', { medium: "Doomfist's Rocket ___" }, 'Base game kit'),
  def('SLAM', 'ability', { medium: "Doomfist's Seismic ___" }, 'Base game kit'),
  def('NADE', 'ability', { medium: "Ana's anti-heal toss, in callouts" }, 'Community jargon'),
  def(
    'REZ',
    'ability',
    { easy: "Mercy's revive, for short", medium: "The 'deny their pick' button" },
    'Community jargon for Mercy kit',
  ),
  def('AMP', 'ability', { easy: "Lucio's '___ It Up!'" }, 'Base game kit'),
  def('PYLON', 'ability', { medium: "Illari's auto-healing gadget" }, 'Base game kit'),
  def(
    'ROCK',
    'ability',
    { medium: "Sigma's Accretion, to everyone it stuns" },
    'Community jargon for Sigma kit',
  ),
  def('FLUX', 'ability', { medium: "Sigma's Gravitic ___" }, 'Base game kit'),
  def(
    'RIPTIRE',
    'ability',
    { medium: "Junkrat's rolling ultimate, minus the hyphen" },
    'Base game kit',
  ),
  def('BLOSSOM', 'ability', { medium: "Reaper's Death ___" }, 'Base game kit'),
  def(
    'VALK',
    'ability',
    { medium: "Mercy's ultimate, in shorthand" },
    'Community jargon for Mercy kit',
  ),
  def(
    'BLADE',
    'ability',
    {
      medium: "Genji's sword ultimate, in callouts",
      hard: "'He has ___' is the cue to group up",
    },
    'Community jargon for Genji kit',
  ),
  def(
    'PIN',
    'ability',
    { medium: 'What a charging Reinhardt does to you on a wall' },
    'Base game kit',
  ),
  def('BOOST', 'ability', { medium: "Mercy's blue beam, damage ___" }, 'Base game kit'),

  // ------------------------------------------------------------------
  // Maps
  // ------------------------------------------------------------------
  def(
    'OASIS',
    'map',
    {
      easy: 'Control map in the Arabian Desert',
      medium: 'Control map with a deadly jump pad and a University',
      hard: 'City of science whose Minister of Genetics is Moira',
    },
    'Base game map; Moira lore',
  ),
  def(
    'ILIOS',
    'map',
    {
      easy: 'Greek control map with a famous well',
      medium: 'Control map with Ruins and Lighthouse points',
      hard: 'Where more boops happen per match than anywhere else',
    },
    'Base game map',
  ),
  def(
    'BUSAN',
    'map',
    {
      easy: 'Korean control map',
      medium: 'Control map with MEKA Base and Sanctuary',
      hard: "D.Va's home city",
    },
    'Base game map',
  ),
  def(
    'NEPAL',
    'map',
    {
      easy: 'Mountain monastery control map',
      medium: 'Control map with Village, Shrine, and Sanctum',
      hard: 'Where the Shambali preach omnic enlightenment',
    },
    'Base game map',
  ),
  def(
    'DORADO',
    'map',
    {
      easy: 'Mexican escort map at festival time',
      medium: 'Escort map lit by the Festival de la Luz',
      hard: "LumeriCo's hometown map",
    },
    'Base game map',
  ),
  def(
    'HAVANA',
    'map',
    {
      easy: 'Cuban escort map',
      medium: 'Escort map past the Don Rumbotico distillery',
    },
    'Base game map',
  ),
  def(
    'RIALTO',
    'map',
    {
      easy: 'Venetian escort map',
      medium: 'Escort map through Talon turf in Venice',
      hard: 'Map born from the Retribution mission',
    },
    'Base game map; Retribution event',
  ),
  def(
    'NUMBANI',
    'map',
    {
      easy: 'African city where humans and omnics live as one',
      medium: "Hybrid map guarding Doomfist's gauntlet",
      hard: 'Home of the Unity Day celebration',
    },
    'Base game map',
  ),
  def(
    'PARIS',
    'map',
    {
      easy: 'French assault map, now retired',
      medium: "2CP map removed with OW2's launch",
      hard: 'Its defense-side piano was the best part of the map',
    },
    'OW1 map history',
  ),
  def(
    'ANUBIS',
    'map',
    {
      easy: 'Temple of ___, classic Egyptian 2CP map',
      medium: 'Retired assault map above a buried god program',
      hard: 'The AI sealed beneath the temple after the Crisis',
    },
    'OW1 map history; lore',
  ),
  def(
    'SAMOA',
    'map',
    { easy: 'Pacific island control map', medium: 'OW2-era control map in Polynesia' },
    'OW2 map (2023)',
  ),
  def(
    'MIDTOWN',
    'map',
    { easy: 'New York hybrid map', medium: 'Manhattan hybrid map added with OW2' },
    'OW2 launch map',
  ),
  def(
    'HANAOKA',
    'map',
    {
      medium: 'Clash map on familiar Hanamura ground',
      hard: "Where Clash debuted, on the Shimada clan's doorstep",
    },
    'OW2 Clash map',
  ),
  def('THRONE', 'map', { medium: '___ of Anubis, the Egyptian Clash map' }, 'OW2 Clash map'),
  def(
    'ROUTE',
    'map',
    { easy: '___ 66, American escort map', medium: 'Escort map through a Deadlock Gorge diner' },
    'Base game map',
  ),
  def('CIRCUIT', 'map', { medium: '___ Royal, Monte Carlo escort map' }, 'OW2 launch map'),
  def('PETRA', 'map', { medium: 'Deathmatch map carved into Jordanian cliffs' }, 'OW1 map (2018)'),
  def(
    'CHATEAU',
    'map',
    { medium: "___ Guillard, Widowmaker's family estate" },
    'Base game deathmatch map',
  ),
  def(
    'LIJIANG',
    'map',
    {
      easy: '___ Tower, Chinese control map',
      medium: 'Control map with Night Market and Garden points',
    },
    'Base game map',
  ),
  def(
    'KINGS',
    'map',
    {
      easy: '___ Row, London hybrid map',
      hard: '___ Row, where Widowmaker shot Mondatta',
    },
    'Base game map; Alive short',
  ),
  def(
    'AATLIS',
    'map',
    { medium: 'Flashpoint map added in 2025' },
    'Ship date unconfirmed at authoring time; verify against Liquipedia',
    false,
  ),

  // ------------------------------------------------------------------
  // Modes
  // ------------------------------------------------------------------
  def(
    'HYBRID',
    'mode',
    {
      easy: 'Capture a point, then push the payload',
      medium: 'Mode that is half assault, half escort',
    },
    'Base game mode',
  ),
  def(
    'ESCORT',
    'mode',
    { easy: 'Payload-pushing mode', medium: 'Mode where the cart needs a babysitter' },
    'Base game mode',
  ),
  def(
    'CONTROL',
    'mode',
    { easy: 'Best-of-three king of the hill mode', medium: 'The mode of 99-to-99 heartbreaks' },
    'Base game mode',
  ),
  def(
    'PUSH',
    'mode',
    {
      easy: 'Mode starring a friendly robot and a barricade',
      medium: 'TS-1 does the heavy lifting in this OW2 mode',
    },
    'OW2 mode',
  ),
  def(
    'CLASH',
    'mode',
    { easy: 'Tug-of-war capture mode added in 2024', medium: 'Five-point back-and-forth mode' },
    'OW2 mode (2024)',
  ),
  def('ARCADE', 'mode', { easy: 'Where the weird game modes live' }, 'Base game feature'),
  def(
    'STADIUM',
    'mode',
    { medium: 'Round-based 2025 mode with builds and an item shop' },
    'OW2 mode (2025)',
  ),
  def('PAYLOAD', 'mode', { easy: 'The thing you push (or forget to push)' }, 'Base game object'),
  def(
    'KOTH',
    'mode',
    {
      easy: 'King of the hill, for short',
      medium: "Control's nickname, borrowed from older shooters",
    },
    'Community jargon',
  ),
  def(
    'CTF',
    'mode',
    { easy: 'Capture the flag, for short', medium: 'Flag mode that returns every Lunar New Year' },
    'Seasonal mode',
  ),
  def('MYSTERY', 'mode', { easy: '___ Heroes, the roulette arcade mode' }, 'Arcade mode'),
  def('COMP', 'mode', { easy: 'Ranked queue, casually' }, 'Community jargon'),
  def('RANKED', 'mode', { easy: 'Competitive play, by another name' }, 'Community jargon'),

  // ------------------------------------------------------------------
  // Jargon
  // ------------------------------------------------------------------
  def(
    'GOATS',
    'jargon',
    {
      medium: 'Three-tank, three-support meta named after a team',
      hard: 'The comp that pushed Blizzard to role queue',
    },
    'OWL-era meta history',
  ),
  def(
    'DIVE',
    'jargon',
    {
      easy: 'Jumping the backline, as a strategy',
      medium: 'Winston-led aggression archetype',
      hard: 'What Genji, Tracer, and a gorilla do to a Zen',
    },
    'Community jargon',
  ),
  def(
    'BRAWL',
    'jargon',
    { easy: 'A messy close-range scrap', medium: 'Close-range deathball style' },
    'Community jargon',
  ),
  def(
    'POKE',
    'jargon',
    { easy: 'Chip at them from far away', medium: 'Long-range chip-damage style' },
    'Community jargon',
  ),
  def(
    'PEEL',
    'jargon',
    { easy: 'Turn back to protect your healers', medium: 'Turn around and save your supports' },
    'Community jargon',
  ),
  def(
    'SPAM',
    'jargon',
    { easy: 'Mindless choke damage, or what the emote wheel suffers' },
    'Community jargon',
  ),
  def(
    'SMURF',
    'jargon',
    {
      easy: 'Pro hiding on a beginner account',
      medium: 'High-ranked player on a fresh low account',
    },
    'Community jargon',
  ),
  def(
    'META',
    'jargon',
    { easy: "What's strong right now", medium: 'The comps everyone copies from pros' },
    'Community jargon',
  ),
  def(
    'NERF',
    'jargon',
    { easy: 'Balance change that weakens', hard: 'What happened to Brigitte, repeatedly' },
    'Community jargon',
  ),
  def('BUFF', 'jargon', { easy: 'Balance change that strengthens' }, 'Community jargon'),
  def(
    'ULT',
    'jargon',
    { easy: 'Your Q ability, for short', medium: 'What you track for the enemy team, ideally' },
    'Community jargon',
  ),
  def(
    'POTG',
    'jargon',
    {
      easy: 'The end-of-match highlight, for short',
      medium: "What Junkrat's tire steals from everyone else",
    },
    'Base game feature',
  ),
  def('DIFF', 'jargon', { easy: "'Tank ___': the rudest scoreboard verdict" }, 'Community jargon'),
  def(
    'ANTI',
    'jargon',
    { medium: 'Purple no-healing state, for short', hard: 'What Suzu cleanses first' },
    'Community jargon',
  ),
  def(
    'BOOP',
    'jargon',
    { easy: "Lucio's friendly shove off the map", medium: 'The sound of an environmental kill' },
    'Community jargon',
  ),
  def('DPS', 'jargon', { easy: 'The damage role, for short' }, 'Community jargon'),
  def(
    'TANK',
    'jargon',
    { easy: 'The frontline role', medium: "The role that gets the 'diff' blame first" },
    'Community jargon',
  ),
  def('FLEX', 'jargon', { easy: 'Fill any role, as a player' }, 'Community jargon'),
  def(
    'HITSCAN',
    'jargon',
    {
      easy: 'Bullets that land the instant you click',
      medium: 'Weapons with no projectile travel time',
    },
    'Community jargon',
  ),
  def(
    'FEED',
    'jargon',
    { easy: 'Die over and over to the same team', medium: 'Die repeatedly, charging enemy ults' },
    'Community jargon',
  ),
  def('THROW', 'jargon', { easy: 'Lose on purpose' }, 'Community jargon'),
  def('TILT', 'jargon', { easy: 'Frustration that makes you play worse' }, 'Community jargon'),
  def('CARRY', 'jargon', { easy: 'Win the game mostly by yourself' }, 'Community jargon'),
  def('CLUTCH', 'jargon', { easy: 'Save a lost fight at the last second' }, 'Community jargon'),
  def(
    'STAGGER',
    'jargon',
    { medium: 'Die late so your team waits even longer' },
    'Community jargon',
  ),
  def('WHIFF', 'jargon', { easy: 'Miss badly' }, 'Community jargon'),
  def('FRAG', 'jargon', { medium: 'An elimination, in old-school FPS speak' }, 'Community jargon'),
  def('SCRIM', 'jargon', { easy: 'Practice match between teams' }, 'Community jargon'),
  def(
    'VOD',
    'jargon',
    {
      easy: 'Recorded match you review, for short',
      medium: 'What a coach makes you rewatch after a loss',
    },
    'Community jargon',
  ),
  def(
    'MMR',
    'jargon',
    { medium: 'The hidden number behind your rank, for short' },
    'Community jargon',
  ),
  def('ELO', 'jargon', { medium: 'Rating system named for a chess master' }, 'Community jargon'),
  def('QUEUE', 'jargon', { easy: 'What you sit in before a match' }, 'Community jargon'),
  def('MAIN', 'jargon', { easy: 'The hero you always pick' }, 'Community jargon'),
  def(
    'POCKET',
    'jargon',
    { easy: 'Glue a Mercy to one star player', medium: 'Dedicate a Mercy to one DPS' },
    'Community jargon',
  ),
  def(
    'CHEESE',
    'jargon',
    { medium: "A cheap strategy that works until it doesn't" },
    'Community jargon',
  ),
  def('COUNTER', 'jargon', { easy: 'The hero you swap to beat their hero' }, 'Community jargon'),
  def(
    'KITE',
    'jargon',
    { medium: "Stay just out of a tank's reach while it chases" },
    'Community jargon',
  ),
  def(
    'ROLLOUT',
    'jargon',
    { medium: 'A rehearsed path from spawn to the fight' },
    'Community jargon',
  ),
  def('SPAWN', 'jargon', { easy: 'Where heroes appear after dying' }, 'Base game'),
  def('WIPE', 'jargon', { easy: 'A whole team dead at once' }, 'Community jargon'),
  def('PICK', 'jargon', { easy: 'A first kill that opens the fight' }, 'Community jargon'),
  def('TRADE', 'jargon', { easy: 'Answer a death with a death' }, 'Community jargon'),
  def('CRIT', 'jargon', { easy: 'A headshot, on the damage numbers' }, 'Community jargon'),
  def(
    'ONESHOT',
    'jargon',
    { medium: 'Kill from full health in a single combo' },
    'Community jargon',
  ),
  def('BURST', 'jargon', { medium: 'Damage that arrives all at once' }, 'Community jargon'),
  def(
    'SUSTAIN',
    'jargon',
    { medium: "A comp's ability to out-heal incoming damage" },
    'Community jargon',
  ),
  def(
    'UPTIME',
    'jargon',
    { medium: 'How long you spend actually dealing damage' },
    'Community jargon',
  ),
  def(
    'ANGLE',
    'jargon',
    { medium: "Off-___: attacking from where they aren't looking" },
    'Community jargon',
  ),
  def('FLANK', 'jargon', { easy: 'Attack from the side' }, 'Community jargon'),
  def(
    'BACKCAP',
    'jargon',
    { medium: 'Steal the point while everyone is elsewhere' },
    'Community jargon',
  ),
  def('WINCON', 'jargon', { medium: 'Your path to victory, for short' }, 'Community jargon'),
  def('DUO', 'jargon', { easy: 'Queue partner' }, 'Community jargon'),
  def('STACK', 'jargon', { easy: "A premade group, as in 'five-___'" }, 'Community jargon'),
  def(
    'TOUCH',
    'jargon',
    { medium: 'Reach the point in overtime to keep it alive' },
    'Base game rules',
  ),
  def('CART', 'jargon', { easy: 'The payload, affectionately' }, 'Community jargon'),
  def('CALLOUT', 'jargon', { easy: "'Widow, top left!' for example" }, 'Community jargon'),
  def('BAIT', 'jargon', { medium: 'Dangle yourself so they overextend' }, 'Community jargon'),
  def('HOG', 'jargon', { easy: 'The hook tank, to his friends' }, 'Community nickname'),
  def(
    'BALL',
    'jargon',
    { easy: 'Wrecking ___', medium: "Hammond's rolling mech, for short" },
    'Community nickname',
  ),
  def('BAP', 'jargon', { easy: 'The Immortality Field medic, in callouts' }, 'Community nickname'),
  def(
    'BRIG',
    'jargon',
    {
      easy: 'The flail-and-shield support, for short',
      medium: 'Hero whose 2018 debut ended dive, for short',
    },
    'Community nickname; meta history',
  ),
  def(
    'WIDOW',
    'jargon',
    { easy: 'The enemy sniper, nine times out of ten', medium: 'Amelie, in callouts' },
    'Community nickname',
  ),
  def('TORB', 'jargon', { easy: 'The turret dwarf, for short' }, 'Community nickname'),
  def('REIN', 'jargon', { easy: 'The hammer tank, for short' }, 'Community nickname'),
  def('ZEN', 'jargon', { easy: 'The orb monk, for short' }, 'Community nickname'),
  def('SYM', 'jargon', { easy: 'The teleporter architect, for short' }, 'Community nickname'),
  def('DOOM', 'jargon', { easy: 'The punching tank, for short' }, 'Community nickname'),
  def('QUEEN', 'jargon', { easy: 'Junker royalty, for short' }, 'Community nickname'),

  // ------------------------------------------------------------------
  // Esports
  // ------------------------------------------------------------------
  def(
    'SHOCK',
    'esports',
    {
      easy: 'San Francisco team with back-to-back OWL titles',
      medium: '2019 and 2020 OWL champion',
      hard: "Crusty's back-to-back dynasty by the bay",
    },
    'OWL history; corpus',
  ),
  def(
    'FUEL',
    'esports',
    { medium: 'Dallas OWL franchise', hard: '2022 OWL champion from Texas' },
    'OWL history; corpus',
  ),
  def(
    'MAYHEM',
    'esports',
    { medium: 'Florida OWL franchise', hard: "Champion of OWL's final season, 2023" },
    'OWL history; corpus',
  ),
  def(
    'DRAGONS',
    'esports',
    {
      easy: "Hanzo's ultimate summons two of these",
      medium: 'Shanghai OWL franchise',
      hard: 'From 0-40 to champions in four years',
    },
    'OWL history; corpus (0-40, 2021 title)',
  ),
  def(
    'JJONAK',
    'esports',
    { medium: 'NYXL Zenyatta great', hard: '2018 OWL regular-season MVP' },
    'OWL history; corpus (season MVP, distinct from Finals MVP)',
  ),
  def(
    'FLETA',
    'esports',
    { medium: 'Korean DPS star, 2020 OWL MVP', hard: "The '___ deadlift': carrying a team alone" },
    'OWL history; corpus',
  ),
  def(
    'PROPER',
    'esports',
    { medium: '2022 OWL MVP', hard: 'Shock prodigy who won MVP as a rookie' },
    'OWL history; corpus',
  ),
  def(
    'MICKIE',
    'esports',
    { medium: 'Beloved Thai pro, first Dennis Hawelka Award winner' },
    'Corpus (2018 Hawelka Award)',
  ),
  def(
    'CUSTA',
    'esports',
    { medium: 'Australian support turned desk regular, 2019 Hawelka Award' },
    'Corpus (2019 Hawelka Award)',
  ),
  def('MCGRAVY', 'esports', { hard: '2020 Dennis Hawelka Award winner' }, 'Corpus'),
  def(
    'HADI',
    'esports',
    { medium: 'Tank pro who won the 2022 Dennis Hawelka Award' },
    'Corpus (tank pro, per exclusion rules)',
  ),
  def(
    'CRUSTY',
    'esports',
    { medium: "Coach behind San Francisco's back-to-back titles" },
    'OWL history; corpus',
  ),
  def(
    'RUSH',
    'esports',
    { easy: 'Hit the objective with zero setup time', hard: 'Storied Korean Overwatch coach' },
    'Corpus (coaches); generic gaming term',
  ),
  def(
    'MOON',
    'esports',
    { easy: 'Where the Horizon Lunar Colony sits', hard: 'Veteran Korean Overwatch coach' },
    'Corpus (coaches); base game lore',
  ),
  def(
    'FALCONS',
    'esports',
    {
      medium: 'Team ___, OWCS 2024 world champion',
      hard: 'They beat Crazy Raccoon 4-1 in the 2024 World Finals',
    },
    'Corpus (OWCS 2024)',
  ),
  def('QUARTZ', 'esports', { medium: 'OWCS 2025 World Finals MVP' }, 'Corpus (OWCS 2025)'),
  def(
    'ZETA',
    'esports',
    { medium: '___ Division, Japanese esports org', hard: "Org that swept 2026's Korea Stage 1" },
    'Corpus (2026)',
  ),
  def(
    'OWCS',
    'esports',
    {
      easy: "Overwatch esports' top circuit since 2024, for short",
      medium: 'Circuit this org competes in, Pacific region',
    },
    'Corpus; site identity',
  ),
  def(
    'OWL',
    'esports',
    {
      easy: 'Overwatch League, for short',
      medium: 'The city-franchise league that ran 2018 to 2023',
    },
    'OWL history',
  ),
  def(
    'OWWC',
    'esports',
    { hard: 'National-teams Overwatch event, for short' },
    'Corpus (Korea three-peat 2016-18, USA 2019)',
  ),
  def(
    'APEX',
    'esports',
    {
      medium: 'Korean OGN series that came before the league era',
      hard: 'Where Lunatic-Hai went back-to-back',
    },
    'Corpus (OGN APEX)',
  ),
  def('MELEE', 'esports', { easy: 'Quick punch on the V key, by default' }, 'Base game control'),
  def('CUP', 'esports', { easy: 'Weekend tournament, often' }, 'Generic esports term'),
  def(
    'EWC',
    'esports',
    { medium: "Riyadh's multi-game mega event, for short" },
    'Corpus (Esports World Cup)',
  ),
  def(
    'PROFIT',
    'esports',
    { medium: "Spitfire star of OWL's first title", hard: '2018 Grand Finals MVP for London' },
    'OWL history (Finals MVP, distinct from season MVP)',
  ),
  def(
    'KOREA',
    'esports',
    { easy: 'Country that three-peated the Overwatch World Cup' },
    'Corpus (2016-18)',
  ),
  def('USA', 'esports', { medium: '2019 Overwatch World Cup winner' }, 'Corpus'),
  def('SEOUL', 'esports', { medium: "Dynasty's OWL city" }, 'OWL history'),
  def('DALLAS', 'esports', { medium: "Fuel's home city" }, 'OWL history'),
  def(
    'LONDON',
    'esports',
    { medium: "Spitfire's city, home of OWL's first title" },
    'OWL history; corpus (2018 Spitfire)',
  ),
  def(
    'ATLANTA',
    'esports',
    { medium: "Reign's OWL city", hard: 'Its Reign was swept in the 2021 Grand Finals' },
    'OWL history; corpus (2021 4-0)',
  ),
  def('FLORIDA', 'esports', { medium: "Mayhem's home state" }, 'OWL history'),
  def(
    'TWISTED',
    'esports',
    { medium: '___ Minds, OWCS 2025 world champion' },
    'Corpus (4-1 over Al Qadsiah, MVP Quartz)',
  ),
  def(
    'RACCOON',
    'esports',
    {
      medium: 'Crazy ___, Japanese powerhouse org',
      hard: 'Crazy ___, 2024 Esports World Cup Overwatch champion',
    },
    'Corpus',
  ),
  def(
    'NYXL',
    'esports',
    { medium: "New York's OWL team, for short", hard: "JJonak's franchise" },
    'OWL history',
  ),
  def('DYNASTY', 'esports', { medium: "Seoul's OWL franchise" }, 'OWL history'),
  def('LUNATIC', 'esports', { hard: '___-Hai, back-to-back APEX champion' }, 'Corpus (OGN APEX)'),
  def(
    'RUNAWAY',
    'esports',
    { medium: 'Pink-jacketed fan favorites of the APEX era' },
    'OGN APEX history',
  ),
  def(
    'WDG',
    'esports',
    { hard: 'Korean tournament operator behind OWCS Asia, for short' },
    'Corpus (OWCS operators)',
  ),
  def(
    'NETEASE',
    'esports',
    { hard: 'Chinese partner in the OWCS launch trio' },
    'Corpus (ESL FACEIT Group, WDG, NetEase)',
  ),
  def(
    'ESL',
    'esports',
    { medium: "Esports giant in OWCS's operating group, for short" },
    'Corpus (ESL FACEIT Group)',
  ),
  def(
    'FACEIT',
    'esports',
    { medium: 'Platform side of the group that runs OWCS' },
    'Corpus (ESL FACEIT Group)',
  ),
  def(
    'GESTURE',
    'esports',
    { hard: "Spitfire tank of OWL's first title run" },
    'OWL history (2018 London)',
  ),
  def(
    'RANKERS',
    'esports',
    {
      medium: 'Roster Najdorf Esports acquired for OWCS Pacific 2026',
      hard: 'They won the OWCS 2026 Pacific Stage 1 Open Qualifier, pre-acquisition',
    },
    'Site identity; results credited pre-acquisition per house rule',
  ),
  def(
    'NAJDORF',
    'community',
    { easy: 'This org, named for a sharp Sicilian Defense line' },
    'Site identity',
  ),
  def('PACIFIC', 'community', { easy: 'OWCS region this org calls home' }, 'Site identity'),
  def('BISHOP', 'community', { easy: 'Chess piece on the Najdorf Esports crest' }, 'Site identity'),

  // ------------------------------------------------------------------
  // Lore
  // ------------------------------------------------------------------
  def(
    'ATHENA',
    'lore',
    { easy: "Overwatch's ever-present AI", medium: "Winston's digital right hand" },
    'Base game lore',
  ),
  def(
    'IRIS',
    'lore',
    {
      medium: "The ___, Zenyatta's guiding presence",
      hard: "'Experience tranquility' points you toward it",
    },
    'Base game lore',
  ),
  def(
    'TALON',
    'lore',
    {
      easy: 'The bad guys, organizationally speaking',
      medium: "Doomfist's terror network",
      hard: "2026's 'Reign of ___' story arc",
    },
    'Base game lore; corpus (2026 arc)',
  ),
  def('VISHKAR', 'lore', { medium: 'Hard-light corporation employing Symmetra' }, 'Base game lore'),
  def(
    'MEKA',
    'lore',
    { easy: "Korea's mech defense squad, for short", medium: 'The unit D.Va pilots for' },
    'Base game lore',
  ),
  def('EMILY', 'lore', { medium: "Tracer's girlfriend" }, 'Base game lore; corpus'),
  def('PHREAKS', 'lore', { medium: "Hazard's Scottish crew" }, 'Corpus (Hazard lore)'),
  def('OMNIC', 'lore', { easy: 'A robot citizen of the Overwatch world' }, 'Base game lore'),
  def(
    'CRISIS',
    'lore',
    { medium: 'The Omnic ___, the war that started everything' },
    'Base game lore',
  ),
  def(
    'HORIZON',
    'lore',
    {
      medium: 'Lunar colony where Winston was raised',
      hard: 'Retired 2CP map with low-gravity rooms',
    },
    'Base game lore; OW1 map history',
  ),
  def('HAMMOND', 'lore', { medium: 'The hamster inside Wrecking Ball' }, 'Base game lore'),
  def(
    'BOB',
    'lore',
    { easy: "Ashe's big omnic butler", medium: "'___! Do something!'" },
    'Base game lore',
  ),
  def('VIPER', 'lore', { medium: "Ashe's lever-action rifle" }, 'Base game kit'),
  def('PETRAS', 'lore', { hard: 'The ___ Act outlawed Overwatch operations' }, 'Base game lore'),
  def('NULL', 'lore', { medium: "___ Sector, the omnic uprising's army" }, 'Base game lore'),
  def('JUNKER', 'lore', { easy: '___ Queen, or any Outback scavenger' }, 'Base game lore'),
  def(
    'CHRONAL',
    'lore',
    { hard: 'Kind of accelerator keeping Tracer anchored in time' },
    'Base game lore',
  ),
  def(
    'ZURICH',
    'lore',
    { hard: 'City where the Overwatch HQ explosion happened' },
    'Base game lore',
  ),

  // ------------------------------------------------------------------
  // Meta / community
  // ------------------------------------------------------------------
  def('SKIN', 'meta', { easy: 'Cosmetic outfit' }, 'Base game feature'),
  def('EMOTE', 'meta', { easy: 'Dance or sit, cosmetically' }, 'Base game feature'),
  def(
    'SPRAY',
    'meta',
    { easy: 'Tag you stamp on a wall', medium: 'Wall decal, or what bad Widows do at chokes' },
    'Base game feature; jargon',
  ),
  def('GOLDEN', 'meta', { easy: '___ gun, the competitive-points flex' }, 'Base game feature'),
  def('MYTHIC', 'meta', { medium: "OW2's top skin tier" }, 'OW2 feature'),
  def('EPIC', 'meta', { easy: 'Rarity tier between rare and legendary' }, 'Base game feature'),
  def('LOOTBOX', 'meta', { medium: "OW1's cosmetic crate, as one word" }, 'OW1 feature'),
  def(
    'ENDORSE',
    'meta',
    { medium: 'Give a sportsmanship thumbs-up after a match' },
    'Base game feature',
  ),
  def('AVOID', 'meta', { medium: '___ as Teammate' }, 'Base game feature'),
  def(
    'PING',
    'meta',
    {
      easy: 'Wheel-and-click communication system',
      medium: 'Latency number you blame for everything',
    },
    'OW2 feature; jargon',
  ),
  def('ROLE', 'meta', { easy: '___ queue' }, 'Base game feature'),
  def('SEASON', 'meta', { easy: 'Nine-week content cycle' }, 'OW2 cadence'),
  def('PASS', 'meta', { easy: 'Battle ___' }, 'OW2 feature'),
  def('PATCH', 'meta', { easy: 'Balance update' }, 'Base game'),
  def('HOTFIX', 'meta', { medium: "Emergency patch that can't wait" }, 'Base game'),
  def('REPLAY', 'meta', { medium: 'System for rewatching your own games' }, 'Base game feature'),
  def('CASTER', 'meta', { easy: 'Esports commentator' }, 'Esports term'),
  def('DESK', 'meta', { medium: 'Where analysts break down the match' }, 'Esports term'),
  def('ANALYST', 'meta', { medium: 'Desk expert between maps' }, 'Esports term'),
  def('TWITCH', 'community', { easy: 'Purple platform where OWCS airs' }, 'Esports broadcast'),
  def(
    'DISCORD',
    'community',
    {
      easy: 'Chat app where the Najdorf community lives',
      medium: "Zenyatta's damage-amplifying orb",
    },
    'Site identity; base game kit',
  ),
  def(
    'REIGN',
    'esports',
    { medium: "Atlanta's OWL franchise", hard: "2026's '___ of Talon' arc" },
    'OWL history; corpus (2026 arc)',
  ),
  def('CUSTOM', 'meta', { easy: '___ games, home of community modes' }, 'Base game feature'),
  def('PARKOUR', 'meta', { medium: 'Mercy-only custom game genre' }, 'Community staple'),
  def('STREAM', 'community', { easy: 'What you watch on Twitch' }, 'General term'),
  def('DROPS', 'community', { medium: 'Twitch rewards for watching OWCS' }, 'OWCS broadcasts'),
  def('PERKS', 'meta', { medium: 'Mid-match hero upgrades added in 2025' }, 'OW2 feature (2025)'),
  def('BAN', 'meta', { medium: 'Hero ___s, added to competitive in 2025' }, 'OW2 feature (2025)'),
  def('MIT', 'meta', { medium: 'Damage blocked, on the scoreboard' }, 'OW2 scoreboard stat'),
  def('ELIM', 'meta', { easy: 'A kill, in scoreboard shorthand' }, 'Base game stat'),
  def('ASSIST', 'meta', { easy: 'Scoreboard credit for helping a kill' }, 'Base game stat'),
  def('HEALS', 'jargon', { easy: 'What supports provide, in the plural' }, 'Community jargon'),
  def('DAMAGE', 'meta', { easy: "The DPS role's output" }, 'Base game'),
  def('SUPPORT', 'meta', { easy: 'The healing role' }, 'Base game'),
  def('HERO', 'meta', { easy: 'What you pick at spawn' }, 'Base game'),
  def('SWAP', 'jargon', { easy: 'Change heroes mid-match' }, 'Base game'),
  def(
    'CHOKE',
    'jargon',
    {
      easy: 'Narrow doorway teams pile up behind',
      medium: 'Narrow path every team fight funnels through',
    },
    'Community jargon',
  ),
  def('POINT', 'meta', { easy: 'What you stand on in Control' }, 'Base game'),
  def('ROUND', 'meta', { easy: 'One stage of a match' }, 'Base game'),
  def('MAP', 'meta', { easy: 'Where the match happens' }, 'Base game'),
  def('AIM', 'jargon', { easy: 'FPS fundamental you blame after a loss' }, 'Community jargon'),
  def('LAG', 'jargon', { easy: 'Network stutter' }, 'General gaming'),
  def('BOT', 'jargon', { easy: 'Practice-range target, or an insult' }, 'Community jargon'),
];
