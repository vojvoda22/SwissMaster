function showToast(message, type = "info", duration = 3000) {
  const container = document.getElementById("toast-container");
  if (!container) return; // Guard

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  let icon = "ℹ️";
  if (type === "success") icon = "✅";
  if (type === "error") icon = "⚠️";

  toast.innerHTML = `<span style="font-size:1.2rem">${icon}</span><span>${message}</span>`;

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.classList.add("hiding");
    toast.addEventListener("transitionend", () => toast.remove());
  }, duration);
}

function showAlert(message, title = "Hinweis") {
  document.getElementById("alert-title").innerText = title;
  document.getElementById("alert-message").innerText = message;
  document.getElementById("alert-modal").classList.remove("hidden");
}

function closeAlert() {
  document.getElementById("alert-modal").classList.add("hidden");
}

// --- IMPORT ---

function setupImportListener() {
  const input = document.getElementById("import-file-input");
  if (!input || input.dataset.bound === "true") return;
  input.dataset.bound = "true";

  input.addEventListener("change", async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        showAlert("Ungültige Datei: Kein gültiges JSON-Objekt.", "Import fehlgeschlagen");
        return;
      }

      // Minimal validation
      if (!parsed.teams || !parsed.rounds || !parsed.config) {
        showAlert("Ungültige Datei: Fehlende Turnierdaten.", "Import fehlgeschlagen");
        return;
      }

      if (
        !(await showConfirm(
          "Import überschreibt den aktuellen Turnierstand. Fortfahren?",
          "Import bestätigen",
        ))
      ) {
        return;
      }

      commitState();
      state = parsed;
      normalizeState();
      saveState();
      updateNavigation();
      lockSetup();
      renderAll();
      showSection("standings");
      showToast("Import erfolgreich.", "success");
    } catch (err) {
      console.error(err);
      showAlert("Import fehlgeschlagen: " + err.message, "Fehler");
    }
  });
}

// Global resolve for confirm
let confirmResolve = null;

function showConfirm(message, title = "Bestätigung") {
  return new Promise((resolve) => {
    document.getElementById("confirm-title").innerText = title;
    document.getElementById("confirm-message").innerText = message;
    document.getElementById("confirm-modal").classList.remove("hidden");

    const okBtn = document.getElementById("confirm-ok-btn");
    const cancelBtn = document.getElementById("confirm-cancel-btn");

    // Clone to clear listeners
    const newOk = okBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    okBtn.parentNode.replaceChild(newOk, okBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newOk.addEventListener("click", () => {
      closeConfirm();
      resolve(true);
    });

    newCancel.addEventListener("click", () => {
      closeConfirm();
      resolve(false);
    });

    // Also allow Escape key?
    // For simplicity, sticking to buttons.
  });
}

function closeConfirm() {
  document.getElementById("confirm-modal").classList.add("hidden");
}

// --- CONFIRM & MODAL HELPERS ---

function showExcludeModal() {
  const modal = document.getElementById("exclude-modal");
  const list = document.getElementById("exclude-teams-list");
  list.innerHTML = "";

  // Sort teams by name for easier selection
  const sortedTeams = [...state.teams].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  sortedTeams.forEach((t) => {
    const div = document.createElement("div");
    div.className = "exclude-item";
    div.innerHTML = `
            <input type="checkbox" id="exclude-${t.id}" value="${t.id}">
            <label for="exclude-${t.id}">${t.name}</label>
        `;
    // Allow clicking the whole row to toggle checkbox
    div.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        const cb = div.querySelector("input");
        cb.checked = !cb.checked;
      }
    });
    list.appendChild(div);
  });

  modal.classList.remove("hidden");
}

function closeExcludeModal() {
  document.getElementById("exclude-modal").classList.add("hidden");
}

function showExcludeSinglesModal() {
  const modal = document.getElementById("exclude-singles-modal");
  const list = document.getElementById("exclude-players-list");
  if (!modal || !list) return;
  list.innerHTML = "";

  const sortedPlayers = [...state.singles.players].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  sortedPlayers.forEach((p) => {
    const div = document.createElement("div");
    div.className = "exclude-item";
    div.innerHTML = `
            <input type="checkbox" id="exclude-player-${p.id}" value="${p.id}">
            <label for="exclude-player-${p.id}">${p.name}</label>
        `;
    div.addEventListener("click", (e) => {
      if (e.target.tagName !== "INPUT") {
        const cb = div.querySelector("input");
        cb.checked = !cb.checked;
      }
    });
    list.appendChild(div);
  });

  modal.classList.remove("hidden");
}

function closeExcludeSinglesModal() {
  document.getElementById("exclude-singles-modal").classList.add("hidden");
}

function toggleTheme() {
  state.theme = state.theme === "light" ? "dark" : "light";
  applyTheme();
  saveState();
}

function printActiveView() {
  window.print();
}


function applyRulesPreset(preset) {
  const presetConfig = RULES_PRESETS && RULES_PRESETS[preset];
  if (!presetConfig) return;

  const winInput = document.getElementById("points-win");
  const drawInput = document.getElementById("points-draw");

  state.config.pointsMatchWin = presetConfig.pointsMatchWin;
  state.config.pointsMatchDraw = presetConfig.pointsMatchDraw;
  state.config.pointsMatchLoss = presetConfig.pointsMatchLoss;
  state.config.pointsBye = presetConfig.pointsBye;
  state.config.rulesPreset = preset;

  if (winInput) winInput.value = presetConfig.pointsMatchWin;
  if (drawInput) drawInput.value = presetConfig.pointsMatchDraw;
}

function applySinglesRulesPreset(preset) {
  const presetConfig = RULES_PRESETS && RULES_PRESETS[preset];
  if (!presetConfig) return;

  const winInput = document.getElementById("points-win-singles");
  const drawInput = document.getElementById("points-draw-singles");

  state.singles.config.pointsWin = presetConfig.pointsMatchWin;
  state.singles.config.pointsDraw = presetConfig.pointsMatchDraw;
  state.singles.config.pointsLoss = presetConfig.pointsMatchLoss;
  state.singles.config.pointsBye = presetConfig.pointsBye;
  state.singles.config.rulesPreset = preset;

  if (winInput) winInput.value = presetConfig.pointsMatchWin;
  if (drawInput) drawInput.value = presetConfig.pointsMatchDraw;
}

function markPresetCustom() {
  const presetSelect = document.getElementById("rules-preset");
  if (presetSelect && presetSelect.value !== "CUSTOM") {
    presetSelect.value = "CUSTOM";
  }
}

function markSinglesPresetCustom() {
  const presetSelect = document.getElementById("rules-preset-singles");
  if (presetSelect && presetSelect.value !== "CUSTOM") {
    presetSelect.value = "CUSTOM";
  }
}

function setupPresetListeners() {
  const winInput = document.getElementById("points-win");
  const drawInput = document.getElementById("points-draw");
  const singlesWinInput = document.getElementById("points-win-singles");
  const singlesDrawInput = document.getElementById("points-draw-singles");

  const presetSelect = document.getElementById("rules-preset");
  if (presetSelect) {
    presetSelect.value = state.config.rulesPreset || "CUSTOM";
    presetSelect.addEventListener("change", () => {
      const val = presetSelect.value || "CUSTOM";
      if (val === "CUSTOM") {
        state.config.rulesPreset = "CUSTOM";
        saveState();
        return;
      }
      applyRulesPreset(val);
      saveState();
    });
  }

  if (winInput) winInput.addEventListener("input", markPresetCustom);
  if (drawInput) drawInput.addEventListener("input", markPresetCustom);

  const singlesPresetSelect = document.getElementById("rules-preset-singles");
  if (singlesPresetSelect) {
    singlesPresetSelect.value = state.singles.config.rulesPreset || "CUSTOM";
    singlesPresetSelect.addEventListener("change", () => {
      const val = singlesPresetSelect.value || "CUSTOM";
      if (val === "CUSTOM") {
        state.singles.config.rulesPreset = "CUSTOM";
        saveState();
        return;
      }
      applySinglesRulesPreset(val);
      saveState();
    });
  }

  if (singlesWinInput) singlesWinInput.addEventListener("input", markSinglesPresetCustom);
  if (singlesDrawInput) singlesDrawInput.addEventListener("input", markSinglesPresetCustom);

  // Round Robin Listener
  const pairingSelect = document.getElementById("pairing-system");
  if (pairingSelect) {
    pairingSelect.addEventListener("change", () => {
      const type = pairingSelect.value;
      const roundsInput = document.getElementById("total-rounds");
      const boardsInput = document.getElementById("boards-count");

      if (type === "ROUND_ROBIN") {
        // Calculate needed rounds
        let needed = 1;
        if (roundsInput) {
          const teamCount = state.teams.length;
          needed = teamCount < 2 ? 1 : (teamCount % 2 === 0 ? teamCount - 1 : teamCount);
          roundsInput.value = needed;
        }

        // Hide containers
        if (roundsInput) roundsInput.closest('.form-group').style.display = 'none';
        // boardsInput should remain visible for Team Round Robin!

        // Update State
        state.config.totalRounds = needed;

      } else {
        // Show containers
        if (roundsInput) {
          roundsInput.disabled = false;
          roundsInput.closest('.form-group').style.display = 'block';
        }
        if (boardsInput) {
          boardsInput.closest('.form-group').style.display = 'block';
        }
      }

      state.config.type = type;
      saveState();
    });
    // Sync form state on load when round-robin is already selected.
    if (state.config.type === "ROUND_ROBIN") {
      pairingSelect.dispatchEvent(new Event('change'));
    }
  }

  // Singles Round Robin Listener
  const singlesPairingSelect = document.getElementById("pairing-system-singles");
  if (singlesPairingSelect) {
    singlesPairingSelect.addEventListener("change", () => {
      const type = singlesPairingSelect.value;
      const roundsInput = document.getElementById("total-rounds-singles");

      if (type === "ROUND_ROBIN") {
        let needed = 1;
        if (roundsInput) {
          const playerCount = state.singles.players.length;
          needed = playerCount < 2 ? 1 : (playerCount % 2 === 0 ? playerCount - 1 : playerCount);
          roundsInput.value = needed;
        }

        if (roundsInput) roundsInput.closest('.form-group').style.display = 'none';

        state.singles.config.totalRounds = needed;

      } else {
        if (roundsInput) {
          roundsInput.disabled = false;
          roundsInput.closest('.form-group').style.display = 'block';
        }
      }

      state.singles.config.type = type;
      saveState();
    });

    if (state.singles.config.type === "ROUND_ROBIN") {
      singlesPairingSelect.dispatchEvent(new Event('change'));
    }
  }
}

function openPairingSwapModal() {
  if (state.currentRound === 0) {
    showAlert("Noch keine Paarungen vorhanden.", "Hinweis");
    return;
  }
  if (state.currentRound !== state.rounds.length) {
    showAlert("Nur die aktuelle Runde kann bearbeitet werden.", "Hinweis");
    return;
  }

  const round = state.rounds[state.currentRound - 1];
  const slotA = document.getElementById("swap-slot-a");
  const slotB = document.getElementById("swap-slot-b");
  if (!slotA || !slotB) return;

  const options = [];
  round.matches.forEach((m, idx) => {
    const tA = getTeam(m.teamA);
    if (tA) {
      options.push({
        value: `${idx}:teamA`,
        label: `Tisch ${m.table}: ${tA.name} (A)`,
      });
    }
    if (!m.isBye) {
      const tB = getTeam(m.teamB);
      if (tB) {
        options.push({
          value: `${idx}:teamB`,
          label: `Tisch ${m.table}: ${tB.name} (B)`,
        });
      }
    }
  });

  slotA.innerHTML = "";
  slotB.innerHTML = "";
  options.forEach((opt) => {
    const o1 = document.createElement("option");
    o1.value = opt.value;
    o1.textContent = opt.label;
    const o2 = document.createElement("option");
    o2.value = opt.value;
    o2.textContent = opt.label;
    slotA.appendChild(o1);
    slotB.appendChild(o2);
  });

  document.getElementById("pairing-swap-modal").classList.remove("hidden");
}

function closePairingSwapModal() {
  document.getElementById("pairing-swap-modal").classList.add("hidden");
}

function confirmPairingSwap() {
  const slotA = document.getElementById("swap-slot-a");
  const slotB = document.getElementById("swap-slot-b");
  if (!slotA || !slotB) return;

  const valA = slotA.value;
  const valB = slotB.value;
  if (!valA || !valB || valA === valB) {
    showAlert("Bitte zwei unterschiedliche Slots wählen.", "Hinweis");
    return;
  }

  const [idxA, sideA] = valA.split(":");
  const [idxB, sideB] = valB.split(":");
  const round = state.rounds[state.currentRound - 1];
  const matchA = round.matches[parseInt(idxA, 10)];
  const matchB = round.matches[parseInt(idxB, 10)];
  if (!matchA || !matchB) return;

  commitState();

  const keyA = sideA === "teamA" ? "teamA" : "teamB";
  const keyB = sideB === "teamA" ? "teamA" : "teamB";

  const tmp = matchA[keyA];
  matchA[keyA] = matchB[keyB];
  matchB[keyB] = tmp;

  [matchA, matchB].forEach((m) => {
    if (!m.isBye) {
      m.results = new Array(state.config.boardsPerMatch).fill(null);
    }
  });

  rebuildTeamHistoryFromRounds();
  saveState();
  closePairingSwapModal();
  renderAll();
  showSection("pairings");
  showToast("Paarungen aktualisiert.", "success");
}
