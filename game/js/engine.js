// The rules of Kindlefall: warmth, embers, ward, resonance, and the Warden's turn.
// The engine owns the state and returns an event list for each step, so the view
// can animate what happened without owning any rule.

import { buildDeck, buildRivalDeck, makeRng, shuffle, SUITS } from './cards.js';

export const START_WARMTH = 44;
export const MAX_HAND = 8;
export const START_HAND = 5;
export const DRAW_PER_TURN = 2;

export function embersForTurn(turn) {
  if (turn <= 2) return 3;
  if (turn <= 4) return 4;
  if (turn <= 6) return 5;
  return 6;
}

export class Duel {
  constructor({ seed = 1, difficulty = 'steady' } = {}) {
    this.seed = seed >>> 0;
    this.rng = makeRng(this.seed);
    this.difficulty = difficulty;
    this.turn = 1;
    this.phase = 'player';
    this.over = false;
    this.winner = null;
    this.log = [];
    this.playedSuits = new Set();
    this.playedThisTurn = [];
    this.resonated = new Set();
    this.channelBonus = 0;
    this.intent = null;
    this.stats = { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, wardRaised: 0 };
    this.you = { warmth: START_WARMTH, ward: 0, embers: 0, hand: [], deck: [], discard: [] };
    this.rival = { warmth: START_WARMTH, ward: 0, embers: 0, hand: [], deck: [], discard: [] };
    this.you.deck = shuffle(buildDeck(), this.rng);
    this.rival.deck = shuffle(buildRivalDeck(), this.rng);
  }

  // --- setup -------------------------------------------------------------

  start() {
    const events = [];
    this.draw('you', START_HAND, events);
    this.draw('rival', START_HAND, events);
    this.you.embers = embersForTurn(1);
    this.intent = this.rivalIntent();
    this.note('The Warden takes its seat across the table.');
    events.push({ type: 'start' });
    return events;
  }

  note(text) {
    this.log.push(text);
    if (this.log.length > 40) this.log.shift();
  }

  // --- deck --------------------------------------------------------------

  draw(who, count, events = []) {
    const side = this[who];
    for (let i = 0; i < count; i += 1) {
      if (side.hand.length >= MAX_HAND) break;
      if (side.deck.length === 0) {
        if (side.discard.length === 0) break;
        side.deck = shuffle(side.discard, this.rng);
        side.discard = [];
        events.push({ type: 'reshuffle', who });
      }
      const card = side.deck.pop();
      side.hand.push(card);
      events.push({ type: 'draw', who, card });
    }
    return events;
  }

  // --- damage ------------------------------------------------------------

  damage(target, amount, pierce = false) {
    const side = this[target];
    const absorbed = pierce ? 0 : Math.min(side.ward, amount);
    side.ward -= absorbed;
    const dealt = amount - absorbed;
    side.warmth = Math.max(0, side.warmth - dealt);
    if (target === 'rival') this.stats.damageDealt += dealt;
    if (target === 'you') this.stats.damageTaken += dealt;
    if (side.warmth === 0) this.finish(target === 'rival' ? 'you' : 'rival');
    return { absorbed, dealt, pierce };
  }

  heal(target, amount) {
    const side = this[target];
    const before = side.warmth;
    side.warmth = Math.min(START_WARMTH, side.warmth + amount);
    return side.warmth - before;
  }

  finish(winner) {
    if (this.over) return;
    this.over = true;
    this.winner = winner;
    this.phase = 'over';
  }

  // --- the player's turn -------------------------------------------------

  playable(index) {
    if (this.phase !== 'player' || this.over) return false;
    const card = this.you.hand[index];
    return !!card && card.cost <= this.you.embers;
  }

  playCard(index) {
    const events = [];
    if (!this.playable(index)) return events;
    const card = this.you.hand.splice(index, 1)[0];
    this.you.embers -= card.cost;
    this.you.discard.push(card);
    this.playedThisTurn.push(card);
    this.stats.cardsPlayed += 1;
    events.push({ type: 'play', card });
    this.note(`You play ${card.name}.`);

    const comboOn = card.combo && this.playedSuits.has(card.combo.suit);
    for (const effect of card.effects) this.applyEffect('you', effect, events);
    if (comboOn) this.applyEffect('you', card.combo, events);

    this.playedSuits.add(card.suit);
    if (this.suitCount(card.suit) >= 2 && !this.resonated.has(card.suit)) {
      this.resonated.add(card.suit);
      events.push({ type: 'resonance', suit: card.suit });
      this.note(`${SUITS[card.suit].name} resonance.`);
      this.applyResonance(card.suit, events);
    }
    return events;
  }

  suitCount(suit) {
    return this.playedThisTurn.filter((c) => c.suit === suit).length;
  }

  applyEffect(who, effect, events) {
    if (this.over) return;
    const foe = who === 'you' ? 'rival' : 'you';
    switch (effect.kind) {
      case 'strike': {
        const hit = this.damage(foe, effect.amount);
        events.push({ type: 'damage', target: foe, dealt: hit.dealt, absorbed: hit.absorbed, amount: effect.amount });
        break;
      }
      case 'ward': {
        this[who].ward += effect.amount;
        if (who === 'you') this.stats.wardRaised += effect.amount;
        events.push({ type: 'ward', who, amount: effect.amount });
        break;
      }
      case 'heal': {
        const gained = this.heal(who, effect.amount);
        events.push({ type: 'heal', who, amount: gained });
        break;
      }
      case 'draw':
        this.draw(who, effect.amount, events);
        break;
      case 'ember':
        this[who].embers += effect.amount;
        events.push({ type: 'ember', who, amount: effect.amount });
        break;
      case 'selfDamage': {
        const hit = this.damage(who, effect.amount);
        events.push({ type: 'damage', target: who, dealt: hit.dealt, absorbed: hit.absorbed, amount: effect.amount });
        break;
      }
      default:
        break;
    }
  }

  applyResonance(suit, events) {
    if (suit === 'sun') this.applyEffect('you', { kind: 'strike', amount: 2 }, events);
    if (suit === 'moon') this.applyEffect('you', { kind: 'draw', amount: 1 }, events);
    if (suit === 'leaf') this.applyEffect('you', { kind: 'heal', amount: 2 }, events);
    if (suit === 'ash') this.applyEffect('you', { kind: 'ember', amount: 1 }, events);
  }

  // --- turn handover -----------------------------------------------------

  endTurn() {
    const events = [];
    if (this.phase !== 'player' || this.over) return events;
    if (this.you.embers >= 2) {
      const gain = 2;
      this.you.ward += gain;
      this.stats.wardRaised += gain;
      events.push({ type: 'ward', who: 'you', amount: gain, overcharge: true });
      this.note(`You bank ${this.you.embers} Embers as ${gain} Ward.`);
    }
    this.phase = 'rival';
    this.playedSuits = new Set();
    this.playedThisTurn = [];
    this.resonated = new Set();
    events.push({ type: 'endTurn' });
    return events;
  }

  rivalTurn() {
    const events = [];
    if (this.over) return events;
    this.rival.ward = 0;
    this.playedSuits = new Set();
    this.playedThisTurn = [];
    this.resonated = new Set();
    this.draw('rival', 1, events);
    const intent = this.intent || this.rivalIntent();
    this.note(`The Warden: ${intent.label}.`);
    events.push({ type: 'intentFire', intent });

    if (intent.kind === 'strike' || intent.kind === 'heavy' || intent.kind === 'drain') {
      const hit = this.damage('you', intent.amount, intent.kind === 'heavy');
      events.push({ type: 'damage', target: 'you', dealt: hit.dealt, absorbed: hit.absorbed, pierce: hit.pierce, amount: intent.amount });
      if (intent.kind === 'drain') {
        const gained = this.heal('rival', Math.max(2, Math.round(intent.amount / 2)));
        events.push({ type: 'heal', who: 'rival', amount: gained });
      }
    } else if (intent.kind === 'guard') {
      this.rival.ward += intent.amount;
      events.push({ type: 'ward', who: 'rival', amount: intent.amount });
    } else if (intent.kind === 'channel') {
      this.channelBonus += 3;
      events.push({ type: 'channel', amount: this.channelBonus });
    }

    if (this.rival.hand.length > 0) {
      this.rival.discard.push(this.rival.hand.pop());
      events.push({ type: 'rivalPlay' });
    }
    this.intent = this.rivalIntent();
    events.push({ type: 'newIntent', intent: this.intent });
    return events;
  }

  beginPlayerTurn() {
    const events = [];
    if (this.over) return events;
    this.turn += 1;
    this.phase = 'player';
    this.you.ward = 0;
    this.playedSuits = new Set();
    this.playedThisTurn = [];
    this.resonated = new Set();
    this.you.embers = embersForTurn(this.turn);
    events.push({ type: 'turn', turn: this.turn, embers: this.you.embers });
    this.draw('you', DRAW_PER_TURN, events);
    return events;
  }

  // --- the Warden's mind -------------------------------------------------

  rivalIntent() {
    const rng = this.rng;
    const turn = this.turn;
    const hard = this.difficulty === 'hollow';
    const easy = this.difficulty === 'kindled';
    const base = 5 + Math.floor(turn * 0.9) + (turn >= 5 ? 1 : 0) + (hard ? 1 : 0) - (easy ? 1 : 0);

    if (this.channelBonus > 0) {
      const amount = base + this.channelBonus;
      this.channelBonus = 0;
      return {
        kind: 'heavy',
        amount,
        label: `Heavy Strike ${amount}`,
        tell: 'It has wound up a heavy blow that Ward will not stop.',
      };
    }
    if (this.rival.warmth <= 10 && rng() < 0.4) {
      return {
        kind: 'drain',
        amount: Math.max(2, base - 1),
        label: `Drain ${Math.max(2, base - 1)}`,
        tell: 'It is drinking from your lantern.',
      };
    }
    const roll = rng();
    if (roll < 0.44) {
      return { kind: 'strike', amount: base, label: `Strike ${base}`, tell: 'It readies a quick cut.' };
    }
    if (roll < 0.74) {
      const amount = base + 2;
      return { kind: 'heavy', amount, label: `Heavy Strike ${amount}`, tell: 'It winds up a heavy blow that Ward will not stop.' };
    }
    if (roll < 0.86) {
      return { kind: 'guard', amount: base + 1, label: `Guard ${base + 1}`, tell: 'It raises a veil of bells.' };
    }
    if (roll < 0.94) {
      return {
        kind: 'drain',
        amount: Math.max(2, base - 1),
        label: `Drain ${Math.max(2, base - 1)}`,
        tell: 'It is drinking from your lantern.',
      };
    }
    return { kind: 'channel', amount: 0, label: 'Channel', tell: 'It gathers a cold breath.' };
  }
}
