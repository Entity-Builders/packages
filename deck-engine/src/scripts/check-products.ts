import {
  MUSIC_BINGO_PRODUCT_CATALOG,
  TRIVIA_BINGO_PRODUCT_CATALOG,
  validateBarajaProductCatalog,
} from '../products/index.js';

const errors = [MUSIC_BINGO_PRODUCT_CATALOG, TRIVIA_BINGO_PRODUCT_CATALOG].flatMap(
  (catalog) => validateBarajaProductCatalog(catalog)
);

if (errors.length > 0) {
  console.error('Baraja playable product catalog is invalid:');

  for (const error of errors) {
    console.error(`- ${error}`);
  }

  process.exit(1);
}

console.log('Baraja playable product catalog is valid.');
