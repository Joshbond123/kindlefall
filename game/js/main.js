// Kindlefall's front door: the title screen, the duel loop, and the two endings.

import { Duel } from './engine.js';
import { CARDS } from './cards.js';
import { TableView } from './view.js';
import { Soundboard } from './audio.js';
import * as art from './art.js';

const params = new URLSearchParams(window.location.search);
const sound = new Soundboard();
const view = new TableView(sound);
const overlay = document.getElementById('overlay');

let duel = null;
let difficulty = params.get('mode') || 'steady';
let busy = false;

const DIFFICULTIES = [
  { id: 'kindled', label: 'Kindled', note: 'a gentle warden' },
  { id: 'steady', label: 'Steady', note: 'a fair duel' },
  { id: 'hollow', label: 'Hollow', note: 'a cruel warden' },
];

function seedFromLink() {
  const given = Number(params.get('seed'));
  if (Number.isFinite(given) && given > 0) return given >>> 0;
  return (Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0;
}

/* ------------------------------------------------------------ overlays */

function openOverlay(html) {
  overlay.innerHTML = html;
  overlay.classList.add('is-open');
}

function closeOverlay() {
  overlay.classList.remove('is-open', 'is-soft');
  overlay.innerHTML = '';
}

function titleScreen() {
  const fan = view.previewFan([
    CARDS.sunlance, CARDS.moonveil, CARDS.rootbind, CARDS.ashenCrown, CARDS.gildedRay,
  ]);
  openOverlay(`
    <div class="panel title-panel">
      <div class="title-lantern">${art.lantern()}</div>
      <div class="eyebrow">a duel of lantern-keepers</div>
      <h1 class="title-word">KINDLEFALL</h1>
      <p class="title-sub">Two lanterns, one long night.</p>
      <p class="title-blurb">
        Burn the Warden's Warmth before yours gutters out. Embers pay for cards; leave two unspent
        and they bank as Ward. Play two cards of one suit in a turn to wake its resonance — but
        heavy blows pierce Ward, so read the intent above its hand before you spend your turn.
      </p>
      <div class="difficulty">
        ${DIFFICULTIES.map((d) => `
          <button class="diff${d.id === difficulty ? ' is-on' : ''}" type="button" data-mode="${d.id}">
            ${d.label}<br><span class="diff-note">${d.note}</span>
          </button>`).join('')}
      </div>
      <button class="begin" type="button" id="begin">Begin the duel</button>
      <p class="rules-line">Mouse and keyboard · click a card to play it · space ends your turn</p>
      <div class="title-fan">${fan}</div>
    </div>`);

  overlay.querySelectorAll('.diff').forEach((button) => {
    button.addEventListener('click', () => {
      difficulty = button.dataset.mode;
      sound.click();
      overlay.querySelectorAll('.diff').forEach((b) => b.classList.toggle('is-on', b === button));
    });
  });
  document.getElementById('begin').addEventListener('click', () => {
    sound.unlock();
    sound.click();
    startDuel();
  });
}

function endScreen(winner) {
  const won = winner === 'you';
  const stats = duel.stats;
  overlay.classList.add('is-soft');
  openOverlay(`
    <div class="panel">
      <div class="eyebrow">${won ? 'the night breaks' : 'the night closes in'}</div>
      <h2 class="verdict-word ${won ? 'win' : 'loss'}">${won ? 'THE LANTERN HOLDS' : 'THE LANTERN GUTTERS'}</h2>
      <p class="verdict-sub">${won
        ? 'The Hollow Warden folds its cold light away.'
        : 'Your flame sinks to the wick. The Warden watches on.'}</p>
      <p class="final-line">Your lantern <b>${duel.you.warmth}</b> · the Warden's <b>${duel.rival.warmth}</b></p>
      <div class="stat-row">
        <div class="stat"><span class="stat-value">${duel.turn}</span><span class="stat-label">Turns</span></div>
        <div class="stat"><span class="stat-value">${stats.damageDealt}</span><span class="stat-label">Damage dealt</span></div>
        <div class="stat"><span class="stat-value">${stats.cardsPlayed}</span><span class="stat-label">Cards played</span></div>
        <div class="stat"><span class="stat-value">${stats.wardRaised}</span><span class="stat-label">Ward raised</span></div>
      </div>
      <button class="begin" type="button" id="again">${won ? 'Duel again' : 'Try again'}</button>
      <p class="rules-line">Seed ${duel.seed} · ${difficulty} warden</p>
    </div>`);
  document.getElementById('again').addEventListener('click', () => { sound.click(); startDuel(); });
}

/* --------------------------------------------------------------- the loop */

function startDuel() {
  closeOverlay();
  duel = new Duel({ seed: seedFromLink(), difficulty });
  busy = true;
  view.setBusy(true);
  const opening = duel.start();
  view.render(duel, { deal: true });
  view.playSequence(opening, 90, () => {
    busy = false;
    view.setBusy(false);
    view.render(duel);
  });
}

function onPlay(index, cardEl) {
  if (busy || !duel || duel.over) return;
  if (!duel.playable(index)) return;
  const events = duel.playCard(index);
  view.flyCard(cardEl);
  view.applyEvents(events);
  view.render(duel);
  if (duel.over) finish();
}

function onEndTurn() {
  if (busy || !duel || duel.over) return;
  busy = true;
  view.setBusy(true);
  const closing = duel.endTurn();
  view.applyEvents(closing);
  view.render(duel);

  setTimeout(() => {
    if (duel.over) { finish(); return; }
    const rival = duel.rivalTurn();
    view.render(duel);
    view.playSequence(rival, 420, () => {
      if (duel.over) { finish(); return; }
      const opening = duel.beginPlayerTurn();
      view.render(duel, { deal: true });
      view.playSequence(opening, 120, () => {
        busy = false;
        view.setBusy(false);
        view.render(duel);
      });
    });
  }, 420);
}

function finish() {
  busy = true;
  view.setBusy(true);
  view.render(duel);
  if (duel.winner === 'you') { sound.victory(); view.burst(30); } else { sound.defeat(); }
  setTimeout(() => endScreen(duel.winner), 900);
}

/* ------------------------------------------------------------- wiring */

view.onPlay = onPlay;
view.onEndTurn = onEndTurn;

document.addEventListener('keydown', (event) => {
  if (overlay.classList.contains('is-open')) {
    if (event.key === 'Enter') {
      const begin = document.getElementById('begin') || document.getElementById('again');
      if (begin) begin.click();
    }
    return;
  }
  if (event.key === ' ' || event.key === 'Enter') {
    if (event.target instanceof HTMLElement && event.target.classList.contains('card')) return;
    event.preventDefault();
    onEndTurn();
  }
  if (/^[1-8]$/.test(event.key) && duel) {
    const index = Number(event.key) - 1;
    const el = view.el.hand.querySelector(`[data-index="${index}"]`);
    if (el) el.click();
  }
});

document.getElementById('btn-sound').addEventListener('click', (event) => {
  sound.enabled = !sound.enabled;
  const button = event.currentTarget;
  button.setAttribute('aria-pressed', String(sound.enabled));
  button.textContent = sound.enabled ? 'Sound on' : 'Sound off';
  if (sound.enabled) sound.click();
});

document.getElementById('btn-menu').addEventListener('click', () => {
  if (duel && !duel.over) duel.over = true;
  busy = true;
  titleScreen();
});

titleScreen();
document.body.dataset.ready = 'true';
