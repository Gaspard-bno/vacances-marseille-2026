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
  .forEach((b) =>
    b.addEventListener("click", () => renderBudget(b.dataset.budget)),
  );
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
  const margin = document.getElementById("personal-margin");
  margin.value = saved.margin ?? 10;
  const update = () => {
    const values = [...document.querySelectorAll("[data-personal-item]")].map(
      (input) => Math.max(0, Number(input.value) || 0),
    );
    const rate = Math.max(0, Number(margin.value) || 0);
    const subtotal = values.reduce((sum, value) => sum + value, 0);
    document.getElementById("personal-total").textContent = euro(
      Math.round(subtotal * (1 + rate / 100)),
    );
    localStorage.setItem(
      "marseille26-personal-budget-v1",
      JSON.stringify({ ...values, margin: rate }),
    );
  };
  rows.addEventListener("input", update);
  margin.addEventListener("input", update);
  document.getElementById("personal-reset").onclick = () => {
    localStorage.removeItem("marseille26-personal-budget-v1");
    [...document.querySelectorAll("[data-personal-item]")].forEach(
      (input, index) => (input.value = personalDefaultItems[index][1]),
    );
    margin.value = 10;
    update();
  };
  update();
}
initPersonalBudget();
const names = [
  "Arthur",
  "Aymeric",
  "Elouan",
  "Gaetan",
  "Gaspard",
  "Hélio",
  "Juliette",
  "Matys",
  "Yoel",
];
let expenses = JSON.parse(
    localStorage.getItem("marseille26-expenses-v3") ||
      localStorage.getItem("marseille26-expenses-v2") ||
      "[]",
  ).map((e) => ({ ...e, participants: e.participants || names })),
  history = JSON.parse(
    localStorage.getItem("marseille26-history-v3") ||
      localStorage.getItem("marseille26-history-v2") ||
      "[]",
  ),
  repayments = JSON.parse(
    localStorage.getItem("marseille26-repayments-v3") || "[]",
  ),
  editing = null;
const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s).replace(
    /[&<>'"]/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
        c
      ],
  );
function persist() {
  localStorage.setItem("marseille26-expenses-v3", JSON.stringify(expenses));
  localStorage.setItem("marseille26-history-v3", JSON.stringify(history));
  localStorage.setItem("marseille26-repayments-v3", JSON.stringify(repayments));
}
function log(action, text, snapshot = null) {
  history.unshift({
    id: `${Date.now()}-${Math.random()}`,
    action,
    text,
    snapshot,
    at: new Date().toLocaleString("fr-FR"),
  });
  history = history.slice(0, 120);
}
function calc() {
  const paid = Object.fromEntries(names.map((n) => [n, 0])),
    owed = Object.fromEntries(names.map((n) => [n, 0]));
  expenses.forEach((e) => {
    paid[e.payer] += Number(e.amount);
    const share = Number(e.amount) / e.participants.length;
    e.participants.forEach((n) => (owed[n] += share));
  });
  const balance = Object.fromEntries(names.map((n) => [n, paid[n] - owed[n]]));
  repayments.forEach((r) => {
    balance[r.from] += r.amount;
    balance[r.to] -= r.amount;
  });
  return { paid, owed, balance };
}
function suggested(balance) {
  const debtors = names
      .filter((n) => balance[n] < -0.005)
      .map((n) => ({ n, a: -balance[n] })),
    creditors = names
      .filter((n) => balance[n] > 0.005)
      .map((n) => ({ n, a: balance[n] })),
    out = [];
  let i = 0,
    j = 0;
  while (i < debtors.length && j < creditors.length) {
    const a = Math.min(debtors[i].a, creditors[j].a);
    out.push({ from: debtors[i].n, to: creditors[j].n, a });
    debtors[i].a -= a;
    creditors[j].a -= a;
    if (debtors[i].a < 0.005) i++;
    if (creditors[j].a < 0.005) j++;
  }
  return out;
}
function formInit() {
  if (!$("expense-payer")) return;
  $("expense-payer").innerHTML = names
    .map((n) => `<option>${n}</option>`)
    .join("");
  $("member-checks").innerHTML = names
    .map(
      (n) => `<label><input type="checkbox" value="${n}" checked> ${n}</label>`,
    )
    .join("");
  $("all-members").onclick = () =>
    document
      .querySelectorAll("#member-checks input")
      .forEach((i) => (i.checked = true));
  $("cancel-edit").onclick = resetForm;
  $("expense-form").onsubmit = saveExpense;
}
function resetForm() {
  editing = null;
  $("expense-form").reset();
  document
    .querySelectorAll("#member-checks input")
    .forEach((i) => (i.checked = true));
  $("expense-title").textContent = "Ajouter une dépense";
  $("expense-submit").textContent = "Ajouter la dépense";
  $("cancel-edit").classList.add("hidden");
}
function saveExpense(event) {
  event.preventDefault();
  const people = [
    ...document.querySelectorAll("#member-checks input:checked"),
  ].map((i) => i.value);
  if (!people.length) return alert("Choisis au moins une personne concernée.");
  const data = {
    id: editing || String(Date.now()),
    payer: $("expense-payer").value,
    category: $("expense-category").value,
    label: $("expense-label").value.trim(),
    amount: Number($("expense-amount").value),
    participants: people,
    at: new Date().toLocaleString("fr-FR"),
  };
  if (editing) {
    expenses[expenses.findIndex((e) => e.id === editing)] = data;
    log("Modification", `${data.label} · ${euro(data.amount)}`);
  } else {
    expenses.unshift(data);
    log("Ajout", `${data.label} · ${euro(data.amount)} payé par ${data.payer}`);
  }
  resetForm();
  renderAccounts();
}
function editExpense(id) {
  const e = expenses.find((e) => e.id === id);
  editing = id;
  $("expense-payer").value = e.payer;
  $("expense-category").value = e.category;
  $("expense-label").value = e.label;
  $("expense-amount").value = e.amount;
  document
    .querySelectorAll("#member-checks input")
    .forEach((i) => (i.checked = e.participants.includes(i.value)));
  $("expense-title").textContent = `Modifier : ${e.label}`;
  $("expense-submit").textContent = "Enregistrer la correction";
  $("cancel-edit").classList.remove("hidden");
  scrollTo({ top: 0, behavior: "smooth" });
}
function deleteExpense(id) {
  const e = expenses.find((e) => e.id === id);
  if (!confirm(`Supprimer « ${e.label} » ? À utiliser seulement en cas d’erreur : elle restera restaurable dans l’historique.`)) return;
  expenses = expenses.filter((e) => e.id !== id);
  log("Suppression", `${e.label} · ${euro(e.amount)}`, e);
  renderAccounts();
}
function expenseRepayments(expense) {
  return repayments.filter((r) => r.expenseId === expense.id);
}
function isExpenseResolved(expense) {
  const share = Number(expense.amount) / expense.participants.length;
  return expense.participants
    .filter((name) => name !== expense.payer)
    .every((name) =>
      expenseRepayments(expense)
        .filter((payment) => payment.from === name && payment.to === expense.payer)
        .reduce((sum, payment) => sum + payment.amount, 0) >= share - 0.005,
    );
}
function markExpenseRepayment(expenseId, from, to, amount) {
  const expense = expenses.find((entry) => entry.id === expenseId);
  repayments.unshift({
    id: String(Date.now()),
    expenseId,
    from,
    to,
    amount,
    at: new Date().toLocaleString("fr-FR"),
  });
  log("Remboursement coché", `${from} → ${to} · ${euro(amount)} · ${expense.label}`);
  showExpense(expenseId);
  renderAccounts();
}
function showExpense(id) {
  const expense = expenses.find((entry) => entry.id === id);
  if (!expense) return;
  const detail = $("expense-detail");
  const share = Number(expense.amount) / expense.participants.length;
  detail.classList.remove("hidden");
  detail.innerHTML = `<b>${esc(expense.label)}</b> · payé par ${expense.payer} · part individuelle ${euro(share)}<br><small>Cocher ici un remboursement vers la personne qui a avancé cette dépense. Une fois toutes les parts réglées, la dépense devient verte.</small><div class="expense-members">${expense.participants.map((name) => {
    if (name === expense.payer) return `<div><b>${name}</b><span>avance effectuée</span></div>`;
    const paid = expenseRepayments(expense).filter((payment) => payment.from === name && payment.to === expense.payer).reduce((sum, payment) => sum + payment.amount, 0);
    const remaining = Math.max(0, share - paid);
    return `<div class="${remaining < 0.005 ? "done" : ""}"><b>${name}</b><span>${remaining < 0.005 ? "✓ part réglée" : `reste ${euro(remaining)}`}</span>${remaining < 0.005 ? "" : `<button onclick="markExpenseRepayment('${expense.id}','${name}','${expense.payer}',${remaining})">marquer réglé</button>`}</div>`;
  }).join("")}</div>`;
}
function restoreExpense(historyId) {
  const entry = history.find((item) => item.id === historyId);
  if (!entry?.snapshot || expenses.some((expense) => expense.id === entry.snapshot.id)) return;
  expenses.unshift(entry.snapshot);
  log("Restauration", `${entry.snapshot.label} · ${euro(entry.snapshot.amount)}`);
  renderAccounts();
}
function markRepayment(from, to, amount) {
  repayments.unshift({
    id: String(Date.now()),
    from,
    to,
    amount,
    at: new Date().toLocaleString("fr-FR"),
  });
  log("Remboursement coché", `${from} → ${to} · ${euro(amount)}`);
  renderAccounts();
}
function undoRepayment(id) {
  const r = repayments.find((r) => r.id === id);
  repayments = repayments.filter((r) => r.id !== id);
  log("Remboursement annulé", `${r.from} → ${r.to} · ${euro(r.amount)}`);
  renderAccounts();
}
function showPerson(name) {
  const { paid, owed, balance } = calc(),
    relevant = expenses.filter(
      (e) => e.payer === name || e.participants.includes(name),
    ),
    reps = repayments.filter((r) => r.from === name || r.to === name);
  $("person-detail").innerHTML =
    `<b>${name}</b> · avancé ${euro(paid[name])} · part ${euro(owed[name])} · <b class="${balance[name] > 0.005 ? "positive" : balance[name] < -0.005 ? "negative" : ""}">${balance[name] > 0.005 ? "à recevoir " : balance[name] < -0.005 ? "à rembourser " : "à l’équilibre "}${euro(Math.abs(balance[name]))}</b><br><br><b>Dépenses concernées</b><br>${relevant.length ? relevant.map((e) => (e.payer === name ? `${esc(e.label)} : avance ${euro(e.amount)} pour ${e.participants.length} personne(s)` : `${esc(e.label)} : part ${euro(e.amount / e.participants.length)}`)).join("<br>") : "Aucune dépense."}<br><br><b>Remboursements cochés</b><br>${reps.length ? reps.map((r) => (r.from === name ? `A remboursé ${r.to} : ${euro(r.amount)}` : `A reçu de ${r.from} : ${euro(r.amount)}`)).join("<br>") : "Aucun pour le moment."}`;
}
function renderAccounts() {
  if (!$("ledger-total")) return;
  const { paid, owed, balance } = calc(),
    total = expenses.reduce((s, e) => s + Number(e.amount), 0),
    moves = suggested(balance);
  $("ledger-total").textContent = euro(total);
  $("expense-count").textContent = expenses.length;
  $("share-total").textContent = euro(
    Object.values(owed).reduce((a, b) => a + b, 0) / names.length,
  );
  $("expense-list").innerHTML = expenses.length
    ? expenses
        .map(
          (e) => {
            const resolved = isExpenseResolved(e);
            return `<li class="${resolved ? "resolved" : ""}"><span><b>${esc(e.label)}</b><small>${esc(e.category)} · payé par ${e.payer} · ${e.participants.length} personne(s) · ${e.at || ""}</small></span><span><b>${resolved ? "✓ réglée" : euro(e.amount)}</b><button class="text-action" onclick="showExpense('${e.id}')">détail</button><button class="text-action" onclick="editExpense('${e.id}')">modifier</button><button class="text-action delete" onclick="deleteExpense('${e.id}')">supprimer</button></span></li>`;
          },
        )
        .join("")
    : "<li>Aucune dépense saisie.</li>";
  $("balance-list").innerHTML = names
    .map((n) => {
      const b = balance[n],
        c = b > 0.005 ? "positive" : b < -0.005 ? "negative" : "";
      return `<button class="person ${b < -50 ? "urgent" : ""}" onclick="showPerson('${n}')"><b>${n}</b><small>avancé ${euro(paid[n])} · part ${euro(owed[n])}</small><small class="${c}">${b < -50 ? "⚠ priorité · " : ""}${b > 0.005 ? "doit recevoir " : b < -0.005 ? "doit rembourser " : "à l’équilibre "}${euro(Math.abs(b))}</small></button>`;
    })
    .join("");
  $("settlements").innerHTML =
    (moves.length
      ? moves
          .map(
            (m) =>
              `<div class="settlement ${m.a > 50 ? "urgent" : ""}"><span><b>${m.from}</b> rembourse <b>${m.to}</b> · ${euro(m.a)}${m.a > 50 ? " · priorité" : ""}</span><button onclick="markRepayment('${m.from}','${m.to}',${m.a})">✓ fait</button></div>`,
          )
          .join("")
      : '<div class="settlement done">Tout le monde est à l’équilibre.</div>') +
    (repayments.length
      ? `<hr><small>Déjà cochés</small>${repayments.map((r) => `<div class="settlement done"><span><b>${r.from}</b> → <b>${r.to}</b> · ${euro(r.amount)}</span><button onclick="undoRepayment('${r.id}')">annuler</button></div>`).join("")}`
      : "");
  $("history").innerHTML = history.length
    ? history
        .map(
          (h) =>
            `<li><span><b>${esc(h.action)}</b> · ${esc(h.text)}<small>${h.at}</small></span>${h.snapshot ? `<button class="text-action" onclick="restoreExpense('${h.id}')">restaurer</button>` : ""}</li>`,
        )
        .join("")
    : "<li>Aucun historique pour le moment.</li>";
  persist();
}
if ($("group-notes")) {
  $("group-notes").value = localStorage.getItem("marseille26-notes-v1") || "";
  $("group-notes").addEventListener("input", (e) =>
    localStorage.setItem("marseille26-notes-v1", e.target.value),
  );
}
formInit();
renderAccounts();
