# Design Document

## Overview

The Super Offer Packages system extends the existing offers and quotes infrastructure to support pre-configured destination packages with complex pricing matrices. The system enables administrators to create standardized packages that can be quickly applied to quotes, reducing manual data entry and ensuring consistency across quotes for the same destination.

The design leverages the existing MongoDB infrastructure, Next.js API routes, and React components while introducing new models and interfaces specifically tailored for super packages with multi-dimensional pricing (group size × duration × season).

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Admin Interface Layer                    │
├─────────────────────────────────────────────────────────────┤
│  SuperPackageManager  │  SuperPackageForm  │  PackageSelector│
│  PricingMatrixEditor  │  CSVImporter       │  QuoteIntegration│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Routes Layer                        │
├─────────────────────────────────────────────────────────────┤
│  /api/admin/super-packages                                   │
│  /api/admin/super-packages/[id]                             │
│  /api/admin/super-packages/import                           │
│  /api/admin/super-packages/calculate-price                  │
│  /api/admin/quotes/[id]/link-package                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Business Logic Layer                      │
├─────────────────────────────────────────────────────────────┤
│  SuperPackageService  │  PricingCalculator  │  CSVParser    │
│  PackageValidator     │  QuoteLinker        │               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Models Layer                       │
├─────────────────────────────────────────────────────────────┤
│  SuperOfferPackage    │  Quote (enhanced)   │  ImportHistory│
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      MongoDB Database                        │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Package Creation Flow**
   - Admin creates package via form or CSV import
   - Data validated and normalized
   - Package stored in database
   - Package appears in selection lists

2. **Quote Linking Flow**
   - Admin selects package during quote creation
   - Admin specifies: people count, nights, arrival date
   - System calculates appropriate price
   - Quote populated with package data
   - Package reference stored in quote

3. **Price Calculation Flow**
   - Input: people count, nights, arrival date
   - Determine group size tier
   - Determine duration option
   - Determine pricing period
   - Lookup price in matrix
   - Return calculated price or "ON REQUEST"

## Components and Interfaces

### 1. Data Models

#### SuperOfferPackage Model

```typescript
interface ISuperOfferPackage extends Document {
  // Basic Information
  name: string;
  destination: string;
  resort: string;
  currency: 'EUR' | 'GBP' | 'USD';
  
  // Pricing Structure
  groupSizeTiers: IGroupSizeTier[];
  durationOptions: number[]; // e.g., [2, 3, 4]
  pricingMatrix: IPricingEntry[];
  
  // Package Details
  inclusions: IInclusion[];
  accommodationExamples: string[];
  salesNotes: string;
  
  // Status and Metadata
  status: 'active' | 'inactive' | 'deleted';
  version: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastModifiedBy: mongoose.Types.ObjectId;
  
  // Import tracking
  importSource?: 'csv' | 'manual';
  originalFilename?: string;
}

interface IGroupSizeTier {
  label: string; // e.g., "6-11 People"
  minPeople: number;
  maxPeople: number;
}

interface IPricingEntry {
  period: string; // e.g., "January", "Easter (02/04/2025 - 06/04/2025)"
  periodType: 'month' | 'special';
  startDate?: Date; // For special periods
  endDate?: Date; // For special periods
  prices: IPricePoint[];
}

interface IPricePoint {
  groupSizeTierIndex: number;
  nights: number;
  price: number | 'ON_REQUEST';
}

interface IInclusion {
  text: string;
  category?: 'transfer' | 'accommodation' | 'activity' | 'service' | 'other';
}
```

#### Enhanced Quote Model

```typescript
// Add to existing IQuote interface
interface IQuote extends Document {
  // ... existing fields ...
  
  // Super Package Integration
  linkedPackage?: {
    packageId: mongoose.Types.ObjectId;
    packageName: string;
    packageVersion: number;
    selectedTier: {
      tierIndex: number;
      tierLabel: string;
    };
    selectedNights: number;
    selectedPeriod: string;
    calculatedPrice: number;
    priceWasOnRequest: boolean;
  };
}
```

### 2. API Endpoints

#### GET /api/admin/super-packages
- **Purpose**: List all super packages with filtering
- **Query Params**: 
  - `page`, `limit` (pagination)
  - `status` (active/inactive/all)
  - `destination` (filter)
  - `search` (text search)
- **Response**: Paginated list of packages

#### POST /api/admin/super-packages
- **Purpose**: Create new super package
- **Body**: Complete package data
- **Validation**: Ensure pricing matrix is complete
- **Response**: Created package

#### GET /api/admin/super-packages/[id]
- **Purpose**: Get single package details
- **Response**: Full package data including pricing matrix

#### PUT /api/admin/super-packages/[id]
- **Purpose**: Update existing package
- **Body**: Updated package data
- **Version Control**: Increment version number
- **Response**: Updated package

#### DELETE /api/admin/super-packages/[id]
- **Purpose**: Delete or soft-delete package
- **Logic**: Check for linked quotes, soft-delete if found
- **Response**: Success confirmation

#### PATCH /api/admin/super-packages/[id]/status
- **Purpose**: Toggle package active/inactive status
- **Body**: `{ status: 'active' | 'inactive' }`
- **Response**: Updated package

#### POST /api/admin/super-packages/import
- **Purpose**: Import package from CSV
- **Body**: FormData with CSV file
- **Process**: 
  1. Parse CSV structure
  2. Extract pricing matrix
  3. Extract inclusions
  4. Validate data
  5. Return preview
- **Response**: Parsed package data for review

#### POST /api/admin/super-packages/import/confirm
- **Purpose**: Confirm and save imported package
- **Body**: Reviewed package data
- **Response**: Created package

#### POST /api/admin/super-packages/calculate-price
- **Purpose**: Calculate price for given parameters
- **Body**: 
  ```typescript
  {
    packageId: string;
    numberOfPeople: number;
    numberOfNights: number;
    arrivalDate: string;
  }
  ```
- **Response**: 
  ```typescript
  {
    price: number | 'ON_REQUEST';
    tierUsed: string;
    periodUsed: string;
    breakdown: {
      pricePerPerson: number;
      numberOfPeople: number;
      totalPrice: number;
    };
  }
  ```

#### POST /api/admin/quotes/[id]/link-package
- **Purpose**: Link super package to quote
- **Body**: 
  ```typescript
  {
    packageId: string;
    numberOfPeople: number;
    numberOfNights: number;
    arrivalDate: string;
  }
  ```
- **Process**:
  1. Calculate price
  2. Populate quote fields
  3. Store package reference
- **Response**: Updated quote

### 3. Business Logic Services

#### SuperPackageService

```typescript
class SuperPackageService {
  // CRUD operations
  async createPackage(data: ISuperOfferPackage): Promise<ISuperOfferPackage>
  async updatePackage(id: string, data: Partial<ISuperOfferPackage>): Promise<ISuperOfferPackage>
  async deletePackage(id: string, force: boolean): Promise<void>
  async getPackage(id: string): Promise<ISuperOfferPackage>
  async listPackages(filters: PackageFilters): Promise<PaginatedResult<ISuperOfferPackage>>
  
  // Status management
  async activatePackage(id: string): Promise<ISuperOfferPackage>
  async deactivatePackage(id: string): Promise<ISuperOfferPackage>
  
  // Validation
  async validatePackage(data: ISuperOfferPackage): Promise<ValidationResult>
  async checkLinkedQuotes(packageId: string): Promise<number>
}
```

#### PricingCalculator

```typescript
class PricingCalculator {
  // Determine appropriate tier
  determineTier(
    numberOfPeople: number, 
    tiers: IGroupSizeTier[]
  ): { index: number; tier: IGroupSizeTier }
  
  // Determine pricing period
  determinePeriod(
    arrivalDate: Date, 
    pricingMatrix: IPricingEntry[]
  ): IPricingEntry
  
  // Calculate price
  calculatePrice(
    packageId: string,
    numberOfPeople: number,
    numberOfNights: number,
    arrivalDate: Date
  ): Promise<PriceCalculation>
  
  // Validate pricing matrix completeness
  validatePricingMatrix(matrix: IPricingEntry[]): ValidationResult
}
```

#### CSVParser

```typescript
class SuperPackageCSVParser {
  // Parse CSV file
  async parseCSV(file: File): Promise<ParsedPackageData>
  
  // Extract sections
  private extractHeader(rows: string[][]): { resort: string; destination: string }
  private extractGroupTiers(rows: string[][]): IGroupSizeTier[]
  private extractDurationOptions(rows: string[][]): number[]
  private extractPricingMatrix(rows: string[][]): IPricingEntry[]
  private extractInclusions(rows: string[][]): IInclusion[]
  private extractSalesNotes(rows: string[][]): string
  
  // Utilities
  private parsePrice(value: string): number | 'ON_REQUEST'
  private parsePeriod(value: string): { period: string; type: string; dates?: { start: Date; end: Date } }
  private detectCurrency(rows: string[][]): 'EUR' | 'GBP' | 'USD'
}
```

#### QuoteLinker

```typescript
class QuoteLinker {
  // Link package to quote
  async linkPackageToQuote(
    quoteId: string,
    packageId: string,
    selections: {
      numberOfPeople: number;
      numberOfNights: number;
      arrivalDate: Date;
    }
  ): Promise<IQuote>
  
  // Populate quote from package
  private populateQuoteFromPackage(
    quote: IQuote,
    package: ISuperOfferPackage,
    calculation: PriceCalculation
  ): IQuote
  
  // Unlink package from quote
  async unlinkPackageFromQuote(quoteId: string): Promise<IQuote>
}
```

### 4. React Components

#### SuperPackageManager
- **Purpose**: Main admin interface for managing packages
- **Features**:
  - List view with search and filters
  - Create/Edit/Delete actions
  - Status toggle
  - CSV import button
- **State Management**: React Query for data fetching

#### SuperPackageForm
- **Purpose**: Form for creating/editing packages
- **Sections**:
  - Basic info (name, destination, resort, currency)
  - Group size tiers configuration
  - Duration options
  - Pricing matrix editor
  - Inclusions list
  - Accommodation examples
  - Sales notes
- **Validation**: Real-time validation with error display

#### PricingMatrixEditor
- **Purpose**: Interactive grid for editing pricing matrix
- **Features**:
  - Spreadsheet-like interface
  - Rows: Periods (months/special dates)
  - Columns: Group size × Duration combinations
  - Support for "ON REQUEST" entries
  - Bulk edit capabilities
  - Copy/paste support

#### CSVImporter
- **Purpose**: Import packages from CSV files
- **Flow**:
  1. File upload
  2. Parsing and preview
  3. Data review and adjustment
  4. Confirmation and save
- **Features**:
  - Drag-and-drop upload
  - Preview parsed data
  - Edit before saving
  - Error handling and validation

#### PackageSelector (for Quote Form)
- **Purpose**: Select and apply package to quote
- **Features**:
  - Searchable package list
  - Package details preview
  - Selection parameters form (people, nights, date)
  - Price calculation preview
  - Apply to quote button

#### PackagePriceCalculator
- **Purpose**: Standalone calculator for testing
- **Features**:
  - Select package
  - Input parameters
  - View calculated price
  - See breakdown and tier used

## Data Models

### Database Schema

#### super_offer_packages Collection

```javascript
{
  _id: ObjectId,
  name: String,
  destination: String,
  resort: String,
  currency: String,
  
  groupSizeTiers: [{
    label: String,
    minPeople: Number,
    maxPeople: Number
  }],
  
  durationOptions: [Number],
  
  pricingMatrix: [{
    period: String,
    periodType: String,
    startDate: Date,
    endDate: Date,
    prices: [{
      groupSizeTierIndex: Number,
      nights: Number,
      price: Mixed // Number or "ON_REQUEST"
    }]
  }],
  
  inclusions: [{
    text: String,
    category: String
  }],
  
  accommodationExamples: [String],
  salesNotes: String,
  
  status: String,
  version: Number,
  
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  lastModifiedBy: ObjectId,
  
  importSource: String,
  originalFilename: String
}
```

#### Indexes

```javascript
// Performance indexes
db.super_offer_packages.createIndex({ status: 1, destination: 1 })
db.super_offer_packages.createIndex({ createdAt: -1 })
db.super_offer_packages.createIndex({ name: "text", destination: "text" })

// Quote linking
db.quotes.createIndex({ "linkedPackage.packageId": 1 })
```

### Migration Strategy

Create migration file: `008-create-super-packages-collection.ts`

1. Create super_offer_packages collection
2. Add indexes
3. Add linkedPackage field to quotes collection
4. Create initial super packages from existing offers (optional)

## Error Handling

### Validation Errors

```typescript
class PackageValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string
  ) {
    super(message);
  }
}

// Example validations:
- Pricing matrix completeness
- Group tier overlap detection
- Duration option validation
- Date range validation for special periods
- Currency consistency
```

### Import Errors

```typescript
class CSVImportError extends Error {
  constructor(
    public line: number,
    public column: string,
    public message: string
  ) {
    super(`Line ${line}, Column ${column}: ${message}`);
  }
}

// Example errors:
- Invalid CSV structure
- Missing required sections
- Invalid price format
- Duplicate periods
- Invalid date format
```

### Calculation Errors

```typescript
class PriceCalculationError extends Error {
  constructor(
    public reason: string,
    public details: any
  ) {
    super(reason);
  }
}

// Example errors:
- No matching tier found
- No matching period found
- No matching duration found
- Price is ON_REQUEST (not an error, but special handling)
```

## Testing Strategy

### Unit Tests

1. **Model Tests**
   - SuperOfferPackage validation
   - Quote linkedPackage field
   - Schema constraints

2. **Service Tests**
   - PricingCalculator.determineTier()
   - PricingCalculator.determinePeriod()
   - PricingCalculator.calculatePrice()
   - CSVParser.parseCSV()
   - QuoteLinker.linkPackageToQuote()

3. **Utility Tests**
   - Price parsing
   - Date parsing
   - Currency detection
   - Period matching

### Integration Tests

1. **API Tests**
   - Create package
   - Update package
   - Delete package (with/without linked quotes)
   - Import from CSV
   - Calculate price
   - Link to quote

2. **Component Tests**
   - SuperPackageForm submission
   - PricingMatrixEditor interactions
   - CSVImporter flow
   - PackageSelector integration with quote form

### End-to-End Tests

1. **Complete Workflows**
   - Create package manually → Link to quote
   - Import package from CSV → Link to quote
   - Edit package → Verify existing quotes unchanged
   - Deactivate package → Verify not in selection list

## Security Considerations

### Authorization

- All super package endpoints require admin role
- Package creation/editing logged with user ID
- Version history maintained for audit trail

### Data Validation

- Strict input validation on all endpoints
- SQL injection prevention (MongoDB parameterized queries)
- XSS prevention (sanitize text inputs)
- File upload validation (CSV only, size limits)

### Data Integrity

- Soft delete for packages with linked quotes
- Version tracking for package changes
- Immutable package reference in quotes
- Validation of pricing matrix completeness

## Performance Optimization

### Database Optimization

- Indexes on frequently queried fields
- Pagination for package lists
- Selective field projection
- Aggregation pipelines for statistics

### Caching Strategy

- Cache active packages list (5 minute TTL)
- Cache individual packages (10 minute TTL)
- Invalidate cache on package updates
- Client-side caching with React Query

### Frontend Optimization

- Lazy loading of pricing matrix editor
- Virtual scrolling for large package lists
- Debounced search inputs
- Optimistic UI updates

## Deployment Considerations

### Database Migration

1. Run migration to create collection and indexes
2. Optionally import initial packages from CSV
3. Verify indexes created successfully
4. Test package creation and linking

### Feature Flags

- Enable super packages feature for admins only initially
- Gradual rollout to all admin users
- Monitor performance and errors
- Collect feedback before full release

### Monitoring

- Track package creation/edit frequency
- Monitor CSV import success rate
- Track quote linking usage
- Alert on calculation errors
- Monitor API response times

### Rollback Plan

- Keep existing quote creation flow intact
- Super packages are additive feature
- Can disable feature flag if issues arise
- Existing quotes unaffected by rollback
