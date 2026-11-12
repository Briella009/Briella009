"use strict";

/* GynNavi v0.3: deterministic, session-only demonstration.
   No generative AI, database, analytics, third-party scripts, or server calls. */

const SYNTHETIC_REPORT = `FICTIONAL TRAINING REPORT - NOT A REAL PATIENT RECORD
REPORT DATE: 2026-10-18
EXAMINATION: Pelvic ultrasound
INDICATION: Heavy menstrual bleeding and pelvic pressure
FINDINGS: The uterus is anteverted and measures 11.2 x 6.8 x 7.1 cm.
A well-defined intramural fibroid is described in the anterior uterine wall, measuring 4.2 x 3.6 cm.
The right and left ovaries are described as unremarkable.
IMPRESSION: Uterine fibroid described above.
This fictional text is for testing document organisation only.`;

const SYNTHETIC_REPORT_2 = `FICTIONAL TRAINING REPORT - NOT A REAL PATIENT RECORD
REPORT DATE: 2026-11-03
EXAMINATION: Pelvic ultrasound
INDICATION: Pelvic pressure
FINDINGS: An intramural fibroid measuring 2.5 x 2.1 cm is described.
IMPRESSION: Fibroid noted in the findings section.
This fictional text is for testing document organisation only.`;

const state = {
  story: {symptoms: [], duration: "Not specified", impact: 4, notes: ""},
  report: "", findings: [], brief: "",
  tasks: [
    {id: 1, name: "Prepare questions for the next appointment", done: false},
    {id: 2, name: "Bring the fictional report summary to the appointment", done: false},
    {id: 3, name: "Record the agreed follow-up actions after the visit", done: false}
  ],
  nextTaskId: 4
};

const $ = id => document.getElementById(id);
const views = ["overview", "story", "reports", "visit", "followup", "facilities", "evidence"];
const viewTitles = {overview:"Overview",story:"My health story",reports:"Report desk",visit:"Visit preparation",followup:"My next steps",facilities:"Find care",evidence:"Research & safety"};
let toastTimeout;

function showToast(message) {
  const box = $("toast");
  box.textContent = message;
  box.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => box.classList.remove("show"), 3500);
}

function navigate(view) {
  if (!views.includes(view)) return;
  document.querySelectorAll(".page").forEach(page => page.classList.toggle("active", page.id === `view-${view}`));
  document.querySelectorAll(".nav-link").forEach(btn => {
    const selected = btn.dataset.view === view;
    btn.classList.toggle("active", selected);
    if (selected) btn.setAttribute("aria-current", "page");
    else btn.removeAttribute("aria-current");
  });
  $("topbar-section").textContent = viewTitles[view];
  document.querySelector(".sidebar").classList.remove("open");
  window.scrollTo(0,0);
}

document.querySelectorAll("[data-view]").forEach(btn => btn.addEventListener("click", () => navigate(btn.dataset.view)));
$("menu-toggle").addEventListener("click", () => document.querySelector(".sidebar").classList.toggle("open"));

function saveStory() {
  const story = {
    symptoms: Array.from(document.querySelectorAll(".symptom-check:checked")).map(x => x.value),
    duration: $("symptom-duration").value,
    impact: Number($("severity").value),
    notes: $("story-notes").value.trim()
  };
  state.story = story;
  $("story-feedback").textContent = "Saved for this browser session.";
  showToast("Demo story updated. Nothing was sent or stored.");
}

$("severity").addEventListener("input", () => { $("severity-value").textContent = `${$("severity").value} / 10`; });
$("save-story").addEventListener("click", saveStory);
$("load-story-sample").addEventListener("click", () => {
  const selectValues = ["Heavy menstrual bleeding", "Pelvic or abdominal discomfort", "Pelvic pressure or fullness"];
  document.querySelectorAll(".symptom-check").forEach(c => c.checked = selectValues.includes(c.value));
  $("symptom-duration").value = "More than 6 months";
  $("severity").value = "6";
  $("severity-value").textContent = "6 / 10";
  $("story-notes").value = "Fictional example: Symptoms have affected concentration at work. I want to understand my written scan report and prepare questions for my clinician.";
  saveStory();
});

function addFact(items, label, value, quotation) {
  const v = (value || "").trim();
  const q = (quotation || "").trim();
  if (v && q) items.push({label, value:v.slice(0,500), source:q.slice(0,700)});
}

function extractReportFacts(reportText) {
  // Parse only source statements. Do not infer diagnosis, severity, urgency or treatment.
  const lines = reportText.replace(/\r/g, "").split("\n").map(line => line.trim()).filter(Boolean);
  const items = [];
  const lookFor = (re, label) => {
    const source = lines.find(line => re.test(line));
    if (!source) return;
    const match = source.match(re);
    if (match && match[1]) addFact(items, label, match[1], source);
  };
  lookFor(/^(?:REPORT DATE|DATE OF EXAMINATION)\s*:\s*(.+)$/i, "Report date");
  lookFor(/^(?:EXAMINATION|EXAM)\s*:\s*(.+)$/i, "Examination");
  lookFor(/^INDICATION\s*:\s*(.+)$/i, "Indication written on report");
  lookFor(/^IMPRESSION\s*:\s*(.+)$/i, "Report impression (verbatim)");
  const fibroidLine = lines.find(line => /fibroid/i.test(line) && /measur/i.test(line) && !/^(?:IMPRESSION|INDICATION):/i.test(line));
  if (fibroidLine) {
    const match = fibroidLine.match(/\bfibroid\b.{0,150}?\bmeasur(?:ing|es)\s+([\d.]+\s*(?:x|\u00d7)\s*[\d.]+(?:\s*(?:x|\u00d7)\s*[\d.]+)?\s*(?:mm|cm))\b/i);
    if (match) addFact(items, "Fibroid measurement as written", match[1], fibroidLine);
  }
  return items;
}

function renderFindings() {
  const results = $("extraction-result");
  results.replaceChildren();
  $("extraction-empty").hidden = state.findings.length > 0;
  results.hidden = state.findings.length === 0;
  $("extraction-foot").hidden = state.findings.length === 0;
  state.findings.forEach(item => {
    const wrap = document.createElement("div"); wrap.className = "finding-item";
    const key = document.createElement("div"); key.className = "finding-key"; key.textContent = item.label;
    const value = document.createElement("div"); value.className = "finding-value"; value.textContent = item.value;
    const source = document.createElement("div"); source.className = "finding-source"; source.textContent = `Source: "${item.source}"`;
    const reviewLabel = document.createElement("label"); reviewLabel.className = "review-choice";
    const reviewInput = document.createElement("input"); reviewInput.type = "checkbox";
    reviewInput.checked = Boolean(item.approved);
    reviewInput.setAttribute("aria-label", `Include ${item.label} in visit brief`);
    reviewInput.addEventListener("change", () => {
      item.approved = reviewInput.checked;
      state.brief = "";
      $("brief-preview").textContent = "";
      $("brief-preview").hidden = true;
      $("brief-empty").hidden = false;
      $("download-brief").disabled = true;
      $("copy-brief").disabled = true;
      showToast("Report review updated. Regenerate your visit brief.");
    });
    const reviewText = document.createElement("span");
    reviewText.textContent = "I checked this excerpt against the original fictional report; include it in my brief.";
    reviewLabel.append(reviewInput,reviewText);
    wrap.append(key,value,source,reviewLabel); results.appendChild(wrap);
  });
}

$("load-report-sample").addEventListener("click", () => {
  $("report-text").value = SYNTHETIC_REPORT;
  state.report = SYNTHETIC_REPORT;
  state.findings = [];
  renderFindings();
  showToast("Fictional ultrasound report loaded.");
});
$("load-report-sample-2").addEventListener("click", () => {
  $("report-text").value = SYNTHETIC_REPORT_2;
  state.report = SYNTHETIC_REPORT_2;
  state.findings = [];
  state.brief = "";
  renderFindings();
  showToast("Second fictional ultrasound report loaded.");
});
$("clear-report").addEventListener("click", () => { $("report-text").value = ""; state.report=""; state.findings=[]; renderFindings(); });
$("txt-upload").addEventListener("change", async event => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;
  if (!file.name.toLowerCase().endsWith(".txt") || file.size > 250000) {
    showToast("Choose a fictional .txt file under 250 KB.");
    event.target.value="";
    return;
  }
  $("report-text").value = await file.text();
  state.findings=[];
  renderFindings();
  event.target.value="";
  showToast("Text loaded locally. Click Extract reported facts.");
});
$("analyse-report").addEventListener("click", () => {
  const text = $("report-text").value.trim();
  if (!text) {showToast("Load or paste a fictional report first.");return;}
  if (text.length > 50000) {showToast("Please use a report under 50,000 characters.");return;}
  state.report = text;
  state.findings = extractReportFacts(text).map(item => ({...item, approved:false}));
  state.brief = "";
  $("brief-preview").hidden = true;
  $("brief-empty").hidden = false;
  $("download-brief").disabled = true;
  $("copy-brief").disabled = true;
  renderFindings();
  if (state.findings.length) showToast(`${state.findings.length} statements extracted with exact source lines.`);
  else showToast("No supported report headings found. No details were invented.");
});

function createBrief() {
  const s = state.story;
  const questions = [
    "What may be causing these symptoms, and what evaluation is appropriate?",
    "How should I understand the findings in my written report?",
    "Which management options fit my circumstances, and what are their trade-offs?",
    "Which symptoms should lead me to seek urgent care?",
    "What is the follow-up plan, and what practical costs should I anticipate?"
  ];
  const lines = [
    "GYNNAVI | FICTIONAL APPOINTMENT PREPARATION BRIEF",
    "DEMONSTRATION ONLY - NOT MEDICAL ADVICE",
    "===================================================",
    `Reason for visit: ${$("visit-purpose").value}`,
    `Appointment date: ${$("visit-date").value || "Not entered"}`,
    "",
    "SYMPTOMS REPORTED BY THE FICTIONAL USER",
    `- Selected symptoms: ${s.symptoms.length ? s.symptoms.join("; ") : "None entered"}`,
    `- Time noticed: ${s.duration}`,
    `- Self-reported daily-life impact: ${s.impact}/10 (subjective, not a clinical score)`,
    `- User's own notes: ${s.notes || "None entered"}`,
    "",
    "EXTRACTS FROM FICTIONAL DOCUMENT (USER-REVIEWED, VERBATIM)",
  ];
  const approvedFindings = state.findings.filter(f => f.approved);
  if (!approvedFindings.length) lines.push("- No report excerpts selected. Review extracted source lines in Report desk first.");
  approvedFindings.forEach(f => lines.push(`- ${f.label}: ${f.value}\n  Source line: ${f.source}`));
  lines.push("", "QUESTIONS FOR A QUALIFIED CLINICIAN");
  questions.forEach((q,i) => lines.push(`${i+1}. ${q}`));
  lines.push("", "NOTES", "This brief organises fictional user-provided statements and user-selected source quotations. It is not a diagnosis, a verified medical record, a treatment recommendation, or an assessment of urgency.");
  return lines.join("\n");
}
$("generate-brief").addEventListener("click", () => {
  state.brief = createBrief();
  $("brief-preview").textContent = state.brief;
  $("brief-empty").hidden = true;
  $("brief-preview").hidden = false;
  $("download-brief").disabled=false;
  $("copy-brief").disabled=false;
  showToast("Fictional appointment brief generated.");
});
$("download-brief").addEventListener("click", () => {
  if(!state.brief)return;
  const blob = new Blob([state.brief], {type:"text/plain;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href=url; a.download="gynnavi-fictional-appointment-brief.txt";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast("Text summary downloaded to your device.");
});
$("copy-brief").addEventListener("click", async () => {
  if(!state.brief)return;
  try {
    if(navigator.clipboard && navigator.clipboard.writeText) await navigator.clipboard.writeText(state.brief);
    else { const el=document.createElement("textarea"); el.value=state.brief; document.body.appendChild(el); el.select(); if(!document.execCommand("copy")) throw new Error("Copy failed");el.remove(); }
    showToast("Summary copied.");
  } catch(e) {showToast("Copy is blocked in this browser. Download the .txt instead.");}
});

function renderTasks() {
  const list = $("task-list"); list.replaceChildren();
  const count = state.tasks.filter(t=>t.done).length;
  const total = state.tasks.length;
  const percent = total ? Math.round(100*count/total) : 0;
  $("progress-text").textContent = `${count} of ${total} actions complete`;
  $("progress-percent").textContent = `${percent}%`;
  $("progress-fill").style.width = `${percent}%`;
  $("progress-circle").style.background = `conic-gradient(#936582 ${percent*3.6}deg,#f0e5ed ${percent*3.6}deg)`;
  for (const task of state.tasks) {
    const label = document.createElement("label"); label.className=`task-item ${task.done?"done":""}`;
    const checkbox=document.createElement("input"); checkbox.type="checkbox";checkbox.checked=task.done;
    checkbox.setAttribute("aria-label",`Complete ${task.name}`);
    checkbox.addEventListener("change",()=>{task.done=checkbox.checked;renderTasks();});
    const name = document.createElement("span"); name.textContent=task.name;
    const remove=document.createElement("button"); remove.className="remove-task";remove.type="button";remove.textContent="\u00d7";remove.setAttribute("aria-label",`Remove ${task.name}`);
    remove.addEventListener("click",event=>{event.preventDefault();state.tasks=state.tasks.filter(t=>t.id!==task.id);renderTasks();});
    label.append(checkbox,name,remove);list.appendChild(label);
  }
}
$("add-task").addEventListener("click",()=>{
  const name=$("new-task").value.trim();
  if(!name){showToast("Describe a fictional follow-up action first.");return;}
  state.tasks.push({id:state.nextTaskId++,name,done:false});
  $("new-task").value="";renderTasks();
});
$("new-task").addEventListener("keydown",event=>{if(event.key==="Enter"){$("add-task").click();}});
renderTasks();

$("show-integration").addEventListener("click",()=>{
  const stateName=$("facility-state").value;
  const box=$("integration-notice");
  box.textContent=`Planned search: registered facilities in ${stateName}. Source: official HFR REST API (read-only), which needs an approved X-API-Key. This prototype has no key and cannot show verified facility listings. Specialist services, costs and opening hours require additional confirmation.`;
  box.hidden=false;
});
