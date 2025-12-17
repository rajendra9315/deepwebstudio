let PASSWORD = localStorage.getItem("pwd") || "1234";
let data = JSON.parse(localStorage.getItem("journal")) || [];
let editIndex = null;

/* AUTH */
function unlock() {
  if (passwordInput.value === PASSWORD) {
    lockScreen.style.display = "none";
    app.style.display = "block";
    render();
  } else alert("Wrong password");
}

function changePassword() {
  const oldP = prompt("Enter old password");
  if (oldP !== PASSWORD) return alert("Wrong password");
  const newP = prompt("Enter new password");
  PASSWORD = newP;
  localStorage.setItem("pwd", newP);
  alert("Password changed");
}

/* SAVE */
function saveTransaction() {
  if (!date.value || !amount.value) return alert("Date & Amount required");

  const tx = {
    date: date.value,
    type: type.value,
    category: category.value,
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

/* RENDER + SEARCH */
function render() {
  journalBody.innerHTML = "";
  let totalIn = 0, totalOut = 0;
  const q = search.value.toLowerCase();

  data.forEach((t, i) => {
    if (
      q &&
      !(
        t.note.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        String(t.amount).includes(q)
      )
    ) return;

    if (t.type === "in") totalIn += t.amount;
    else totalOut += t.amount;

    journalBody.innerHTML += `
      <tr>
        <td>${t.date}</td>
        <td class="in">${t.type === "in" ? "₹" + t.amount : ""}</td>
        <td class="out">${t.type === "out" ? "₹" + t.amount : ""}</td>
        <td>${t.category}</td>
        <td title="${t.note}">${t.note}</td>
        <td>
          <button onclick="editTx(${i})">✏️</button>
          <button onclick="deleteTx(${i})" style="background:#dc2626">🗑</button>
        </td>
      </tr>
    `;
  });

  totalInEl.textContent = totalIn;
  totalOutEl.textContent = totalOut;
  netTotalEl.textContent = totalIn - totalOut;
}

/* EDIT / DELETE */
function editTx(i) {
  const t = data[i];
  date.value = t.date;
  type.value = t.type;
  category.value = t.category;
  amount.value = t.amount;
  note.value = t.note;
  editIndex = i;
}
function deleteTx(i) {
  if (confirm("Delete?")) {
    data.splice(i, 1);
    localStorage.setItem("journal", JSON.stringify(data));
    render();
  }
}

/* CALCULATOR */
function toggleCalc() {
  calculator.style.display =
    calculator.style.display === "none" ? "block" : "none";
}
function press(v) { calc.value += v; }
function calculate() { try { calc.value = eval(calc.value); } catch { calc.value = "Error"; } }
function clearCalc() { calc.value = ""; }

/* EXPORTS */
function exportExcel() {
  let csv = "Date,Type,Category,Amount,Note\n";
  data.forEach(t => {
    csv += `${t.date},${t.type},${t.category},${t.amount},"${t.note}"\n`;
  });
  download(csv, "journal.csv");
}

function exportMonth() {
  const m = prompt("Enter month (YYYY-MM)");
  let csv = "Date,Type,Category,Amount,Note\n";
  data.filter(t => t.date.startsWith(m)).forEach(t => {
    csv += `${t.date},${t.type},${t.category},${t.amount},"${t.note}"\n`;
  });
  download(csv, `journal-${m}.csv`);
}

function download(content, name) {
  const blob = new Blob([content]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
}

/* BACKUP */
function backupData() {
  download(JSON.stringify(data), "backup.json");
}
function restoreData() {
  const input = document.createElement("input");
  input.type = "file";
  input.onchange = e => {
    const r = new FileReader();
    r.onload = () => {
      data = JSON.parse(r.result);
      localStorage.setItem("journal", JSON.stringify(data));
      render();
    };
    r.readAsText(e.target.files[0]);
  };
  input.click();
}

/* INVOICE */
function openInvoice() {
  const client = prompt("Client name");
  invClient.textContent = client;
  invDate.textContent = new Date().toLocaleDateString();
  invBody.innerHTML = "";
  let total = 0;
  data.filter(t => t.type === "in").forEach(t => {
    total += t.amount;
    invBody.innerHTML += `<tr><td>${t.note}</td><td>₹${t.amount}</td></tr>`;
  });
  invTotal.textContent = total;
  invoice.style.display = "block";
  window.print();
  invoice.style.display = "none";
}
