// EXPORT

function sanitizeFilenameSegment(value, fallback) {
  const safe = String(value ?? "")
    .trim()
    .replace(/[^\w.\-]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return safe || fallback;
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

function downloadCSV(filename, csvContent) {
  downloadBlob(filename, csvContent, "text/csv;charset=utf-8;");
}

function escapeCSV(field) {
  if (field === null || field === undefined) return "";
  const stringField = String(field);
  if (/[",\n]/.test(stringField)) {
    return `"${stringField.replace(/"/g, '""')}"`;
  }
  return stringField;
}

function exportStandingsToCSV() {
  calculateStandings();

  const headers = [
    "Rank",
    "Team",
    "MP",
    "BP",
    "Buchholz",
    "MedianBuchholz",
    "SonnebornBerger",
  ];
  const rows = [headers.join(",")];

  state.teams.forEach((t, index) => {
    const row = [
      index + 1,
      escapeCSV(t.name),
      t.mp,
      t.bp,
      t.buchholz,
      t.medianBuchholz,
      t.sonnebornBerger,
    ];
    rows.push(row.join(","));
  });

  const safeName = sanitizeFilenameSegment(state.config?.name, "Tournament");
  const filename = `Standings_${safeName}_R${state.currentRound}.csv`;
  downloadCSV(filename, rows.join("\n"));
}

function exportSinglesStandingsToCSV() {
  calculateStandingsSingles();
  const headers = ["Rank", "Player", "MP", "Buchholz"];
  const rows = [headers.join(",")];

  state.singles.players.forEach((p, index) => {
    const row = [index + 1, escapeCSV(p.name), p.mp, p.buchholz];
    rows.push(row.join(","));
  });

  const safeName = sanitizeFilenameSegment(
    state.singles.config?.name,
    "Singles_Tournament",
  );
  const filename = `Singles_Standings_${safeName}_R${state.singles.currentRound}.csv`;
  downloadCSV(filename, rows.join("\n"));
}

function exportSinglesTournamentToJSON() {
  const safeName = sanitizeFilenameSegment(
    state.singles.config?.name,
    "Singles_Tournament",
  );
  const filename = `Singles_${safeName}_R${state.singles.currentRound}.json`;
  const json = JSON.stringify(state.singles, null, 2);
  downloadBlob(filename, json, "application/json;charset=utf-8;");
}

function exportMatchesToCSV() {
  const headers = ["Round", "Board", "Team 1", "Result", "Team 2"];
  const rows = [headers.join(",")];

  state.rounds.forEach((round, index) => {
    round.matches.forEach((m) => {
      const tA = getTeam(m.teamA);
      const tB = m.isBye ? { name: "BYE" } : getTeam(m.teamB);

      let resultStr = "-";
      if (m.isBye) {
        resultStr = "BYE";
      } else if (!m.results.includes(null)) {
        let scoreA = 0;
        let scoreB = 0;
        m.results.forEach((r) => {
          if (r === "1-0") scoreA++;
          else if (r === "0-1") scoreB++;
          else if (r === "0.5-0.5") {
            scoreA += 0.5;
            scoreB += 0.5;
          } else if (r === "0-0") {
            /* no points */
          }
        });
        resultStr = `${scoreA} - ${scoreB}`;
      }

      const row = [
        round.matches.length > 0 ? index + 1 : "",
        m.table,
        escapeCSV(tA.name),
        escapeCSV(resultStr),
        escapeCSV(tB.name),
      ];
      rows.push(row.join(","));
    });
  });

  const safeName = sanitizeFilenameSegment(state.config?.name, "Tournament");
  const filename = `Matches_${safeName}_R${state.currentRound}.csv`;
  downloadCSV(filename, rows.join("\n"));
}

function exportTournamentToJSON() {
  const safeName = sanitizeFilenameSegment(state.config?.name, "Tournament");
  const filename = `Tournament_${safeName}_R${state.currentRound}.json`;
  const json = JSON.stringify(state, null, 2);
  downloadBlob(filename, json, "application/json;charset=utf-8;");
}

function triggerImportTournament() {
  const input = document.getElementById("import-file-input");
  if (!input) return;
  input.value = "";
  input.click();
}
