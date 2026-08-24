// Cardiovascular risk scoring — mirrors the logic from formulärfrågor-kod.html
function assessRisk(f) {
  let risk = 0;

  ['meds', 'smoke', 'syncope', 'family_infarkt', 'doc_advice'].forEach((field) => {
    const v = f[field];
    if (['ja', 'nuvarande', 'tidigare'].includes(v)) risk++;
  });

  (f.hist || []).forEach(() => risk++);
  (f.symptom || []).forEach(() => risk++);

  const V = {
    sys: Number(f.systolic) || 0,
    dia: Number(f.diastolic) || 0,
    hr: Number(f.heartrate) || 0,
    np: Number(f.ntprobnp) || 0,
    w: Number(f.weight) || 0,
    pr: Number(f.pr) || 0,
    qrs: Number(f.qrs) || 0,
    qt: Number(f.qt) || 0,
  };

  if (V.sys >= 140) risk++;
  if (V.dia >= 90) risk++;
  if (V.hr < 60 || V.hr > 80) risk++;
  if (V.np >= 125) risk++;
  if (V.w < 60 || V.w > 85) risk++;
  if (V.pr < 120 || V.pr > 200) risk++;
  if (V.qrs < 80 || V.qrs > 120) risk++;
  if (V.qt < 350 || V.qt > 450) risk++;

  let cls, title, desc, explanation, color;
  if (risk === 0) {
    cls = 'green';
    title = '✅ Grön signal';
    desc = 'Alla värden normala – du kan delta!';
    explanation = 'Inga riskmarkörer påträffades.';
    color = '#28a745';
  } else if (risk <= 3) {
    cls = 'yellow';
    title = '⚠️ Gul signal';
    desc = 'Några avvikelser – rådgör med vården.';
    explanation = `${risk} avvikande parametrar upptäcktes.`;
    color = '#ffc107';
  } else {
    cls = 'red';
    title = '❌ Röd signal';
    desc = 'Flera avvikelser – Vi rekommenderar att du kontaktar vården innan du deltar.';
    explanation = `${risk} avvikande parametrar – kontakta vård.`;
    color = '#dc3545';
  }

  return { risk, cls, title, desc, explanation, color };
}

if (typeof module !== 'undefined') module.exports = { assessRisk };
