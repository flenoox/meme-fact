import { useEffect, useRef, useState } from 'react';
import { browser } from 'wxt/browser';
import { FACTS, FACTS_RU } from '@meme-fact/shared';
import { UI_TEXT } from '../../lib/i18n';

type Lang = 'ru' | 'en';
type Item = { id: string; text: string; isTrue?: boolean };
type Screen = 'main' | 'collection' | 'achievements' | 'levels';
type Storage = {
  meme_lang?: Lang; lastVisit?: number; streak?: number; bestStreak?: number;
  xp?: number; opened?: string[]; dailyAnswered?: string;
  totalAnswers?: number; totalCorrect?: number;
  perfectStreak?: number; bestPerfectStreak?: number;
  achievements?: string[]; dailyHidden?: number;
};

const ICONS: Record<string, JSX.Element> = {
  tg: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M22 3L2 10.5l6 2 2 6 3-3 5 4 4-16.5zM9 13l8-5-6 7v3l-2-5z"/></svg>,
  wa: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5 14c-.3.8-1.5 1.5-2.2 1.5-.6 0-1.4-.2-4-1.7-2.8-1.7-4.5-4.8-4.7-5s-1-1.4-1-2.6.6-1.8.9-2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 2c.1.2.1.4 0 .6l-.4.5c-.1.2-.3.3-.1.6.2.3.7 1.2 1.5 2 1 .9 1.8 1.2 2.1 1.3.2.1.4.1.6-.1l.8-.9c.2-.2.4-.2.6-.1l2 .9c.3.1.4.2.4.3.1.2 0 .7-.2 1.3z"/></svg>,
  vk: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M13 17c-4.5 0-7.3-3.1-7.4-8.3h2.3c.1 3.9 1.8 5.5 3.1 5.9V8.7h2.2v3.4c1.3-.1 2.6-1.6 3.1-3.4h2.2c-.4 2.2-1.8 3.7-2.7 4.3.9.4 2.5 1.8 3.1 4h-2.4c-.5-1.6-1.7-2.8-3.3-3v3h-.2z"/></svg>,
  x: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.5 3h3L14 10.7 21.5 21h-6l-4.7-6.2L5.4 21H2.3l7-8.2L2 3h6.2l4.3 5.7L17.5 3zm-1 16h1.6L7.6 4.6H5.9L16.5 19z"/></svg>,
  rd: <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>,
};

const SOCIALS = [
  { id: 'tg', name: 'Telegram', url: (t: string) => `https://t.me/share/url?url=&text=${encodeURIComponent(t)}` },
  { id: 'wa', name: 'WhatsApp', url: (t: string) => `https://wa.me/?text=${encodeURIComponent(t)}` },
  { id: 'vk', name: 'VK', url: (t: string) => `https://vk.com/share.php?url=&title=${encodeURIComponent(t)}` },
  { id: 'x', name: 'X', url: (t: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(t)}` },
  { id: 'rd', name: 'Reddit', url: (t: string) => `https://www.reddit.com/submit?title=${encodeURIComponent(t)}` },
];

// === 100 ВЕЛИКИХ УМОВ ===
const ERUDITES = [
  'Новичок', 'Сократ', 'Платон', 'Аристотель', 'Архимед',
  'Пифагор', 'Евклид', 'Гиппократ', 'Геродот', 'Птолемей',
  'Леонардо да Винчи', 'Николай Коперник', 'Галилео Галилей', 'Иоганн Кеплер', 'Исаак Ньютон',
  'Готфрид Лейбниц', 'Леонард Эйлер', 'Карл Гаусс', 'Михаил Ломоносов', 'Карл Линней',
  'Дмитрий Менделеев', 'Чарльз Дарвин', 'Грегор Мендель', 'Луи Пастер', 'Джеймс Максвелл',
  'Майкл Фарадей', 'Никола Тесла', 'Томас Эдисон', 'Мария Кюри', 'Пьер Кюри',
  'Альберт Эйнштейн', 'Нильс Бор', 'Вернер Гейзенберг', 'Эрвин Шрёдингер', 'Макс Планк',
  'Энрико Ферми', 'Стивен Хокинг', 'Алан Тьюринг', 'Джон фон Нейман', 'Ада Лавлейс',
  'Чарльз Бэббидж', 'Константин Циолковский', 'Сергей Королёв', 'Юрий Гагарин', 'Нил Армстронг',
  'Андрей Сахаров', 'Лев Ландау', 'Пётр Капица', 'Жорес Алфёров', 'Игорь Курчатов',
  'Александр Флеминг', 'Джозеф Листер', 'Джеймс Уотсон', 'Фрэнсис Крик', 'Антони ван Левенгук',
  'Роберт Кох', 'Эдвард Дженнер', 'Николай Пирогов', 'Иван Павлов', 'Илья Мечников',
  'Зигмунд Фрейд', 'Карл Юнг', 'Иван Сеченов', 'Владимир Вернадский', 'Николай Вавилов',
  'Билл Гейтс', 'Стив Джобс', 'Илон Маск', 'Джефф Безос', 'Марк Цукерберг',
  'Тим Бернерс-Ли', 'Линус Торвальдс', 'Гордон Мур', 'Джек Килби', 'Роберт Нойс',
  'Галилео Феррари', 'Джон Логи Бэрд', 'Александр Белл', 'Никола Тесла', 'Гульельмо Маркони',
  'Братья Райт', 'Фердинанд Порше', 'Карл Бенц', 'Генри Форд', 'Рудольф Дизель',
  'Джордж Стефенсон', 'Ричард Тревитик', 'Томас Ньюкомен', 'Джеймс Уатт', 'Дени Папен',
  'Эдвин Дрейк', 'Абрахам Джеральд', 'Иоганн Гутенберг', 'Христофор Колумб', 'Фернан Магеллан',
  'Марко Поло', 'Афанасий Никитин', 'Васко да Гама', 'Джеймс Кук', 'Руаль Амундсен'
];

const LEVELS: { xp: number; name: string }[] = ERUDITES.map((name, i) => {
  // Прогрессия XP: 1 ур - 0, 2 ур - 20, 3 ур - 60, 4 ур - 120, и т.д.
  const xp = i === 0 ? 0 : Math.floor(10 * i * (i + 1) * 0.5);
  return { xp, name };
});

const getLevelInfo = (currentXp: number) => {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (currentXp >= LEVELS[i].xp) idx = i;
  }
  const current = LEVELS[idx];
  const next = LEVELS[idx + 1] || null;
  const progress = next ? Math.min(1, (currentXp - current.xp) / (next.xp - current.xp)) : 1;
  return { current, next, progress, idx };
};

type AchProgress = { current: number; target: number };
type Achievement = {
  id: string; icon: string; name: string; desc: string;
  progress: (s: {
    totalAnswers: number; totalCorrect: number; bestStreak: number;
    opened: number; bestPerfectStreak: number;
  }) => AchProgress;
};

// === 36 АЧИВОК ===
const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', icon: '🔥', name: 'Первый огонь', desc: 'Открыл плагин', progress: () => ({ current: 1, target: 1 }) },
  { id: 'streak3', icon: '🔥🔥', name: '3 дня', desc: 'Стрик 3 дня', progress: s => ({ current: s.bestStreak, target: 3 }) },
  { id: 'streak7', icon: '🔥🔥🔥', name: 'Неделя', desc: 'Стрик 7 дней', progress: s => ({ current: s.bestStreak, target: 7 }) },
  { id: 'streak14', icon: '⚡', name: 'Две недели', desc: 'Стрик 14 дней', progress: s => ({ current: s.bestStreak, target: 14 }) },
  { id: 'streak30', icon: '🌋', name: 'Месяц', desc: 'Стрик 30 дней', progress: s => ({ current: s.bestStreak, target: 30 }) },
  { id: 'streak100', icon: '🌌', name: '100 дней', desc: 'Стрик 100 дней', progress: s => ({ current: s.bestStreak, target: 100 }) },
  { id: 'coll10', icon: '📖', name: 'Читатель', desc: '10 фактов', progress: s => ({ current: s.opened, target: 10 }) },
  { id: 'coll50', icon: '📚', name: 'Коллекционер', desc: '50 фактов', progress: s => ({ current: s.opened, target: 50 }) },
  { id: 'coll100', icon: '📚📖', name: 'Книжный червь', desc: '100 фактов', progress: s => ({ current: s.opened, target: 100 }) },
  { id: 'coll200', icon: '📚📚', name: 'Библиотекарь', desc: '200 фактов', progress: s => ({ current: s.opened, target: 200 }) },
  { id: 'coll400', icon: '🏛️', name: 'Архивариус', desc: '400 фактов', progress: s => ({ current: s.opened, target: 400 }) },
  { id: 'sniper3', icon: '🎯', name: 'Три в ряд', desc: '3 верных подряд', progress: s => ({ current: s.bestPerfectStreak, target: 3 }) },
  { id: 'sniper5', icon: '🎯🎯', name: 'Меткий', desc: '5 верных подряд', progress: s => ({ current: s.bestPerfectStreak, target: 5 }) },
  { id: 'sniper10', icon: '🎯🎯🎯', name: 'Снайпер', desc: '10 верных подряд', progress: s => ({ current: s.bestPerfectStreak, target: 10 }) },
  { id: 'sniper25', icon: '🏹', name: 'Безупречный', desc: '25 верных подряд', progress: s => ({ current: s.bestPerfectStreak, target: 25 }) },
  { id: 'smart5', icon: '🧠', name: 'Смекалистый', desc: '5 верных', progress: s => ({ current: s.totalCorrect, target: 5 }) },
  { id: 'smart10', icon: '🧠🧠', name: 'Умник', desc: '10 верных', progress: s => ({ current: s.totalCorrect, target: 10 }) },
  { id: 'smart50', icon: '🧠🧠🧠', name: 'Гений', desc: '50 верных', progress: s => ({ current: s.totalCorrect, target: 50 }) },
  { id: 'smart100', icon: '🏆', name: 'Википедия', desc: '100 верных', progress: s => ({ current: s.totalCorrect, target: 100 }) },
  { id: 'smart200', icon: '👑', name: 'Эрудит', desc: '200 верных', progress: s => ({ current: s.totalCorrect, target: 200 }) },
  { id: 'player5', icon: '🎲', name: 'Разминка', desc: '5 ответов', progress: s => ({ current: s.totalAnswers, target: 5 }) },
  { id: 'player10', icon: '🎲🎲', name: 'Новичок', desc: '10 ответов', progress: s => ({ current: s.totalAnswers, target: 10 }) },
  { id: 'player50', icon: '🎲🎲🎲', name: 'Азартный', desc: '50 ответов', progress: s => ({ current: s.totalAnswers, target: 50 }) },
  { id: 'player100', icon: '🎮', name: 'Игрок', desc: '100 ответов', progress: s => ({ current: s.totalAnswers, target: 100 }) },
  { id: 'player200', icon: '🎮🎮', name: 'Заядлый', desc: '200 ответов', progress: s => ({ current: s.totalAnswers, target: 200 }) },
  { id: 'player500', icon: '👑', name: 'Король фактов', desc: '500 ответов', progress: s => ({ current: s.totalAnswers, target: 500 }) },
  { id: 'player1000', icon: '💎', name: 'Легенда', desc: '1000 ответов', progress: s => ({ current: s.totalAnswers, target: 1000 }) },
  { id: 'daily7', icon: '📅', name: 'Неделя фактов', desc: '7 дней фактов', progress: () => ({ current: 0, target: 1 }) },
  { id: 'daily30', icon: '🗓️', name: 'Месяц фактов', desc: '30 дней фактов', progress: () => ({ current: 0, target: 1 }) },
  { id: 'night', icon: '🦉', name: 'Полуночник', desc: 'Ответил в 3 часа ночи', progress: () => ({ current: 0, target: 1 }) },
  { id: 'early', icon: '🌅', name: 'Ранняя птица', desc: 'Ответил в 6 утра', progress: () => ({ current: 0, target: 1 }) },
  { id: 'fast', icon: '⚡', name: 'Скорострел', desc: 'Ответил за 1 секунду', progress: () => ({ current: 0, target: 1 }) },
  { id: 'perfect10', icon: '💯', name: 'Идеальный', desc: '10 ответов без ошибок', progress: s => ({ current: s.bestPerfectStreak, target: 10 }) },
  { id: 'perfect25', icon: '🌟', name: 'Безукоризненный', desc: '25 ответов без ошибок', progress: s => ({ current: s.bestPerfectStreak, target: 25 }) },
  { id: 'level5', icon: '📈', name: 'Рост', desc: 'Достиг 5 уровня', progress: () => ({ current: 0, target: 1 }) },
  { id: 'level10', icon: '🚀', name: 'Взлёт', desc: 'Достиг 10 уровня', progress: () => ({ current: 0, target: 1 }) },
  { id: 'level20', icon: '🌟', name: 'Звезда', desc: 'Достиг 20 уровня', progress: () => ({ current: 0, target: 1 }) },
];

export default function App() {
  const [lang, setLang] = useState<Lang>('en');
  const t = UI_TEXT[lang];
  const [fact, setFact] = useState<Item | null>(null);
  const [answer, setAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [fading, setFading] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [screen, setScreen] = useState<Screen>('main');
  const [pulse, setPulse] = useState(false);

  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [opened, setOpened] = useState<string[]>([]);
  const [dailyAnswered, setDailyAnswered] = useState<string | null>(null);
  const [dailyHidden, setDailyHidden] = useState<number>(0);
  const [totalAnswers, setTotalAnswers] = useState(0);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [bestPerfectStreak, setBestPerfectStreak] = useState(0);
  const [achievements, setAchievements] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  const timerRef = useRef<number | null>(null);
  const hoverZoneRef = useRef(false);
  const hoverShareRef = useRef(false);

  useEffect(() => {
    browser.storage.local.get(null).then((res: Storage) => {
      const now = Date.now();
      const day = 86400000;
      const today = Math.floor(now / day);
      const lastDay = res.lastVisit ? Math.floor(res.lastVisit / day) : 0;
      let newStreak = res.streak || 0;
      if (lastDay === today - 1) newStreak += 1;
      else if (lastDay < today - 1) newStreak = 1;
      if (newStreak === 0) newStreak = 1;
      const newBest = Math.max(res.bestStreak || 0, newStreak);
      setStreak(newStreak);
      setBestStreak(newBest);

      if (res.meme_lang === 'ru' || res.meme_lang === 'en') setLang(res.meme_lang);
      else setLang(navigator.language.toLowerCase().startsWith('ru') ? 'ru' : 'en');

      setXp(res.xp || 0);
      setOpened(res.opened || []);
      setDailyAnswered(res.dailyAnswered || null);
      setDailyHidden(res.dailyHidden || 0);
      setTotalAnswers(res.totalAnswers || 0);
      setTotalCorrect(res.totalCorrect || 0);
      setPerfectStreak(res.perfectStreak || 0);
      setBestPerfectStreak(res.bestPerfectStreak || 0);
      setAchievements(res.achievements || []);

      browser.storage.local.set({ lastVisit: now, streak: newStreak, bestStreak: newBest });
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    roll();
    browser.storage.local.set({ meme_lang: lang });
  }, [lang, ready]);

  const getPool = (): Item[] => (lang === 'ru' ? (FACTS_RU as Item[]) : (FACTS as Item[]));

  const getDailyFact = (): Item => {
    const pool = getPool();
    const day = Math.floor(Date.now() / 86400000);
    return pool[day % pool.length];
  };

  const checkAchievements = (data: {
    totalAnswers: number; totalCorrect: number; bestStreak: number;
    opened: number; bestPerfectStreak: number;
  }) => {
    const unlocked = new Set(achievements);
    const newOnes: string[] = [];
    for (const a of ACHIEVEMENTS) {
      if (!unlocked.has(a.id)) {
        const p = a.progress(data);
        if (p.current >= p.target) { unlocked.add(a.id); newOnes.push(`${a.icon} ${t['ach_' + a.id + '_name'] || a.name}`); }
      }
    }
    if (newOnes.length > 0) {
      const list = Array.from(unlocked);
      setAchievements(list);
      browser.storage.local.set({ achievements: list });
      newOnes.forEach((n, i) => setTimeout(() => showToast(`🏆 ${n}`), i * 700));
    }
  };

  const roll = () => {
    const pool = getPool();
    let next = pool[Math.floor(Math.random() * pool.length)];
    while (fact && next.id === fact.id && pool.length > 1) {
      next = pool[Math.floor(Math.random() * pool.length)];
    }
    setFact(next);
    setAnswer(null);
    setFading(false);
    setShowShare(false);
  };

  const showToast = (text: string) => {
    setToast(text);
    window.setTimeout(() => setToast(null), 2400);
  };

  const scheduleAutoRoll = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (hoverZoneRef.current || hoverShareRef.current) { scheduleAutoRoll(); return; }
      setFading(true);
      window.setTimeout(() => roll(), 200);
    }, 900);
  };

  const checkLevelUp = (prevXp: number, newXp: number) => {
    const prevInfo = getLevelInfo(prevXp);
    const newInfo = getLevelInfo(newXp);
    if (newInfo.idx > prevInfo.idx) {
      setTimeout(() => showToast(`🎉 Новый уровень: ${newInfo.current.name}!`), 600);
    }
  };

  const submit = (guess: boolean) => {
    if (!fact || answer !== null) return;
    setAnswer(guess);
    const factIsTrue = fact.isTrue === undefined ? true : fact.isTrue;
    const correct = factIsTrue === guess;

    setScore({ correct: score.correct + (correct ? 1 : 0), total: score.total + 1 });
    setPulse(true); setTimeout(() => setPulse(false), 400);

    const newTotalAnswers = totalAnswers + 1;
    const newTotalCorrect = totalCorrect + (correct ? 1 : 0);
    const newPerfect = correct ? perfectStreak + 1 : 0;
    const newBestPerfect = Math.max(bestPerfectStreak, newPerfect);
    const newXp = xp + (correct ? 3 : 1);
    const newOpened = opened.includes(fact.id) ? opened : [...opened, fact.id];

    checkLevelUp(xp, newXp);

    setTotalAnswers(newTotalAnswers); setTotalCorrect(newTotalCorrect);
    setPerfectStreak(newPerfect); setBestPerfectStreak(newBestPerfect);
    setXp(newXp); setOpened(newOpened);

    browser.storage.local.set({
      xp: newXp, opened: newOpened,
      totalAnswers: newTotalAnswers, totalCorrect: newTotalCorrect,
      perfectStreak: newPerfect, bestPerfectStreak: newBestPerfect,
    });

    setTimeout(() => checkAchievements({
      totalAnswers: newTotalAnswers, totalCorrect: newTotalCorrect,
      bestStreak, opened: newOpened.length, bestPerfectStreak: newBestPerfect,
    }), 500);

    scheduleAutoRoll();
  };

  const submitDaily = (guess: boolean) => {
    const daily = getDailyFact();
    if (dailyAnswered === daily.id) return;
    const factIsTrue = daily.isTrue === undefined ? true : daily.isTrue;
    const correct = factIsTrue === guess;
    const newXp = xp + (correct ? 5 : 2);
    const newOpened = opened.includes(daily.id) ? opened : [...opened, daily.id];
    const newTotalAnswers = totalAnswers + 1;
    const newTotalCorrect = totalCorrect + (correct ? 1 : 0);
    const newPerfect = correct ? perfectStreak + 1 : 0;
    const newBestPerfect = Math.max(bestPerfectStreak, newPerfect);

    checkLevelUp(xp, newXp);

    setXp(newXp); setOpened(newOpened); setDailyAnswered(daily.id);
    setTotalAnswers(newTotalAnswers); setTotalCorrect(newTotalCorrect);
    setPerfectStreak(newPerfect); setBestPerfectStreak(newBestPerfect);

    browser.storage.local.set({
      xp: newXp, opened: newOpened, dailyAnswered: daily.id,
      totalAnswers: newTotalAnswers, totalCorrect: newTotalCorrect,
      perfectStreak: newPerfect, bestPerfectStreak: newBestPerfect,
    });

    showToast(correct ? '✅ Верно! +5 XP' : '❌ Мимо! +2 XP');
    setTimeout(() => checkAchievements({
      totalAnswers: newTotalAnswers, totalCorrect: newTotalCorrect,
      bestStreak, opened: newOpened.length, bestPerfectStreak: newBestPerfect,
    }), 500);
  };

  const hideDaily = () => {
    const day = Math.floor(Date.now() / 86400000);
    setDailyHidden(day);
    browser.storage.local.set({ dailyHidden: day });
  };

  const cancelAutoRoll = () => {
    if (timerRef.current) { window.clearTimeout(timerRef.current); timerRef.current = null; }
  };

  const buildShareText = () => {
    if (!fact) return '';
    const factIsTrue = fact.isTrue === undefined ? true : fact.isTrue;
    if (answer === null) {
      return `🤔 Правда или ложь?\n\n«${fact.text}»\n\nПроверь себя → https://meme-fact.app`;
    }
    const verdict = (factIsTrue === answer) ? '✅ Угадал' : '❌ Не угадал';
    return `🤔 Правда или ложь?\n\n«${fact.text}»\n\n${verdict}. А ты угадаешь? → https://meme-fact.app`;
  };

  const shareTo = (networkId: string) => {
    const text = buildShareText();
    const social = SOCIALS.find(s => s.id === networkId);
    if (!social) return;
    cancelAutoRoll();
    browser.tabs.create({ url: social.url(text) });
    setShowShare(false);
    navigator.clipboard.writeText(text).catch(() => {});
    showToast('Текст скопирован + открыта вкладка');
  };

  const donate = () => {
    browser.tabs.create({ url: 'https://boosty.to/mememachine' });
  };

  if (!fact) return <div className="app" />;

  const factIsTrue = fact.isTrue === undefined ? true : fact.isTrue;
  const isCorrect = answer !== null && factIsTrue === answer;
  const levelInfo = getLevelInfo(xp);
  const daily = getDailyFact();
  const dailyIsTrue = daily.isTrue === undefined ? true : daily.isTrue;
  const dailyDone = dailyAnswered === daily.id;
  const dailyIsHidden = dailyHidden === Math.floor(Date.now() / 86400000);
  const totalFacts = getPool().length;

  const progressData = { totalAnswers, totalCorrect, bestStreak, opened: opened.length, bestPerfectStreak };

  // === ЭКРАН: Коллекция ===
  if (screen === 'collection') {
    const collected = opened.map(id => getPool().find(f => f.id === id)).filter(Boolean) as Item[];
    return (
      <div className="app">
        <div className="bg-glow" aria-hidden="true" />
        <header className="screen-header">
          <button className="back-btn" onClick={() => setScreen('main')}>{t.back}</button>
          <div className="brand">{t.collection}</div>
          <div className="overlay-count">{opened.length}/{totalFacts}</div>
        </header>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${(opened.length / totalFacts) * 100}%` }} /></div>
        <div className="screen-scroll">
          {collected.length === 0 && <div className="overlay-empty">{t.collectionEmpty}</div>}
          {collected.slice().reverse().map(f => (
            <div key={f.id} className="collection-item">{f.text}</div>
          ))}
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  // === ЭКРАН: Ачивки ===
  if (screen === 'achievements') {
    return (
      <div className="app">
        <div className="bg-glow" aria-hidden="true" />
        <header className="screen-header">
          <button className="back-btn" onClick={() => setScreen('main')}>{t.back}</button>
          <div className="brand">{t.achievementsTitle}</div>
          <div className="overlay-count">{achievements.length}/{ACHIEVEMENTS.length}</div>
        </header>
        <div className="screen-scroll">
          <div className="ach-grid-full">
            {ACHIEVEMENTS.map(a => {
              const unlocked = achievements.includes(a.id);
              const p = a.progress(progressData);
              const pct = Math.min(100, (p.current / p.target) * 100);
              return (
                <div key={a.id} className={`ach-card ${unlocked ? 'unlocked' : 'locked'}`} title={t['ach_' + a.id + '_desc'] || a.desc}>
                  <div className="ach-icon">{a.icon}</div>
                  <div className="ach-name">{t['ach_' + a.id + '_name'] || a.name}</div>
                  <div className="ach-progress"><div className="ach-progress-fill" style={{ width: `${pct}%` }} /></div>
                  <div className="ach-count">{Math.min(p.current, p.target)}/{p.target}</div>
                </div>
              );
            })}
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  // === ЭКРАН: Уровни ===
  if (screen === 'levels') {
    return (
      <div className="app">
        <div className="bg-glow" aria-hidden="true" />
        <header className="screen-header">
          <button className="back-btn" onClick={() => setScreen('main')}>{t.back}</button>
          <div className="brand">{t.levelsTitle}</div>
          <div className="overlay-count">{xp} XP</div>
        </header>
        <div className="screen-scroll">
          <div className="levels-list">
            {LEVELS.map((l, i) => {
              const reached = xp >= l.xp;
              const current = levelInfo.idx === i;
              return (
                <div key={i} className={`level-row ${reached ? 'reached' : 'locked'} ${current ? 'current' : ''}`}>
                  <div className="level-row-icon">{reached ? '✓' : '🔒'}</div>
                  <div className="level-row-info">
                    <div className="level-row-name">{t['lvl_' + i] || l.name}</div>
                    <div className="level-row-xp">{l.xp} XP</div>
                  </div>
                  {current && <div className="level-row-badge">{t.youAreHere}</div>}
                </div>
              );
            })}
          </div>
        </div>
        {toast && <div className="toast">{toast}</div>}
      </div>
    );
  }

  // === ЭКРАН: Главный ===
  return (
    <div className="app">
      <div className="bg-glow" aria-hidden="true" />

      <header>
        <div className="brand">Meme Fact</div>
        <div className="header-right">
          <button className="streak" onClick={() => setScreen('levels')} title={`${t.streakTooltip} ${bestStreak}`}>🔥 {streak}</button>
          <button className="icon-btn" onClick={() => setShowShare(v => !v)} onMouseEnter={() => { hoverShareRef.current = true; }} onMouseLeave={() => { hoverShareRef.current = false; }} title={t.share}>{t.share}</button>
          <div className="lang-switch">
            <button className={lang === 'ru' ? 'active' : ''} onClick={() => setLang('ru')}>RU</button>
            <button className={lang === 'en' ? 'active' : ''} onClick={() => setLang('en')}>EN</button>
          </div>
          <button className="icon-btn" onClick={() => setScreen('achievements')}>🏆 <span className="badge-count">{achievements.length}/{ACHIEVEMENTS.length}</span></button>
          <button className="icon-btn" onClick={donate}>☕</button>
        </div>
      </header>

      <div className="level-bar">
        <div className="level-info">
          <span className="level-name">{t['lvl_' + levelInfo.idx] || levelInfo.current.name}</span>
          {levelInfo.next && <span className="level-next">{xp}/{levelInfo.next.xp} {t.xp}</span>}
        </div>
        <div className="level-progress"><div className="level-fill" style={{ width: `${levelInfo.progress * 100}%` }} /></div>
      </div>

      {!dailyIsHidden && (
        <div className={`daily ${dailyDone ? 'done' : ''}`}>
          <div className="daily-header">
            <div className="daily-label">{t.dailyFact}</div>
            <button className="daily-close" onClick={hideDaily}>×</button>
          </div>
          <div className="daily-text">«{daily.text}»</div>
          {dailyDone ? (
            <div className="daily-done">{dailyIsTrue ? '✅ Верно' : '❌ Не угадал'} <span className="daily-hint">· {dailyIsTrue ? t.dailyTrue : t.dailyFalse}</span></div>
          ) : (
            <div className="daily-buttons">
              <button className="daily-yes" onClick={() => submitDaily(true)}>{t.trueBtn}</button>
              <button className="daily-no" onClick={() => submitDaily(false)}>{t.falseBtn}</button>
            </div>
          )}
        </div>
      )}

      <div className={`stage ${fading ? 'fading' : ''}`}>
        <div
          className={`card ${answer !== null ? (isCorrect ? 'correct' : 'wrong') : ''}`}
          onMouseEnter={() => { hoverZoneRef.current = true; }}
          onMouseLeave={() => { hoverZoneRef.current = false; }}
        >
          <p>{fact.text}</p>
          {answer !== null && (
            <div className={`verdict ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? t.correct : t.wrong}
              {factIsTrue === false && <span className="hint"> {t.wasFake}</span>}
            </div>
          )}
        </div>

        <div className="controls">
          {answer === null ? (
            <>
              <button className="yes" onClick={() => submit(true)}>{t.trueBtn}</button>
              <button className="no" onClick={() => submit(false)}>{t.falseBtn}</button>
            </>
          ) : (
            <div className="auto-next">{t.nextFact}</div>
          )}
        </div>
      </div>

      <footer>
        <button className="collection-btn" onClick={() => setScreen('collection')}>📚 {opened.length}/{totalFacts}</button>
      </footer>

      {showShare && (
        <div className="overlay" onMouseEnter={() => { hoverShareRef.current = true; }} onMouseLeave={() => { hoverShareRef.current = false; }}>
          <div className="overlay-header">{t.shareTitle}</div>
          <div className="share-grid">
            {SOCIALS.map(s => (
              <button key={s.id} className="share-item" onClick={() => shareTo(s.id)}>
                <span className="share-icon">{ICONS[s.id]}</span><span>{s.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
