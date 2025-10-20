import { migrationRunner } from './migration-runner';
import {
  migrateOffersSchema,
  rollbackOffersSchema,
} from './001-enhance-offers-schema';
import { migration002 } from './002-create-destinations-collection';
import { migration003 } from './003-enhance-user-schema';
import {
  createContractCollections,
  rollbackContractCollections,
} from './004-create-contract-collections';
import {
  enhanceTrainingMaterialsSchema,
  rollbackTrainingMaterialsSchema,
} from './006-enhance-training-materials-schema';
import {
  up as createQuotesCollection,
  down as rollbackQuotesCollection,
} from './007-create-quotes-collection';
import {
  up as createSuperPackagesCollection,
  down as rollbackSuperPackagesCollection,
} from './008-create-super-packages-collection';
import {
  up as createEventsCollection,
  down as rollbackEventsCollection,
} from './009-create-events-collection';

// Register all migrations
migrationRunner.addMigration({
  version: '001',
  description: 'Enhance offers schema with flexible pricing structure',
  up: migrateOffersSchema,
  down: rollbackOffersSchema,
});

migrationRunner.addMigration({
  version: '004',
  description: 'Create contract template and signature collections',
  up: createContractCollections,
  down: rollbackContractCollections,
});

migrationRunner.addMigration({
  version: '006',
  description:
    'Enhance training materials schema with rich content and file upload capabilities',
  up: enhanceTrainingMaterialsSchema,
  down: rollbackTrainingMaterialsSchema,
});

migrationRunner.addMigration({
  version: '007',
  description:
    'Create quotes collection and extend enquiries with quote references',
  up: createQuotesCollection,
  down: rollbackQuotesCollection,
});

migrationRunner.addMigration({
  version: '008',
  description:
    'Create super offer packages collection and add linkedPackage field to quotes',
  up: createSuperPackagesCollection,
  down: rollbackSuperPackagesCollection,
});

migrationRunner.addMigration({
  version: '009',
  description:
    'Create events and categories collections with predefined categories and migrate hardcoded events',
  up: createEventsCollection,
  down: rollbackEventsCollection,
});

// Note: Migrations 002, 003, and 005 are temporarily disabled due to interface inconsistencies
// They can be run manually if needed

export { migrationRunner };
