# SwissMaster - Swiss Team & Singles Chess Tournament Manager

SwissMaster is a browser-based tournament manager for chess events with support for:

- Team tournaments
- Singles tournaments
- Swiss system pairings
- Round-robin pairings
- Live standings, tiebreaks, and exports

It is implemented in plain HTML/CSS/JavaScript and stores data in `localStorage`.

## Features

- Two tournament modes:
  - `TEAM`
  - `SINGLES`
- Pairing systems:
  - `SWISS`
  - `ROUND_ROBIN`
- Team scoring:
  - Match points + board points
  - Configurable presets (`FIDE`, `USCF`, `CUSTOM`)
- Singles scoring:
  - Configurable win/draw/loss/bye points
  - Presets (`FIDE`, `USCF`, `CUSTOM`)
- Tiebreak support:
  - Buchholz
  - Median Buchholz (team mode)
  - Sonneborn-Berger (team mode)
- Round flow:
  - Exclude teams/players for a round (Swiss mode)
  - Bye handling
  - Undo/redo
- Data management:
  - Multi-tournament slot storage
  - JSON import/export
  - CSV export for standings and matches
- UI utilities:
  - Light/dark theme toggle
  - Print current view

## Quick Start

1. Open `index.html` directly in a browser.
2. Configure tournament settings in Setup.
3. Add teams or players.
4. Start the tournament.
5. Enter results and advance rounds.
6. Export standings/data as needed.

## Development

No build step is required.

Run from a local static server if you prefer:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Testing

Tests are plain Node.js scripts in `tests/`.

Run all tests:

```bash
for f in tests/test_*.js; do node "$f"; done
```

## Result Encoding

Team board results use:

- `1-0`
- `0.5-0.5`
- `0-1`
- `0-0` (for missing/forfeited board outcome)

Singles match results use:

- `1-0`
- `0.5-0.5`
- `0-1`

## Project Structure

```text
.
|-- index.html
|-- style.css
|-- js/
|   |-- main.js                 # app initialization and startup wiring
|   |-- config.js               # constants and rules presets
|   |-- models.js               # Team/Match/Player model classes
|   |-- export.js               # CSV/JSON export + import trigger
|   |-- logic/
|   |   |-- pairings.js         # Swiss + round-robin pairing engines
|   |   `-- standings.js        # scoring and tiebreak calculations
|   |-- state/
|   |   |-- core.js             # root app state
|   |   |-- normalize.js        # state shape normalization
|   |   |-- storage.js          # localStorage persistence + slots
|   |   `-- history.js          # undo/redo state history
|   `-- ui/
|       |-- core.js             # rendering and navigation helpers
|       |-- interactions.js     # modals, toasts, UI interactions
|       `-- actions.js          # tournament actions and mutations
`-- tests/
    `-- test_*.js               # coverage across logic/state/ui
```

## Storage

- Tournament metadata key: `swiss_manager_meta`
- Tournament data key pattern: `swiss_manager_data_<id>`
- Legacy single-save key migration is supported from `swiss_manager_data`

## License

No license file is currently included in this repository.
