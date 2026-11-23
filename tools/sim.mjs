// Balance bench for Kindlefall: plays seeded duels against the real engine with a few
// player policies, so the Warden's numbers are set by measurement rather than by feel.
//
//   node tools/sim.mjs            # 400 seeds per difficulty, every policy
//   node tools/sim.mjs 100        # fewer seeds

import { Duel, START_WARMTH } from '../game/js/engine.js';

const SEEDS = Number(process.argv[2] || 400);

// Each policy scores a card from the duel's own state; the engine is never told about them.
const POLICIES = {
  // reads the intent, values ward against the blow that is coming, heals when low
  careful(duel, card) {
    let v = 0;
    const incoming = duel.intent && duel.intent.kind !== 'guard' && duel.intent.kind !== 'channel'
      ? duel.intent.amount
      : 0;
    for (const e of card.effects) {
      if (e.kind === 'strike') v += e.amount * 1.2;
      if (e.kind === 'ward') v += Math.min(e.amount, incoming) * 0.9 + e.amount * 0.15;
      if (e.kind === 'heal') v += Math.min(e.amount, START_WARMTH - duel.you.warmth) * 1.1;
      if (e.kind === 'draw') v += e.amount * 1.6;
      if (e.kind === 'ember') v += e.amount * 1.2;
      if (e.kind === 'selfDamage') v -= e.amount * (duel.you.warmth <= 10 ? 3 : 1.4);
    }
    if (card.combo && duel.playedSuits.has(card.combo.suit)) v += card.combo.amount;
    return v / Math.max(1, card.cost + 0.4);
  },
  // races: damage per ember, nothing else
  reckless(duel, card) {
    let v = 0;
    for (const e of card.effects) if (e.kind === 'strike') v += e.amount;
    return v / Math.max(1, card.cost);
  },
  // hoards: never spends, only banks embers as ward
  passive() {
    return 0;
  },
};

function playTurn(duel, policy) {
  for (let guard = 0; guard < 12; guard += 1) {
    const options = duel.you.hand
      .map((card, index) => ({ card, index }))
      .filter((o) => duel.playable(o.index))
      .map((o) => ({ ...o, score: policy(duel, o.card) }))
      .sort((a, b) => b.score - a.score);
    if (!options.length || options[0].score < 0.55) break;
    duel.playCard(options[0].index);
    if (duel.over) return;
  }
  duel.endTurn();
  duel.rivalTurn();
  if (duel.over) return;
  duel.beginPlayerTurn();
}

function run(policy, difficulty) {
  let wins = 0;
  let losses = 0;
  let stalls = 0;
  let turns = 0;
  let dealt = 0;
  let taken = 0;
  let warmthLeft = 0;
  for (let seed = 1; seed <= SEEDS; seed += 1) {
    const duel = new Duel({ seed, difficulty });
    duel.start();
    for (let n = 0; !duel.over && n < 120; n += 1) playTurn(duel, policy);
    if (!duel.over) stalls += 1;
    else if (duel.winner === 'you') wins += 1;
    else losses += 1;
    turns += duel.turn;
    dealt += duel.stats.damageDealt;
    taken += duel.stats.damageTaken;
    warmthLeft += duel.you.warmth;
  }
  const pct = (n) => `${((n / SEEDS) * 100).toFixed(0)}%`;
  return {
    win: pct(wins), loss: pct(losses), stall: stalls,
    turns: (turns / SEEDS).toFixed(1),
    dealt: (dealt / SEEDS).toFixed(1),
    taken: (taken / SEEDS).toFixed(1),
    left: (warmthLeft / SEEDS).toFixed(1),
  };
}

for (const [name, policy] of Object.entries(POLICIES)) {
  for (const difficulty of ['kindled', 'steady', 'hollow']) {
    const r = run(policy, difficulty);
    console.log(
      `${name.padEnd(9)} ${difficulty.padEnd(8)} win ${r.win.padStart(4)} loss ${r.loss.padStart(4)}`,
      `stall ${r.stall} turns ${r.turns} dealt ${r.dealt} taken ${r.taken} warmth left ${r.left}`,
    );
  }
}
