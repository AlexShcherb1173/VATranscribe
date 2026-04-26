import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Language = "en" | "ru";

type Dictionary = typeof dictionaries.en;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const dictionaries = {
  en: {
    nav: {
      dashboard: "Dashboard",
      downloads: "Downloads",
      files: "Files",
      jobs: "Jobs",
      transcripts: "Transcripts",
      billing: "Billing",
      profile: "Profile",
      settings: "Settings",
      upgrade: "Upgrade",
    },
    common: {
      appName: "VATranscribe",
      logout: "Logout",
      startFree: "Start free",
      uploadFile: "Upload file",
      pasteLink: "Paste link",
      upgrade: "Upgrade",
      upgradeToPro: "Upgrade to Pro",
      processing: "Processing",
      ready: "Ready",
      failed: "Failed",
      viewResult: "View result",
      free: "Free",
      pro: "Pro",
      business: "Business",
      monthly: "monthly",
      close: "Close",
    },
    landing: {
      badge: "Creator-first transcription workspace",
      headline: "Turn audio & video into content in minutes",
      subhead:
        "Upload a file or paste a link. Get transcripts, subtitles, summaries and ready-to-publish content from one workflow.",
      urlPlaceholder: "Paste YouTube, Kinescope or podcast URL...",
      primary: "Start free",
      secondary: "See pricing",
      proof: "Transcript · Subtitles · Content ideas · Exports",
      creator: "For creators",
      creatorText: "Turn one video into 10 pieces of content.",
      agency: "For freelancers",
      agencyText: "Turn client calls into action plans.",
      education: "For education",
      educationText: "Turn lectures into notes instantly.",
    },
    dashboard: {
      eyebrow: "Command center",
      title: "What do you want to process today?",
      description:
        "Start with a file or a link. VATranscribe turns raw media into transcript, subtitles and content deliverables.",
      urlPlaceholder: "Paste YouTube / Kinescope / Vimeo URL...",
      recentResults: "Recent results",
      usage: "Usage this period",
      plan: "Current plan",
      almostOut: "You are close to your free limits. Upgrade to keep processing without interruption.",
      empty: "No results yet. Upload a file or paste a link to create your first transcript.",
      magicFlow: "Paste link → processing → transcript → subtitles → content pack",
    },
    result: {
      title: "Result workspace",
      transcript: "Transcript",
      summary: "Summary",
      subtitles: "Subtitles",
      contentIdeas: "Content ideas",
      export: "Export",
      locked: "Pro feature",
      upgradeCta: "Want AI summary, subtitles and content repurposing? Upgrade to Pro.",
    },
    pricing: {
      title: "Upgrade when the result is useful",
      subtitle: "Simple internal plans now. Payment provider can be connected next.",
      freeDesc: "Try it with basic transcript workflow.",
      proDesc: "Best for creators and freelancers.",
      businessDesc: "Teams, priority queue and future API access.",
      freeFeatures: ["30 min / month", "Basic transcript", "TXT export"],
      proFeatures: ["100 hours", "Summaries", "Subtitles", "Content repurposing"],
      businessFeatures: ["Team workspace", "Shared folders", "Priority queue", "API-ready"],
    },
  },
  ru: {
    nav: {
      dashboard: "Дашборд",
      downloads: "Скачивание",
      files: "Файлы",
      jobs: "Задачи",
      transcripts: "Транскрипты",
      billing: "Тарифы",
      profile: "Профиль",
      settings: "Настройки",
      upgrade: "Апгрейд",
    },
    common: {
      appName: "VATranscribe",
      logout: "Выйти",
      startFree: "Начать бесплатно",
      uploadFile: "Загрузить файл",
      pasteLink: "Вставить ссылку",
      upgrade: "Апгрейд",
      upgradeToPro: "Перейти на Pro",
      processing: "Обработка",
      ready: "Готово",
      failed: "Ошибка",
      viewResult: "Открыть результат",
      free: "Free",
      pro: "Pro",
      business: "Business",
      monthly: "в месяц",
      close: "Закрыть",
    },
    landing: {
      badge: "Рабочее пространство для транскрибации и контента",
      headline: "Превращай аудио и видео в контент за минуты",
      subhead:
        "Загрузи файл или вставь ссылку. Получи транскрипт, субтитры, summary и материалы для публикации в одном сценарии.",
      urlPlaceholder: "Вставь ссылку YouTube, Kinescope или подкаста...",
      primary: "Начать бесплатно",
      secondary: "Смотреть тарифы",
      proof: "Транскрипт · Субтитры · Идеи контента · Экспорт",
      creator: "Для creators",
      creatorText: "Одно видео → 10 единиц контента.",
      agency: "Для фрилансеров",
      agencyText: "Созвоны с клиентами → action plan.",
      education: "Для обучения",
      educationText: "Лекции → понятные конспекты.",
    },
    dashboard: {
      eyebrow: "Командный центр",
      title: "Что обработаем сегодня?",
      description:
        "Начни с файла или ссылки. VATranscribe превращает медиа в текст, субтитры и готовые deliverables.",
      urlPlaceholder: "Вставь ссылку YouTube / Kinescope / Vimeo...",
      recentResults: "Последние результаты",
      usage: "Использование за период",
      plan: "Текущий тариф",
      almostOut: "Лимиты почти закончились. Перейди на Pro, чтобы продолжить без остановок.",
      empty: "Результатов пока нет. Загрузи файл или вставь ссылку, чтобы создать первый транскрипт.",
      magicFlow: "Ссылка → обработка → транскрипт → субтитры → контент-пакет",
    },
    result: {
      title: "Рабочая область результата",
      transcript: "Транскрипт",
      summary: "Summary",
      subtitles: "Субтитры",
      contentIdeas: "Идеи контента",
      export: "Экспорт",
      locked: "Pro-функция",
      upgradeCta: "Нужны AI summary, субтитры и переработка в контент? Перейди на Pro.",
    },
    pricing: {
      title: "Переход на Pro в момент ценности",
      subtitle: "Сейчас внутренние тарифы. Реальные платежи можно подключить следующим этапом.",
      freeDesc: "Попробовать базовую транскрибацию.",
      proDesc: "Лучший вариант для creators и фрилансеров.",
      businessDesc: "Команды, приоритетная очередь и будущий API.",
      freeFeatures: ["30 мин / месяц", "Базовый транскрипт", "TXT экспорт"],
      proFeatures: ["100 часов", "Summary", "Субтитры", "Content repurposing"],
      businessFeatures: ["Командная работа", "Общие папки", "Priority queue", "API-ready"],
    },
  },
} as const;

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem("vatranscribe_language");
  if (stored === "ru" || stored === "en") return stored;
  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  function setLanguage(nextLanguage: Language) {
    localStorage.setItem("vatranscribe_language", nextLanguage);
    setLanguageState(nextLanguage);
  }

  const value = useMemo(
    () => ({ language, setLanguage, t: dictionaries[language] }),
    [language],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider");
  }
  return context;
}
