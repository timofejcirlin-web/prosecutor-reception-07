import { useEffect, useMemo, useRef, useState } from "react";
import { BadgeCheck, Camera, Check, ChevronRight, FileText, Gavel, MapPin, Maximize2, MessageSquare, Minimize2, RotateCcw, Scale, Stamp, UserRound, Users, X } from "lucide-react";

const OFFICE_BG = "/manus-storage/prosecutor-office-reference_7e58c04a.png";
const UI_CLICK = "/manus-storage/prosecutor-ui-click_a921f702.mp3";
const BACKGROUND_MUSIC = "/manus-storage/prosecutor-soviet-ambient_98bcbd3d.mp3";
const ADMIN_MAP_SVG = "/manus-storage/Ed887Ix3NN14_f7721d82.svg";
const RF_SUBJECTS = "Адыгея|Алтай|Башкортостан|Бурятия|Дагестан|Донецкая Народная Республика|Ингушетия|Кабардино-Балкария|Калмыкия|Карачаево-Черкесия|Карелия|Коми|Крым|Луганская Народная Республика|Марий Эл|Мордовия|Саха (Якутия)|Северная Осетия — Алания|Татарстан|Тыва|Удмуртия|Хакасия|Чечня|Чувашия|Алтайский край|Забайкальский край|Камчатский край|Краснодарский край|Красноярский край|Пермский край|Приморский край|Ставропольский край|Хабаровский край|Амурская область|Архангельская область|Астраханская область|Белгородская область|Брянская область|Владимирская область|Волгоградская область|Вологодская область|Воронежская область|Запорожская область|Ивановская область|Иркутская область|Калининградская область|Калужская область|Кемеровская область — Кузбасс|Кировская область|Костромская область|Курганская область|Курская область|Ленинградская область|Липецкая область|Магаданская область|Московская область|Мурманская область|Нижегородская область|Новгородская область|Новосибирская область|Омская область|Оренбургская область|Орловская область|Пензенская область|Псковская область|Ростовская область|Рязанская область|Самарская область|Саратовская область|Сахалинская область|Свердловская область|Смоленская область|Тамбовская область|Тверская область|Томская область|Тульская область|Тюменская область|Ульяновская область|Херсонская область|Челябинская область|Ярославская область|Москва|Санкт-Петербург|Севастополь|Еврейская автономная область|Ненецкий автономный округ|Ханты-Мансийский автономный округ — Югра|Чукотский автономный округ|Ямало-Ненецкий автономный округ".split("|");
const MAP_MARKERS = [{ name: "Калининградская область", left: 8, top: 38 }, { name: "Санкт-Петербург", left: 19, top: 28 }, { name: "Москва", left: 31, top: 45 }, { name: "Свердловская область", left: 59, top: 42 }, { name: "Новосибирская область", left: 70, top: 56 }, { name: "Красноярский край", left: 77, top: 47 }, { name: "Иркутская область", left: 82, top: 61 }, { name: "Республика Саха (Якутия)", left: 82, top: 25 }, { name: "Приморский край", left: 94, top: 60 }, { name: "Хабаровский край", left: 91, top: 48 }, { name: "Камчатский край", left: 99, top: 27 }, { name: "Краснодарский край", left: 29, top: 69 }, { name: "Республика Татарстан", left: 46, top: 53 }, { name: "Мурманская область", left: 24, top: 10 }];
const SPECIAL_MAP_REGIONS = [{ name: "Донецкая Народная Республика", left: 24, top: 68 }, { name: "Луганская Народная Республика", left: 29, top: 63 }, { name: "Запорожская область", left: 34, top: 72 }, { name: "Херсонская область", left: 38, top: 78 }];
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
    const music = new Audio(BACKGROUND_MUSIC);
    music.loop = true;
    music.volume = 0.16;
    const startMusic = () => {
      void music.play().catch(() => undefined);
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
    };
    window.addEventListener("pointerdown", startMusic, { once: true });
    window.addEventListener("keydown", startMusic, { once: true });
    return () => {
      window.removeEventListener("pointerdown", startMusic);
      window.removeEventListener("keydown", startMusic);
      music.pause();
      music.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (onboardingStep !== "region" || mapSvg) return;
    fetch(ADMIN_MAP_SVG).then((response) => response.text()).then((svg) => setMapSvg(svg.replace(/<\?xml[^>]*>/, ""))).catch(() => setMapSvg(""));
  }, [onboardingStep, mapSvg]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapSvg) return;
    const onMapClick = (event: MouseEvent) => {
      const target = (event.target as Element).closest("g[id]");
      const id = target?.getAttribute("id");
      if (!id || id === "Boundaries_of_federal_subjects") return;
      setRegion(regionNameBySvgId(id));
    };
    map.addEventListener("click", onMapClick);
    return () => map.removeEventListener("click", onMapClick);
  }, [mapSvg]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapSvg) return;
    map.querySelectorAll("svg > g[id]").forEach((group) => {
      const id = group.getAttribute("id") ?? "";
      group.classList.toggle("map-region-selected", Boolean(region && normalizeSvgId(regionSvgId(region)) === normalizeSvgId(id)));
    });
  }, [mapSvg, region]);

  if (onboardingStep === "intro") return (
    <main className="onboarding-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.95), rgba(7,18,20,.44)), url(${OFFICE_BG})` }}>
      <div className="grain" /><div className="onboarding-inner">
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
    <main className="onboarding-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.95), rgba(7,18,20,.44)), url(${OFFICE_BG})` }}>
      <div className="grain" /><div className="onboarding-inner compact-onboarding">
        <div className="location-kicker">ПЕРВОЕ НАЗНАЧЕНИЕ · СУБЪЕКТ РФ</div><h1>Куда направит вас<br /><em>приказ?</em></h1>
        <p className="location-intro">Выберите любой субъект Российской Федерации. Регион определит характер обращений, ведомства и первые дела в вашей папке.</p>
        <div className="region-workspace"><div ref={mapRef} className="russia-map real-map" aria-label="Интерактивная административная карта субъектов России">{mapSvg ? <div className="admin-map-svg" dangerouslySetInnerHTML={{ __html: mapSvg }} /> : <div className="map-loading">Загрузка административной карты…</div>}<div className="special-region-layer">{SPECIAL_MAP_REGIONS.map((item) => <button key={item.name} className={`special-region-chip ${region === item.name ? "selected" : ""}`} style={{ left: `${item.left}%`, top: `${item.top}%` }} onClick={() => setRegion(item.name)}><i />{item.name.replace(" Народная Республика", "")}</button>)}</div>{region && <div className="map-selection-readout"><span>ВЫБРАННЫЙ СУБЪЕКТ</span><b>{region}</b></div>}</div><div className="region-panel"><label className="region-search">ПОИСК СУБЪЕКТА<input value={regionQuery} onChange={(event) => setRegionQuery(event.target.value)} placeholder="Например, Татарстан" /></label><div className="region-list">{filteredRegions.slice(0, 18).map((item) => <button key={item} className={region === item ? "selected" : ""} onClick={() => setRegion(item)}><span>{item}</span>{region === item && <Check size={14} />}</button>)}{filteredRegions.length > 18 && <small>Показаны первые 18 результатов · уточните поиск</small>}</div></div></div>
        <div className="region-confirm"><span>{region ? `ВЫБРАНО: ${region}` : "Выберите субъект на карте или в списке"}</span><button className="primary-button" disabled={!region} onClick={() => setOnboardingStep("character")}>Подтвердить регион <ChevronRight size={17} /></button></div>
        <div className="location-footer"><span>НАЗНАЧЕНИЕ · ПОМОЩНИК ПРОКУРОРА</span><span>ШАГ 01 / 03</span></div>
      </div>
    </main>
  );

  if (!character) return (
    <main className="character-screen" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.95), rgba(7,18,20,.44)), url(${OFFICE_BG})` }}>
      <div className="grain" />
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
      <div className="grain" />
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
      <div className="grain" />
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
