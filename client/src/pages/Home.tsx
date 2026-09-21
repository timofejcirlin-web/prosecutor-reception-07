import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Camera, Check, ChevronRight, FileText, Gavel, MapPin, Maximize2, MessageSquare, Minimize2, Pause, Play, RotateCcw, Scale, SkipBack, SkipForward, Stamp, UserRound, Users, X, Music2 } from "lucide-react";

const OFFICE_BG = "/manus-storage/prosecutor-office-reference_7e58c04a.png";
const UI_CLICK = "/manus-storage/prosecutor-ui-click_a921f702.mp3";
const BACKGROUND_MUSIC = "/manus-storage/prosecutor-soviet-ambient_98bcbd3d.mp3";
const MUSIC_TRACKS = [
  { title: "Смена · Неоновый архив", src: BACKGROUND_MUSIC },
  { title: "Ночной проспект · синтвейв", src: "/manus-storage/prosecutor-track-02_aaff8899.mp3" },
  { title: "Кабинет · детективный джаз", src: "/manus-storage/prosecutor-track-03_a729478f.mp3" },
  { title: "Архив · тихий минимализм", src: "/manus-storage/prosecutor-track-04_af2e30c3.mp3" },
  { title: "Проверка · срочный протокол", src: "/manus-storage/prosecutor-track-05_918c4c8a.mp3" },
];
const ADMIN_MAP_SVG = "/manus-storage/Ed887Ix3NN14_f7721d82.svg";
const CONSTITUTION_SUBJECT_COUNT = 89;
const RF_SUBJECTS = "Адыгея|Алтай|Башкортостан|Бурятия|Дагестан|Донецкая Народная Республика|Ингушетия|Кабардино-Балкария|Калмыкия|Карачаево-Черкесия|Карелия|Коми|Крым|Луганская Народная Республика|Марий Эл|Мордовия|Саха (Якутия)|Северная Осетия — Алания|Татарстан|Тыва|Удмуртия|Хакасия|Чечня|Чувашия|Алтайский край|Забайкальский край|Камчатский край|Краснодарский край|Красноярский край|Пермский край|Приморский край|Ставропольский край|Хабаровский край|Амурская область|Архангельская область|Астраханская область|Белгородская область|Брянская область|Владимирская область|Волгоградская область|Вологодская область|Воронежская область|Запорожская область|Ивановская область|Иркутская область|Калининградская область|Калужская область|Кемеровская область — Кузбасс|Кировская область|Костромская область|Курганская область|Курская область|Ленинградская область|Липецкая область|Магаданская область|Московская область|Мурманская область|Нижегородская область|Новгородская область|Новосибирская область|Омская область|Оренбургская область|Орловская область|Пензенская область|Псковская область|Ростовская область|Рязанская область|Самарская область|Саратовская область|Сахалинская область|Свердловская область|Смоленская область|Тамбовская область|Тверская область|Томская область|Тульская область|Тюменская область|Ульяновская область|Херсонская область|Челябинская область|Ярославская область|Москва|Санкт-Петербург|Севастополь|Еврейская автономная область|Ненецкий автономный округ|Ханты-Мансийский автономный округ — Югра|Чукотский автономный округ|Ямало-Ненецкий автономный округ".split("|");
const MAP_MARKERS = [{ name: "Калининградская область", left: 8, top: 38 }, { name: "Санкт-Петербург", left: 19, top: 28 }, { name: "Москва", left: 31, top: 45 }, { name: "Свердловская область", left: 59, top: 42 }, { name: "Новосибирская область", left: 70, top: 56 }, { name: "Красноярский край", left: 77, top: 47 }, { name: "Иркутская область", left: 82, top: 61 }, { name: "Республика Саха (Якутия)", left: 82, top: 25 }, { name: "Приморский край", left: 94, top: 60 }, { name: "Хабаровский край", left: 91, top: 48 }, { name: "Камчатский край", left: 99, top: 27 }, { name: "Краснодарский край", left: 29, top: 69 }, { name: "Республика Татарстан", left: 46, top: 53 }, { name: "Мурманская область", left: 24, top: 10 }];
const NEW_REGION_TERRITORIES = [
  { name: 'Донецкая Народная Республика', d: 'M 11.33 72.33 10.07 75.90 9.47 74.04 8.08 75.64 7.83 74.59 8.69 73.37 8.31 72.74 8.55 71.81 6.55 68.42 7.31 68.21 7.06 65.58 9.07 64.83 9.58 62.26 6.75 60.33 6.26 58.63 5.70 59.15 5.46 57.89 5.96 57.23 5.34 57.33 5.02 54.69 4.33 54.92 4.58 53.55 4.00 52.14 4.78 51.49 4.21 49.79 4.27 47.85 6.45 48.69 6.76 47.47 6.49 45.37 6.98 44.99 6.79 42.47 5.97 41.99 6.16 38.39 6.75 37.18 5.54 35.70 5.12 31.34 7.31 30.68 7.83 31.98 7.74 30.44 9.08 30.43 10.70 24.78 12.26 22.90 11.70 21.01 14.32 21.09 14.51 20.00 15.10 21.34 14.98 22.44 16.19 22.34 16.19 25.97 15.51 26.98 17.13 27.23 17.17 29.60 17.93 30.14 17.45 31.32 17.86 33.34 17.25 34.50 17.77 38.90 18.67 39.04 19.29 41.09 18.71 43.09 19.69 42.96 20.14 45.40 21.84 46.65 22.01 49.04 23.74 49.30 23.90 52.70 22.12 52.70 21.56 56.87 18.34 58.76 17.84 60.40 17.90 63.93 17.29 65.56 18.09 65.85 18.15 66.97 17.46 67.55 17.37 70.09 16.29 72.23 16.55 71.19 16.00 70.25 12.15 70.58 11.48 71.90 11.33 72.33 Z M 12.96 70.99 12.93 70.97 12.96 70.99 Z', labelX: 14, labelY: 85 },
  { name: 'Херсонская область', d: 'M 78.91 66.83 78.90 66.80 78.91 66.83 Z M 78.90 65.39 78.90 65.36 78.90 65.39 Z M 79.18 64.53 79.17 64.51 79.18 64.53 Z M 78.68 64.19 78.65 64.16 78.68 64.19 Z M 78.57 65.97 78.57 65.91 78.57 65.97 Z M 77.78 63.75 77.78 63.68 77.78 63.75 Z M 77.98 63.64 77.98 63.62 77.98 63.64 Z M 76.13 60.40 76.49 64.33 78.89 66.83 76.53 64.55 76.06 62.49 76.10 60.36 76.13 60.40 Z M 77.24 63.52 77.23 63.49 77.24 63.52 Z M 78.15 63.20 78.15 63.16 78.15 63.20 Z M 77.37 62.51 77.37 62.58 77.37 62.51 Z M 78.13 62.40 78.11 62.34 78.13 62.40 Z M 81.28 69.98 79.01 67.01 79.98 68.26 80.11 67.09 78.15 62.15 78.02 63.86 77.49 63.85 77.51 61.92 79.06 59.40 78.80 57.60 77.42 56.41 77.08 58.22 76.00 53.40 81.04 56.78 80.34 56.46 80.25 53.15 79.51 54.08 78.74 51.29 79.29 50.29 79.26 47.94 80.02 46.87 80.07 44.92 80.87 46.58 80.93 45.21 81.78 45.72 81.84 43.97 82.79 45.69 84.19 44.77 83.62 42.90 84.06 42.98 84.36 41.66 84.08 40.24 84.81 39.39 83.91 35.89 85.35 31.82 84.88 29.38 85.04 26.85 84.55 27.16 84.61 23.84 84.75 26.22 85.09 25.88 85.16 22.55 84.82 20.53 85.65 21.05 85.55 22.22 86.23 23.91 87.57 20.00 87.60 22.97 87.93 24.02 89.40 22.89 89.82 25.15 90.70 24.30 91.41 27.00 91.61 31.43 92.63 29.58 92.89 32.43 92.60 32.59 92.76 36.02 93.25 41.12 94.05 42.23 94.17 44.87 94.51 45.31 94.23 49.33 93.55 51.28 94.21 52.18 94.00 54.81 94.28 56.69 95.00 56.11 95.03 58.37 95.88 58.77 96.00 61.77 95.79 63.69 94.52 65.91 94.56 70.93 93.58 69.89 93.40 73.77 92.63 76.00 92.28 73.83 92.68 73.45 92.44 73.20 92.62 71.14 93.19 72.42 93.33 69.96 93.05 68.85 92.78 70.84 92.26 69.28 91.71 71.77 90.27 71.06 90.20 72.29 89.23 68.08 87.87 66.33 87.78 69.01 87.58 67.38 87.15 68.64 87.46 70.18 87.06 70.24 87.19 71.70 86.66 71.69 86.15 68.86 85.89 70.12 85.89 68.24 85.42 69.07 85.55 65.49 85.06 68.53 84.47 67.49 84.45 68.99 81.61 70.36 81.28 69.98 Z M 78.92 59.75 78.91 59.64 78.92 59.75 Z M 78.99 59.38 78.99 59.34 78.99 59.38 Z M 80.33 56.63 80.27 56.60 80.33 56.63 Z M 77.45 62.15 77.46 62.15 77.45 62.15 Z M 77.23 58.56 77.47 60.23 77.22 58.53 77.23 58.56 Z M 77.18 58.37 77.17 58.34 77.18 58.37 Z M 78.62 55.92 78.62 55.87 78.62 55.92 Z M 80.36 56.70 80.35 56.67 80.36 56.70 Z M 80.19 56.21 80.15 56.18 80.19 56.21 Z M 80.24 56.03 80.21 56.00 80.24 56.03 Z M 78.70 55.90 78.68 55.87 78.70 55.90 Z M 79.39 55.49 79.17 55.92 79.40 55.45 79.39 55.49 Z M 80.36 55.49 80.33 55.47 80.36 55.49 Z M 79.82 53.58 79.79 53.55 79.82 53.58 Z M 78.47 55.80 78.49 55.79 78.47 55.80 Z M 78.21 55.08 78.19 55.07 78.21 55.08 Z M 76.27 53.52 76.26 53.49 76.27 53.52 Z M 81.79 70.41 84.76 72.26 81.78 70.39 81.79 70.41 Z M 86.11 70.18 86.12 70.16 86.11 70.18 Z M 85.38 69.78 85.37 69.75 85.38 69.78 Z M 84.53 68.93 84.51 68.90 84.53 68.93 Z M 90.20 72.29 90.17 72.28 90.20 72.29 Z M 87.37 68.45 87.37 68.41 87.37 68.45 Z M 80.40 55.75 80.40 55.71 80.40 55.75 Z M 80.36 53.83 80.34 53.81 80.36 53.83 Z', labelX: 86, labelY: 85 },
  { name: 'Луганская Народная Республика', d: 'M 39.66 74.83 38.36 75.19 38.03 71.36 36.18 71.08 36.00 68.56 34.18 67.25 33.70 64.67 32.65 64.80 33.27 62.69 32.62 60.53 31.64 60.39 31.09 55.74 31.75 54.52 31.31 52.39 31.82 51.14 31.01 50.58 30.96 48.07 29.23 47.81 29.95 46.74 29.96 42.91 28.45 42.69 28.79 41.86 28.17 40.30 29.04 39.53 28.32 38.55 28.05 33.79 29.66 30.15 28.90 28.27 29.79 26.91 29.37 25.95 30.01 25.18 29.52 24.03 31.15 22.75 30.92 20.25 32.10 20.00 32.33 21.90 33.50 22.92 35.06 22.18 35.57 24.39 37.10 25.45 37.38 26.98 39.27 25.10 40.23 28.16 42.88 28.49 43.18 31.19 44.42 32.76 47.27 31.52 47.92 32.95 47.51 36.06 47.84 40.83 46.35 42.51 45.61 45.27 43.36 45.65 43.32 46.77 44.03 47.01 44.71 49.59 46.98 49.71 46.08 51.75 44.44 50.54 43.26 56.12 44.89 57.44 44.90 59.88 45.70 62.40 44.89 63.59 46.04 63.75 46.28 64.96 44.84 69.94 45.21 70.41 44.44 70.64 44.87 71.73 44.60 74.43 44.07 76.00 39.82 74.80 39.66 74.83 Z', labelX: 38, labelY: 85 },
  { name: 'Запорожская область', d: 'M 57.88 74.03 57.87 74.00 57.88 74.03 Z M 58.02 69.96 57.98 66.67 57.00 66.34 56.96 64.48 56.13 64.96 55.81 63.41 56.06 61.23 55.29 60.50 56.08 58.88 56.40 55.56 56.01 55.20 55.87 53.02 54.94 52.10 54.38 47.90 54.20 45.07 54.53 44.93 54.23 42.59 53.04 44.11 52.81 40.46 52.00 38.22 54.76 36.03 57.09 36.89 56.81 33.25 57.13 30.14 56.74 30.27 56.88 27.98 56.29 26.44 57.02 25.68 56.77 20.23 57.20 21.42 59.12 20.09 61.11 21.72 62.21 20.00 62.90 22.03 63.93 21.13 64.74 25.62 64.53 27.90 65.79 28.80 67.87 27.64 67.72 29.42 68.29 29.14 68.55 32.26 69.06 32.15 68.65 32.92 68.84 34.40 69.30 33.79 69.70 35.79 72.00 38.07 71.59 41.09 69.95 41.98 70.15 45.08 69.53 45.32 71.06 48.96 71.28 51.15 69.73 55.84 68.90 60.70 69.20 58.11 68.04 56.63 66.32 58.73 64.70 64.67 65.84 60.56 65.60 61.73 65.26 59.76 64.07 59.73 62.07 61.71 60.36 66.18 58.60 74.29 57.40 76.00 58.88 72.98 59.80 68.15 59.54 69.04 58.78 67.66 58.01 69.99 58.02 69.96 Z M 65.38 62.64 65.38 62.60 65.38 62.64 Z M 65.51 62.23 65.51 62.29 65.51 62.23 Z M 68.84 60.19 68.83 60.18 68.84 60.19 Z M 68.90 60.24 68.90 60.26 68.90 60.24 Z M 68.86 60.03 68.85 59.99 68.86 60.03 Z M 69.03 59.91 69.02 59.89 69.03 59.91 Z M 69.12 59.11 69.12 58.93 69.12 59.11 Z', labelX: 62, labelY: 85 },
];
const REGION_ALIASES: Record<string, string> = { "Алтай": "altajskij_kraj", "Башкортостан": "bashkortostan", "Крым": "respublica_krym", "Саха (Якутия)": "respublika_sakha_(jakutija)", "Чечня": "chechenskaja_respublika", "Татарстан": "tatarstan", "Северная Осетия — Алания": "severnaja_osetija_-_alanija", "Еврейская автономная область": "evrejskaja_avtonomnaja_oblast'", "Ханты-Мансийский автономный округ — Югра": "khanty-mansijskij_avtonomnyj_okrug_-_jugra", "Ямало-Ненецкий автономный округ": "jamalo-neneckij_avtonomnyj_okrug" };
const translit: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "j", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "kh", ц: "c", ч: "ch", ш: "sh", щ: "shh", ъ: "", ы: "y", ь: "", э: "eh", ю: "ju", я: "ja" };
const regionSvgId = (name: string) => REGION_ALIASES[name] ?? name.toLowerCase().split("").map((char) => translit[char] ?? char).join("").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
const normalizeSvgId = (id: string) => id.replace(/'/g, "");
const regionNameBySvgId = (id: string) => RF_SUBJECTS.find((name) => normalizeSvgId(regionSvgId(name)) === normalizeSvgId(id)) ?? Object.entries(REGION_ALIASES).find(([, alias]) => normalizeSvgId(alias) === normalizeSvgId(id))?.[0] ?? id;

type Decision = "prosecute" | "dismiss";
type LocationId = "reception" | "inspection";
type Material = { label: string; text: string };
type CaseFile = {
  id: string;
  number: string;
  category: string;
  person: string;
  place: string;
  summary: string;
  evidence: string;
  correct: Decision;
  explanation: string;
  stage: string;
  materials: Material[];
};

const CASES: CaseFile[] = [
  { id: "01", number: "М-07/24", category: "Мошенничество при капремонте", person: "Руководитель подрядной организации", place: "Город N, многоквартирный дом", summary: "При ремонте кровли в документах указали более дорогие материалы, чем использовали фактически.", evidence: "Предварительный ущерб бюджету — свыше 1,5 млн рублей. Материал проверки указывает на возможное хищение в особо крупном размере.", correct: "prosecute", explanation: "Смета, акт осмотра и ведомость закупок дают основания для дальнейшего расследования. Виновность устанавливает суд.", stage: "Проверка завершена, расследование продолжается", materials: [{ label: "Смета", text: "В смете указана кровельная мембрана премиум-класса и усиленный утеплитель. Итоговая стоимость — 3 840 000 рублей." }, { label: "Акт осмотра", text: "На объекте обнаружены материалы другого класса. Представитель заказчика зафиксировал расхождение в журнале работ." }, { label: "Платёжные документы", text: "Оплата перечислена полностью. Разница между заявленной и фактической стоимостью предварительно оценивается более чем в 1,5 млн рублей." }] },
  { id: "02", number: "Л-05/26", category: "Незаконная рубка леса", person: "Двое местных жителей", place: "Лесной квартал 14, район N", summary: "На территории лесничества были вырублены 300 деревьев: сосна, ель и берёза.", evidence: "Размер экологического ущерба оценён свыше 29 млн рублей. Материал содержит сведения о завершённом судебном рассмотрении.", correct: "prosecute", explanation: "Количество деревьев, место, породы и размер ущерба согласуются между материалами. Основания для обвинительного решения подтверждены.", stage: "Судебное рассмотрение завершено", materials: [{ label: "Схема участка", text: "На схеме отмечены делянка лесничества и 300 пней. Координаты привязаны к кварталу 14." }, { label: "Расчёт ущерба", text: "Таксационная ведомость учитывает сосну, ель и берёзу. Итоговая сумма превышает 29 млн рублей." }, { label: "Показания", text: "Двое подозреваемых сообщили, что находились на участке в период, совпадающий со временем рубки." }] },
  { id: "03", number: "В-09/23", category: "Мошенничество при получении выплаты", person: "Жительница района N", place: "Район N, отделение выплат", summary: "Для получения государственной выплаты были представлены ложные документы о рождении ребёнка.", evidence: "Сумма сертификата — 453 тыс. рублей. Ущерб возмещён, материалы направлены для судебного рассмотрения.", correct: "prosecute", explanation: "Документ из реестра актов гражданского состояния не подтверждает событие, указанное в заявлении. Материал требует направления в суд.", stage: "Расследование завершено, дело направлено в суд", materials: [{ label: "Заявление", text: "В заявлении указаны дата и место рождения ребёнка, а также реквизиты сертификата на выплату." }, { label: "Проверка реестра", text: "В архивной записи отсутствует акт о рождении с указанными реквизитами. Запрос направлен в районный архив." }, { label: "Финансовая справка", text: "Средства в размере 453 000 рублей перечислены на погашение целевого займа. В ходе расследования сумма возмещена." }] },
  { id: "04", number: "Д-02/23", category: "Покушение на дачу взятки", person: "Гражданин 44 лет", place: "Город N, служебный автомобиль", summary: "После остановки инспекторами водитель пытался передать 60 тыс. рублей за несоставление документов.", evidence: "Передача денег пресечена. В материалах есть сведения о ранее действовавшем запрете на управление транспортом.", correct: "prosecute", explanation: "Размер суммы, цель передачи и фиксация пресечения согласуются между материалами. Состав покушения подтверждён судебным актом.", stage: "Приговор вступил в законную силу", materials: [{ label: "Рапорт инспектора", text: "Автомобиль остановлен ночью. Водитель находился за рулём, несмотря на действующий запрет управления." }, { label: "Запись разговора", text: "На записи слышно предложение передать 60 000 рублей, чтобы избежать оформления материалов." }, { label: "Протокол изъятия", text: "Денежные средства изъяты в салоне служебного автомобиля до завершения передачи." }] },
  { id: "05", number: "Т-02/25", category: "Трудовые права и оплата", person: "Трое работников", place: "Агрокомплекс в районе N", summary: "Сторожам более трёх лет оплачивали 12 часов из 24-часовой смены.", evidence: "Работники обращались с жалобами. Вопрос касается взыскания задолженности и административного нарушения, а не возбуждения уголовного дела.", correct: "dismiss", explanation: "Нарушение трудовых прав подтверждено, но выбранное решение не соответствует уголовной квалификации: материал нужно направить по гражданско-административному маршруту.", stage: "Требования работников удовлетворены", materials: [{ label: "График смен", text: "Фактический график — сутки через двое. С графиками сменности работников официально не знакомили." }, { label: "Расчётные листки", text: "В документах отражена оплата 12 часов при фактической 24-часовой смене." }, { label: "Исковое заявление", text: "Требования включают задолженность, компенсацию задержки и моральный вред. Общая выплата — 635 000 рублей." }] },
];

const INSPECTION_POINTS: Record<string, Material[]> = {
  "01": [{ label: "Кровля", text: "На участке виден новый слой покрытия, но маркировка рулонов не совпадает с указанной в смете." }, { label: "Склад", text: "В подсобном помещении обнаружены остатки более дешёвого материала. Упаковки частично сохранились." }, { label: "Прораб", text: "Ответственный за работы не может объяснить, почему фактический материал отличается от ведомости закупок." }],
  "02": [{ label: "Делянка", text: "На границе квартала обнаружены свежие пни и следы тяжёлой техники." }, { label: "Следы", text: "Колеи ведут к временной дороге. На нескольких пнях сохранены свежие опилки." }, { label: "Егеря", text: "Сотрудник лесничества подтверждает, что разрешение на рубку для этого участка не выдавалось." }],
  "03": [{ label: "Отдел выплат", text: "В заявлении указаны реквизиты сертификата и дата события, которые требуют отдельной проверки." }, { label: "Архив", text: "В архиве отсутствует запись с указанными реквизитами. Сотрудник готов предоставить заверенную справку." }, { label: "Получатель", text: "Получатель утверждает, что документы подавались лично, но не называет сотрудника, который их принял." }],
  "04": [{ label: "Место остановки", text: "Патрульный автомобиль и место остановки соответствуют схеме в рапорте." }, { label: "Салон", text: "На видеозаписи видно движение денежных средств до момента вмешательства второго инспектора." }, { label: "Инспектор", text: "Инспектор описывает сумму, цель передачи и последовательность действий без существенных расхождений." }],
  "05": [{ label: "Пост охраны", text: "На объекте есть журнал дежурств: смена длится 24 часа и повторяется по графику «сутки через двое»." }, { label: "Табель", text: "В табеле отмечены полные смены, а в расчётных листках оплачена только половина часов." }, { label: "Работники", text: "Трое работников независимо описывают одинаковый порядок смен и отсутствие расчётных листков." }],
};

type Complaint = { id: string; title: string; applicant: string; role: string; situation: string; request: string; correct: "accept" | "reject"; outcome: string; background: string; portrait: string; documents: Material[]; extra: Material };
const COMPLAINTS: Complaint[] = [
  { id: "housing", title: "Аварийное жильё", applicant: "Заявительница 01", role: "жительница района N", situation: "Я живу в доме, который признали аварийным ещё несколько лет назад. Дом должны были расселить, но решение постоянно откладывают. Прошу проверить мои жилищные права и помочь добиться безопасного жилья.", request: "Проверить, почему расселение не проводится, и принять меры для восстановления жилищных прав.", correct: "accept", outcome: "Жалоба принята: обстоятельства конкретны, есть указание на аварийный статус дома и длительное бездействие. Материал направляется на проверку.", background: "/manus-storage/complaint-housing-bg_9b956f3f.png", portrait: "/manus-storage/complaint-housing-portrait_88fe0823.png", documents: [{ label: "Решение комиссии", text: "Дом признан аварийным и подлежащим сносу. В выписке указана дата решения и состав комиссии." }, { label: "Ответ администрации", text: "В ответе говорится, что переселение запланировано, но конкретный срок предоставления жилья не указан." }, { label: "Сведения о доме", text: "Акт осмотра фиксирует неисправности конструкций, промерзание стен и жалобы жильцов на условия проживания." }], extra: { label: "План переселения", text: "Запрошенный план показывает, что срок переселения переносился дважды из-за отсутствия подготовленного жилого фонда." } },
  { id: "wage", title: "Задержка зарплаты", applicant: "Заявитель 02", role: "работник коммерческой организации", situation: "Мне не выплатили зарплату за несколько месяцев и не начислили компенсацию за задержку. Я обращался к руководству, но ответа не получил. Прошу проверить расчёты и добиться выплаты причитающихся сумм.", request: "Проверить задолженность, расчётные листки и соблюдение трудовых прав.", correct: "accept", outcome: "Жалоба принята: указан период, характер нарушения и требование о выплате. Материал направляется в трудовую проверку.", background: "/manus-storage/complaint-wage-bg_1214be84.png", portrait: "/manus-storage/complaint-wage-portrait_789f9519.png", documents: [{ label: "Расчётный листок", text: "За три расчётных периода начисления отражены, но фактическая выплата отсутствует. Сумма задолженности превышает 80 000 рублей." }, { label: "Табель", text: "В табеле отмечены полные смены. Данные совпадают с графиком, который работник приложил к обращению." }, { label: "Переписка", text: "На обращение к работодателю получен короткий ответ: «Выплата будет после закрытия месяца». Дата выплаты не указана." }], extra: { label: "Банковская выписка", text: "Выписка подтверждает отсутствие перечислений от работодателя за указанные расчётные периоды." } },
  { id: "medicine", title: "Лекарственное обеспечение", applicant: "Заявительница 03", role: "законный представитель ребёнка", situation: "Моему ребёнку с редким заболеванием назначили препарат, который должен выдаваться бесплатно. Из-за перебоя с обеспечением лечение прервалось. Прошу проверить причины и помочь восстановить терапию без новых перерывов.", request: "Запросить медицинские документы, проверить закупку и фактическую выдачу препарата.", correct: "accept", outcome: "Жалоба принята: речь идёт о проверяемом праве ребёнка на льготное лекарственное обеспечение. Материал требует срочной проверки.", background: "/manus-storage/complaint-medicine-bg_cdb5a400.png", portrait: "/manus-storage/complaint-medicine-portrait_cc7cff2f.png", documents: [{ label: "Назначение врача", text: "В выписке указана схема терапии и необходимость постоянного приёма препарата по медицинским показаниям." }, { label: "Рецепт", text: "Рецепт выписан, но отметки о выдаче препарата за последний период нет." }, { label: "Ответ аптеки", text: "Аптека сообщает об отсутствии препарата на складе и ожидаемой поставке без точной даты." }], extra: { label: "Журнал выдачи", text: "В журнале выдачи есть пробел между двумя датами: препарат не выдавался 18 дней подряд." } },
];

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "good" | "bad" }) {
  return <div className="stat"><span>{label}</span><strong className={`tone-${tone}`}>{value}</strong></div>;
}

function MusicPlayer({ trackIndex, isPlaying, isOpen, onToggleOpen, onTogglePlaying, onPrevious, onNext, onSelectTrack }: { trackIndex: number; isPlaying: boolean; isOpen: boolean; onToggleOpen: () => void; onTogglePlaying: () => void; onPrevious: () => void; onNext: () => void; onSelectTrack: (index: number) => void }) {
  const track = MUSIC_TRACKS[trackIndex];
  return <div className={`music-player ${isOpen ? "open" : ""}`}><button className="music-player-trigger" onClick={onToggleOpen} aria-label="Открыть музыкальный плеер"><Music2 size={17} /><span className={isPlaying ? "music-pulse" : ""} /></button>{isOpen && <div className="music-player-panel"><div className="music-player-heading"><span>СОВЕТСКОЕ РЕТРО · FM</span><b>МУЗЫКА</b></div><div className="music-now-playing"><small>СЕЙЧАС ИГРАЕТ</small><strong>{track.title}</strong></div><div className="music-controls"><button onClick={onPrevious} aria-label="Предыдущий трек"><SkipBack size={15} /></button><button className="music-play" onClick={onTogglePlaying} aria-label={isPlaying ? "Пауза" : "Воспроизвести"}>{isPlaying ? <Pause size={15} /> : <Play size={15} />}</button><button onClick={onNext} aria-label="Следующий трек"><SkipForward size={15} /></button></div><div className="music-track-list">{MUSIC_TRACKS.map((item, index) => <button key={item.title} className={index === trackIndex ? "active" : ""} onClick={() => { onSelectTrack(index); onToggleOpen(); }}>{String(index + 1).padStart(2, "0")} · {item.title}</button>)}</div></div>}</div>;
}

export default function Home() {
  const [onboardingStep, setOnboardingStep] = useState<"intro" | "region" | "character">("intro");
  const [region, setRegion] = useState<string | null>(null);
  const [regionQuery, setRegionQuery] = useState("");
  const [mapSvg, setMapSvg] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const [character, setCharacter] = useState<{ name: string; gender: "male" | "female" } | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftGender, setDraftGender] = useState<"male" | "female">("female");
  const [location, setLocation] = useState<LocationId | null>(null);
  const [caseIndex, setCaseIndex] = useState(0);
  const [complaintIndex, setComplaintIndex] = useState(0);
  const [complaintDecision, setComplaintDecision] = useState<"accept" | "reject" | null>(null);
  const [openComplaintDoc, setOpenComplaintDoc] = useState<number | null>(null);
  const [reviewedComplaintDocs, setReviewedComplaintDocs] = useState<number[]>([]);
  const [hoursLeft, setHoursLeft] = useState(8);
  const [extraRequested, setExtraRequested] = useState(false);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string; decision: Decision } | null>(null);
  const [finished, setFinished] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [musicTrack, setMusicTrack] = useState(0);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicOpen, setMusicOpen] = useState(false);
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [openMaterial, setOpenMaterial] = useState<number | null>(null);
  const [reviewedMaterials, setReviewedMaterials] = useState<number[]>([]);
  const current = CASES[caseIndex];
  const activeMaterials = location === "inspection" ? INSPECTION_POINTS[current.id] : current.materials;
  const progress = Math.min(caseIndex + (feedback ? 1 : 0), CASES.length);
  const rating = useMemo(() => score >= 4 ? "Смена принята" : score >= 2 ? "Нужна внимательность" : "Разбор полётов", [score]);
  const canDecide = reviewedMaterials.length === activeMaterials.length;

  const decide = (decision: Decision) => {
    if (feedback || finished || !canDecide) return;
    const good = decision === current.correct;
    setScore((value) => value + (good ? 1 : 0));
    setTrust((value) => Math.max(0, Math.min(5, value + (good ? 0 : -1))));
    setFeedback({ good, text: current.explanation, decision });
  };

  const next = () => {
    if (!feedback) return;
    if (caseIndex >= CASES.length - 1) setFinished(true);
    else { setCaseIndex((value) => value + 1); setFeedback(null); setOpenMaterial(null); setReviewedMaterials([]); }
  };

  const inspectMaterial = (index: number) => {
    setOpenMaterial(index);
    setReviewedMaterials((items) => items.includes(index) ? items : [...items, index]);
  };

  const restart = () => { setOnboardingStep("intro"); setRegion(null); setCharacter(null); setDraftName(""); setLocation(null); setCaseIndex(0); setScore(0); setTrust(3); setFeedback(null); setFinished(false); setOpenMaterial(null); setReviewedMaterials([]); setHoursLeft(8); setExtraRequested(false); };

  const createCharacter = () => {
    const name = draftName.trim();
    if (!name) return;
    setCharacter({ name, gender: draftGender });
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) await document.exitFullscreen?.();
    else await document.documentElement.requestFullscreen?.();
  };

  const chooseLocation = (nextLocation: LocationId) => {
    setLocation(nextLocation);
    setOpenMaterial(null);
    setReviewedMaterials([]);
    setComplaintIndex(0);
    setComplaintDecision(null);
    setHoursLeft(8);
    setExtraRequested(false);
  };

  const currentComplaint = COMPLAINTS[complaintIndex];
  const complaintDocuments = extraRequested ? [...currentComplaint.documents, currentComplaint.extra] : currentComplaint.documents;
  const decideComplaint = (decision: "accept" | "reject") => setComplaintDecision(decision);
  const nextComplaint = () => {
    if (complaintIndex >= COMPLAINTS.length - 1) setComplaintDecision("accept");
    else { setComplaintIndex((value) => value + 1); setComplaintDecision(null); setOpenComplaintDoc(null); setReviewedComplaintDocs([]); setExtraRequested(false); }
  };

  const requestExtraMaterial = () => {
    if (extraRequested || hoursLeft < 2 || complaintDecision) return;
    setHoursLeft((value) => value - 2);
    setExtraRequested(true);
  };

  const requestComplaintDocument = (index: number) => {
    setOpenComplaintDoc(index);
    setReviewedComplaintDocs((items) => items.includes(index) ? items : [...items, index]);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a") decide("dismiss");
      if (event.key.toLowerCase() === "d") decide("prosecute");
      if (event.key === "Enter" && feedback) next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, finished, current]);

  useEffect(() => {
    const click = () => {
      const sound = new Audio(UI_CLICK);
      sound.volume = 0.32;
      void sound.play().catch(() => undefined);
    };
    document.addEventListener("click", click, true);
    return () => document.removeEventListener("click", click, true);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    syncFullscreen();
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    const music = new Audio(MUSIC_TRACKS[musicTrack].src);
    music.loop = true;
    music.volume = 0.16;
    musicRef.current?.pause();
    musicRef.current = music;
    if (musicPlaying) void music.play().catch(() => undefined);
    return () => { music.pause(); music.currentTime = 0; };
  }, [musicTrack]);

  useEffect(() => {
    const music = musicRef.current;
    if (!music) return;
    if (musicPlaying) void music.play().catch(() => undefined);
    else music.pause();
  }, [musicPlaying]);

  const changeMusicTrack = (offset: number) => setMusicTrack((value) => (value + offset + MUSIC_TRACKS.length) % MUSIC_TRACKS.length);

  useEffect(() => {
    if (onboardingStep !== "region" || mapSvg) return;
    fetch(ADMIN_MAP_SVG).then((response) => response.text()).then((svg) => setMapSvg(svg.replace(/<\?xml[^>]*>/, ""))).catch(() => setMapSvg(""));
  }, [onboardingStep, mapSvg]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapSvg) return;
    let hoveredGroup: Element | null = null;
    const onMapClick = (event: MouseEvent) => {
      const target = (event.target as Element).closest("g[id]");
      const id = target?.getAttribute("id");
      if (!id || id === "Boundaries_of_federal_subjects") return;
      setRegion(regionNameBySvgId(id));
    };
    const onPointerOver = (event: PointerEvent) => {
      const target = event.target as Element;
      const group = target.closest("svg > g[id]");
      if (!group || group.closest(".new-region-territories")) return;
      if (hoveredGroup === group) return;
      hoveredGroup?.classList.remove("map-region-hovered");
      hoveredGroup = group;
      hoveredGroup.classList.add("map-region-hovered");
    };
    const onPointerOut = (event: PointerEvent) => {
      const target = event.target as Element;
      const group = target.closest("svg > g[id]");
      const related = event.relatedTarget as Element | null;
      if (!group || related?.closest?.("svg > g[id]") === group) return;
      group.classList.remove("map-region-hovered");
      if (hoveredGroup === group) hoveredGroup = null;
    };
    map.addEventListener("click", onMapClick);
    map.addEventListener("pointerover", onPointerOver);
    map.addEventListener("pointerout", onPointerOut);
    return () => {
      map.removeEventListener("click", onMapClick);
      map.removeEventListener("pointerover", onPointerOver);
      map.removeEventListener("pointerout", onPointerOut);
      hoveredGroup?.classList.remove("map-region-hovered");
    };
  }, [mapSvg]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapSvg) return;
    map.querySelectorAll("svg > g[id]").forEach((group) => {
      const id = group.getAttribute("id") ?? "";
      group.classList.toggle("map-region-selected", Boolean(region && normalizeSvgId(regionSvgId(region)) === normalizeSvgId(id)));
    });
  }, [mapSvg, region]);

  const musicPlayer = <MusicPlayer trackIndex={musicTrack} isPlaying={musicPlaying} isOpen={musicOpen} onToggleOpen={() => setMusicOpen((value) => !value)} onTogglePlaying={() => setMusicPlaying((value) => !value)} onPrevious={() => changeMusicTrack(-1)} onNext={() => changeMusicTrack(1)} onSelectTrack={setMusicTrack} />;

  if (onboardingStep === "intro") return (
    <main className="onboarding-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.95), rgba(7,18,20,.44)), url(${OFFICE_BG})` }}>
      {musicPlayer}<div className="grain" /><div className="onboarding-inner">
        <div className="location-kicker">ПЕРВОЕ НАЗНАЧЕНИЕ · СЕНТЯБРЬ 2026</div>
        <p className="academy-line">УРАЛЬСКИЙ ГОСУДАРСТВЕННЫЙ ЮРИДИЧЕСКИЙ УНИВЕРСИТЕТ · ВЫПУСК 2026</p>
        <h1>После университета —<br /><em>на службу.</em></h1>
        <p className="onboarding-copy">Вы только что окончили Уральский государственный юридический университет. Приказом прокурора вас направили работать помощником прокурора в один из районов субъекта Российской Федерации.</p>
        <p className="onboarding-copy">Впереди — незнакомая приёмная, первые материалы проверок и решения, за которыми стоят реальные люди. Сегодня теория останется в конспектах: на столе будут только факты, документы и ответственность.</p>
        <div className="assignment-line"><span>НАЗНАЧЕНИЕ</span><b>Помощник прокурора</b><small>ПРИЁМНАЯ № 07</small></div>
        <div className="intro-actions"><button className="primary-button onboarding-button" onClick={() => setOnboardingStep("region")}>Приступить к службе <ChevronRight size={17} /></button><button className="fullscreen-button" onClick={toggleFullscreen}>{isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}<span>{isFullscreen ? "Выйти из полного экрана" : "На весь экран"}</span></button></div>
        <div className="location-footer"><span>ДЕЛО НОВОГО СОТРУДНИКА · 01</span><span>ТОЧНОСТЬ · БЕСПРИСТРАСТНОСТЬ · ОТВЕТСТВЕННОСТЬ</span></div>
      </div>
    </main>
  );

  const filteredRegions = RF_SUBJECTS.filter((item) => item.toLowerCase().includes(regionQuery.trim().toLowerCase()));

  if (onboardingStep === "region") return (
    <main className="onboarding-screen wall-map-mode" style={{ backgroundImage: `linear-gradient(90deg, rgba(242,235,207,.98), rgba(224,211,174,.82)), url(${OFFICE_BG})` }}>
      {musicPlayer}<div className="grain" /><div className="onboarding-inner compact-onboarding">
        <div className="location-kicker">ПЕРВОЕ НАЗНАЧЕНИЕ · СУБЪЕКТ РФ · СТАТЬЯ 65</div><h1>Куда направит вас<br /><em>приказ?</em></h1>
        <p className="location-intro">Выберите один из {CONSTITUTION_SUBJECT_COUNT} субъектов Российской Федерации. Перед вами административная карта в духе советского настенного атласа; регион определит характер обращений и первые дела в папке.</p>
        <div className="region-workspace"><div className="map-column"><div ref={mapRef} className="russia-map real-map" aria-label="Интерактивная административная карта 89 субъектов России">{mapSvg ? <div className="admin-map-svg" dangerouslySetInnerHTML={{ __html: mapSvg }} /> : <div className="map-loading">Загрузка административной карты…</div>}{region && <div className="map-selection-readout"><span>ВЫБРАННЫЙ СУБЪЕКТ</span><b>{region}</b></div>}</div><section className="new-territories-panel" aria-label="Новые территории"><div className="new-territories-heading"><strong>НОВЫЕ ТЕРРИТОРИИ</strong><span>АДМИНИСТРАТИВНЫЕ КОНТУРЫ · 4 СУБЪЕКТА</span></div><div className="territory-tiles">{NEW_REGION_TERRITORIES.map((item) => <svg key={item.name} className="territory-tile" viewBox={`${item.labelX - 10} 18 20 72`} preserveAspectRatio="xMidYMid meet" aria-label={item.name}><g className={region === item.name ? "selected" : ""} role="button" tabIndex={0} aria-label={item.name} onClick={() => setRegion(item.name)} onKeyDown={(event) => event.key === "Enter" && setRegion(item.name)}><path d={item.d} /><text x={item.labelX} y={item.labelY}>{item.name.replace(" Народная Республика", " НР").replace("область", "обл.")}</text></g></svg>)}</div></section></div><div className="region-panel"><label className="region-search">ПОИСК СУБЪЕКТА<input value={regionQuery} onChange={(event) => setRegionQuery(event.target.value)} placeholder="Например, Татарстан" /></label><div className="region-list">{filteredRegions.map((item) => <button key={item} className={region === item ? "selected" : ""} onClick={() => setRegion(item)}><span>{item}</span>{region === item && <Check size={14} />}</button>)}{filteredRegions.length === 0 && <small>Субъект не найден</small>}</div></div></div>
        <div className="region-confirm"><span>{region ? `ВЫБРАНО: ${region}` : "Выберите субъект на карте или в списке"}</span><button className="primary-button" disabled={!region} onClick={() => setOnboardingStep("character")}>Подтвердить регион <ChevronRight size={17} /></button></div>
        <div className="location-footer"><span>НАЗНАЧЕНИЕ · ПОМОЩНИК ПРОКУРОРА</span><span>ШАГ 01 / 03</span></div>
      </div>
    </main>
  );

  if (!character) return (
    <main className="character-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.95), rgba(7,18,20,.44)), url(${OFFICE_BG})` }}>
      {musicPlayer}<div className="grain" />
      <div className="character-inner">
        <div className="location-kicker"><UserRound size={14} /> ЛИЧНОЕ ДЕЛО · СОЗДАНИЕ ПЕРСОНАЖА</div>
        <h1>Ваш первый день<br /><em>начинается здесь.</em></h1>
        <p className="location-intro">Заполните короткую анкету. Вы будете работать с материалами дел, принимать решения и отвечать за качество проверки.</p>
        <div className="character-card">
          <div className="assignment-context"><span>МЕСТО СЛУЖБЫ</span><b>{region}</b><small>ПОМOЩНИК ПРОКУРОРА · ЮРИСТ 3 КЛАССА</small></div>
          <label>ИМЯ ИГРОКА<input value={draftName} onChange={(event) => setDraftName(event.target.value)} onKeyDown={(event) => event.key === "Enter" && createCharacter()} placeholder="Например, Анна Орлова" autoFocus /></label>
          <div className="gender-field"><span>ПОЛ</span><div className="gender-options"><button className={draftGender === "female" ? "selected" : ""} onClick={() => setDraftGender("female")}><UserRound size={15} /> Женщина</button><button className={draftGender === "male" ? "selected" : ""} onClick={() => setDraftGender("male")}><UserRound size={15} /> Мужчина</button></div></div>
          <div className="rank-field"><BadgeCheck size={18} /><div><span>ЗВАНИЕ</span><b>Юрист 3 класса</b></div><small>НАЗНАЧЕНО</small></div>
          <button className="primary-button" disabled={!draftName.trim()} onClick={createCharacter}>Открыть личное дело <ChevronRight size={17} /></button>
        </div>
        <div className="location-footer"><span>ПРИЁМНАЯ № 07</span><span>КАНДИДАТ · НОВАЯ СМЕНА</span></div>
      </div>
    </main>
  );

  if (!location) return (
    <main className="location-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.94), rgba(7,18,20,.42)), url(${OFFICE_BG})` }}>
      {musicPlayer}<div className="grain" />
      <div className="location-inner">
        <div className="location-kicker"><span className="live-dot" /> НАЧАЛО РАБОЧЕГО ДНЯ · 09:00</div>
        <h1>Куда направимся<br /><em>сегодня?</em></h1>
        <p className="location-intro">Выберите маршрут работы. От этого зависят материалы, свидетели и решения, которые попадут на ваш стол.</p>
        <div className="location-cards">
          <button className="location-card" onClick={() => chooseLocation("reception")}><div className="location-icon"><MessageSquare size={22} /></div><div><span>МАРШРУТ 01</span><h2>Приёмная граждан</h2><p>Жалобы, заявления и документы. Сначала изучите папку, затем решите, есть ли основания для дела.</p><strong><Users size={14} /> 5 материалов · спокойный темп</strong></div><ChevronRight /></button>
          <button className="location-card" onClick={() => chooseLocation("inspection")}><div className="location-icon"><MapPin size={22} /></div><div><span>МАРШРУТ 02</span><h2>Городская проверка</h2><p>Выезд на объект. Осмотрите точки на месте, поговорите с людьми и соберите собственный акт.</p><strong><Camera size={14} /> 5 объектов · полевая работа</strong></div><ChevronRight /></button>
        </div>
        <div className="location-footer"><span>ПРИЁМНАЯ № 07</span><span>СМЕНА 17 · 17 СЕНТЯБРЯ 2026</span></div>
      </div>
    </main>
  );

  return (
    <main className="game-shell" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.94) 0%, rgba(7,18,20,.82) 33%, rgba(7,18,20,.25) 72%, rgba(7,18,20,.66) 100%), url(${OFFICE_BG})` }}>
      {musicPlayer}<div className="grain" />
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Scale size={18} /></div><div><p>ПРОКУРАТУРА</p><h1>Приёмная № 07</h1></div></div>
        <div className="profile-chip"><UserRound size={14} /><span>{character.name}</span><b>юрист 3 класса</b></div>
          <div className="shift"><span className="live-dot" /> {location === "inspection" ? "ГОРОДСКАЯ ПРОВЕРКА" : "ПРИЁМНАЯ ГРАЖДАН"} <b>•</b> 17 сентября 2026</div>
        <div className="seal">ДЕЛО<br /><span>В РАБОТЕ</span></div>
      </header>

      <section className="workspace">
        <aside className="briefing panel">
          <div className="eyebrow"><Stamp size={14} /> ОРИЕНТИР ДНЯ</div>
          <h2>Сначала факты.<br /><em>Потом вывод.</em></h2>
          <p>Проверьте материалы перед тем, как поставить печать. Решение нельзя отменить после отправки.</p>
          <div className="rule" />
          <div className="rule-row"><span>Дел в очереди</span><b>{CASES.length - Math.min(caseIndex, CASES.length - 1)}</b></div>
          <div className="rule-row"><span>Порог доверия</span><b>{trust} / 5</b></div>
          <div className="stamp-note">«Не торопись<br />с формулировкой»</div>
        </aside>

        {location === "reception" ? <section className="complaint-area" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.15), rgba(7,18,20,.62)), url(${currentComplaint.background})` }}>
          <div className="complaint-meta"><span>ПРИЁМНАЯ ГРАЖДАН · ОБРАЩЕНИЕ {String(complaintIndex + 1).padStart(2, "0")} / {COMPLAINTS.length}</span><span>ЛИЧНЫЙ ПРИЁМ · ОСТАЛОСЬ {hoursLeft} ЧАС.</span></div>
          <div className="complaint-layout"><div className="complaint-portrait"><img src={currentComplaint.portrait} alt="Обезличенный портрет заявителя" /><div><span>{currentComplaint.applicant}</span><b>{currentComplaint.role}</b></div></div><article className="complaint-card"><div className="eyebrow"><MessageSquare size={14} /> РАССКАЗ ЗАЯВИТЕЛЯ</div><h2>{currentComplaint.title}</h2><p className="complaint-speech">«{currentComplaint.situation}»</p><div className="complaint-request"><span>ПРОСЬБА</span><p>{currentComplaint.request}</p></div><div className="complaint-documents"><div className="evidence-label"><span>ЗАПРОСИТЬ ДОКУМЕНТЫ</span><small>ИЗУЧЕНО: {reviewedComplaintDocs.length}/{complaintDocuments.length}</small></div><div className="material-tabs">{complaintDocuments.map((document, index) => <button key={document.label} className={reviewedComplaintDocs.includes(index) ? "reviewed" : ""} onClick={() => requestComplaintDocument(index)}><FileText size={13} /> {document.label}{reviewedComplaintDocs.includes(index) && <Check size={12} />}</button>)}</div>{openComplaintDoc !== null && <div className="material-content"><span>{complaintDocuments[openComplaintDoc].label}</span><p>{complaintDocuments[openComplaintDoc].text}</p></div>}</div><button className="extra-request" disabled={extraRequested || hoursLeft < 2 || !!complaintDecision} onClick={requestExtraMaterial}><FileText size={14} /><span>{extraRequested ? "Дополнительный материал запрошен" : "Запросить дополнительный материал"}</span><small>{extraRequested ? "−2 часа смены" : "−2 часа · ответ из ведомства"}</small></button>{complaintDecision ? <div className={`complaint-result ${complaintDecision === currentComplaint.correct ? "good" : "bad"}`}><strong>{complaintDecision === currentComplaint.correct ? "РЕШЕНИЕ ОБОСНОВАНО" : "ТРЕБУЕТСЯ ВНИМАТЕЛЬНОСТЬ"}</strong><p>{currentComplaint.outcome}</p></div> : <div className="complaint-actions"><button className="complaint-action reject" disabled={reviewedComplaintDocs.length < complaintDocuments.length} onClick={() => decideComplaint("reject")}><X size={18} /><span><b>Отказать</b><small>{reviewedComplaintDocs.length < complaintDocuments.length ? "Сначала изучите документы" : "Недостаточно оснований"}</small></span></button><button className="complaint-action accept" disabled={reviewedComplaintDocs.length < complaintDocuments.length} onClick={() => decideComplaint("accept")}><Check size={18} /><span><b>Принять жалобу</b><small>{reviewedComplaintDocs.length < complaintDocuments.length ? "Сначала изучите документы" : "Направить на проверку"}</small></span></button></div>}{complaintDecision && <button className="next-button" onClick={nextComplaint}>{complaintIndex === COMPLAINTS.length - 1 ? "Завершить приём" : "Следующее обращение"} <ChevronRight size={17} /></button>}</article></div>
        </section> : <section className="case-area">
          <div className="case-meta"><span>МАТЕРИАЛ № {current?.number ?? "—"}</span><span>ДЕЛО {String(Math.min(caseIndex + 1, CASES.length)).padStart(2, "0")} / {CASES.length}</span></div>
          <div className="progress-track"><div style={{ width: `${(progress / CASES.length) * 100}%` }} /></div>
          {finished ? (
            <div className="finish-card paper-card">
              <div className="finish-icon"><Gavel size={28} /></div><span className="eyebrow">ИТОГ СМЕНЫ</span><h2>{rating}</h2>
              <p>Вы рассмотрели все материалы. Верных решений: <strong>{score} из {CASES.length}</strong>. Доверие канцелярии: <strong>{trust} / 5</strong>.</p>
              <button className="primary-button" onClick={restart}><RotateCcw size={16} /> Начать новую смену</button>
            </div>
          ) : (
            <>
              <article className="paper-card">
                <div className="paper-top"><div className="file-icon"><FileText size={18} /></div><div><span className="eyebrow">ПАПКА ДЕЛА</span><h2>{current.category}</h2></div><div className="paper-number">{current.number}</div></div>
                <div className="paper-rule" />
                <div className="identity-grid"><div><span>ФИО / ОРГАНИЗАЦИЯ</span><b>{current.person}</b></div><div><span>МЕСТО СОБЫТИЯ</span><b>{current.place}</b></div></div>
                <div className="summary"><span>КРАТКОЕ ИЗЛОЖЕНИЕ</span><p>{current.summary}</p></div>
                <div className="materials-box"><div className="evidence-label"><span>{location === "inspection" ? "ТОЧКИ ОСМОТРА" : "МАТЕРИАЛЫ ДЕЛА"}</span><small>ИЗУЧЕНО: {reviewedMaterials.length}/{activeMaterials.length}</small></div><div className="material-tabs">{activeMaterials.map((material, index) => <button key={material.label} className={reviewedMaterials.includes(index) ? "reviewed" : ""} onClick={() => inspectMaterial(index)}><FileText size={13} /> {material.label}{reviewedMaterials.includes(index) && <Check size={12} />}</button>)}</div>{openMaterial !== null && <div className="material-content"><span>{activeMaterials[openMaterial].label}</span><p>{activeMaterials[openMaterial].text}</p></div>}</div>
                <div className="evidence"><div className="evidence-label"><span>СВОДКА ПО МАТЕРИАЛАМ</span><small>ПРОВЕРЕНО</small></div><p>{current.evidence}</p></div>
                <div className="stage-note"><span>СТАДИЯ</span><b>{current.stage}</b></div>
                <div className={`paper-footer ${feedback ? (feedback.good ? "success" : "failure") : ""}`}>{feedback ? <><span>{feedback.good ? <Check size={15} /> : <X size={15} />} {feedback.good ? "РЕШЕНИЕ ОБОСНОВАНО" : "РЕШЕНИЕ ОШИБОЧНО"}</span><em>{feedback.text}</em></> : <span><span className="underline">Внимание:</span> решение принимается на основании только этих материалов.</span>}</div>
              </article>
              <div className="decision-row">
                {!feedback ? <><button className="decision dismiss" disabled={!canDecide} onClick={() => decide("dismiss")}><X size={19} /><span><b>Отказать</b><small>{canDecide ? "Недостаточно оснований" : "Изучите все материалы"}</small></span><kbd>A</kbd></button><button className="decision prosecute" disabled={!canDecide} onClick={() => decide("prosecute")}><Gavel size={19} /><span><b>Возбудить дело</b><small>{canDecide ? "Основания подтверждены" : "Изучите все материалы"}</small></span><kbd>D</kbd></button></> : <button className="next-button" onClick={next}>Следующее дело <ChevronRight size={18} /></button>}
              </div>
            </>
          )}
        </section>}
      </section>

      <footer className="footerbar"><div><b>УКАЗАНИЕ:</b> решение должно быть кратким, точным и проверяемым.</div><div className="footer-stats"><Stat label="ВЕРНЫЕ" value={`${score}/${CASES.length}`} tone={score > 0 ? "good" : "default"} /><Stat label="ДОВЕРИЕ" value={`${trust}/5`} tone={trust < 2 ? "bad" : "default"} /><Stat label="СТАТУС" value={finished ? "ЗАКРЫТО" : feedback ? "ПРОВЕРКА" : "ОЖИДАНИЕ"} /></div></footer>
    </main>
  );
}
