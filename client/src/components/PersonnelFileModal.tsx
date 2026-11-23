import { useEffect, useState } from "react";
import { Archive, Award, BookOpen, Briefcase, CalendarDays, ChartLine, FileText, History, ShieldAlert, ShieldCheck, UserRound, X } from "lucide-react";
import { PERSONNEL_PORTRAIT } from "../assets/personnelPortrait";

type PersonnelEvent = { title: string; text: string; tone: "good" | "warn" };
type ArchiveEntry = {
  id: string;
  number: string;
  kind: "service" | "case" | "award" | "discipline" | "daily";
  documentType: string;
  title: string;
  body: string;
  day: number;
  createdAt: string;
};
type ArchiveFilter = "all" | ArchiveEntry["kind"];
type Reputation = { quality: number; leadership: number; citizens: number; risk: number };
type Props = {
  open: boolean;
  onClose: () => void;
  archiveEntries: ArchiveEntry[];
  name: string;
  office: string;
  region: string;
  rank: string;
  dayNumber: number;
  correctDecisions: number;
  wrongDecisions: number;
  registeredCases: number;
  trust: number;
  reputation: Reputation;
  reputationLabel: string;
  rewardCounts: Record<string, number>;
  disciplineCounts: Record<string, number>;
  events: PersonnelEvent[];
  serviceEnded: boolean;
};

type Tab = "overview" | "service" | "timeline" | "archive" | "awards" | "discipline" | "attestation";

const tabs: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: "overview", label: "Сведения", icon: UserRound },
  { id: "service", label: "Служба", icon: Briefcase },
  { id: "timeline", label: "Хронология", icon: History },
  { id: "archive", label: "Архив", icon: Archive },
  { id: "awards", label: "Поощрения", icon: Award },
  { id: "discipline", label: "Взыскания", icon: ShieldAlert },
  { id: "attestation", label: "Аттестация", icon: ChartLine },
];

const countLabel = (value: number) => new Intl.NumberFormat("ru-RU").format(value);

export function PersonnelFileModal(props: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const [archiveFilter, setArchiveFilter] = useState<ArchiveFilter>("all");
  const [openedDocumentId, setOpenedDocumentId] = useState<string | null>(null);
  useEffect(() => {
    if (!props.open) return;
    setTab("overview");
    setOpenedDocumentId(null);
    setArchiveFilter("all");
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") props.onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [props.open]);

  if (!props.open) return null;

  const awards = Object.entries(props.rewardCounts).filter(([, count]) => count > 0);
  const sanctions = Object.entries(props.disciplineCounts).filter(([, count]) => count > 0);
  const completed = props.correctDecisions + props.wrongDecisions;
  const sortedArchive = [...props.archiveEntries].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const chronologicalEntries = [...props.archiveEntries].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const filteredArchive = sortedArchive.filter((entry) => archiveFilter === "all" || entry.kind === archiveFilter);
  const openedDocument = props.archiveEntries.find((entry) => entry.id === openedDocumentId) ?? null;
  const archiveKindLabels: Record<ArchiveEntry["kind"], string> = {
    service: "Кадровые документы",
    case: "Служебные записи",
    award: "Поощрения",
    discipline: "Дисциплинарные документы",
    daily: "Сводки дней",
  };
  const formatArchiveDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Дата не указана";
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  };
  const formatArchiveTime = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "" : date.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  };
  const accuracy = completed ? Math.round((props.correctDecisions / completed) * 100) : 0;
  const status = props.serviceEnded ? "СЛУЖБА ПРЕКРАЩЕНА" : "ПРОХОЖДЕНИЕ СЛУЖБЫ";
  const facts = [
    ["Должность", "Помощник прокурора"],
    ["Субъект Российской Федерации", props.region || "Не указан"],
    ["Текущий день службы", String(props.dayNumber)],
  ];

  return (
    <div className="personnel-file-overlay" onMouseDown={(event) => event.target === event.currentTarget && props.onClose()}>
      <section className="personnel-file-window" role="dialog" aria-modal="true" aria-labelledby="personnel-file-title">


        <div className="personnel-file-paper">
          <header className="personnel-file-header">
            <div>
              <span className="personnel-file-kicker">КАДРОВОЕ ПРОИЗВОДСТВО · АРХИВ № 07</span>
              <h2 id="personnel-file-title">Личное дело сотрудника</h2>
              <p>Сведения о прохождении службы и результатах работы</p>
              <div className="personnel-file-header-meta"><span>ЭКЗЕМПЛЯР № 01</span><span>ВЕДЁТСЯ В ЭЛЕКТРОННОМ АРХИВЕ</span></div>
            </div>
            <div className="personnel-file-header-seal" aria-hidden="true"><span>КАДРОВАЯ</span><b>СЛУЖБА</b><i>·</i></div>
            <button type="button" className="personnel-file-close" onClick={props.onClose} aria-label="Закрыть личное дело"><X size={19} /></button>
          </header>

          <nav className="personnel-file-tabs" aria-label="Разделы личного дела">
            {tabs.map((item) => {
              const Icon = item.icon;
              return <button type="button" key={item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>
                <Icon size={15} /><span>{item.label}</span>
              </button>;
            })}
          </nav>

          <div className="personnel-file-content" key={tab}>
            {tab === "overview" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ I · ПЕРСОНАЛЬНЫЕ ДАННЫЕ</span><b>ЛИСТ 01</b></div>
              <div className="personnel-file-intro">
                <div className="personnel-file-avatar"><img src={PERSONNEL_PORTRAIT} alt="" /></div>
                <div>
                  <span className="personnel-file-muted">ЛИЧНОСТЬ СОТРУДНИКА</span>
                  <h3>{props.name || "Имя не указано"}</h3>
                  <p>{props.rank} · {props.office}</p>
                  <span className={props.serviceEnded ? "personnel-file-status ended" : "personnel-file-status"}><i />{status}</span>
                </div>
              </div>
              <div className="personnel-file-facts">
                {facts.map(([label, value]) => <div className="personnel-file-fact" key={label}><span>{label}</span><strong>{value}</strong></div>)}
              </div>
              <div className="personnel-file-note">
                <ShieldCheck size={18} />
                <p>Личное дело формируется автоматически по мере прохождения игры. Здесь отражаются только сведения, содержащиеся в текущем игровом сохранении.</p>
              </div>
            </>}

            {tab === "service" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ II · ПРОХОЖДЕНИЕ СЛУЖБЫ</span><b>ЛИСТ 02</b></div>
              <h3 className="personnel-file-section-title">Служебная деятельность</h3>
              <p className="personnel-file-section-copy">Учётные показатели на текущий игровой день. Значения обновляются по мере принятия решений.</p>
              <div className="personnel-file-kpis">
                <div><span>ДЕНЬ СЛУЖБЫ</span><strong>{countLabel(props.dayNumber)}</strong></div>
                <div><span>РЕШЕНИЯ</span><strong>{countLabel(completed)}</strong></div>
                <div><span>ЗАПИСИ В ЖУРНАЛЕ</span><strong>{countLabel(props.registeredCases)}</strong></div>
                <div><span>ДОВЕРИЕ</span><strong>{props.trust}/5</strong></div>
              </div>
              <div className="personnel-file-decision-bars">
                <div><span>Обоснованные решения</span><b>{props.correctDecisions}</b></div>
                <i><b className="good" style={{ width: completed ? `${props.correctDecisions / completed * 100}%` : "0%" }} /></i>
                <div><span>Ошибочные решения</span><b>{props.wrongDecisions}</b></div>
                <i><b className="warn" style={{ width: completed ? `${props.wrongDecisions / completed * 100}%` : "0%" }} /></i>
              </div>
              <div className="personnel-file-records">
                <div className="personnel-file-record"><CalendarDays size={17} /><div><b>Текущий игровой день</b><span>День {props.dayNumber} · {props.office}</span></div></div>
                {props.events.length ? props.events.slice(-5).reverse().map((event, index) => <div className="personnel-file-record" key={`${event.title}-${index}`}><FileText size={17} /><div><b>{event.title}</b><span>{event.text}</span></div><em className={event.tone}>{event.tone === "good" ? "РЕЗУЛЬТАТ" : "ОТМЕТКА"}</em></div>) : <p className="personnel-file-empty">Записи о событиях текущей смены появятся здесь по мере прохождения игры.</p>}
              </div>
            </>}

            {tab === "timeline" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ III · ХРОНОЛОГИЯ СЛУЖБЫ</span><b>ЛИСТ 03</b></div>
              <h3 className="personnel-file-section-title">История прохождения службы</h3>
              <p className="personnel-file-section-copy">Последовательность событий, автоматически зафиксированных в игровом сохранении. События показаны в обратном хронологическом порядке.</p>
              <div className="personnel-file-timeline-summary">
                <div><strong>{countLabel(props.archiveEntries.length)}</strong><span>ЗАПИСЕЙ В ХРОНОЛОГИИ</span></div>
                <div><strong>{countLabel(props.archiveEntries.filter((entry, index, list) => list.findIndex((candidate) => candidate.day === entry.day) === index).length)}</strong><span>ДНЕЙ С ЗАПИСЯМИ</span></div>
              </div>
              {sortedArchive.length ? <div className="personnel-file-timeline">
                {sortedArchive.map((entry) => <button type="button" className={`personnel-file-timeline-entry ${entry.kind}`} key={entry.id} onClick={() => { setOpenedDocumentId(entry.id); setTab("archive"); }}>
                  <span className="personnel-file-timeline-dot" />
                  <span className="personnel-file-timeline-date">ДЕНЬ {String(entry.day).padStart(2, "0")} · {formatArchiveDate(entry.createdAt)}</span>
                  <strong>{entry.title}</strong>
                  <span className="personnel-file-timeline-kind">{archiveKindLabels[entry.kind]} · {entry.number}</span>
                </button>)}
              </div> : <div className="personnel-file-empty large"><History size={25}/><strong>Хронология пока пуста</strong><span>Первая запись о начале службы появится после создания игрового профиля.</span></div>}
            </>}

            {tab === "archive" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ IV · АРХИВ ДОКУМЕНТОВ</span><b>ЛИСТ 04</b></div>
              {openedDocument ? <>
                <button type="button" className="personnel-file-back" onClick={() => setOpenedDocumentId(null)}>← Вернуться к архиву</button>
                <article className="personnel-file-document">
                  <div className="personnel-file-document-top"><span>ПРОКУРАТУРА · КАДРОВОЕ ПРОИЗВОДСТВО</span><span>ЭЛЕКТРОННЫЙ ЭКЗЕМПЛЯР</span></div>
                  <div className="personnel-file-document-rule"/>
                  <p className="personnel-file-document-type">{openedDocument.documentType}</p>
                  <h3>{openedDocument.title}</h3>
                  <div className="personnel-file-document-meta"><span>Регистрационный номер</span><b>{openedDocument.number}</b></div>
                  <div className="personnel-file-document-meta"><span>Дата формирования</span><b>{formatArchiveDate(openedDocument.createdAt)} · {formatArchiveTime(openedDocument.createdAt)}</b></div>
                  <div className="personnel-file-document-meta"><span>Игровой день</span><b>№ {openedDocument.day}</b></div>
                  <div className="personnel-file-document-body">{openedDocument.body}</div>
                  <div className="personnel-file-document-sign"><span>Сформировано игровой системой</span><b>ЛИЧНОЕ ДЕЛО · № 07</b></div>
                  <div className="personnel-file-document-stamp"><span>АРХИВНАЯ</span><b>ЗАПИСЬ</b><i>·</i></div>
                  <p className="personnel-file-document-footnote">Игровой документ. Не является официальным актом прокуратуры Российской Федерации.</p>
                </article>
              </> : <>
                <h3 className="personnel-file-section-title">Документы личного дела</h3>
                <p className="personnel-file-section-copy">Каждая запись формируется на основании действий в игре и сохраняется вместе с игровым прогрессом.</p>
                <div className="personnel-file-archive-summary"><Archive size={19}/><strong>{countLabel(props.archiveEntries.length)}</strong><span>ДОКУМЕНТОВ В АРХИВЕ</span></div>
                <div className="personnel-file-archive-filters">
                  {([
                    ["all", "Все"],
                    ["service", "Кадровые"],
                    ["case", "Служебные"],
                    ["award", "Поощрения"],
                    ["discipline", "Взыскания"],
                    ["daily", "Сводки"],
                  ] as [ArchiveFilter, string][]).map(([value, label]) => <button type="button" key={value} className={archiveFilter === value ? "active" : ""} onClick={() => setArchiveFilter(value)}>{label}</button>)}
                </div>
                {filteredArchive.length ? <div className="personnel-file-archive-list">
                  {filteredArchive.map((entry) => <button type="button" className={`personnel-file-archive-item ${entry.kind}`} key={entry.id} onClick={() => setOpenedDocumentId(entry.id)}>
                    <span className="personnel-file-archive-icon">{entry.kind === "award" ? <Award size={17}/> : entry.kind === "discipline" ? <ShieldAlert size={17}/> : entry.kind === "daily" ? <CalendarDays size={17}/> : entry.kind === "service" ? <Briefcase size={17}/> : <FileText size={17}/>}</span>
                    <span className="personnel-file-archive-main"><b>{entry.title}</b><small>{entry.documentType} · День {entry.day}</small></span>
                    <span className="personnel-file-archive-number">{entry.number}<small>{formatArchiveDate(entry.createdAt)}</small></span>
                  </button>)}
                </div> : <div className="personnel-file-empty large"><Archive size={25}/><strong>Документы не найдены</strong><span>{props.archiveEntries.length ? "Для выбранной категории записей пока нет." : "Документы будут добавляться сюда по мере прохождения игры."}</span></div>}
              </>}
            </>}

            {tab === "awards" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ V · ПООЩРЕНИЯ</span><b>ЛИСТ 05</b></div>
              <h3 className="personnel-file-section-title">Поощрения и награды</h3>
              <p className="personnel-file-section-copy">Отмечены виды поощрений, фактически начисленные в ходе игры.</p>
              <div className="personnel-file-award-total"><Award size={23} /><div><strong>{awards.reduce((sum, [, count]) => sum + count, 0)}</strong><span>НАЧИСЛЕННЫХ ПООЩРЕНИЙ</span></div></div>
              {awards.length ? <div className="personnel-file-list">{awards.map(([name, count]) => <div key={name}><Award size={16} /><span>{name}</span><b>× {count}</b></div>)}</div> : <div className="personnel-file-empty large"><Award size={25} /><strong>Пока нет начисленных поощрений</strong><span>Полученные благодарности, грамоты и премии появятся в этом разделе.</span></div>}
            </>}

            {tab === "discipline" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ VI · ДИСЦИПЛИНА</span><b>ЛИСТ 06</b></div>
              <h3 className="personnel-file-section-title">Дисциплинарная история</h3>
              <p className="personnel-file-section-copy">Учитываются только взыскания, записанные игровой системой.</p>
              <div className="personnel-file-award-total discipline"><ShieldAlert size={23} /><div><strong>{sanctions.reduce((sum, [, count]) => sum + count, 0)}</strong><span>ЗАРЕГИСТРИРОВАННЫХ ВЗЫСКАНИЙ</span></div></div>
              {sanctions.length ? <div className="personnel-file-list">{sanctions.map(([name, count]) => <div key={name}><ShieldAlert size={16} /><span>{name}</span><b>× {count}</b></div>)}</div> : <div className="personnel-file-empty large"><ShieldCheck size={25} /><strong>Взысканий не зарегистрировано</strong><span>При наличии дисциплинарного события его вид и количество отобразятся в этом разделе.</span></div>}
            </>}

            {tab === "attestation" && <>
              <div className="personnel-file-page-heading"><span>РАЗДЕЛ VII · АТТЕСТАЦИЯ</span><b>ЛИСТ 07</b></div>
              <h3 className="personnel-file-section-title">Показатели и служебная оценка</h3>
              <div className="personnel-file-attestation-status"><span>ТЕКУЩАЯ ОЦЕНКА</span><strong>{props.reputationLabel}</strong><small>Автоматическая оценка по показателям текущего сохранения</small></div>
              <div className="personnel-file-rating-list">
                {[
                  ["Качество надзора", props.reputation.quality],
                  ["Управленческая устойчивость", props.reputation.leadership],
                  ["Доверие жителей", props.reputation.citizens],
                  ["Дисциплинарный риск", props.reputation.risk],
                ].map(([label, value]) => <div key={String(label)}><span>{label}</span><b>{value}/5</b><i><em className={label === "Дисциплинарный риск" ? "risk" : ""} style={{ width: `${Number(value) / 5 * 100}%` }} /></i></div>)}
              </div>
              <div className="personnel-file-note"><BookOpen size={18} /><p>Аттестационный раздел носит информационный характер. Он не заменяет отдельное решение руководителя и не присваивает сотруднику новую должность или классный чин.</p></div>
            </>}
          </div>

          <footer className="personnel-file-footer">
            <span>ПРОКУРАТУРА · СЛУЖЕБНОЕ ДЕЛО № 07</span>
            <span>ЛИСТ {tabs.findIndex((item) => item.id === tab) + 1} / 07</span>
            <button type="button" onClick={props.onClose}>Закрыть дело</button>
          </footer>
        </div>
      </section>
    </div>
  );
}
