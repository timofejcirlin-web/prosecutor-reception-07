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
};

const CASES: CaseFile[] = [
  { id: "01", number: "А-174/26", category: "Мошенничество", person: "Лебедев Артём Викторович", place: "г. Тверь, ул. Советская, 18", summary: "Получил предоплату за ремонт кровли и исчез до начала работ.", evidence: "Договор есть. Две независимые жалобы на тот же счёт. Деньги переведены на карту родственника через час после получения.", correct: "prosecute", explanation: "Повторяемость схемы и движение денег подтверждают умысел. Материал направляется в дело." },
  { id: "02", number: "Б-052/26", category: "Нарушение тишины", person: "Кузнецова Марина Олеговна", place: "г. Ржев, пер. Полевой, 7", summary: "Сосед заявил о громкой музыке после 23:00.", evidence: "Замер шума не проводился. Заявитель признал, что находился в другом городе. Есть только устное сообщение консьержа.", correct: "dismiss", explanation: "Доказательств недостаточно: материал возвращается на дополнительную проверку." },
  { id: "03", number: "В-908/26", category: "Незаконная вырубка", person: "ООО «Лесной контур»", place: "Калининский район, квартал 14", summary: "На участке обнаружены свежие пни и техника без разрешения.", evidence: "Координаты совпадают с актом осмотра. Номер техники виден на фото, а разрешение на вырубку выдано на соседний квартал.", correct: "prosecute", explanation: "Фотофиксация и несоответствие разрешения дают достаточные основания для возбуждения." },
  { id: "04", number: "Г-221/26", category: "Трудовой спор", person: "Петров Денис Ильич", place: "г. Торжок, ул. Заводская, 3", summary: "Работодатель задержал выплату за один рабочий день.", evidence: "Есть трудовой договор и табель. Бухгалтерия представила платёжное поручение, отправленное в срок; банк подтвердил задержку зачисления.", correct: "dismiss", explanation: "Нарушение со стороны работодателя не подтверждено: платёж ушёл вовремя." },
  { id: "05", number: "Д-611/26", category: "Подделка документа", person: "Сафронов Илья Романович", place: "г. Кашин, МФЦ № 2", summary: "Предоставил справку с признаками исправлений для получения выплаты.", evidence: "Экспертиза указывает на монтаж печати. Ведомство-источник не выдавало справку с таким номером, дата также не совпадает с реестром.", correct: "prosecute", explanation: "Заключение эксперта и проверка реестра подтверждают признаки подделки." },
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
                <div className="evidence"><div className="evidence-label"><span>КЛЮЧЕВЫЕ МАТЕРИАЛЫ</span><small>ПРОВЕРЕНО: {caseIndex % 2 === 0 ? "УТРО" : "ДЕНЬ"}</small></div><p>{current.evidence}</p></div>
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
