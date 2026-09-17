import { useEffect, useMemo, useState } from "react";
import { Check, ChevronRight, FileText, Gavel, RotateCcw, Scale, Stamp, X } from "lucide-react";

const OFFICE_BG = "/manus-storage/prosecutor-office-reference_7e58c04a.png";

type Decision = "prosecute" | "dismiss";
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
  sourceName: string;
  sourceDate: string;
  sourceUrl: string;
  stage: string;
};

const CASES: CaseFile[] = [
  { id: "01", number: "КЛГ-07/24", category: "Мошенничество при капремонте", person: "Директор строительной компании (имя не раскрыто)", place: "г. Калуга, ул. Чичерина", summary: "При ремонте кровли в документах указали более дорогие материалы, чем использовали фактически.", evidence: "Прокуратура сообщила о расхождении материалов и ущербе муниципальному бюджету свыше 1,5 млн рублей. По материалам проверки возбуждено дело по ч. 4 ст. 159 УК РФ.", correct: "prosecute", explanation: "Есть акт прокурорской проверки, конкретное расхождение материалов и оценённый ущерб. Материал принимается в работу; виновность устанавливает суд.", sourceName: "Прокуратура Калужской области", sourceDate: "02.07.2024", stage: "Уголовное дело возбуждено, расследование на контроле" , sourceUrl: "https://epp.genproc.gov.ru/ru/proc_40/mass-media/news/?item=96037194" },
  { id: "02", number: "СМЛ-05/26", category: "Незаконная рубка леса", person: "Двое жителей Смоленской области (имена не раскрыты)", place: "Вяземский район, территория лесничества", summary: "В марте 2024 года были вырублены 300 деревьев: сосна, ель и берёза.", evidence: "В официальном сообщении указан ущерб свыше 29 млн рублей. Судебное рассмотрение завершилось приговором и гражданским иском о взыскании ущерба.", correct: "prosecute", explanation: "В игровом моменте материал принимается в работу по тяжёлому составу; публикация прокуратуры уже сообщает о вынесенном приговоре.", sourceName: "Прокуратура Смоленской области", sourceDate: "19.05.2026", stage: "Есть приговор: 3 года лишения свободы и 2,5 года принудительных работ", sourceUrl: "https://epp.genproc.gov.ru/ru/gprf/mass-media/news/regional/e8502657/" },
  { id: "03", number: "ЧР-09/23", category: "Мошенничество при получении выплат", person: "Местная жительница (имя не раскрыто)", place: "Ачхой-Мартановский район, Чеченская Республика", summary: "По версии следствия, для получения маткапитала были представлены ложные документы о рождении ребёнка.", evidence: "СК сообщил о сертификате на 453 тыс. рублей, возмещении ущерба и направлении дела в суд после утверждения обвинительного заключения.", correct: "prosecute", explanation: "Есть достаточная доказательственная база по версии следствия и дело направлено в суд. В карточке сохраняется презумпция невиновности.", sourceName: "СУ СК России по Чеченской Республике", sourceDate: "06.09.2023", stage: "Расследование завершено, дело направлено в суд", sourceUrl: "https://chr.sledcom.ru/news/item/1830007" },
  { id: "04", number: "КОС-02/23", category: "Покушение на дачу взятки", person: "44-летний житель Костромы (имя не раскрыто)", place: "г. Кострома, Костромская область", summary: "После остановки ДПС мужчина пытался передать 60 тыс. рублей за несоставление документов.", evidence: "Прокуратура сообщила о пресечении передачи денег, признании вины в суде и вступившем в силу приговоре.", correct: "prosecute", explanation: "Сумма, обстоятельства передачи и итоговый судебный акт подтверждены официальной публикацией. Материал принимается в работу.", sourceName: "Прокуратура Костромской области", sourceDate: "10.02.2023", stage: "Приговор вступил в законную силу", sourceUrl: "https://epp.genproc.gov.ru/web/proc_44/mass-media/news?item=85238680" },
  { id: "05", number: "ТЮМ-02/25", category: "Трудовые права и оплата", person: "Трое работников агрокомплекса (имена не раскрыты)", place: "Казанский район, Тюменская область", summary: "Сторожам в течение более трёх лет оплачивали 12 часов из 24-часовой смены.", evidence: "Прокуратура обратилась в суд; работникам присудили выплаты общей суммой 635 тыс. рублей, директор привлечён к административной ответственности.", correct: "dismiss", explanation: "Основания для прокурорского вмешательства есть, но это трудовой и административный материал, а не основание для возбуждения уголовного дела в рамках этой смены.", sourceName: "Прокуратура Тюменской области", sourceDate: "12.02.2025", stage: "Требования прокуратуры удовлетворены, выплаты произведены", sourceUrl: "https://epp.genproc.gov.ru/ru/gprf/mass-media/news/main/e5612955/" },
];

function Stat({ label, value, tone = "default" }: { label: string; value: string | number; tone?: "default" | "good" | "bad" }) {
  return <div className="stat"><span>{label}</span><strong className={`tone-${tone}`}>{value}</strong></div>;
}

export default function Home() {
  const [caseIndex, setCaseIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [trust, setTrust] = useState(3);
  const [feedback, setFeedback] = useState<{ good: boolean; text: string; decision: Decision } | null>(null);
  const [finished, setFinished] = useState(false);
  const current = CASES[caseIndex];
  const progress = Math.min(caseIndex + (feedback ? 1 : 0), CASES.length);
  const rating = useMemo(() => score >= 4 ? "Смена принята" : score >= 2 ? "Нужна внимательность" : "Разбор полётов", [score]);

  const decide = (decision: Decision) => {
    if (feedback || finished) return;
    const good = decision === current.correct;
    setScore((value) => value + (good ? 1 : 0));
    setTrust((value) => Math.max(0, Math.min(5, value + (good ? 0 : -1))));
    setFeedback({ good, text: current.explanation, decision });
  };

  const next = () => {
    if (!feedback) return;
    if (caseIndex >= CASES.length - 1) setFinished(true);
    else { setCaseIndex((value) => value + 1); setFeedback(null); }
  };

  const restart = () => { setCaseIndex(0); setScore(0); setTrust(3); setFeedback(null); setFinished(false); };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "a") decide("dismiss");
      if (event.key.toLowerCase() === "d") decide("prosecute");
      if (event.key === "Enter" && feedback) next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [feedback, finished, current]);

  return (
    <main className="game-shell" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,18,20,.94) 0%, rgba(7,18,20,.82) 33%, rgba(7,18,20,.25) 72%, rgba(7,18,20,.66) 100%), url(${OFFICE_BG})` }}>
      <div className="grain" />
      <header className="topbar">
        <div className="brand"><div className="brand-mark"><Scale size={18} /></div><div><p>ПРОКУРАТУРА</p><h1>Приёмная № 07</h1></div></div>
        <div className="shift"><span className="live-dot" /> СМЕНА 09:00 — 18:00 <b>•</b> 17 сентября 2026</div>
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

        <section className="case-area">
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
                <div className="evidence"><div className="evidence-label"><span>КЛЮЧЕВЫЕ МАТЕРИАЛЫ</span><small>ИСТОЧНИК: {current.sourceDate}</small></div><p>{current.evidence}</p><div className="source-line"><span>{current.sourceName}</span><a href={current.sourceUrl} target="_blank" rel="noreferrer">Открыть публикацию ↗</a></div></div>
                <div className="stage-note"><span>СТАДИЯ</span><b>{current.stage}</b></div>
                <div className={`paper-footer ${feedback ? (feedback.good ? "success" : "failure") : ""}`}>{feedback ? <><span>{feedback.good ? <Check size={15} /> : <X size={15} />} {feedback.good ? "РЕШЕНИЕ ОБОСНОВАНО" : "РЕШЕНИЕ ОШИБОЧНО"}</span><em>{feedback.text}</em></> : <span><span className="underline">Внимание:</span> решение принимается на основании только этих материалов.</span>}</div>
              </article>
              <div className="decision-row">
                {!feedback ? <><button className="decision dismiss" onClick={() => decide("dismiss")}><X size={19} /><span><b>Отказать</b><small>Недостаточно оснований</small></span><kbd>A</kbd></button><button className="decision prosecute" onClick={() => decide("prosecute")}><Gavel size={19} /><span><b>Возбудить дело</b><small>Основания подтверждены</small></span><kbd>D</kbd></button></> : <button className="next-button" onClick={next}>Следующее дело <ChevronRight size={18} /></button>}
              </div>
            </>
          )}
        </section>
      </section>

      <footer className="footerbar"><div><b>УКАЗАНИЕ:</b> решение должно быть кратким, точным и проверяемым.</div><div className="footer-stats"><Stat label="ВЕРНЫЕ" value={`${score}/${CASES.length}`} tone={score > 0 ? "good" : "default"} /><Stat label="ДОВЕРИЕ" value={`${trust}/5`} tone={trust < 2 ? "bad" : "default"} /><Stat label="СТАТУС" value={finished ? "ЗАКРЫТО" : feedback ? "ПРОВЕРКА" : "ОЖИДАНИЕ"} /></div></footer>
    </main>
  );
}
