# Super Packages Caching Strategy

This document describes the caching implementation for the Super Offer Packages feature using React Query.

## Overview

The caching strategy implements a **stale-while-revalidate** pattern, which provides:
- Fast initial data display from cache
- Background refetching to keep data fresh
- Optimistic updates for better UX
- Automatic cache invalidation on mutations

## Architecture

### Query Client Configuration

Located in `src/lib/providers/QueryProvider.tsx`:

```typescript
{
  queries: {
    staleTime: 5 * 60 * 1000,      // 5 minutes
    gcTime: 10 * 60 * 1000,         // 10 minutes
    refetchOnWindowFocus: true,     // Refetch when window regains focus
    refetchOnReconnect: true,       // Refetch when reconnecting
    refetchOnMount: true,           // Refetch on component mount
    retry: 1,                       // Retry failed requests once
  }
}
```

### Cache Keys Structure

All cache keys follow a hierarchical structure for easy invalidation:

```typescript
superPackageKeys = {
  all: ['super-packages'],
  lists: () => ['super-packages', 'list'],
  list: (params) => ['super-packages', 'list', params],
  details: () => ['super-packages', 'detail'],
  detail: (id) => ['super-packages', 'detail', id],
  statistics: () => ['super-packages', 'statistics'],
  filterOptions: () => ['super-packages', 'filter-options'],
}
```

## Hooks and Caching Behavior

### 1. useSuperPackages (Package Lists)

**Purpose**: Fetch paginated lists of packages

**Caching Strategy**:
- **Stale Time**: 5 minutes
- **GC Time**: 10 minutes
- **Refetch on Focus**: Yes
- **Refetch on Mount**: Always

**Use Case**: Main package list view with filters

```typescript
const { data, isLoading, error } = useSuperPackages({
  page: 1,
  limit: 10,
  status: 'active',
  destination: 'Benidorm'
});
```

**Cache Behavior**:
- Each unique combination of filters creates a separate cache entry
- Data is considered fresh for 5 minutes
- After 5 minutes, data is stale but still served while refetching in background
- Cache is garbage collected after 10 minutes of no usage

### 2. useSuperPackage (Single Package)

**Purpose**: Fetch individual package details

**Caching Strategy**:
- **Stale Time**: 10 minutes
- **GC Time**: 15 minutes
- **Refetch on Focus**: No
- **Refetch on Mount**: No (if data exists)

**Use Case**: Package detail view, edit form

```typescript
const { data, isLoading } = useSuperPackage(packageId);
```

**Cache Behavior**:
- Individual packages are cached longer (10 minutes)
- No automatic refetching to reduce API calls
- Cache persists for 15 minutes after last use

### 3. useSuperPackageStatistics

**Purpose**: Fetch package statistics and analytics

**Caching Strategy**:
- **Stale Time**: 2 minutes
- **GC Time**: 5 minutes
- **Refetch on Focus**: Yes
- **Auto Refetch**: Every 5 minutes

**Use Case**: Statistics dashboard

```typescript
const { data } = useSuperPackageStatistics();
```

**Cache Behavior**:
- Statistics are cached for 2 minutes
- Automatically refetches every 5 minutes when component is mounted
- Refetches when window regains focus

### 4. useSuperPackageFilters

**Purpose**: Fetch filter options (destinations, resorts)

**Caching Strategy**:
- **Stale Time**: 15 minutes
- **GC Time**: 30 minutes
- **Refetch on Focus**: No
- **Refetch on Mount**: No

**Use Case**: Filter dropdowns

```typescript
const { data } = useSuperPackageFilters();
```

**Cache Behavior**:
- Aggressive caching since filter options change infrequently
- Data is fresh for 15 minutes
- No automatic refetching to minimize API calls
- Cache persists for 30 minutes

### 5. useSuperPackagePriceCalculation

**Purpose**: Calculate package prices

**Caching Strategy**:
- **Stale Time**: 10 minutes
- **GC Time**: 30 minutes
- **Refetch on Focus**: No
- **Refetch on Mount**: No

**Use Case**: Price calculator, quote form

```typescript
const { data } = useSuperPackagePriceCalculation({
  packageId: '123',
  numberOfPeople: 10,
  numberOfNights: 3,
  arrivalDate: '2025-06-01'
});
```

**Cache Behavior**:
- Each unique combination of parameters creates a separate cache entry
- Prevents redundant calculations for same parameters
- Long cache time since prices don't change frequently

## Mutation Hooks and Cache Invalidation

### 1. useCreateSuperPackage

**Cache Invalidation**:
- Invalidates all list queries
- Invalidates statistics
- Invalidates filter options
- Sets new package in detail cache

```typescript
const createMutation = useCreateSuperPackage();

createMutation.mutate(packageData, {
  onSuccess: (newPackage) => {
    // Cache automatically updated
  }
});
```

### 2. useUpdateSuperPackage

**Cache Invalidation**:
- Updates specific package in detail cache
- Invalidates all list queries
- Invalidates statistics

```typescript
const updateMutation = useUpdateSuperPackage();

updateMutation.mutate({ id: '123', data: updates });
```

### 3. useDeleteSuperPackage

**Cache Invalidation**:
- Removes package from detail cache
- Invalidates all list queries
- Invalidates statistics
- Invalidates filter options

```typescript
const deleteMutation = useDeleteSuperPackage();

deleteMutation.mutate(packageId);
```

### 4. useUpdatePackageStatus

**Optimistic Updates**:
- Immediately updates UI before server response
- Rolls back on error
- Updates cache with server response on success

```typescript
const statusMutation = useUpdatePackageStatus();

statusMutation.mutate({ id: '123', status: 'inactive' });
```

**Cache Behavior**:
1. Cancels any in-flight queries for the package
2. Snapshots current cache state
3. Optimistically updates cache
4. Makes API call
5. On success: Updates cache with server response
6. On error: Rolls back to snapshot

## Performance Benefits

### 1. Reduced API Calls

- **Before**: Every component mount triggers API call
- **After**: Data served from cache if fresh

Example: Navigating between package list and detail view:
- First visit: 2 API calls (list + detail)
- Return visit within 5 minutes: 0 API calls (served from cache)

### 2. Faster UI Response

- **Stale-while-revalidate**: Show cached data immediately, update in background
- **Optimistic updates**: UI updates before server response

### 3. Automatic Synchronization

- Window focus refetching keeps data fresh across tabs
- Reconnect refetching handles network interruptions
- Automatic cache invalidation on mutations

## Usage Examples

### Example 1: Package List with Filters

```typescript
function PackageList() {
  const [filters, setFilters] = useState({ status: 'active' });
  
  const { data, isLoading, error } = useSuperPackages(filters);
  
  // Data is cached per filter combination
  // Changing filters creates new cache entry
  // Previous filter results remain cached
}
```

### Example 2: Package Detail with Prefetching

```typescript
function PackageCard({ packageId }) {
  const prefetch = usePrefetchSuperPackage();
  
  return (
    <div
      onMouseEnter={() => prefetch(packageId)}
      onClick={() => navigate(`/packages/${packageId}`)}
    >
      {/* Hovering prefetches detail data */}
      {/* Clicking shows instant data from cache */}
    </div>
  );
}
```

### Example 3: Optimistic Status Toggle

```typescript
function StatusToggle({ packageId, currentStatus }) {
  const mutation = useUpdatePackageStatus();
  
  const handleToggle = () => {
    mutation.mutate({
      id: packageId,
      status: currentStatus === 'active' ? 'inactive' : 'active'
    });
    // UI updates immediately
    // Rolls back if server returns error
  };
}
```

## Cache Invalidation Patterns

### Pattern 1: Invalidate All Related Queries

```typescript
// When creating a package
queryClient.invalidateQueries({ queryKey: superPackageKeys.lists() });
queryClient.invalidateQueries({ queryKey: superPackageKeys.statistics() });
queryClient.invalidateQueries({ queryKey: superPackageKeys.filterOptions() });
```

### Pattern 2: Update Specific Cache Entry

```typescript
// When updating a package
queryClient.setQueryData(
  superPackageKeys.detail(packageId),
  updatedPackage
);
```

### Pattern 3: Remove from Cache

```typescript
// When deleting a package
queryClient.removeQueries({
  queryKey: superPackageKeys.detail(packageId)
});
```

## Monitoring and Debugging

### React Query Devtools

In development mode, the React Query Devtools are available:
- View all cached queries
- See query status (fresh, stale, fetching)
- Manually trigger refetches
- Inspect cache data

Access via the floating icon in bottom-right corner.

### Cache Inspection

```typescript
// Get current cache data
const cachedPackage = queryClient.getQueryData(
  superPackageKeys.detail(packageId)
);

// Check if query is fetching
const isFetching = queryClient.isFetching({
  queryKey: superPackageKeys.lists()
});
```

## Best Practices

### 1. Use Appropriate Stale Times

- **Frequently changing data**: 1-2 minutes
- **Moderately changing data**: 5-10 minutes
- **Rarely changing data**: 15-30 minutes

### 2. Invalidate Conservatively

- Only invalidate what's affected by the mutation
- Use specific query keys when possible
- Avoid invalidating entire cache unnecessarily

### 3. Leverage Optimistic Updates

- Use for status toggles and simple updates
- Always provide rollback logic
- Show loading states during mutation

### 4. Prefetch Strategically

- Prefetch on hover for detail views
- Prefetch next page in paginated lists
- Don't prefetch everything upfront

### 5. Handle Errors Gracefully

- Show error messages to users
- Provide retry mechanisms
- Log errors for debugging

## Migration from Direct Fetch

### Before (Direct Fetch)

```typescript
const [packages, setPackages] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('/api/admin/super-packages')
    .then(res => res.json())
    .then(data => {
      setPackages(data.packages);
      setLoading(false);
    });
}, []);
```

### After (React Query)

```typescript
const { data, isLoading } = useSuperPackages();
const packages = data?.packages || [];
```

**Benefits**:
- Automatic caching
- Background refetching
- Error handling
- Loading states
- No manual state management

## Performance Metrics

Expected improvements:
- **Initial Load**: Similar (first API call required)
- **Subsequent Loads**: 90% faster (served from cache)
- **Navigation**: Instant (cached data)
- **Background Updates**: Transparent to user
- **API Call Reduction**: 60-80% fewer calls

## Troubleshooting

### Issue: Data Not Updating

**Solution**: Check stale time configuration
```typescript
// Force refetch
queryClient.invalidateQueries({ queryKey: superPackageKeys.all });
```

### Issue: Too Many API Calls

**Solution**: Increase stale time or disable refetch options
```typescript
useSuperPackages(params, {
  staleTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false
});
```

### Issue: Cache Growing Too Large

**Solution**: Reduce GC time or manually clear cache
```typescript
// Clear all caches
queryClient.clear();

// Clear specific cache
queryClient.removeQueries({ queryKey: superPackageKeys.lists() });
```

## Future Enhancements

1. **Persistent Cache**: Store cache in localStorage for offline support
2. **Selective Invalidation**: More granular cache invalidation
3. **Background Sync**: Sync cache with server on reconnect
4. **Cache Warming**: Prefetch common queries on app load
5. **Analytics**: Track cache hit rates and performance metrics
