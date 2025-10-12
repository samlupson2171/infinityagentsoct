# PriceSyncIndicator API Reference

## Component Signature

```tsx
function PriceSyncIndicator(props: PriceSyncIndicatorProps): JSX.Element
```

## Props

### `status` (required)
- **Type**: `'synced' | 'calculating' | 'custom' | 'error' | 'out-of-sync'`
- **Description**: The current synchronization status of the price
- **Examples**:
  ```tsx
  status="synced"        // Price matches package calculation
  status="calculating"   // Price calculation in progress
  status="custom"        // Price manually overridden
  status="error"         // Calculation error occurred
  status="out-of-sync"   // Parameters changed, needs recalculation
  ```

### `priceBreakdown` (optional)
- **Type**: `PriceBreakdown | undefined`
- **Description**: Detailed breakdown of the price calculation
- **Structure**:
  ```tsx
  {
    pricePerPerson: number;      // Price per person in the tier
    numberOfPeople: number;      // Number of people in the booking
    totalPrice: number;          // Total calculated price
    tierUsed: string;            // Tier label (e.g., "Tier 2 (4-6 people)")
    periodUsed: string;          // Period label (e.g., "Peak Season")
    currency: string;            // Currency code (e.g., "GBP", "EUR")
  }
  ```
- **Example**:
  ```tsx
  priceBreakdown={{
    pricePerPerson: 500,
    numberOfPeople: 4,
    totalPrice: 2000,
    tierUsed: 'Tier 2 (4-6 people)',
    periodUsed: 'Peak Season (Jun-Aug)',
    currency: 'GBP'
  }}
  ```
- **When to provide**: Always provide when status is 'synced' or 'custom' to show breakdown in tooltip

### `error` (optional)
- **Type**: `string | undefined`
- **Description**: Error message to display when status is 'error'
- **Examples**:
  ```tsx
  error="Package not found"
  error="Network connection failed"
  error="Invalid parameters: 8 nights not available"
  error="Calculation timeout"
  ```
- **When to provide**: Required when status is 'error'

### `onRecalculate` (optional)
- **Type**: `(() => void) | undefined`
- **Description**: Callback function to trigger price recalculation
- **When called**: User clicks the recalculate button
- **Shows button for**: 'custom', 'error', 'out-of-sync' states
- **Example**:
  ```tsx
  const handleRecalculate = async () => {
    setStatus('calculating');
    try {
      const newPrice = await calculatePrice(params);
      setPrice(newPrice);
      setStatus('synced');
    } catch (error) {
      setStatus('error');
      setError(error.message);
    }
  };

  <PriceSyncIndicator
    status={status}
    onRecalculate={handleRecalculate}
  />
  ```

### `onResetToCalculated` (optional)
- **Type**: `(() => void) | undefined`
- **Description**: Callback function to reset price to calculated value
- **When called**: User clicks the reset button
- **Shows button for**: 'custom' state only
- **Example**:
  ```tsx
  const handleReset = () => {
    setPrice(calculatedPrice);
    setStatus('synced');
  };

  <PriceSyncIndicator
    status="custom"
    onResetToCalculated={handleReset}
  />
  ```

## Type Definitions

### PriceSyncIndicatorProps
```tsx
interface PriceSyncIndicatorProps {
  status: SyncStatus;
  priceBreakdown?: PriceBreakdown;
  error?: string;
  onRecalculate?: () => void;
  onResetToCalculated?: () => void;
}
```

### SyncStatus
```tsx
type SyncStatus =
  | 'synced'        // Price matches calculated package price
  | 'calculating'   // Price calculation in progress
  | 'custom'        // Price manually overridden
  | 'error'         // Error during calculation
  | 'out-of-sync';  // Parameters changed, needs recalculation
```

### PriceBreakdown
```tsx
interface PriceBreakdown {
  pricePerPerson: number;
  numberOfPeople: number;
  totalPrice: number;
  tierUsed: string;
  periodUsed: string;
  currency: string;
}
```

## Usage Examples

### Basic Usage (Synced State)
```tsx
import PriceSyncIndicator from '@/components/admin/PriceSyncIndicator';

function QuoteForm() {
  return (
    <PriceSyncIndicator
      status="synced"
      priceBreakdown={{
        pricePerPerson: 500,
        numberOfPeople: 4,
        totalPrice: 2000,
        tierUsed: 'Tier 2 (4-6 people)',
        periodUsed: 'Peak Season',
        currency: 'GBP'
      }}
    />
  );
}
```

### With Recalculation (Custom State)
```tsx
function QuoteForm() {
  const [status, setStatus] = useState<SyncStatus>('custom');
  const [price, setPrice] = useState(2500);
  const calculatedPrice = 2000;

  const handleRecalculate = async () => {
    setStatus('calculating');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setPrice(calculatedPrice);
    setStatus('synced');
  };

  const handleReset = () => {
    setPrice(calculatedPrice);
    setStatus('synced');
  };

  return (
    <PriceSyncIndicator
      status={status}
      priceBreakdown={{
        pricePerPerson: 500,
        numberOfPeople: 4,
        totalPrice: calculatedPrice,
        tierUsed: 'Tier 2 (4-6 people)',
        periodUsed: 'Peak Season',
        currency: 'GBP'
      }}
      onRecalculate={handleRecalculate}
      onResetToCalculated={handleReset}
    />
  );
}
```

### Error Handling
```tsx
function QuoteForm() {
  const [status, setStatus] = useState<SyncStatus>('error');
  const [error, setError] = useState('Package not found');

  const handleRecalculate = async () => {
    setStatus('calculating');
    try {
      const result = await fetchPackagePrice(packageId);
      setPrice(result.price);
      setStatus('synced');
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <PriceSyncIndicator
      status={status}
      error={error}
      onRecalculate={handleRecalculate}
    />
  );
}
```

### Integration with useQuotePrice Hook
```tsx
import { useQuotePrice } from '@/lib/hooks/useQuotePrice';
import PriceSyncIndicator from '@/components/admin/PriceSyncIndicator';

function QuoteForm() {
  const {
    syncStatus,
    priceBreakdown,
    error,
    recalculatePrice,
    resetToCalculated
  } = useQuotePrice({
    linkedPackage,
    numberOfPeople,
    numberOfNights,
    arrivalDate,
    currentPrice,
    onPriceUpdate: (price) => setValue('totalPrice', price)
  });

  return (
    <div>
      <input
        type="number"
        value={currentPrice}
        onChange={(e) => setValue('totalPrice', parseFloat(e.target.value))}
      />
      
      {linkedPackage && (
        <PriceSyncIndicator
          status={syncStatus}
          priceBreakdown={priceBreakdown}
          error={error}
          onRecalculate={recalculatePrice}
          onResetToCalculated={resetToCalculated}
        />
      )}
    </div>
  );
}
```

## State Management Patterns

### Pattern 1: Controlled Component
```tsx
// Parent manages all state
const [status, setStatus] = useState<SyncStatus>('synced');
const [breakdown, setBreakdown] = useState<PriceBreakdown | undefined>();

<PriceSyncIndicator
  status={status}
  priceBreakdown={breakdown}
  onRecalculate={() => {
    setStatus('calculating');
    // ... recalculation logic
  }}
/>
```

### Pattern 2: Hook-Based
```tsx
// Hook manages state, component just displays
const priceSync = useQuotePrice(options);

<PriceSyncIndicator
  status={priceSync.syncStatus}
  priceBreakdown={priceSync.priceBreakdown}
  error={priceSync.error}
  onRecalculate={priceSync.recalculatePrice}
  onResetToCalculated={priceSync.resetToCalculated}
/>
```

### Pattern 3: Conditional Rendering
```tsx
// Only show when package is linked
{linkedPackage && (
  <PriceSyncIndicator
    status={syncStatus}
    priceBreakdown={priceBreakdown}
    onRecalculate={recalculatePrice}
  />
)}
```

## Styling and Customization

The component uses Tailwind CSS classes and cannot be customized via props. To customize:

1. **Modify the component directly** for global changes
2. **Wrap in a container** for positioning:
   ```tsx
   <div className="my-4">
     <PriceSyncIndicator {...props} />
   </div>
   ```
3. **Use CSS modules** for scoped styling (not recommended)

## Accessibility

### ARIA Attributes
- `role="status"` - Identifies as a status indicator
- `aria-live="polite"` - Announces changes to screen readers
- `aria-label` - Provides descriptive labels
- `aria-hidden="true"` - Hides decorative icons

### Keyboard Navigation
- Action buttons are keyboard accessible
- Tab to focus buttons
- Enter/Space to activate

### Screen Reader Support
All states are announced with descriptive labels:
- "Price synced with package"
- "Calculating price..."
- "Custom price (not synced)"
- "Price calculation error"
- "Parameters changed"

## Performance Considerations

### Rendering
- Component is lightweight (~320 lines)
- No expensive computations
- Efficient re-rendering with React

### Tooltip
- Tooltip only renders when `showTooltip` is true
- Uses CSS for show/hide (no JS animations)
- Fixed width prevents layout shifts

### Callbacks
- Callbacks should be memoized to prevent unnecessary re-renders:
  ```tsx
  const handleRecalculate = useCallback(async () => {
    // ... recalculation logic
  }, [dependencies]);
  ```

## Common Patterns

### Loading State
```tsx
// Show calculating while fetching
const [isLoading, setIsLoading] = useState(false);

const handleRecalculate = async () => {
  setIsLoading(true);
  setStatus('calculating');
  try {
    const result = await fetchPrice();
    setPrice(result);
    setStatus('synced');
  } finally {
    setIsLoading(false);
  }
};
```

### Debounced Recalculation
```tsx
// Debounce parameter changes
const debouncedRecalculate = useMemo(
  () => debounce(recalculatePrice, 500),
  [recalculatePrice]
);

useEffect(() => {
  if (linkedPackage) {
    setStatus('out-of-sync');
    debouncedRecalculate();
  }
}, [numberOfPeople, numberOfNights, arrivalDate]);
```

### Error Recovery
```tsx
const handleRecalculate = async () => {
  setStatus('calculating');
  try {
    const result = await fetchPrice();
    setPrice(result);
    setStatus('synced');
    setError(undefined);
  } catch (err) {
    setStatus('error');
    setError(err.message);
    // Optionally retry after delay
    setTimeout(() => handleRecalculate(), 5000);
  }
};
```

## Testing

### Unit Tests
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PriceSyncIndicator from './PriceSyncIndicator';

test('shows synced state', () => {
  render(<PriceSyncIndicator status="synced" />);
  expect(screen.getByText('Price synced with package')).toBeInTheDocument();
});

test('calls onRecalculate', () => {
  const handleRecalculate = vi.fn();
  render(
    <PriceSyncIndicator
      status="custom"
      onRecalculate={handleRecalculate}
    />
  );
  fireEvent.click(screen.getByLabelText('Recalculate price from package'));
  expect(handleRecalculate).toHaveBeenCalled();
});
```

### Integration Tests
```tsx
test('complete recalculation flow', async () => {
  const { rerender } = render(
    <PriceSyncIndicator status="custom" onRecalculate={handleRecalculate} />
  );
  
  // Click recalculate
  fireEvent.click(screen.getByLabelText('Recalculate price from package'));
  
  // Should show calculating
  rerender(<PriceSyncIndicator status="calculating" />);
  expect(screen.getByText('Calculating price...')).toBeInTheDocument();
  
  // Should show synced after calculation
  await waitFor(() => {
    rerender(<PriceSyncIndicator status="synced" priceBreakdown={breakdown} />);
    expect(screen.getByText('Price synced with package')).toBeInTheDocument();
  });
});
```

## Troubleshooting

### Issue: Tooltip not showing
**Solution**: Ensure `priceBreakdown` is provided for synced/custom states

### Issue: Buttons not appearing
**Solution**: Verify callbacks are provided and status is correct

### Issue: Status not updating
**Solution**: Ensure parent component updates status prop

### Issue: Currency not formatting
**Solution**: Check that `currency` in `priceBreakdown` is a valid ISO code

### Issue: Accessibility warnings
**Solution**: Ensure all required ARIA attributes are present (they are by default)

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Full support

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3+
- No external libraries required

## Related Components

- `useQuotePrice` - Hook for managing price synchronization
- `QuoteForm` - Parent component that uses PriceSyncIndicator
- `PackageSelector` - Provides package selection data
