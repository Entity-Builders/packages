import type {
  BarajaProductCatalog,
  BarajaProduct,
  CampaignLanding,
  DigitalCompanion,
  GameEdition,
  GameTemplate,
  PrintablePack,
  ProductOffering,
} from './types.js';

const REQUIRED_MUSIC_BINGO_EXCLUSIONS = [
  'audio_files',
  'music_rights',
  'public_performance',
  'official_playlists',
  'physical_printing',
  'shipping',
];

export function validateBarajaProductCatalog(catalog: BarajaProductCatalog): string[] {
  const errors: string[] = [];
  const productIds = collectUniqueIds('product', catalog.products, errors);
  const templateIds = collectUniqueIds('template', catalog.templates, errors);
  const editionIds = collectUniqueIds('edition', catalog.editions, errors);
  const packIds = collectUniqueIds('printable pack', catalog.printablePacks, errors);
  const companionIds = collectUniqueIds('digital companion', catalog.digitalCompanions, errors);
  const offeringIds = collectUniqueIds('offering', catalog.offerings, errors);
  const landingIds = collectUniqueIds('campaign landing', catalog.campaignLandings, errors);

  validateProducts(catalog.products, errors);
  validateTemplates(catalog.templates, errors);
  validateEditions(catalog.editions, productIds, templateIds, errors);
  validatePrintablePacks(catalog.printablePacks, editionIds, packIds, errors);
  validateDigitalCompanions(catalog.digitalCompanions, editionIds, companionIds, errors);
  validateOfferings(catalog.offerings, productIds, editionIds, offeringIds, errors);
  validateCampaignLandings(
    catalog.campaignLandings,
    productIds,
    editionIds,
    offeringIds,
    landingIds,
    errors
  );

  return errors;
}

function collectUniqueIds(
  label: string,
  records: Array<{ id: string }>,
  errors: string[]
): Set<string> {
  const ids = new Set<string>();

  for (const record of records) {
    if (!record.id.trim()) {
      errors.push(`${label} has an empty id`);
      continue;
    }

    if (ids.has(record.id)) {
      errors.push(`${label} id "${record.id}" is duplicated`);
    }

    ids.add(record.id);
  }

  return ids;
}

function validateProducts(products: BarajaProduct[], errors: string[]) {
  for (const product of products) {
    if (product.kind === 'music_bingo') {
      const exclusionIds = new Set(product.legal.exclusions.map((exclusion) => exclusion.id));

      for (const requiredId of REQUIRED_MUSIC_BINGO_EXCLUSIONS) {
        if (!exclusionIds.has(requiredId)) {
          errors.push(`music bingo product "${product.id}" is missing legal exclusion "${requiredId}"`);
        }
      }

      if (product.legal.organizerResponsibilities.length === 0) {
        errors.push(`music bingo product "${product.id}" must define organizer responsibilities`);
      }
    }
  }
}

function validateTemplates(templates: GameTemplate[], errors: string[]) {
  for (const template of templates) {
    if (template.requiredAssetKinds.length === 0) {
      errors.push(`template "${template.id}" must define required asset kinds`);
    }
  }
}

function validateEditions(
  editions: GameEdition[],
  productIds: Set<string>,
  templateIds: Set<string>,
  errors: string[]
) {
  for (const edition of editions) {
    if (!productIds.has(edition.productId)) {
      errors.push(`edition "${edition.id}" references missing product "${edition.productId}"`);
    }

    if (!templateIds.has(edition.templateId)) {
      errors.push(`edition "${edition.id}" references missing template "${edition.templateId}"`);
    }
  }
}

function validatePrintablePacks(
  packs: PrintablePack[],
  editionIds: Set<string>,
  packIds: Set<string>,
  errors: string[]
) {
  void packIds;

  for (const pack of packs) {
    if (!editionIds.has(pack.editionId)) {
      errors.push(`printable pack "${pack.id}" references missing edition "${pack.editionId}"`);
    }

    const assetIds = new Set<string>();

    for (const asset of pack.assets) {
      if (assetIds.has(asset.id)) {
        errors.push(`printable pack "${pack.id}" has duplicated asset id "${asset.id}"`);
      }

      assetIds.add(asset.id);

      if (asset.status === 'delivered' && !asset.fileKey) {
        errors.push(`printable asset "${asset.id}" is delivered but has no fileKey`);
      }
    }
  }
}

function validateDigitalCompanions(
  companions: DigitalCompanion[],
  editionIds: Set<string>,
  companionIds: Set<string>,
  errors: string[]
) {
  void companionIds;

  for (const companion of companions) {
    if (!editionIds.has(companion.editionId)) {
      errors.push(`digital companion "${companion.id}" references missing edition "${companion.editionId}"`);
    }

    if (companion.qrEnabled && !companion.route.startsWith('/')) {
      errors.push(`digital companion "${companion.id}" has QR enabled but route is not absolute`);
    }
  }
}

function validateOfferings(
  offerings: ProductOffering[],
  productIds: Set<string>,
  editionIds: Set<string>,
  offeringIds: Set<string>,
  errors: string[]
) {
  void offeringIds;

  for (const offering of offerings) {
    if (!productIds.has(offering.productId)) {
      errors.push(`offering "${offering.id}" references missing product "${offering.productId}"`);
    }

    if (offering.editionId && !editionIds.has(offering.editionId)) {
      errors.push(`offering "${offering.id}" references missing edition "${offering.editionId}"`);
    }

    if (offering.commercialResaleAllowed) {
      errors.push(`offering "${offering.id}" allows commercial resale in the pilot catalog`);
    }
  }
}

function validateCampaignLandings(
  landings: CampaignLanding[],
  productIds: Set<string>,
  editionIds: Set<string>,
  offeringIds: Set<string>,
  landingIds: Set<string>,
  errors: string[]
) {
  void landingIds;

  for (const landing of landings) {
    if (!productIds.has(landing.productId)) {
      errors.push(`campaign landing "${landing.id}" references missing product "${landing.productId}"`);
    }

    for (const editionId of landing.featuredEditionIds) {
      if (!editionIds.has(editionId)) {
        errors.push(`campaign landing "${landing.id}" references missing featured edition "${editionId}"`);
      }
    }

    for (const offeringId of landing.offeringIds) {
      if (!offeringIds.has(offeringId)) {
        errors.push(`campaign landing "${landing.id}" references missing offering "${offeringId}"`);
      }
    }
  }
}
