// The table view: it draws the duel state into the page and plays the small
// flourishes — dealt cards, flying plays, floating numbers, ember bursts.

import { SUITS } from './cards.js';
import { START_WARMTH } from './engine.js';
import * as art from './art.js';

const $ = (id) => document.getElementById(id);
const FLOAT_MS = 1100;

export class TableView {
  constructor(sound) {
    this.sound = sound;
    this.onPlay = null;
    this.onEndTurn = null;
    this.busy = false;
    this.el = {
      table: $('table'),
      turnCount: $('turn-count'),
      turnLabel: $('turn-label'),
      rivalHand: $('rival-hand'),
      hand: $('hand'),
      embers: $('embers-pips'),
      deck: $('deck-value'),
      log: $('log'),
      intent: $('intent'),
      intentIcon: $('intent-icon'),
      intentTitle: $('intent-title'),
      intentTell: $('intent-tell'),
      floats: $('float-layer'),
      hint: $('hint'),
      end: $('btn-end'),
      flash: $('flash'),
    };
    this.el.brand = $('brand-sigil');
    this.el.brand.innerHTML = art.lantern('#e6c079');
    $('lantern').innerHTML = art.lantern();
    $('rival-portrait').innerHTML = art.wardenPortrait();
    $('player-portrait').innerHTML = art.keeperPortrait();
    $('rival-ward-icon').innerHTML = art.wardShield();
    $('player-ward-icon').innerHTML = art.wardShield();
    $('deck-icon').innerHTML = art.deckIcon();

    this.el.hand.addEventListener('click', (event) => {
      const card = event.target.closest('.card');
      if (!card || card.classList.contains('unplayable') || this.busy) return;
      if (this.onPlay) this.onPlay(Number(card.dataset.index), card);
    });
    this.el.end.addEventListener('click', () => {
      if (!this.busy && this.onEndTurn) this.onEndTurn();
    });
  }

  setBusy(value) {
    this.busy = value;
    this.el.end.disabled = value;
  }

  /* ------------------------------------------------------------- drawing */

  render(duel, { deal = false } = {}) {
    this.renderVitals('rival', duel.rival);
    this.renderVitals('player', duel.you);
    this.el.turnCount.textContent = `Turn ${duel.turn}`;
    this.el.turnLabel.textContent = duel.phase === 'rival' ? 'The Warden acts' : 'Your turn';
    this.el.turnLabel.classList.toggle('is-rival', duel.phase === 'rival');
    this.renderEmbers(duel.you.embers);
    this.el.deck.textContent = String(duel.you.deck.length);
    this.renderIntent(duel.intent);
    this.renderResonance(duel);
    this.renderRivalHand(duel.rival.hand.length);
    this.renderHand(duel, deal);
    this.renderLog(duel.log);
    this.el.hint.textContent = duel.you.embers >= 2
      ? 'Bank 2 Embers by ending your turn to gain 2 Ward.'
      : 'Play cards, then end your turn.';
  }

  renderVitals(who, side) {
    const fill = $(`${who}-warmth-fill`);
    const value = $(`${who}-warmth-value`);
    fill.style.width = `${(side.warmth / START_WARMTH) * 100}%`;
    value.textContent = String(side.warmth);
    value.classList.toggle('low', side.warmth <= 8);
    const chip = $(`${who}-ward-chip`);
    $(`${who}-ward-value`).textContent = String(side.ward);
    chip.classList.toggle('is-zero', side.ward === 0);
  }

  renderEmbers(count) {
    const pips = this.el.embers;
    while (pips.children.length < 6) {
      const pip = document.createElement('span');
      pip.className = 'pip spent';
      pips.appendChild(pip);
    }
    Array.from(pips.children).forEach((pip, i) => {
      pip.classList.toggle('spent', i >= count);
      pip.style.animationDelay = `${i * 40}ms`;
    });
  }

  renderIntent(intent) {
    if (!intent) return;
    this.el.intentIcon.innerHTML = art.intentIcon(intent.kind);
    this.el.intentTitle.textContent = intent.label;
    this.el.intentTell.textContent = intent.tell || '';
    this.el.intent.classList.toggle('is-heavy', intent.kind === 'heavy');
  }

  renderRivalHand(count) {
    const row = this.el.rivalHand;
    row.innerHTML = '';
    for (let i = 0; i < count; i += 1) {
      const back = document.createElement('span');
      back.className = 'card-back';
      back.style.animationDelay = `${i * 55}ms`;
      back.innerHTML = art.cardBack();
      row.appendChild(back);
    }
  }

  renderHand(duel, deal) {
    const hand = this.el.hand;
    hand.classList.toggle('is-tight', duel.you.hand.length >= 7);
    hand.innerHTML = '';
    duel.you.hand.forEach((card, index) => {
      hand.appendChild(this.cardElement(card, index, duel, deal));
    });
  }

  cardMarkup(card) {
    const suit = SUITS[card.suit];
    return `
      <span class="card-cost">${card.cost}</span>
      <span class="card-suit">${art.suitGlyph(card.suit)}</span>
      <span class="card-art">${art.cardArt(card)}</span>
      <span class="card-body">
        <span class="card-name">${card.name}</span>
        <span class="card-text">${card.text}</span>
      </span>
      <span class="card-power">${card.power}</span>
      <span class="sr-only">${suit.name} suit</span>`;
  }

  cardElement(card, index, duel, deal) {
    const suit = SUITS[card.suit];
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `card suit-${card.suit}${duel.playable(index) ? '' : ' unplayable'}`;
    el.dataset.index = String(index);
    el.style.setProperty('--tilt', `${(index - (duel.you.hand.length - 1) / 2) * 1.6}deg`);
    if (deal) el.style.animationDelay = `${index * 70}ms`;
    el.setAttribute('aria-label', `${card.name}, ${suit.name}, cost ${card.cost}, ${card.text}`);
    el.innerHTML = this.cardMarkup(card);
    return el;
  }

  previewFan(cards) {
    return cards.map((card, i) => `
      <span class="card preview suit-${card.suit}" style="--tilt:${(i - (cards.length - 1) / 2) * 2.4}deg">
        ${this.cardMarkup(card)}
      </span>`).join('');
  }

  renderResonance(duel) {
    const row = this.el.resonance || $('resonance');
    if (!row) return;
    row.innerHTML = `<span class="res-title">suits this turn</span>` + Object.values(SUITS).map((suit) => {
      const count = duel.playedThisTurn.filter((c) => c.suit === suit.id).length;
      const woke = duel.resonated.has(suit.id);
      return `<span class="res-medal${count ? ' is-lit' : ''}${woke ? ' is-resonant' : ''}"
                    style="--glow:${suit.colour}"
                    title="${suit.name}: ${suit.rite}">
                ${art.suitGlyph(suit.id)}
                ${count ? `<span class="res-count">${count}</span>` : ''}
              </span>`;
    }).join('');
  }

  renderLog(lines) {
    const shown = lines.slice(-5).reverse();
    this.el.log.innerHTML = shown.map((line) => `<div class="log-line">${line}</div>`).join('');
  }

  /* ------------------------------------------------------------ flourishes */

  flyCard(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const clone = cardEl.cloneNode(true);
    clone.classList.add('is-playing');
    clone.classList.remove('unplayable');
    Object.assign(clone.style, {
      position: 'fixed',
      left: `${rect.left}px`,
      top: `${rect.top}px`,
      margin: '0',
      animationDelay: '0ms',
      zIndex: '40',
    });
    document.body.appendChild(clone);
    this.sound.play();
    setTimeout(() => clone.remove(), 520);
  }

  floatAt(x, y, text, kind = '') {
    const node = document.createElement('div');
    node.className = `float-text ${kind}`;
    node.textContent = text;
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    this.el.floats.appendChild(node);
    setTimeout(() => node.remove(), FLOAT_MS);
  }

  floatOn(who, text, kind = '') {
    const box = this.el.floats.getBoundingClientRect();
    const x = box.width * (0.42 + Math.random() * 0.16);
    const y = who === 'rival' ? box.height * 0.22 : box.height * 0.74;
    this.floatAt(x, y, text, kind);
  }

  shake() {
    const table = this.el.table;
    table.classList.remove('shake');
    void table.offsetWidth;
    table.classList.add('shake');
    setTimeout(() => table.classList.remove('shake'), 420);
  }

  flashHit() {
    this.el.flash.classList.remove('hit');
    void this.el.flash.offsetWidth;
    this.el.flash.classList.add('hit');
  }

  /* -------------------------------------------------------------- effects */

  applyEvents(events) {
    for (const event of events) {
      if (event.type === 'damage') {
        const who = event.target === 'rival' ? 'rival' : 'you';
        if (event.dealt > 0) {
          this.floatOn(who, `−${event.dealt}`);
          if (who === 'you') { this.shake(); this.flashHit(); }
          this.sound.hit();
        }
        if (event.absorbed > 0) {
          this.floatOn(who, `${event.absorbed} warded`, 'warded');
          this.sound.ward();
        }
        if (event.pierce) {
          this.floatOn(who, 'pierced', 'pierced');
          this.sound.hit();
        }
      } else if (event.type === 'ward') {
        this.floatOn(event.who === 'rival' ? 'rival' : 'you', `+${event.amount} Ward`, 'warded');
        this.sound.ward();
      } else if (event.type === 'heal') {
        if (event.amount > 0) {
          this.floatOn(event.who === 'rival' ? 'rival' : 'you', `+${event.amount}`, 'healed');
          this.sound.heal();
        }
      } else if (event.type === 'ember') {
        this.floatOn('you', `+${event.amount} Ember`, 'warded');
        this.sound.ember();
      } else if (event.type === 'draw') {
        if (event.who === 'you') this.sound.deal();
      } else if (event.type === 'resonance') {
        this.floatOn('you', `${SUITS[event.suit].name} resonance`, 'healed');
      } else if (event.type === 'channel') {
        this.floatOn('rival', 'gathering force', 'warded');
      }
    }
  }

  playSequence(events, stepMs, done) {
    let i = 0;
    const step = () => {
      if (i >= events.length) { if (done) done(); return; }
      this.applyEvents([events[i]]);
      i += 1;
      setTimeout(step, stepMs);
    };
    step();
  }

  burst(count = 26) {
    const box = this.el.floats.getBoundingClientRect();
    for (let i = 0; i < count; i += 1) {
      const p = document.createElement('span');
      p.className = 'ember-particle';
      p.style.left = `${box.width * (0.35 + Math.random() * 0.3)}px`;
      p.style.top = `${box.height * (0.45 + Math.random() * 0.2)}px`;
      p.style.setProperty('--dx', `${(Math.random() - 0.5) * 260}px`);
      p.style.setProperty('--dy', `${-60 - Math.random() * 180}px`);
      p.style.animationDelay = `${Math.random() * 260}ms`;
      this.el.floats.appendChild(p);
      setTimeout(() => p.remove(), 2400);
    }
  }
}
