class Team {
  constructor(name, id) {
    this.id = id;
    this.name = name;
    this.mp = 0; // Match Points
    this.bp = 0; // Board Points
    this.buchholz = 0;
    this.medianBuchholz = 0;
    this.sonnebornBerger = 0;
    this.opponents = []; // List of team IDs played against
    this.colorHistory = []; // List of colors played ('W', 'B') or null for no-color (Bye)
    this.colorPreference = 0; // Calculated color preference (positive=wants White)
    this.hadBye = false;
    this.players = []; // Array of { name: string, id: string, boardOrder: number }
  }
}

class Match {
  constructor(roundNum, table, teamA, teamB) {
    this.id = `R${roundNum}-T${table}`;
    this.round = roundNum;
    this.table = table;
    this.teamA = teamA; // Team ID
    this.teamB = teamB; // Team ID or null (Bye)
    // Dynamic boards, defaults to null
    this.results = new Array(state.config.boardsPerMatch).fill(null);
    this.isBye = teamB === null;
    this.teamAColor = null; // 'W' or 'B' (Force color for Team A)
  }
}

class Player {
  constructor(name, id) {
    this.id = id;
    this.name = name;
    this.mp = 0; // Match Points
    this.buchholz = 0;
    this.opponents = [];
    this.colorHistory = [];
    this.colorPreference = 0;
    this.hadBye = false;
  }
}

class SingleMatch {
  constructor(roundNum, table, playerA, playerB) {
    this.id = `R${roundNum}-T${table}`;
    this.round = roundNum;
    this.table = table;
    this.playerA = playerA;
    this.playerB = playerB;
    this.isBye = playerB === null;
    this.result = null; // "1-0", "0.5-0.5", "0-1"
    this.playerAColor = null; // 'W' or 'B'
  }
}
