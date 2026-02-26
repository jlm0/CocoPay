- Hierarchy: `ui/` → `presentational/` → `containers/` → routes (`app/`)
- Check `ui/` for existing primitives before creating custom components
- Use kebab-case for file names, PascalCase for exports
- 5-color palette only: black `#0A0A0A`, white `#FAFAFA`, pink `#FF2E63`, green `#BAFF29`, blue `#00D4FF`
- Green is primary/CTA/success, pink is destructive/accent, blue is info/secondary
- No rounded corners — 0px border-radius everywhere
- Hard-offset brutal shadows (e.g., `shadow-brutal-md`) — no blur, no soft shadows
- Use Nativewind for all styling — reference `docs/DESIGN_SYSTEM.md` for tokens

## Container Architecture
- **Orchestration Only**: Containers should act as conductors. If a Container requires complex input parsing or state derivation, extract that logic into a custom hook (e.g., `usePayScreenLogic`). The Container should generally be less than 150 lines.
- **Data Handling**: Containers must explicitly handle `isLoading` and `error` states from hooks before rendering the presentational component.

## Presentational Components
- **Props Only**: Dumb components must rely entirely on props. They cannot import store hooks, API clients, or context directly.
- **No Prop Drilling**: If a presentational component requires passing data through more than 2 layers of children, consider breaking it down or composing it via `children` prop (Slots pattern) in the Container.

## Animation (Reanimated)
- **Shared Values**: Use `useSharedValue` for any animation driven by gestures (pan, scroll) or high-frequency updates (60fps). Avoid React `useState` for values that change every frame.
- **Derived Values**: Use `useDerivedValue` to compute dependent animation states on the UI thread.
- **Worklets**: Ensure any function passed to `runOnUI` or used in `useAnimatedStyle` is marked with the `'worklet';` directive if it's defined outside a hook.
- **Layout Animations**: Prefer `LayoutAnimation` (entering/exiting props) for simple mount/unmount transitions over manual opacity interpolation.

## Component Selection Heuristics
- **Bottom Sheet**: Use for complex secondary contexts, forms, or flows that maintain context of the screen behind it (e.g., "Account Details", "Token Select", "Transaction Review").
- **Dialog/Alert**: Strictly for quick confirmations, destructive actions (Delete?), or critical system messages. Keep content minimal.
- **Modal (Full Screen)**: Use for distinct, self-contained workflows that require full focus (e.g., "Onboarding", "Auth", "Scanner").
- **Toast**: For transient success/error messages that do not require user acknowledgment.

## Success & Error UX
- **Success States**:
    - **Visual Confirmation**: Always provide positive reinforcement for successful actions (e.g., checkmark animation, success toast, haptic feedback).
    - **Transition**: On success, automatically transition the user to the next logical step or reset the form state. Don't leave them on a "stale" success screen.
- **Error States**:
    - **Inline Validation**: For form inputs, show errors inline below the specific field immediately after validation fails (onBlur or onChange).
    - **Actionable Messages**: Error messages must be actionable. Avoid "Something went wrong." Instead, use "Failed to load balance. Pull to refresh."
    - **Recovery**: Provide a clear "Retry" button for network errors within the component itself.
