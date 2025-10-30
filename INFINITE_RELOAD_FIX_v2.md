# Fix: Infinite Reload Loop - React Hook Dependencies

## Problem Summary

The game page was experiencing an infinite reload loop due to improperly configured React hooks. Specifically, the `useGameState` and `useChat` hooks had callback functions in their `useEffect` dependency arrays, causing the effects to re-run excessively.

### Root Cause

The issue was in `/lib/hooks.ts`:

1. **`useGameState` hook**: The `fetchGameState` callback was created with `useCallback` and included in the `useEffect` dependency array
2. **`useChat` hook**: The `fetchMessages` callback had the same issue

This created a problematic cycle:
- Component renders → `useCallback` creates/recreates function reference
- `useEffect` detects function reference change (even if the underlying dependencies like `gameId` haven't changed)
- Effect re-runs → Clears interval and sets up new one
- Fetch function updates state → Component re-renders
- Cycle repeats, potentially causing instability and reload loops

### Why This Causes Issues

Including a `useCallback` function in a `useEffect` dependency array is generally an anti-pattern because:
- React may create new function references on each render due to reconciliation
- This causes the effect to re-run even when the actual dependencies haven't changed
- With polling intervals, this creates unstable behavior where intervals are constantly cleared and recreated
- In extreme cases, this can trigger re-render loops or navigation issues

## Solution Implemented

### Key Changes

**Moved fetch function definitions inside `useEffect` bodies**

This eliminates the need to include callback functions in dependency arrays. The fetch functions now:
- Are defined inside the effect scope
- Have direct access to the current `gameId` and other dependencies
- Don't need to be tracked as dependencies themselves
- Are recreated only when the effect re-runs (when `gameId` or `pollingInterval` actually changes)

### Before (Problematic Code)

```typescript
export function useGameState(gameId: string | null, pollingInterval = 2000) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Function defined outside effect with useCallback
  const fetchGameState = useCallback(async () => {
    if (!gameId) return;
    // ... fetch logic
  }, [gameId]);

  useEffect(() => {
    // ...
    fetchGameState();
    intervalRef.current = setInterval(fetchGameState, pollingInterval);
    
    return () => {
      // cleanup
    };
  }, [gameId, pollingInterval, fetchGameState]); // ❌ fetchGameState in deps

  const refetch = useCallback(() => {
    fetchGameState();
  }, [fetchGameState]); // ❌ fetchGameState in deps

  return { gameState, isLoading, error, refetch };
}
```

### After (Fixed Code)

```typescript
export function useGameState(gameId: string | null, pollingInterval = 2000) {
  const [gameState, setGameState] = useState<GameStateResponse | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    if (!gameId) {
      setGameState(null);
      setError(null);
      return;
    }

    // ✅ Function defined inside effect
    const fetchGameState = async () => {
      try {
        setIsLoading(true);
        const state = await getGameState(gameId);

        if (mountedRef.current) {
          setGameState(state);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err : new Error('Failed to fetch game state'));
        }
      } finally {
        if (mountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    // Initial fetch
    fetchGameState();

    // Set up polling
    intervalRef.current = setInterval(fetchGameState, pollingInterval);

    // Cleanup
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [gameId, pollingInterval]); // ✅ Only primitive values in deps

  // ✅ refetch recreates the logic independently
  const refetch = useCallback(async () => {
    if (!gameId) return;

    try {
      setIsLoading(true);
      const state = await getGameState(gameId);

      if (mountedRef.current) {
        setGameState(state);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch game state'));
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [gameId]);

  return { gameState, isLoading, error, refetch };
}
```

## Benefits of This Approach

1. **Stable Effect Dependencies**: Only `gameId` and `pollingInterval` are in the dependency array - both primitive values
2. **Predictable Re-runs**: Effect only re-runs when `gameId` or `pollingInterval` actually changes
3. **No Circular Dependencies**: Fetch functions don't need to be tracked as dependencies
4. **Cleaner Code**: Function definitions are co-located with their usage
5. **Better Performance**: Intervals aren't unnecessarily cleared and recreated

## Files Changed

- `/lib/hooks.ts`
  - Fixed `useGameState` hook
  - Fixed `useChat` hook

## Testing

### Build Verification
```bash
npm run build
```
✅ Build completes successfully with no TypeScript errors

### Expected Behavior

1. **Game Creation Flow**:
   - Create game → Redirect to `/game/{game.id}`
   - Page loads once and remains stable
   - No reload loops

2. **Game State Polling**:
   - Polls every 2 seconds in the background
   - Updates UI without triggering navigation
   - Interval remains stable across re-renders

3. **Waiting for Opponent**:
   - Shows "Waiting for opponent..." message
   - Page remains stable (no reloads)
   - Polling continues in background
   - UI updates when second player joins

4. **Active Game**:
   - Moves are made and board updates
   - Polling continues without issues
   - No unexpected navigation or reloads

## React Hooks Best Practices

Based on this fix, here are best practices for similar situations:

### ✅ DO:
- Define fetch/callback functions inside `useEffect` when they're only used within that effect
- Include only primitive values (strings, numbers, booleans) in dependency arrays
- Use refs to track component mount state
- Clear intervals/timeouts in cleanup functions

### ❌ DON'T:
- Include callback functions in `useEffect` dependency arrays if they can cause re-render loops
- Use `useCallback` for functions that are only used inside a single `useEffect`
- Forget to check `mountedRef` before state updates (prevents memory leaks)
- Include objects or arrays in dependency arrays without proper memoization

## Additional Notes

This fix addresses the infinite reload loop by ensuring that:
1. Polling intervals are stable and only recreated when necessary
2. State updates don't trigger unnecessary effect re-runs
3. Navigation only happens when explicitly called (via `router.push()` on button clicks)
4. The component lifecycle is properly managed with cleanup functions

The solution follows React's recommended patterns for effects with polling/intervals and prevents the anti-pattern of including callbacks in dependency arrays.
