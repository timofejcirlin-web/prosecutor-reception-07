from pathlib import Path
p = Path('/home/ubuntu/prosecutor-checkpoint/client/src/pages/Home.tsx')
s = p.read_text()
needle = '<div className="reputation-summary"><div className="reputation-heading"><span>РЕПУТАЦИЯ СОТРУДНИКА</span>'
insert = '{dayConsequences.length > 0 && <div className="consequence-summary"><div className="reputation-heading"><span>ПОСЛЕДСТВИЯ СМЕНЫ</span><b>ПРОЯВЯТСЯ ЗАВТРА</b></div>{dayConsequences.map((event, index) => <div className={`consequence-event ${event.tone}`} key={`${event.title}-${index}`}><strong>{event.title}</strong><p>{event.text}</p></div>)}</div>}'
if s.count(needle) != 1:
    raise SystemExit(f'expected one summary needle, got {s.count(needle)}')
s = s.replace(needle, insert + needle, 1)
p.write_text(s)
