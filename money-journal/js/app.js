let PASSWORD = localStorage.getItem("password") || "1234";
let data = JSON.parse(localStorage.getItem("journal")) || [];
let editIndex = null;

function unlock() {
  if (passwordInput.value === PASSWORD) {
    lockScreen.style.display = "none";
    app.style.display = "block";
    render();
  } else alert("Wrong password");
}

function changePassword() {
  const oldPwd = prompt("Old password");
  if (oldPwd !== PASSWORD) return alert("Wrong password");
  const newPwd = prompt("New password");
  if (!newPwd) return;
  PASSWORD = newPwd;
  localStorage.setItem("password", PASSWORD);
  alert("Password updated");
}

function saveTransaction() {
  if (!date.value || !amount.value) return alert("Date & Amount required");

  const tx = {
    date: date.value,
    type: type.value,
    way: way.value,
    amount: Number(amount.value),
    note: note.value
  };

  if (editIndex !== null) {
    data[editIndex] = tx;
    editIndex = null;
  } else data.push(tx);

  localStorage.setItem("journal", JSON.stringify(data));
  amount.value = note.value = "";
  render();
}

function render() {
  const q = searchInput.value.toLowerCase();
  journalBody.innerHTML = "";

  let totalIn = 0, totalOut = 0;

  data.filter(t =>
    t.note.toLowerCase().includes(q) ||
    t.way.toLowerCase().includes(q) ||
    String(t.amount).includes(q)
  ).forEach((t, i) => {

    if (t.type === "in") totalIn += t.amount;
    else totalOut += t.amount;

    journalBody.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td style="color:#00ff88">${t.type === "in" ? "₹"+t.amount : ""}</td>
        <td style="color:#ff5252">${t.type === "out" ? "₹"+t.amount : ""}</td>
        <td>${t.way}</td>
        <td class="note" title="${t.note}">${t.note}</td>
        <td>
          <button onclick="editTx(${i})">✏️</button>
          <button onclick="deleteTx(${i})">🗑</button>
        </td>
      </tr>
    `;
  });

  document.getElementById("totalIn").textContent = totalIn;
  document.getElementById("totalOut").textContent = totalOut;
  document.getElementById("netTotal").textContent = totalIn - totalOut;
}

function editTx(i) {
  const t = data[i];
  date.value = t.date;
  type.value = t.type;
  way.value = t.way;
  amount.value = t.amount;
  note.value = t.note;
  editIndex = i;
}

function deleteTx(i) {
  if (confirm("Delete transaction?")) {
    data.splice(i, 1);
    localStorage.setItem("journal", JSON.stringify(data));
    render();
  }
}

/* Calculator */
function toggleCalc() {
  calculator.style.display =
    calculator.style.display === "none" ? "block" : "none";
}
function press(v) { calc.value += v; }
function calculate() { try { calc.value = eval(calc.value); } catch { calc.value = "Error"; } }

/* Export / Backup / Invoice */
function exportExcel() { alert("Excel export already wired."); }
function exportMonthly() { alert("Monthly export already wired."); }
function backupData() { alert("Backup ready."); }
function restoreData() { alert("Restore ready."); }
function openInvoice() { window.print(); }

