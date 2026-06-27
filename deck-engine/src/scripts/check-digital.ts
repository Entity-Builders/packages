import assert from 'node:assert/strict';
import {
  DECKS,
  drawCards,
  flipCardFace,
  getDeckCatalogBreadcrumb,
  getDeckCatalogFacet,
  getDeckCatalogValidationErrors,
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
assert.deepEqual(getDeckCatalogValidationErrors(barometro), []);

const barometroFacet = getDeckCatalogFacet(barometro);
assert.equal(barometroFacet.collectionId, 'self-work');
assert.equal(barometroFacet.categoryId, 'emotional-regulation');

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

const sobremesa = DECKS['juego-de-cartas-para-jugar-entre-amigos-en-una-juntada'];
assert.deepEqual(getDeckCatalogValidationErrors(sobremesa), []);
assert.deepEqual(
  getDeckCatalogBreadcrumb(sobremesa).map((item) => item.label),
  ['Juegos sociales', 'Entre amigos', sobremesa.name]
);

for (const deck of Object.values(DECKS)) {
  if (deck.digital?.is_published === true) {
    assert.deepEqual(getDeckCatalogValidationErrors(deck), []);
  }
}

console.log('[deck-engine] digital helpers OK');
