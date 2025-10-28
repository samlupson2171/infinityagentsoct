/**
 * Model Loader for Serverless Environments
 * 
 * This utility ensures all Mongoose models are registered before use.
 * In serverless environments like Vercel, models need to be explicitly
 * imported to be registered with Mongoose, especially when using populate.
 */

// Import all models to register them with Mongoose
import '@/models/User';
import '@/models/Offer';
import '@/models/Enquiry';
import '@/models/Quote';
import '@/models/TrainingMaterial';
import '@/models/ContactInfo';
import '@/models/Activity';
import '@/models/ActivityPackage';
import '@/models/ImportHistory';
import '@/models/Destination';
import '@/models/ContractTemplate';
import '@/models/ContractSignature';
import '@/models/FileStorage';
import '@/models/Settings';
import '@/models/SuperOfferPackage';
import '@/models/SuperOfferPackageHistory';
import '@/models/Event';
import '@/models/Category';

/**
 * Call this function at the start of any API route that uses Mongoose models
 * to ensure all models are registered.
 */
export function ensureModelsLoaded() {
  // This function doesn't need to do anything - the imports above
  // will register all models when this module is loaded
  return true;
}

export default ensureModelsLoaded;
