const euro = (n) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
    n,
  );
const scenarios = {
  eco: {
    label: "Ultra-économe",
    restaurant: 25,
    pre: 35,
    club: 30,
    bars: 10,
    casino: 20,
    copy: "Restaurant simple, deux clubs avec enveloppe serrée, peu de bars et casino limité à 20 €.",
  },
  realiste: {
    label: "Réaliste",
    restaurant: 35,
    pre: 35,
    club: 60,
    bars: 20,
    casino: 35,
    copy: "Un restaurant sympa, deux clubs raisonnables, un ou deux bars et casino plafonné à 35 €.",
  },
  confort: {
    label: "Confort",
    restaurant: 55,
    pre: 35,
    club: 100,
    bars: 40,
    casino: 50,
    copy: "Restaurant plus généreux, enveloppes sorties confortables et casino à 50 € maximum.",
  },
};
const fixed = [
  ["Logement", 377],
  ["Bateau Bleue Évasion", 130],
  ["Kayak Cassis · 2 h en triplaces", 13],
  ["Karting · 2 sessions + cagoule", 37],
  ["Courses maison & pique-niques", 145],
  ["Essence, parkings & péages locaux", 35],
  ["Compass · tout le monde", 3],
];
function renderBudget(key = "realiste") {
  const s = scenarios[key],
    variables = [
      ["Restaurant marquant", s.restaurant, "25–55 €"],
      ["Pré-soirées maison · collectif", s.pre, "fixe estimé"],
      ["2 soirées club", s.club, "30–100 €"],
      ["Bar(s) chill", s.bars, "10–40 €"],
      ["Casino · enveloppe personnelle", s.casino, "20–50 €"],
    ],
    subtotal = [...fixed, ...variables].reduce((sum, row) => sum + row[1], 0),
    margin = Math.round(subtotal * 0.1),
    total = subtotal + margin,
    rows = document.getElementById("budget-rows");
  if (!rows) return;
  rows.innerHTML = [
    ...fixed.map((r) => `<tr><td>${r[0]}</td><td>${euro(r[1])}</td></tr>`),
    ...variables.map(
      (r) =>
        `<tr class="variable"><td>${r[0]} <small>(${r[2]})</small></td><td>${euro(r[1])}</td></tr>`,
    ),
    `<tr><td>Marge imprévus 10 %</td><td>${euro(margin)}</td></tr>`,
    `<tr class="total"><td>Total estimé</td><td>${euro(total)}</td></tr>`,
    `<tr class="optional"><td>Jet-ski, bouée, paddle, VTC, souvenirs…</td><td>non inclus</td></tr>`,
  ].join("");
  document.getElementById("budget-total").textContent = euro(total);
  document.getElementById("budget-copy").textContent = s.copy;
  document
    .querySelectorAll("[data-budget]")
    .forEach((b) => b.classList.toggle("active", b.dataset.budget === key));
}
document
  .querySelectorAll("[data-budget]")
  .forEach((b) => b.addEventListener("click", () => {
    const personalPanel = document.getElementById("perso");
    const groupPanel = document.getElementById("group-budget-panel");
    if (b.dataset.budget === "perso") {
      personalPanel?.classList.remove("hidden"); groupPanel?.classList.add("hidden");
      document.getElementById("personal-name")?.focus();
      document.querySelectorAll("[data-budget]").forEach((button) => button.classList.toggle("active", button === b));
      return;
    }
    personalPanel?.classList.add("hidden"); groupPanel?.classList.remove("hidden");
    renderBudget(b.dataset.budget);
  }));
renderBudget();
const personalDefaultItems = [
  ["Logement", 377],
  ["Bateau Bleue Évasion", 130],
  ["Kayak Cassis", 13],
  ["Karting", 37],
  ["Courses & pique-niques", 145],
  ["Restaurant marquant", 35],
  ["Pré-soirées maison", 35],
  ["Soirées club", 60],
  ["Bar(s) chill", 20],
  ["Casino", 35],
  ["Essence, parkings & péages", 35],
  ["Compass", 3],
];
function initPersonalBudget() {
  const rows = document.getElementById("personal-budget-rows");
  if (!rows) return;
  const saved = JSON.parse(
    localStorage.getItem("marseille26-personal-budget-v1") || "{}",
  );
  rows.innerHTML = personalDefaultItems
    .map(
      ([label, value], index) =>
        `<label class="personal-row"><span>${label}</span><input data-personal-item="${index}" type="number" min="0" step="1" value="${saved[index] ?? value}" aria-label="${label}" /></label>`,
    )
    .join("");
  const name = document.getElementById("personal-name");
  const margin = document.getElementById("personal-margin");
  const status = document.getElementById("personal-status");
  name.value = saved.name || "";
  margin.value = saved.margin ?? 10;
  const values = () => [...document.querySelectorAll("[data-personal-item]")].map(
    (input) => Math.max(0, Number(input.value) || 0),
  );
  const save = (message = "Version personnelle enregistrée sur cet appareil.") => {
    localStorage.setItem(
      "marseille26-personal-budget-v1",
      JSON.stringify({ ...values(), margin: Math.max(0, Number(margin.value) || 0), name: name.value.trim() }),
    );
    if (status) status.textContent = message;
  };
  const update = () => {
    const itemValues = values();
    const rate = Math.max(0, Number(margin.value) || 0);
    const subtotal = itemValues.reduce((sum, value) => sum + value, 0);
    document.getElementById("personal-total").textContent = euro(
      Math.round(subtotal * (1 + rate / 100)),
    );
    save();
  };
  rows.addEventListener("input", update);
  margin.addEventListener("input", update);
  name.addEventListener("input", () => save());
  document.getElementById("personal-save")?.addEventListener("click", () => save("Version personnelle enregistrée sur cet appareil."));
  document.getElementById("personal-reset").onclick = () => {
    localStorage.removeItem("marseille26-personal-budget-v1");
    [...document.querySelectorAll("[data-personal-item]")].forEach(
      (input, index) => (input.value = personalDefaultItems[index][1]),
    );
    name.value = "";
    margin.value = 10;
    update();
  };
  document.getElementById("personal-image")?.addEventListener("click", async () => {
    const itemValues = values();
    const rate = Math.max(0, Number(margin.value) || 0);
    const subtotal = itemValues.reduce((sum, value) => sum + value, 0);
    const total = Math.round(subtotal * (1 + rate / 100));
    const canvas = document.createElement("canvas"); canvas.width = 1080; canvas.height = 1350;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const gradient = ctx.createLinearGradient(0, 0, 1080, 1350); gradient.addColorStop(0, "#092a61"); gradient.addColorStop(.53, "#007ccc"); gradient.addColorStop(1, "#ff625f");
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "rgba(255,255,255,.14)"; ctx.beginPath(); ctx.arc(900, 180, 250, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(160, 1220, 220, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.font = "700 42px Poppins, Arial"; ctx.fillText("MARSEILLE 2026", 80, 120);
    ctx.font = "500 29px Poppins, Arial"; ctx.fillText("9 → 16 août · 9 amis", 80, 170);
    ctx.fillStyle = "#fff"; ctx.font = "700 76px Poppins, Arial"; ctx.fillText(name.value.trim() || "Mon budget", 80, 310);
    ctx.fillStyle = "#e6fbff"; ctx.font = "500 31px Poppins, Arial"; ctx.fillText("version personnelle · marge " + rate + " % incluse", 80, 364);
    ctx.fillStyle = "#ffffff"; ctx.roundRect(62, 440, 956, 330, 34); ctx.fill();
    ctx.fillStyle = "#092a61"; ctx.font = "700 30px Poppins, Arial"; ctx.fillText("BUDGET PRÉVISIONNEL", 112, 518);
    ctx.font = "700 112px Poppins, Arial"; ctx.fillText(euro(total), 105, 655);
    ctx.fillStyle = "#496487"; ctx.font = "500 28px Poppins, Arial"; ctx.fillText("Sous-total : " + euro(subtotal), 112, 719);
    const highlights = [
      ["Logement", itemValues[0]], ["Bateau", itemValues[1]], ["Kayak + karting", itemValues[2] + itemValues[3]], ["Vie sur place", itemValues[4] + itemValues[5] + itemValues[6]], ["Sorties", itemValues[7] + itemValues[8] + itemValues[9]],
    ];
    ctx.fillStyle = "#ffffff"; ctx.roundRect(62, 830, 956, 365, 34); ctx.fill();
    ctx.fillStyle = "#092a61"; ctx.font = "700 30px Poppins, Arial"; ctx.fillText("MES REPÈRES", 112, 905);
    highlights.forEach(([label, amount], index) => { const y = 970 + index * 48; ctx.fillStyle = "#425f86"; ctx.font = "500 27px Poppins, Arial"; ctx.fillText(label, 112, y); ctx.fillStyle = "#092a61"; ctx.font = "700 27px Poppins, Arial"; ctx.textAlign = "right"; ctx.fillText(euro(amount), 965, y); ctx.textAlign = "left"; });
    ctx.fillStyle = "#fff"; ctx.font = "500 24px Poppins, Arial"; ctx.fillText("Budget privé · l’organisation du groupe", 80, 1280); ctx.fillText("reste dans Marseille 2026.", 80, 1318);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "budget-marseille-2026.png", { type: "image/png" });
      try {
        if (navigator.canShare?.({ files: [file] })) { await navigator.share({ title: "Mon budget Marseille 2026", files: [file] }); if (status) status.textContent = "Image prête : dans le partage iPhone, choisis « Enregistrer l’image » pour la pellicule."; return; }
      } catch (error) { if (error?.name === "AbortError") return; }
      const link = document.createElement("a"); link.href = URL.createObjectURL(blob); link.download = file.name; link.click(); URL.revokeObjectURL(link.href);
      if (status) status.textContent = "Image téléchargée. Sur iPhone, utilise le menu Partager puis « Enregistrer l’image ».";
    }, "image/png");
  });
  update();
}
initPersonalBudget();
const names = ["Arthur", "Aymeric", "Elouan", "Gaetan", "Gaspard", "Hélio", "Juliette", "Matys", "Yoel"];
const SUPABASE_URL = "https://pitmfpsfaekexqqdhizm.supabase.co";
const SUPABASE_KEY = "sb_publishable_1Lh7Q6BiFuR6Hy-3rumzVw_8yW_XN0k";
const TRIP_ID = "marseille-2026";
// v2 intentionally makes every device request the new 4-digit group code (2006).
// Shared data remains in Supabase; only this editing permission is device-local.
const GROUP_CODE_KEY = "marseille26-group-code-v2";
const MIGRATION_KEY = "marseille26-shared-migrated-v1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
const legacy = {
  expenses: JSON.parse(localStorage.getItem("marseille26-expenses-v3") || localStorage.getItem("marseille26-expenses-v2") || "[]"),
  history: JSON.parse(localStorage.getItem("marseille26-history-v3") || localStorage.getItem("marseille26-history-v2") || "[]"),
  repayments: JSON.parse(localStorage.getItem("marseille26-repayments-v3") || "[]"),
  notes: localStorage.getItem("marseille26-notes-v1") || "",
};
let expenses = legacy.expenses.map((item) => ({ ...item, participants: item.participants || names }));
let history = legacy.history, repayments = legacy.repayments, notes = legacy.notes, decisions = [], activities = [], plans = [];
let stateVersion = 1, editing = null, remoteLoaded = false, isSaving = false, realtimeClient = null, accessPromptResolve = null;
function hasLegacyData() { return expenses.length || repayments.length || history.length || notes.trim(); }
function normaliseState(state = {}) {
  return {
    expenses: Array.isArray(state.expenses) ? state.expenses.map((item) => ({ ...item, participants: item.participants || names })) : [],
    repayments: Array.isArray(state.repayments) ? state.repayments : [],
    history: Array.isArray(state.history) ? state.history : [],
    notes: typeof state.notes === "string" ? state.notes : Array.isArray(state.notes) ? state.notes.map((note) => note.text || note).join("\n") : "",
    decisions: Array.isArray(state.decisions) ? state.decisions : [],
    activities: Array.isArray(state.activities) ? state.activities : [],
    plans: Array.isArray(state.plans) ? state.plans : [],
  };
}
function currentState() { return { expenses, repayments, history, notes, decisions, activities, plans }; }
function setSyncStatus(message, tone = "live") {
  document.querySelectorAll("#sync-status").forEach((node) => {
    node.classList.toggle("is-live", tone === "live");
    node.classList.toggle("is-error", tone === "error");
    const text = node.querySelector("span:nth-child(2)");
    if (text) text.textContent = message;
  });
}
function requestHeaders(extra = {}) { return { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, ...extra }; }
function groupCode() { return localStorage.getItem(GROUP_CODE_KEY) || ""; }
function closeAccessModal(result = false) {
  $("group-access-modal")?.remove();
  const resolve = accessPromptResolve; accessPromptResolve = null;
  resolve?.(result);
}
function openAccessModal() {
  if (groupCode()) return Promise.resolve(true);
  if (accessPromptResolve) return new Promise((resolve) => {
    const previousResolve = accessPromptResolve;
    accessPromptResolve = (result) => { previousResolve(result); resolve(result); };
  });
  return new Promise((resolve) => {
    accessPromptResolve = resolve;
    const modal = document.createElement("div"); modal.id = "group-access-modal"; modal.className = "access-modal-backdrop";
    modal.innerHTML = `<section class="access-modal" role="dialog" aria-modal="true" aria-labelledby="access-title"><div class="access-lock">✓</div><h2 id="access-title">Accès du groupe</h2><p>Le programme et le budget restent accessibles à tous. Entre le code du groupe pour ajouter ou modifier une dépense, une note ou une décision.</p><form id="group-access-form"><label for="group-code-input">Code du groupe</label><input id="group-code-input" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{4}" maxlength="4" placeholder="••••" aria-describedby="group-code-help" required /><small id="group-code-help">Il est mémorisé uniquement sur cet appareil. Tu ne le retaperas pas à chaque action.</small><p class="access-error hidden" id="group-code-error">Saisis les 4 chiffres du code du groupe.</p><div class="access-actions"><button class="primary" type="submit">Continuer</button><button class="secondary" type="button" id="cancel-group-access">Annuler</button></div></form></section>`;
    document.body.append(modal);
    const input = $("group-code-input"); input.focus();
    $("cancel-group-access").onclick = () => closeAccessModal(false);
    modal.addEventListener("click", (event) => { if (event.target === modal) closeAccessModal(false); });
    $("group-access-form").onsubmit = (event) => {
      event.preventDefault(); const code = input.value.trim();
      if (!/^\d{4}$/.test(code)) { $("group-code-error").classList.remove("hidden"); input.focus(); return; }
      localStorage.setItem(GROUP_CODE_KEY, code); setSyncStatus("Code enregistré · modifications protégées", "live"); closeAccessModal(true);
    };
  });
}
async function ensureEditAccess() { return groupCode() ? true : openAccessModal(); }
function unlockGroup() { openAccessModal(); }
async function loadSharedState({ quiet = false } = {}) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/trip_state?id=eq.${TRIP_ID}&select=id,state,version,updated_at,updated_by`, { headers: requestHeaders() });
    if (!response.ok) throw new Error("Le carnet partagé ne répond pas.");
    const [row] = await response.json();
    if (!row) throw new Error("Séjour partagé introuvable.");
    const next = normaliseState(row.state);
    const remoteEmpty = !next.expenses.length && !next.repayments.length && !next.history.length && !next.notes.trim();
    stateVersion = Number(row.version) || 1;
    remoteLoaded = true;
    if (remoteEmpty && hasLegacyData() && !localStorage.getItem(MIGRATION_KEY)) {
      setSyncStatus("Ancienne copie locale prête à être partagée", "live");
      renderAccounts();
      return;
    }
    ({ expenses, repayments, history, notes, decisions, activities, plans } = next);
    renderAccounts();
    renderNotes(); renderDecisions(); renderEntryStates();
    if (!quiet) setSyncStatus("Lecture partagée à jour · code requis pour modifier", "live");
  } catch (error) {
    setSyncStatus(error.message || "Connexion indisponible", "error");
  }
}
async function saveSharedState(actor, eventType) {
  if (isSaving || !(await ensureEditAccess())) return false;
  isSaving = true;
  setSyncStatus("Synchronisation en cours…");
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_marseille_trip_state`, {
      method: "POST",
      headers: requestHeaders({ "Content-Type": "application/json", Accept: "application/json" }),
      body: JSON.stringify({ p_access_code: groupCode(), p_state: currentState(), p_expected_version: stateVersion, p_actor: actor, p_event_type: eventType }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.hint || "La modification n’a pas été enregistrée.");
    const row = Array.isArray(result) ? result[0] : result;
    ({ expenses, repayments, history, notes, decisions, activities, plans } = normaliseState(row.state));
    stateVersion = Number(row.version) || stateVersion + 1;
    localStorage.setItem(MIGRATION_KEY, "1");
    renderAccounts(); renderNotes(); renderDecisions(); renderEntryStates();
    setSyncStatus("Enregistré pour tout le groupe", "live");
    return true;
  } catch (error) {
    if (/incorrect/i.test(error.message)) localStorage.removeItem(GROUP_CODE_KEY);
    setSyncStatus(error.message || "La modification n’a pas été enregistrée.", "error");
    await loadSharedState({ quiet: true });
    alert(`${error.message || "Modification non enregistrée."}\n\nLe carnet a été rechargé pour éviter tout conflit.`);
    return false;
  } finally { isSaving = false; }
}
function startRealtime() {
  if (!window.supabase?.createClient) return;
  realtimeClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  realtimeClient.channel("marseille-2026-live").on("postgres_changes", { event: "UPDATE", schema: "public", table: "trip_state", filter: `id=eq.${TRIP_ID}` }, (payload) => {
    if (isSaving || Number(payload.new.version) <= stateVersion) return;
    ({ expenses, repayments, history, notes, decisions, activities, plans } = normaliseState(payload.new.state));
    stateVersion = Number(payload.new.version); renderAccounts(); renderNotes(); renderDecisions(); renderEntryStates();
    setSyncStatus("Mise à jour reçue du groupe", "live");
  }).subscribe();
}
function log(action, text, snapshot = null) {
  history.unshift({ id: `${Date.now()}-${Math.random()}`, action, text, snapshot, at: new Date().toLocaleString("fr-FR") });
  history = history.slice(0, 120);
}
function calc() {
  const paid = Object.fromEntries(names.map((n) => [n, 0])); const owed = Object.fromEntries(names.map((n) => [n, 0]));
  expenses.forEach((expense) => { paid[expense.payer] += Number(expense.amount); const share = Number(expense.amount) / expense.participants.length; expense.participants.forEach((name) => (owed[name] += share)); });
  const balance = Object.fromEntries(names.map((n) => [n, paid[n] - owed[n]]));
  repayments.forEach((payment) => { balance[payment.from] += Number(payment.amount); balance[payment.to] -= Number(payment.amount); });
  return { paid, owed, balance };
}
function suggested(balance) {
  const debtors = names.filter((n) => balance[n] < -0.005).map((n) => ({ n, a: -balance[n] })); const creditors = names.filter((n) => balance[n] > 0.005).map((n) => ({ n, a: balance[n] })); const out = []; let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) { const amount = Math.min(debtors[i].a, creditors[j].a); out.push({ from: debtors[i].n, to: creditors[j].n, a: amount }); debtors[i].a -= amount; creditors[j].a -= amount; if (debtors[i].a < 0.005) i++; if (creditors[j].a < 0.005) j++; }
  return out;
}
function personStatus(name, balance) {
  const remaining = Math.max(0, -balance); const hasPaidBack = repayments.some((payment) => payment.from === name);
  if (remaining < 0.005) return { tone: "green", label: "✓ tout est réglé" };
  if (remaining > 100) return { tone: "red", label: "à rembourser en priorité" };
  if (remaining > 50) return { tone: "yellow", label: "reste à rembourser" };
  if (hasPaidBack) return { tone: "orange", label: "remboursement en cours" };
  return { tone: "red", label: "remboursement à faire" };
}
function formInit() {
  if (!$("expense-payer")) return;
  $("expense-payer").innerHTML = names.map((name) => `<option>${name}</option>`).join("");
  $("member-checks").innerHTML = names.map((name) => `<label><input type="checkbox" value="${name}" checked> ${name}</label>`).join("");
  $("all-members").onclick = () => document.querySelectorAll("#member-checks input").forEach((input) => (input.checked = true));
  $("cancel-edit").onclick = resetForm; $("expense-form").onsubmit = saveExpense;
  $("unlock-group")?.addEventListener("click", unlockGroup);
}
function resetForm() { editing = null; $("expense-form").reset(); document.querySelectorAll("#member-checks input").forEach((input) => (input.checked = true)); $("expense-title").textContent = "Ajouter une dépense"; $("expense-submit").textContent = "Ajouter la dépense"; $("cancel-edit").classList.add("hidden"); }
async function saveExpense(event) {
  event.preventDefault(); if (!(await ensureEditAccess())) return;
  const wasEditing = Boolean(editing);
  const participants = [...document.querySelectorAll("#member-checks input:checked")].map((input) => input.value); if (!participants.length) return alert("Choisis au moins une personne concernée.");
  const data = { id: editing || String(Date.now()), payer: $("expense-payer").value, category: $("expense-category").value, label: $("expense-label").value.trim(), amount: Number($("expense-amount").value), participants, at: new Date().toLocaleString("fr-FR") };
  if (editing) { expenses[expenses.findIndex((expense) => expense.id === editing)] = data; log("Modification", `${data.label} · ${euro(data.amount)}`); } else { expenses.unshift(data); log("Ajout", `${data.label} · ${euro(data.amount)} payé par ${data.payer}`); }
  resetForm(); renderAccounts(); await saveSharedState(data.payer, wasEditing ? "Modification de dépense" : "Ajout de dépense");
}
function editExpense(id) { const expense = expenses.find((item) => item.id === id); if (!expense) return; editing = id; $("expense-payer").value = expense.payer; $("expense-category").value = expense.category; $("expense-label").value = expense.label; $("expense-amount").value = expense.amount; document.querySelectorAll("#member-checks input").forEach((input) => (input.checked = expense.participants.includes(input.value))); $("expense-title").textContent = `Modifier : ${expense.label}`; $("expense-submit").textContent = "Enregistrer la correction"; $("cancel-edit").classList.remove("hidden"); scrollTo({ top: 0, behavior: "smooth" }); }
async function deleteExpense(id) { const expense = expenses.find((item) => item.id === id); if (!expense || !(await ensureEditAccess()) || !confirm(`Supprimer « ${expense.label} » ? Elle restera restaurable dans l’historique.`)) return; expenses = expenses.filter((item) => item.id !== id); log("Suppression", `${expense.label} · ${euro(expense.amount)}`, expense); renderAccounts(); await saveSharedState("Groupe", "Suppression de dépense"); }
function expenseRepayments(expense) { return repayments.filter((payment) => payment.expenseId === expense.id); }
function isExpenseResolved(expense) { const share = Number(expense.amount) / expense.participants.length; return expense.participants.filter((name) => name !== expense.payer).every((name) => expenseRepayments(expense).filter((payment) => payment.from === name && payment.to === expense.payer).reduce((sum, payment) => sum + Number(payment.amount), 0) >= share - 0.005); }
async function markExpenseRepayment(expenseId, from, to, amount) { if (!(await ensureEditAccess())) return; const expense = expenses.find((item) => item.id === expenseId); repayments.unshift({ id: String(Date.now()), expenseId, from, to, amount, at: new Date().toLocaleString("fr-FR") }); log("Remboursement coché", `${from} → ${to} · ${euro(amount)} · ${expense.label}`); showExpense(expenseId); renderAccounts(); await saveSharedState(from, "Remboursement coché"); }
function showExpense(id) { const expense = expenses.find((item) => item.id === id); if (!expense || !$("expense-detail")) return; const detail = $("expense-detail"); const share = Number(expense.amount) / expense.participants.length; detail.classList.remove("hidden"); detail.innerHTML = `<b>${esc(expense.label)}</b> · payé par ${expense.payer} · part individuelle ${euro(share)}<br><small>Cocher ici un remboursement vers la personne qui a avancé cette dépense. Une fois toutes les parts réglées, la dépense devient verte.</small><div class="expense-members">${expense.participants.map((name) => { if (name === expense.payer) return `<div><b>${name}</b><span>avance effectuée</span></div>`; const paid = expenseRepayments(expense).filter((payment) => payment.from === name && payment.to === expense.payer).reduce((sum, payment) => sum + Number(payment.amount), 0); const remaining = Math.max(0, share - paid); return `<div class="${remaining < 0.005 ? "done" : ""}"><b>${name}</b><span>${remaining < 0.005 ? "✓ part réglée" : `reste ${euro(remaining)}`}</span>${remaining < 0.005 ? "" : `<button onclick="markExpenseRepayment('${expense.id}','${name}','${expense.payer}',${remaining})">marquer réglé</button>`}</div>`; }).join("")}</div>`; }
async function restoreExpense(historyId) { const entry = history.find((item) => item.id === historyId); if (!entry?.snapshot || expenses.some((expense) => expense.id === entry.snapshot.id) || !(await ensureEditAccess())) return; expenses.unshift(entry.snapshot); log("Restauration", `${entry.snapshot.label} · ${euro(entry.snapshot.amount)}`); renderAccounts(); await saveSharedState("Groupe", "Restauration de dépense"); }
async function markRepayment(from, to, amount) { if (!(await ensureEditAccess())) return; repayments.unshift({ id: String(Date.now()), from, to, amount, at: new Date().toLocaleString("fr-FR") }); log("Remboursement coché", `${from} → ${to} · ${euro(amount)}`); renderAccounts(); await saveSharedState(from, "Remboursement coché"); }
async function undoRepayment(id) { const repayment = repayments.find((item) => item.id === id); if (!repayment || !(await ensureEditAccess())) return; repayments = repayments.filter((item) => item.id !== id); log("Remboursement annulé", `${repayment.from} → ${repayment.to} · ${euro(repayment.amount)}`); renderAccounts(); await saveSharedState("Groupe", "Remboursement annulé"); }
function showPerson(name) { if (!$("person-detail")) return; const { paid, owed, balance } = calc(); const relevant = expenses.filter((expense) => expense.payer === name || expense.participants.includes(name)); const personRepayments = repayments.filter((payment) => payment.from === name || payment.to === name); $("person-detail").innerHTML = `<b>${name}</b> · avancé ${euro(paid[name])} · part ${euro(owed[name])} · <b class="${balance[name] > 0.005 ? "positive" : balance[name] < -0.005 ? "negative" : ""}">${balance[name] > 0.005 ? "à recevoir " : balance[name] < -0.005 ? "à rembourser " : "à l’équilibre "}${euro(Math.abs(balance[name]))}</b><br><br><b>Dépenses concernées</b><br>${relevant.length ? relevant.map((expense) => expense.payer === name ? `${esc(expense.label)} : avance ${euro(expense.amount)} pour ${expense.participants.length} personne(s)` : `${esc(expense.label)} : part ${euro(expense.amount / expense.participants.length)}`).join("<br>") : "Aucune dépense."}<br><br><b>Remboursements cochés</b><br>${personRepayments.length ? personRepayments.map((payment) => payment.from === name ? `A remboursé ${payment.to} : ${euro(payment.amount)}` : `A reçu de ${payment.from} : ${euro(payment.amount)}`).join("<br>") : "Aucun pour le moment."}`; }
function renderAccounts() {
  if (!$("ledger-total")) return;
  const { paid, owed, balance } = calc(); const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0); const moves = suggested(balance);
  $("ledger-total").textContent = euro(total); $("expense-count").textContent = expenses.length; $("share-total").textContent = euro(Object.values(owed).reduce((a, b) => a + b, 0) / names.length);
  $("expense-list").innerHTML = expenses.length ? expenses.map((expense) => { const resolved = isExpenseResolved(expense); return `<li class="${resolved ? "resolved" : ""}"><span><b>${esc(expense.label)}</b><small>${esc(expense.category)} · payé par ${expense.payer} · ${expense.participants.length} personne(s) · ${expense.at || ""}</small></span><span><b>${resolved ? "✓ réglée" : euro(expense.amount)}</b><button class="text-action" onclick="showExpense('${expense.id}')">détail</button><button class="text-action" onclick="editExpense('${expense.id}')">modifier</button><button class="text-action delete" onclick="deleteExpense('${expense.id}')">supprimer</button></span></li>`; }).join("") : "<li>Aucune dépense saisie.</li>";
  $("balance-list").innerHTML = names.map((name) => { const balanceForName = balance[name]; const status = personStatus(name, balanceForName); const className = balanceForName > 0.005 ? "positive" : balanceForName < -0.005 ? "negative" : ""; return `<button class="person status-${status.tone}" onclick="showPerson('${name}')"><b>${name}</b><small>avancé ${euro(paid[name])} · part ${euro(owed[name])}</small><small class="${className}">${balanceForName > 0.005 ? "doit recevoir " : balanceForName < -0.005 ? "doit rembourser " : "à l’équilibre "}${euro(Math.abs(balanceForName))} · ${status.label}</small></button>`; }).join("");
  $("settlements").innerHTML = (moves.length ? moves.map((move) => `<div class="settlement ${move.a > 100 ? "urgent" : move.a > 50 ? "warning" : ""}"><span><b>${move.from}</b> rembourse <b>${move.to}</b> · ${euro(move.a)}${move.a > 100 ? " · priorité" : move.a > 50 ? " · important" : ""}</span><button onclick="markRepayment('${move.from}','${move.to}',${move.a})">✓ fait</button></div>`).join("") : '<div class="settlement done">Tout le monde est à l’équilibre.</div>') + (repayments.length ? `<hr><small>Déjà cochés</small>${repayments.map((payment) => `<div class="settlement done"><span><b>${payment.from}</b> → <b>${payment.to}</b> · ${euro(payment.amount)}</span><button onclick="undoRepayment('${payment.id}')">annuler</button></div>`).join("")}` : "");
  $("history").innerHTML = history.length ? history.map((entry) => `<li><button class="history-entry" type="button" onclick="showHistoryEntry('${entry.id}')"><b>${esc(entry.action)}</b> · ${esc(entry.text)}<small>${entry.at}</small></button>${entry.snapshot ? `<button class="text-action" onclick="restoreExpense('${entry.id}')" aria-label="Restaurer la dépense">↶</button>` : ""}</li>`).join("") : "<li>Aucun historique pour le moment.</li>";
}
function renderNotes() { if ($("group-notes") && document.activeElement !== $("group-notes")) $("group-notes").value = notes; }
async function saveGroupNotes() { if (!(await ensureEditAccess())) return; notes = $("group-notes").value.trim(); await saveSharedState("Groupe", "Mise à jour des notes"); }
function notesInit() { if (!$("group-notes")) return; renderNotes(); $("save-group-notes")?.addEventListener("click", saveGroupNotes); }
function decisionById(id) { return decisions.find((decision) => decision.id === id) || { id, status: id === "boat" ? "confirmé" : "à décider", note: "", updatedAt: "", updatedBy: "" }; }
function renderDecisions() {
  document.querySelectorAll("[data-decision]").forEach((card) => {
    const decision = decisionById(card.dataset.decision);
    card.classList.toggle("is-confirmed", decision.status === "confirmé");
    card.classList.toggle("is-progress", decision.status === "en cours");
    card.querySelector(".decision-state")?.remove();
    const badge = document.createElement("span"); badge.className = "decision-state"; badge.textContent = decision.status;
    card.append(badge);
  });
}
function closeDecisionModal() { $("decision-modal-root")?.remove(); }
function entryById(kind, id) {
  const entries = kind === "activity" ? activities : plans;
  const defaultStatus = kind === "activity" ? "à confirmer" : "prévu";
  return entries.find((entry) => entry.id === id) || { id, status: defaultStatus, note: "", participants: names, updatedAt: "", updatedBy: "" };
}
function closeEntryModal() { $("entry-modal-root")?.remove(); }
function renderEntryStates() {
  document.querySelectorAll("[data-activity]").forEach((card) => {
    const entry = entryById("activity", card.dataset.activity);
    card.querySelector(".entry-state")?.remove();
    const badge = document.createElement("span"); badge.className = "decision-state entry-state"; badge.textContent = entry.status;
    card.querySelector("summary")?.append(badge);
  });
}
function openEntryModal(kind, id, card) {
  const entry = entryById(kind, id);
  const title = card.querySelector(kind === "activity" ? "summary b" : "summary strong")?.textContent || "Détail";
  const subtitle = card.querySelector(kind === "activity" ? "summary small" : "summary small")?.textContent || "";
  const source = kind === "activity" ? card.querySelector(":scope > div") : card.querySelector(":scope > .detail");
  closeEntryModal();
  const root = document.createElement("div"); root.id = "entry-modal-root"; root.className = "decision-modal-backdrop";
  const statusOptions = kind === "activity" ? ["à confirmer", "réservé", "fait"] : ["prévu", "à confirmer", "fait"];
  root.innerHTML = `<section class="decision-modal entry-modal" role="dialog" aria-modal="true" aria-labelledby="entry-modal-title"><div class="decision-modal-head"><div><h3 id="entry-modal-title">${esc(title)}</h3><p>${esc(subtitle)}</p></div><button class="modal-close" type="button" aria-label="Fermer">×</button></div><div class="entry-modal-copy">${source?.innerHTML || ""}</div><label>État<select id="entry-status">${statusOptions.map((status) => `<option value="${status}">${status}</option>`).join("")}</select></label><label>Participants concernés<div class="entry-checks">${names.map((name) => `<label><input type="checkbox" value="${name}" ${entry.participants?.includes(name) ? "checked" : ""}>${name}</label>`).join("")}</div></label><label>Ton prénom<select id="entry-author">${names.map((name) => `<option>${name}</option>`).join("")}</select></label><label>Note partagée<textarea id="entry-note" placeholder="Ex. créneau réservé, conducteur, matériel à prendre, plan B…"></textarea></label><p class="entry-meta" id="entry-meta">${entry.updatedAt ? `Dernière mise à jour : ${esc(entry.updatedAt)} · ${esc(entry.updatedBy || "groupe")}` : "Aucune note partagée pour le moment."}</p><div class="decision-modal-actions"><button class="primary" id="entry-save" type="button">Enregistrer</button><button class="secondary" id="entry-done" type="button">Marquer comme fait</button></div></section>`;
  document.body.append(root); $("entry-status").value = entry.status; $("entry-note").value = entry.note || "";
  const save = async (forceDone = false) => {
    if (!(await ensureEditAccess())) return;
    const participants = [...document.querySelectorAll("#entry-modal-root .entry-checks input:checked")].map((input) => input.value);
    const next = { id, status: forceDone ? "fait" : $("entry-status").value, note: $("entry-note").value.trim(), participants, updatedBy: $("entry-author").value, updatedAt: new Date().toLocaleString("fr-FR") };
    if (kind === "activity") activities = [...activities.filter((item) => item.id !== id), next]; else plans = [...plans.filter((item) => item.id !== id), next];
    log(kind === "activity" ? "Activité mise à jour" : "Programme mis à jour", `${title} · ${next.status}`);
    renderEntryStates();
    if (await saveSharedState(next.updatedBy, kind === "activity" ? "Mise à jour d’une activité" : "Mise à jour du programme")) closeEntryModal();
  };
  root.addEventListener("click", (event) => { if (event.target === root || event.target.closest(".modal-close")) closeEntryModal(); });
  $("entry-save").onclick = () => save(false); $("entry-done").onclick = () => save(true);
}
function programmeInit() {
  document.querySelectorAll(".day[data-plan]").forEach((day) => {
    const detail = day.querySelector(":scope > .detail"); if (!detail || detail.querySelector(".day-modal-button")) return;
    const button = document.createElement("button"); button.type = "button"; button.className = "day-modal-button"; button.textContent = "Voir le détail complet";
    button.addEventListener("click", () => openEntryModal("plan", day.dataset.plan, day)); detail.append(button);
  });
}
function activityInit() {
  document.querySelectorAll(".activity-card[data-activity]").forEach((card) => {
    const summary = card.querySelector("summary"); if (!summary) return;
    summary.addEventListener("click", (event) => { event.preventDefault(); openEntryModal("activity", card.dataset.activity, card); });
  });
  renderEntryStates();
}
function showHistoryEntry(id) {
  const entry = history.find((item) => item.id === id); if (!entry) return;
  closeEntryModal();
  const root = document.createElement("div"); root.id = "entry-modal-root"; root.className = "decision-modal-backdrop";
  const snapshot = entry.snapshot ? `<div class="entry-meta"><b>Dépense restaurable</b><br>${esc(entry.snapshot.label)} · ${euro(entry.snapshot.amount)} · payé par ${esc(entry.snapshot.payer)}</div>` : "";
  root.innerHTML = `<section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="history-modal-title"><div class="decision-modal-head"><div><h3 id="history-modal-title">${esc(entry.action)}</h3><p>${esc(entry.at || "Historique du groupe")}</p></div><button class="modal-close" type="button" aria-label="Fermer">×</button></div><div class="entry-meta"><b>Détail</b><br>${esc(entry.text)}</div>${snapshot}${entry.snapshot ? `<div class="decision-modal-actions"><button class="primary" id="history-restore" type="button">↶ Restaurer cette dépense</button></div>` : ""}</section>`;
  document.body.append(root); root.addEventListener("click", (event) => { if (event.target === root || event.target.closest(".modal-close")) closeEntryModal(); });
  $("history-restore")?.addEventListener("click", async () => { await restoreExpense(id); closeEntryModal(); });
}
function openDecision(id, card) {
  const decision = decisionById(id); const title = card.querySelector("b")?.textContent || "Décision"; const description = card.querySelector("p")?.textContent || "";
  closeDecisionModal();
  const root = document.createElement("div"); root.id = "decision-modal-root"; root.className = "decision-modal-backdrop";
  root.innerHTML = `<section class="decision-modal" role="dialog" aria-modal="true" aria-labelledby="decision-modal-title"><div class="decision-modal-head"><div><h3 id="decision-modal-title">${esc(title)}</h3><p>${esc(description)}</p></div><button class="modal-close" type="button" aria-label="Fermer">×</button></div><label>État<select id="decision-status"><option value="à décider">À décider</option><option value="en cours">En cours</option><option value="confirmé">Confirmé</option></select></label><label>Ton prénom<select id="decision-author">${names.map((name) => `<option>${name}</option>`).join("")}</select></label><label>Note partagée<textarea id="decision-note" placeholder="Ex. créneau à privilégier, réponse reçue, point à vérifier…"></textarea></label><p class="local" id="decision-meta">${decision.updatedAt ? `Dernière mise à jour : ${esc(decision.updatedAt)} · ${esc(decision.updatedBy || "groupe")}` : "Pas encore de note partagée."}</p><div class="decision-modal-actions"><button class="primary" id="decision-save" type="button">Enregistrer la décision</button><button class="secondary" id="decision-confirm" type="button">Marquer comme confirmé</button></div></section>`;
  document.body.append(root); $("decision-status").value = decision.status; $("decision-note").value = decision.note || "";
  const save = async (forceConfirmed = false) => {
    if (!(await ensureEditAccess())) return;
    const next = { id, status: forceConfirmed ? "confirmé" : $("decision-status").value, note: $("decision-note").value.trim(), updatedBy: $("decision-author").value, updatedAt: new Date().toLocaleString("fr-FR") };
    decisions = [...decisions.filter((item) => item.id !== id), next]; log("Décision mise à jour", `${title} · ${next.status}`); renderDecisions();
    if (await saveSharedState(next.updatedBy, "Mise à jour d’une décision")) closeDecisionModal();
  };
  root.addEventListener("click", (event) => { if (event.target === root || event.target.closest(".modal-close")) closeDecisionModal(); });
  $("decision-save").onclick = () => save(false); $("decision-confirm").onclick = () => save(true);
}
function decisionInit() { document.querySelectorAll("[data-decision]").forEach((card) => { const open = () => openDecision(card.dataset.decision, card); card.addEventListener("click", open); card.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); } }); }); renderDecisions(); }
formInit(); notesInit(); programmeInit(); activityInit(); decisionInit(); renderAccounts(); loadSharedState(); startRealtime();
setInterval(() => { if (remoteLoaded && !isSaving) loadSharedState({ quiet: true }); }, 15000);
window.addEventListener("focus", () => { if (!isSaving) loadSharedState({ quiet: true }); });
