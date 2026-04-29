import { createContext, ReactNode, useContext, useMemo, useState } from "react";

type Language = "en" | "ru";

const dictionaries = {
  en: {
    nav: {
      dashboard: "Dashboard",
      downloads: "Downloads",
      files: "Files",
      jobs: "Jobs",
      transcripts: "Transcripts",
      billing: "Pricing",
      profile: "Profile",
      settings: "Settings",
      upgrade: "Upgrade",
      analytics: "Analytics",
      workspace: "Workspace",
      support: "Support",
    },

    common: {
      appName: "VATranscribe",
      select: "Select",
      creatorOs: "Creator OS",
      authenticatedWorkspace: "authenticated workspace",
      logout: "Logout",
      startFree: "Start free",
      uploadFile: "Upload file",
      pasteLink: "Paste link",
      upgrade: "Upgrade",
      upgradeToPro: "Go to subscriptions",
      processing: "Processing",
      ready: "Ready",
      failed: "Failed",
      viewResult: "View result",
      free: "Free",
      pro: "Pro",
      business: "Business",
      monthly: "monthly",
      close: "Close",
      loading: "Loading...",
      error: "Error",
      success: "Success",
      empty: "Empty",
      openFile: "Open file",
      unavailable: "—",
      sessionClosed: "Session closed",
      signedOut: "You have been signed out.",
      networkError:
        "Cannot reach the API. Check that backend is running at http://127.0.0.1:8000 and VITE_API_BASE_URL is correct.",
      requestFailed: "Request failed.",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      retry: "Retry",
      copied: "Copied",
      language: "Language",
      english: "English",
      russian: "Russian",
      goToSubscriptions: "Go to subscriptions",
      viewAll: "View all",
      openQueue: "Open queue",
      noJobsFound: "No jobs found",
      noJobsHint: "Try changing filters or create a new download/transcription job.",
      noLogsYet: "No logs yet",
      logsHint: "Logs will appear when the job starts producing execution events.",
      noTranscriptsYet: "No transcripts yet",
      noTranscriptsHint: "Create a transcription from a media file to see results here.",
      chooseJob: "Select a job to view details.",
      chooseTranscript: "Select a transcript.",
      saveChanges: "Save changes",
      updated: "Updated",
    },

    auth: {
      checking: "Checking session...",
      heroTitle: "One upload. Transcript, subtitles and content pack.",
      heroText:
        "Built for creators, freelancers and teams who need the result, not another technical tool.",
      bullets: [
        "Paste URL → transcript",
        "Upload file → subtitles",
        "Transcript → summary + posts",
      ],
      signIn: "Sign in",
      createAccount: "Create account",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      confirmPassword: "Repeat password",
      emailRequired: "Email is required.",
      passwordRequired: "Password is required.",
      passwordMin: "Password must contain at least 8 characters.",
      passwordLower: "Password must contain at least one lowercase letter.",
      passwordUpper: "Password must contain at least one uppercase letter.",
      passwordDigit: "Password must contain at least one digit.",
      passwordSpaces: "Password must not contain spaces.",
      passwordMismatch: "Passwords do not match.",
      passwordHint:
        "At least 8 chars, one lowercase, one uppercase, one digit, no spaces.",
      creating: "Creating account...",
      signingIn: "Signing in...",
      created: "User created successfully. You can sign in now.",
    },

    landing: {
      badge: "Creator-first transcription workspace",
      headline: "Turn audio & video into content in minutes",
      subhead:
        "Upload a file or paste a link. Get transcripts, subtitles, summaries and ready-to-publish content from one workflow.",
      urlPlaceholder: "Paste YouTube, Kinescope or podcast URL...",
      primary: "Start free",
      secondary: "See pricing",
      login: "Login",
      proof: "Transcript · Subtitles · Content ideas · Exports",
      creator: "For creators",
      creatorText: "Turn one video into 10 pieces of content.",
      agency: "For freelancers",
      agencyText: "Turn client calls into action plans.",
      education: "For education",
      educationText: "Turn lectures into notes instantly.",
      magicFlow: "Magic flow",
      contentPack: "Content pack for your video",
      checks: [
        "Transcript generated",
        "Subtitles created",
        "10 Shorts hooks",
        "Blog draft",
        "SEO title pack",
      ],
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
      almostOut:
        "You are close to your free limits. Upgrade to keep processing without interruption.",
      empty:
        "No results yet. Upload a file or paste a link to create your first transcript.",
      magicFlow: "Paste link → processing → transcript → subtitles → content pack",
      quickActions: "Quick actions",
      stats: "Statistics",
      totalMinutes: "Total minutes",
      processedFiles: "Processed files",
      successRate: "Success rate",
    },

    downloads: {
      title: "Downloads",
      description:
        "Analyze media URLs, inspect available formats and enqueue MP3/MP4 download jobs.",
      analyzeTitle: "Analyze URL",
      analyzeText:
        "Paste a YouTube, Kinescope, Vimeo or podcast URL and inspect downloadable formats before creating a job.",
      analyzing: "Analyzing...",
      analyze: "Analyze",
      failedAnalyze: "Failed to analyze URL.",
      failedCreate: "Failed to create download job.",
      created: "Job created successfully",
      waitingTitle: "Waiting for analysis",
      waitingText:
        "Run URL analysis first. After that, inspect formats, choose MP3 or MP4 mode and create a job.",
      titleLabel: "Title",
      platform: "Platform",
      duration: "Duration",
      formats: "Formats",
      createTitle: "Create download job",
      createText: "Choose output mode and send the download to the background worker.",
      sourceUrl: "Source URL",
      outputFilename: "Output filename",
      requestedFormat: "Requested format",
      mp4Mode: "MP4 mode",
      selectedAudio: "Selected audio format",
      selectedVideo: "Selected video format",
      auto: "auto",
      notRequired: "not required",
      creating: "Creating...",
      createJob: "Create download job",
    },

    files: {
      title: "Files",
      description:
        "Upload local files, browse media assets, download originals and start transcription directly from storage.",
      loading: "Loading media files...",
      selected: "Selected file",
      name: "Name",
      kind: "Kind",
      id: "Media asset ID",
      download: "Download",
      helper:
        "Upload a file or select an existing media asset, then use the Transcribe button to enqueue a transcription job.",
      transcribe: "Transcribe",
      remove: "Remove",
    },

    jobs: {
      title: "Jobs",
      description:
        "Track asynchronous download and transcription tasks with polling, logs and control actions.",
      loading: "Loading jobs...",
      loadingDetails: "Loading job details...",
      loadingLogs: "Loading logs...",
      actions: "Actions",
      select: "Select a job to view details.",
      restart: "Restart",
      stop: "Stop",
    },

    transcriptions: {
      title: "Transcriptions",
      description:
        "Inspect transcript results, read full text, review segments and download exported artifacts.",
      loading: "Loading transcripts...",
      loadingDetails: "Loading transcript details...",
      select: "Select a transcript to view details.",
      copy: "Copy text",
      exportTxt: "Export TXT",
      exportSrt: "Export SRT",
      exportVtt: "Export VTT",
    },

    profile: {
      title: "Profile",
      description: "Manage your account.",
      loading: "Loading profile...",
      failed: "Failed to load account data.",
      email: "Email",
      plan: "Plan",
      quota: "Quota",
      memberSince: "Member since",
      currentPlan: "Current plan",
      active: "Active",
      storageLimit: "Storage limit",
      transcriptionTime: "Transcription time",
      jobLimit: "Job limit",
      storage: "Storage",
      transcriptionSeconds: "Transcription seconds",
      jobs: "Jobs",
      accountSummary: "Account summary",
      fullName: "Full name",
      company: "Company",
      timezone: "Timezone",
      locale: "Locale",
      role: "Role",
      user: "User",
      profileSettings: "Profile settings",
      profileSettingsDescription:
        "Update account metadata used by the operator interface.",
      avatarUrl: "Avatar URL",
      used: "used",
      of: "of",
    },

    settings: {
      title: "Settings",
      description:
        "System configuration, API environment details and future user preferences.",
      next: "Next step",
      text:
        "This page will host environment settings, preferences and future account controls.",
      appearance: "Appearance",
      notifications: "Notifications",
      integrations: "Integrations",
    },

    result: {
      title: "Result workspace",
      readyTitle: "Transcript ready",
      notFound: "Result not found",
      backToTranscripts: "Back to transcripts",
      downloadArtifact: "Download artifact",
      subscription: "Subscription",
      subscriptionCta:
        "Need AI summary, subtitles and extended export? Go to subscriptions.",
      transcript: "Transcript",
      summary: "Summary",
      subtitles: "Subtitles",
      contentIdeas: "Content ideas",
      export: "Export",
      locked: "Subscription feature",
      upgradeCta:
        "Need AI summary, subtitles and content repurposing? Go to subscriptions.",
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
      billingLabel: "Billing",
      currentPlan: "Current plan",
      subscriptionStatus: "Subscription status",
      active: "Active",
      usageHistory: "Usage history",
      choosePlanTitle: "Choose your plan",
      choosePlanSubtitle: "Pick a subscription that matches your processing volume.",
      starterName: "Starter",
      proName: "Pro",
      businessName: "Business",
      perMonth: "/ month",
      upgrade: "Upgrade",
    },

    billing: {
      selectedPlan: "Selected plan",
      fakePayment: "Fake payment",
      fakePaymentDescription:
        "This is a temporary payment form placeholder. Later it can be connected to Stripe, YooKassa or CloudPayments.",
      fakePaymentCompleted: "fake payment completed",
    },

    uploads: {
      fastPath: "Fast path",
      dropTitle: "Drag & drop media files here",
      supported: "MP3, WAV, M4A, AAC, FLAC, OGG, MP4, MOV, MKV, WEBM, AVI",
      chooseFiles: "Choose files",
      uploading: "Uploading...",
      summary: "Upload summary",
      succeeded: "Succeeded",
      uploadingLabel: "Uploading",
      failed: "Failed",
      queueTitle: "Upload queue",
      queueEmptyTitle: "Queue is empty",
      queueEmptyDescription: "Files will appear here after selection.",
      uploadStartedTitle: "Upload started",
      uploadStartedDescription: "file(s) added to queue.",
      uploadCompletedTitle: "Upload completed",
      uploadCompletedDescription: "ready for transcription.",
      uploadFailedTitle: "Upload failed",
      workWithFile: "Work with file",
      transcribe: "Transcribe",
      mediaAssetId: "Media asset ID",
      progressComplete: "100%",
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
      upgrade: "Тарифы",
      analytics: "Аналитика",
      workspace: "Рабочая зона",
      support: "Поддержка",
    },

    common: {
      appName: "VATranscribe",
      select: "Выбрать",
      creatorOs: "Creator OS",
      authenticatedWorkspace: "рабочее пространство",
      logout: "Выйти",
      startFree: "Начать бесплатно",
      uploadFile: "Загрузить файл",
      pasteLink: "Вставить ссылку",
      upgrade: "Тарифы",
      upgradeToPro: "Перейти к подпискам",
      processing: "Обработка",
      ready: "Готово",
      failed: "Ошибка",
      viewResult: "Открыть результат",
      free: "Free",
      pro: "Pro",
      business: "Business",
      monthly: "в месяц",
      close: "Закрыть",
      loading: "Загрузка...",
      error: "Ошибка",
      success: "Успешно",
      empty: "Пусто",
      openFile: "Открыть файл",
      unavailable: "—",
      sessionClosed: "Сессия завершена",
      signedOut: "Вы вышли из аккаунта.",
      networkError:
        "Не удалось подключиться к API. Проверь, что backend запущен на http://127.0.0.1:8000 и VITE_API_BASE_URL указан правильно.",
      requestFailed: "Запрос не выполнен.",
      save: "Сохранить",
      cancel: "Отмена",
      delete: "Удалить",
      retry: "Повторить",
      copied: "Скопировано",
      language: "Язык",
      english: "Английский",
      russian: "Русский",
      goToSubscriptions: "Перейти к подпискам",
      viewAll: "Смотреть все",
      openQueue: "Открыть очередь",
      noJobsFound: "Задачи не найдены",
      noJobsHint: "Измени фильтры или создай новую задачу скачивания/транскрибации.",
      noLogsYet: "Логов пока нет",
      logsHint: "Логи появятся, когда задача начнёт создавать события выполнения.",
      noTranscriptsYet: "Транскриптов пока нет",
      noTranscriptsHint: "Создай транскрибацию из медиафайла, чтобы увидеть результат.",
      chooseJob: "Выбери задачу для просмотра.",
      chooseTranscript: "Выбери транскрипт.",
      saveChanges: "Сохранить изменения",
      updated: "Обновлено",
    },

    auth: {
      checking: "Проверяем сессию...",
      heroTitle: "Одна загрузка. Транскрипт, субтитры и контент-пакет.",
      heroText:
        "Для creators, фрилансеров и команд, которым нужен готовый результат.",
      bullets: [
        "Вставь ссылку → транскрипт",
        "Загрузи файл → субтитры",
        "Текст → сводка + посты",
      ],
      signIn: "Войти",
      createAccount: "Создать аккаунт",
      login: "Войти",
      register: "Регистрация",
      email: "Email",
      password: "Пароль",
      confirmPassword: "Повторите пароль",
      emailRequired: "Укажите email.",
      passwordRequired: "Укажите пароль.",
      passwordMin: "Пароль должен содержать минимум 8 символов.",
      passwordLower: "Пароль должен содержать строчную букву.",
      passwordUpper: "Пароль должен содержать заглавную букву.",
      passwordDigit: "Пароль должен содержать цифру.",
      passwordSpaces: "Пароль не должен содержать пробелы.",
      passwordMismatch: "Пароли не совпадают.",
      passwordHint:
        "Минимум 8 символов: строчная, заглавная буква, цифра, без пробелов.",
      creating: "Создаём аккаунт...",
      signingIn: "Входим...",
      created: "Аккаунт создан. Теперь можно войти.",
    },

    landing: {
      badge: "Рабочее пространство для транскрибации",
      headline: "Превращай аудио и видео в контент за минуты",
      subhead:
        "Загрузи файл или вставь ссылку. Получи транскрипт, субтитры, summary и материалы для публикации.",
      urlPlaceholder: "Вставь ссылку YouTube, Kinescope или подкаста...",
      primary: "Начать бесплатно",
      secondary: "Тарифы",
      login: "Войти",
      proof: "Транскрипт · Субтитры · Идеи контента · Экспорт",
      creator: "Для creators",
      creatorText: "Одно видео → 10 единиц контента.",
      agency: "Для фрилансеров",
      agencyText: "Созвоны с клиентами → план действий",
      education: "Для обучения",
      educationText: "Лекции → конспекты.",
      magicFlow: "Волшебный поток",
      contentPack: "Пакет контента для вашего видео",
      checks: [
        "Транскрипт готов",
        "Субтитры готовы",
        "10 hooks для Shorts",
        "Черновик статьи",
        "Пакет SEO заголовков",
      ],
    },

    dashboard: {
      eyebrow: "Центр управления",
      title: "Что обработаем сегодня?",
      description:
        "Начни с файла или ссылки. VATranscribe превращает медиа в текст, субтитры и контент.",
      urlPlaceholder: "Вставь YouTube / Kinescope / Vimeo ссылку...",
      recentResults: "Последние результаты",
      usage: "Использование",
      plan: "Текущий тариф",
      almostOut: "Лимиты почти закончились.",
      empty: "Пока нет результатов. Загрузи файл или вставь ссылку.",
      magicFlow: "Ссылка → обработка → текст → субтитры → контент",
      quickActions: "Быстрые действия",
      stats: "Статистика",
      totalMinutes: "Минут обработано",
      processedFiles: "Файлов обработано",
      successRate: "Успешность",
    },

    downloads: {
      title: "Скачивание",
      description: "Анализируй ссылки и создавай MP3/MP4 задачи.",
      analyzeTitle: "Анализ ссылки",
      analyzeText: "Вставь ссылку и посмотри доступные форматы.",
      analyzing: "Анализируем...",
      analyze: "Анализировать",
      failedAnalyze: "Не удалось проанализировать ссылку.",
      failedCreate: "Не удалось создать задачу.",
      created: "Задача создана",
      waitingTitle: "Ожидаем анализ",
      waitingText: "Сначала проанализируй ссылку.",
      titleLabel: "Название",
      platform: "Платформа",
      duration: "Длительность",
      formats: "Форматы",
      createTitle: "Создать задачу",
      createText: "Выбери режим и отправь задачу в очередь.",
      sourceUrl: "Ссылка",
      outputFilename: "Имя файла",
      requestedFormat: "Формат",
      mp4Mode: "MP4 режим",
      selectedAudio: "Выбранный аудио формат",
      selectedVideo: "Выбранный видео формат",
      auto: "auto",
      notRequired: "не требуется",
      creating: "Создаём...",
      createJob: "Создать задачу",
    },

    files: {
      title: "Файлы",
      description: "Загружай локальные файлы и запускай транскрибацию.",
      loading: "Загружаем файлы...",
      selected: "Выбранный файл",
      name: "Имя",
      kind: "Тип",
      id: "ID файла",
      download: "Скачать",
      helper: "Выбери файл и нажми «Транскрибировать».",
      transcribe: "Транскрибировать",
      remove: "Удалить",
    },

    jobs: {
      title: "Задачи",
      description: "Отслеживай фоновые задачи.",
      loading: "Загружаем задачи...",
      loadingDetails: "Загружаем детали задачи...",
      loadingLogs: "Загружаем логи...",
      actions: "Действия",
      select: "Выбери задачу для просмотра.",
      restart: "Перезапустить",
      stop: "Остановить",
    },

    transcriptions: {
      title: "Транскрипты",
      description: "Результаты транскрибации и экспорт.",
      loading: "Загружаем транскрипты...",
      loadingDetails: "Загружаем детали...",
      select: "Выбери транскрипт.",
      copy: "Копировать текст",
      exportTxt: "Экспорт TXT",
      exportSrt: "Экспорт SRT",
      exportVtt: "Экспорт VTT",
    },

    profile: {
      title: "Профиль",
      description: "Управление аккаунтом.",
      loading: "Загружаем профиль...",
      failed: "Не удалось загрузить профиль.",
      email: "Email",
      plan: "Тариф",
      quota: "Лимит",
      memberSince: "Дата регистрации",
      currentPlan: "Текущий тариф",
      active: "Активен",
      storageLimit: "Лимит хранилища",
      transcriptionTime: "Время транскрибации",
      jobLimit: "Лимит задач",
      storage: "Хранилище",
      transcriptionSeconds: "Секунды транскрибации",
      jobs: "Задачи",
      accountSummary: "Сводка аккаунта",
      fullName: "Полное имя",
      company: "Компания",
      timezone: "Часовой пояс",
      locale: "Локаль",
      role: "Роль",
      user: "Пользователь",
      profileSettings: "Настройки профиля",
      profileSettingsDescription:
        "Обнови данные аккаунта, которые используются в интерфейсе.",
      avatarUrl: "URL аватара",
      used: "использовано",
      of: "из",
    },

    settings: {
      title: "Настройки",
      description: "Конфигурация системы и предпочтения.",
      next: "Следующий шаг",
      text: "Здесь будут пользовательские настройки.",
      appearance: "Внешний вид",
      notifications: "Уведомления",
      integrations: "Интеграции",
    },

    result: {
      title: "Рабочая область результата",
      readyTitle: "Транскрипт готов",
      notFound: "Результат не найден",
      backToTranscripts: "Назад к транскриптам",
      downloadArtifact: "Скачать файл",
      subscription: "Подписка",
      subscriptionCta:
        "Нужны AI summary, субтитры и расширенный экспорт? Перейди к подпискам.",
      transcript: "Транскрипт",
      summary: "Сводка",
      subtitles: "Субтитры",
      contentIdeas: "Идеи контента",
      export: "Экспорт",
      locked: "Функция по подписке",
      upgradeCta:
        "Нужны AI summary, субтитры и переработка контента? Перейди к подпискам.",
    },

    pricing: {
      title: "Переходи на Pro когда увидишь ценность",
      subtitle: "Платежи можно подключить следующим этапом.",
      freeDesc: "Базовая транскрибация.",
      proDesc: "Для creators и фрилансеров.",
      businessDesc: "Для команд.",
      freeFeatures: ["30 мин / месяц", "Базовый текст", "TXT экспорт"],
      proFeatures: ["100 часов", "Сводка", "Субтитры", "Переработка контента"],
      businessFeatures: ["Команда", "Общие папки", "Приоритет", "API-совместимый"],
      billingLabel: "Тарифы",
      currentPlan: "Текущий тариф",
      subscriptionStatus: "Статус подписки",
      active: "Активна",
      usageHistory: "История использования",
      choosePlanTitle: "Выберите тариф",
      choosePlanSubtitle: "Подберите подписку под объём обработки.",
      starterName: "Starter",
      proName: "Pro",
      businessName: "Business",
      perMonth: "/ в месяц",
      upgrade: "Выбрать",
    },

    billing: {
      selectedPlan: "Выбранный тариф",
      fakePayment: "Тестовая оплата",
      fakePaymentDescription:
        "Сейчас это временная заглушка платежной формы. Позже сюда можно подключить Stripe, YooKassa или CloudPayments.",
      fakePaymentCompleted: "тестовая оплата выполнена",
    },

    uploads: {
      fastPath: "Быстрый путь",
      dropTitle: "Перетащи медиафайлы сюда",
      supported: "MP3, WAV, M4A, AAC, FLAC, OGG, MP4, MOV, MKV, WEBM, AVI",
      chooseFiles: "Выбрать файлы",
      uploading: "Загружаем...",
      summary: "Сводка загрузки",
      succeeded: "Успешно",
      uploadingLabel: "Загружается",
      failed: "Ошибки",
      queueTitle: "Очередь загрузки",
      queueEmptyTitle: "Очередь пуста",
      queueEmptyDescription: "Файлы появятся здесь после выбора.",
      uploadStartedTitle: "Загрузка началась",
      uploadStartedDescription: "файл(ов) добавлено в очередь.",
      uploadCompletedTitle: "Файл загружен",
      uploadCompletedDescription: "готов к транскрибации.",
      uploadFailedTitle: "Ошибка загрузки",
      workWithFile: "Работать с файлом",
      transcribe: "Транскрибировать",
      mediaAssetId: "ID медиафайла",
      progressComplete: "100%",
    },
  },
} as const;

type DeepStringify<T> = {
  readonly [K in keyof T]: T[K] extends readonly string[]
    ? readonly string[]
    : T[K] extends object
      ? DeepStringify<T[K]>
      : string;
};

type Dictionary = DeepStringify<(typeof dictionaries)["en"]>;

type I18nContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function getInitialLanguage(): Language {
  const stored = localStorage.getItem("vatranscribe_language");

  if (stored === "ru" || stored === "en") {
    return stored;
  }

  return navigator.language.toLowerCase().startsWith("ru") ? "ru" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  function setLanguage(nextLanguage: Language) {
    localStorage.setItem("vatranscribe_language", nextLanguage);
    setLanguageState(nextLanguage);
  }

  const value = useMemo<I18nContextValue>(
    () => ({
      language,
      setLanguage,
      t: dictionaries[language] as Dictionary,
    }),
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