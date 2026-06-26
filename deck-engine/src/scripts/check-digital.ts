import assert from 'node:assert/strict';
import {
  DECKS,
  drawCards,
  flipCardFace,
  getDeckSessionModes,
  getDefaultSessionMode,
  getPreviewCards,
  getPrintableAccess,
  getShareableCardPayload,
  isCardPreviewable,
  shouldRenderPrintableQr,
} from '../index.js';

const barometro = DECKS.barometro;

assert.equal(barometro.id, 'barometro-v1');
assert.equal(barometro.digital?.category, 'emotional-regulation');

const previewCards = getPreviewCards(barometro);
assert.deepEqual(
  previewCards.map((card) => card.id),
  ['barometro-01', 'barometro-02', 'barometro-03']
);

assert.equal(getDefaultSessionMode(barometro), 'solo');
assert.ok(getDeckSessionModes(barometro).includes('facilitator'));
assert.equal(flipCardFace('front'), 'back');
assert.equal(flipCardFace('back'), 'front');
assert.equal(isCardPreviewable(barometro, 'barometro-03'), true);
assert.equal(isCardPreviewable(barometro, 'barometro-04'), false);

const firstDraw = drawCards(barometro, {
  count: 3,
  seed: 'barometro-demo',
}).map((card) => card.id);
const secondDraw = drawCards(barometro, {
  count: 3,
  seed: 'barometro-demo',
}).map((card) => card.id);

assert.deepEqual(firstDraw, secondDraw);
assert.equal(firstDraw.length, 3);

const printable = getPrintableAccess(barometro);
assert.equal(printable?.enabled, true);
assert.ok(printable.license_scopes.includes('personal_print'));
assert.ok(printable.license_scopes.includes('business_internal'));
assert.equal(shouldRenderPrintableQr(barometro), true);
assert.equal(shouldRenderPrintableQr({ digital: { printable: { enabled: false, license_scopes: [] } } }), false);

const shareable = getShareableCardPayload(barometro, 'barometro-01');
assert.equal(shareable?.phrase, barometro.cards[0]?.back.phrase);
assert.equal(shareable?.previewable, true);

console.log('[deck-engine] digital helpers OK');
