// Lightweight i18n — zh / en, no external library.

type Locale = 'zh' | 'en';

const dict: Record<Locale, Record<string, string>> = {
  en: {
    sign_title: 'INK OF FATE',
    sign_sub: 'a tattoo your face was asking for',
    booth_step_in: 'Step in',
    booth_open_since: 'Open since 1973 · cash only',
    booth_clients_today: '{n} clients tonight',

    studio_artist_intro: "I don't ask what you want. I look at you. Then I know.",
    studio_question: "What are you running from?",
    studio_question_placeholder: "(80 chars max — or leave blank, let the master cold-read)",
    studio_face_section: 'Show me your face.',
    studio_use_my_avatar: 'Use my face',
    studio_upload: 'Use a different photo',
    studio_change: 'Change',
    studio_skip_q: 'Skip the question',
    studio_cta: 'Mark me',
    studio_cta_pending: 'Mark me',
    studio_cta_disabled: 'Show me your face first.',
    studio_back: 'Walk out',

    processing_sourcing: 'Sizing you up',
    processing_studying: 'Picking your fate',
    processing_inking: 'Loading the needle',
    processing_stamping: 'Done. Hold still',
    processing_ticket: 'TICKET',

    result_ticket: 'TICKET',
    result_signed: 'SIGNED',
    result_placement: 'PLACEMENT',
    result_style: 'STYLE',
    result_artist_says: 'The artist says',
    result_meaning: 'The reading',
    result_invoice: '$200. Pay at the door.',
    result_cta_again: 'Sit again',
    result_cta_wall: 'Tonight’s Parlor',
    result_cta_share: 'Share',
    result_cta_share_done: 'Copied',
    result_back_to_studio: 'Back to the chair',

    wall_title: "Tonight's Parlor",
    wall_sub: 'Everyone the master read this week',
    wall_back: 'Back',
    wall_new: 'Sit in the chair',
    wall_fab: 'Sit in the chair',
    wall_tab_all: 'All clients',
    wall_tab_mine: 'Mine',
    wall_loading: 'Loading the books...',
    wall_empty_all: 'No one has come in yet. Be the first.',
    wall_empty_mine: "You haven't been marked yet.",
    wall_empty: 'No one has come in yet. Be the first.',
    wall_view: 'View',

    err_processing: 'The needle jammed. Try again.',
    err_no_photo: 'No photo, no reading.',
    err_offline: 'The parlor is offline. Try again in a moment.',

    tip_first_touch: 'tap anywhere to enter',
  },
  zh: {
    sign_title: 'INK OF FATE',
    sign_sub: '一刀你脸早就求着要的',
    booth_step_in: '推门进去',
    booth_open_since: '1973 年开张 · 只收现金',
    booth_clients_today: '今夜 {n} 位客人',

    studio_artist_intro: '不问你想要啥。看你一眼就知道了。',
    studio_question: '你在躲什么？',
    studio_question_placeholder: '（80 字以内 — 或者啥都不写，让师傅自己读）',
    studio_face_section: '把脸给我看。',
    studio_use_my_avatar: '用我现在的脸',
    studio_upload: '换一张照片',
    studio_change: '换',
    studio_skip_q: '不答',
    studio_cta: '标记我',
    studio_cta_pending: '标记我',
    studio_cta_disabled: '先把脸给我看。',
    studio_back: '走人',

    processing_sourcing: '把你看清楚',
    processing_studying: '挑你的命',
    processing_inking: '装针',
    processing_stamping: '行了，别动',
    processing_ticket: '票号',

    result_ticket: '票号',
    result_signed: '日期',
    result_placement: '部位',
    result_style: '风格',
    result_artist_says: '师傅说',
    result_meaning: '解读',
    result_invoice: '两百块。出门结。',
    result_cta_again: '再坐一次',
    result_cta_wall: '今夜的店',
    result_cta_share: '分享',
    result_cta_share_done: '已复制',
    result_back_to_studio: '回到椅子上',

    wall_title: '今夜的店',
    wall_sub: '本周师傅看过的所有人',
    wall_back: '返回',
    wall_new: '坐到椅子上',
    wall_fab: '坐到椅子上',
    wall_tab_all: '所有人',
    wall_tab_mine: '我的',
    wall_loading: '翻账本中……',
    wall_empty_all: '还没人来过。你来开张。',
    wall_empty_mine: '你还没被师傅看过。',
    wall_empty: '还没人来过。你来开张。',
    wall_view: '看',

    err_processing: '针卡了。再试一次。',
    err_no_photo: '没照片就别说命。',
    err_offline: '店关门了。等会儿再来。',

    tip_first_touch: '点屏幕进店',
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  try {
    const override = localStorage.getItem('game_locale');
    if (override === 'en' || override === 'zh') return override;
  } catch {
    /* ignore */
  }
  return typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('zh')
    ? 'zh'
    : 'en';
}

const LOCALE: Locale = detectLocale();

export function t(key: string, vars?: { n?: number | string }): string {
  const raw = dict[LOCALE][key] ?? dict.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{n\}/g, String(vars.n ?? ''));
}

export function getLocale(): Locale {
  return LOCALE;
}
