# CocoPay Pending Features Reference

This document tracks features from Jango's spec that are not yet implemented. Each feature includes implementation details, file references, and considerations for faster iteration.

---

## Feature Checklist

- [x] [CocoPay Labs 1% Split on All Stores](#cocopay-labs-1-split-on-all-stores) ✓ Implemented
- [ ] [Lazy Claiming + Pending Balance Display](#lazy-claiming--pending-balance-display)
- [ ] [Pay in Store Token (Token Transfer)](#pay-in-store-token-token-transfer)
- [ ] [Mainnet Gas Tax (~20 cents in USDC)](#mainnet-gas-tax-20-cents-in-usdc)
- [ ] [External Wallet Invoice Filling](#external-wallet-invoice-filling)
- [ ] [Unlock Bonus (Loan Refinancing)](#unlock-bonus-loan-refinancing)
- [ ] [Allow Codes for Merchant Launch](#allow-codes-for-merchant-launch) _(Deferred)_
- [ ] ["Reach Us" Button](#reach-us-button) _(Deferred)_

---

## CocoPay Labs 1% Split on All Stores

### Status: ✓ IMPLEMENTED

### Description

All CocoPay stores have a 1% reserved token split that routes directly to a CocoPay Labs multisig. The multisig accumulates store tokens from all CocoPay stores and can decide when to cash out or take loans against them.

### Jango's Spec

> "Let's table COCO for now. Let's just take the %'s into a coco labs multisig... our balance sheet will be in terms of store cococoins so we'll participate in the system by having to choose when to cash out / take loans."

### Implementation Summary

**Files Modified:**
| File | Change |
|------|--------|
| `.env.example` | Added `EXPO_PUBLIC_COCOPAY_LABS_MULTISIG` |
| `.env` | Set multisig address |
| `lib/juicebox/constants.ts` | Added split constants |
| `lib/juicebox/revnet-transforms.ts` | Updated `buildRevnetStageConfig` |

**Constants Added** (`lib/juicebox/constants.ts`):

```typescript
export const COCOPAY_LABS_MULTISIG = process.env.EXPO_PUBLIC_COCOPAY_LABS_MULTISIG as
  | `0x${string}`
  | undefined;
export const COCOPAY_LABS_SPLIT_PERCENT = 10_000_000; // 1%
export const STORE_OWNER_SPLIT_PERCENT = 990_000_000; // 99%
```

**Split Configuration** (`lib/juicebox/revnet-transforms.ts:56-85`):

- If `COCOPAY_LABS_MULTISIG` is set: 1% to CocoPay Labs, 99% to store owner
- If not set (fallback): 100% to store owner

### Token Flow on Payment

```
Payment → Tokens Minted
├── Cashback % → Payer (e.g., 5%)
└── Reserved % → Split Distribution (e.g., 95%)
    ├── 1% of reserved → CocoPay Labs multisig
    └── 99% of reserved → Store Owner
```

### How CocoPay Labs Participates

1. Each store payment distributes 1% of reserved tokens to the multisig
2. Multisig accumulates various store tokens (diversified portfolio)
3. CocoPay Labs can choose to:
   - **Cash out** (borrow against) tokens when needed
   - **Hold** tokens for potential value appreciation
   - **Spend** tokens at stores for services

---

## Lazy Claiming + Pending Balance Display

### Description

Optimize the payment and borrow flow by removing the claim step from payments and instead batching it with the borrow transaction. Also display pending reserved tokens in the UI so store owners see their full borrowable balance.

### Background

Currently, every payment includes a `sendReservedTokensToSplitsOf` call that claims reserved tokens for the store. This adds gas cost to every payment. Instead, we can:

1. Remove claiming from payment flow (faster, cheaper payments)
2. Add claiming to the borrow flow (batch: claim + borrow)
3. Show pending balance in UI so owners know their full borrowable amount

### Current State

- Payment batches: `[approve] → [pay] → [sendReservedTokensToSplitsOf]`
- Borrow only shows claimed token balance
- Store owners don't see pending reserved tokens

### Current Flow (in `useStorePay.ts:96-108`)

```typescript
result = await sendBatchedTransaction([
  { target: usdcAddress, data: approveData },
  { target: terminalAddress, data: payData },
  { target: controllerAddress, data: claimReservedData }, // Remove this
]);
```

### Target Flow

**Payment (faster):**

```typescript
result = await sendBatchedTransaction([
  { target: usdcAddress, data: approveData },
  { target: terminalAddress, data: payData },
  // No claim step - reserved tokens accumulate
]);
```

**Borrow (batch claim + borrow):**

```typescript
const claimData = encodeFunctionData({
  abi: jbControllerAbi,
  functionName: 'sendReservedTokensToSplitsOf',
  args: [projectId],
});

const borrowData = encodeFunctionData({
  abi: revLoans1_1Abi,
  functionName: 'borrowFrom',
  args: [...],
});

result = await sendBatchedTransaction([
  { target: controllerAddress, data: claimData },   // Claim first
  { target: loanContractAddress, data: borrowData }, // Then borrow
]);
```

### Files to Modify

1. **`hooks/useStorePay.ts`**
   - Remove `sendReservedTokensToSplitsOf` from payment batch

2. **`hooks/juicebox/useJBLoanBorrow.ts`**
   - Add `sendReservedTokensToSplitsOf` before `borrowFrom`

3. **New: `hooks/usePendingReservedTokens.ts`**

   ```typescript
   import { jbControllerAbi } from 'juice-sdk-core';

   export function usePendingReservedTokens(projectId: number, chainId: number) {
     // Call JBController.pendingReservedTokenBalanceOf(projectId)
     // Returns total pending reserved tokens for project
   }
   ```

4. **`hooks/useStoreDetails.ts`**
   - Add `usePendingReservedTokens` query
   - Calculate owner's share (99% after CocoPay Labs split, or 100% currently)
   - Add `pendingBalance` to `StoreDetails` type

5. **`components/containers/BorrowContainer.tsx`**
   - Update balance display to show: claimed + pending
   - Show breakdown: "100 claimed + 50 pending = 150 total"

### Contract Functions

**Get pending reserved tokens:**

```typescript
// JBController.pendingReservedTokenBalanceOf(projectId) → uint256
const pending = await publicClient.readContract({
  address: controllerAddress,
  abi: jbControllerAbi,
  functionName: 'pendingReservedTokenBalanceOf',
  args: [projectId],
});
```

**Claim reserved tokens:**

```typescript
// JBController.sendReservedTokensToSplitsOf(projectId)
encodeFunctionData({
  abi: jbControllerAbi,
  functionName: 'sendReservedTokensToSplitsOf',
  args: [projectId],
});
```

### Key Insight: Borrowing Requires Claimed Tokens

From `REVLoans.sol:756-770`:

```solidity
function _addCollateralTo(uint256 revnetId, uint256 amount) internal {
    // Burn the tokens that are tracked as collateral.
    CONTROLLER.burnTokensOf({
        holder: _msgSender(),
        projectId: revnetId,
        tokenCount: amount,
        memo: "Adding collateral to loan"
    });
}
```

**You cannot borrow against unclaimed tokens** - the loan contract burns tokens from your wallet. Tokens must be claimed first.

### UI Display

**Current:**

```
Balance: 100 $STORE
Cash out value: $95.00
```

**Target:**

```
Balance: 100 $STORE (claimed)
Pending: +50 $STORE (from recent sales)
────────────────────
Total:  150 $STORE
Cash out value: $142.50
```

### Considerations

- `pendingReservedTokenBalanceOf` returns TOTAL pending for project
- For store owner's share: multiply by their split percent (99% with CocoPay Labs split)
- Claim is a no-op if nothing pending (safe to always include)
- Reduces gas cost per payment by removing unnecessary claim

### Benefits

1. **Faster payments** - one less contract call
2. **Lower gas** - claiming batched only when needed
3. **Better UX** - store owners see full borrowable balance
4. **Same outcome** - tokens claimed right before borrow

---

## Pay in Store Token (Token Transfer)

### Description

When a user pays a store using that store's token (not USDC), it should be a direct token transfer to the store owner. The value displayed should be the cash out value without fees (since no cash out occurs).

### Jango's Spec

> "If a user pays a store in its token, this is the same as the user transferring their tokens to the store owner. The value of doing so is the standard cash out value of the tokens, without accounting for fees since they do not incur. Use reclaimableSurplusOf fn of terminalStore."

### Current State

- `useStorePay` only handles USDC payments via `jbMultiTerminal.pay()`
- No token transfer flow exists
- UI doesn't offer option to pay with store tokens

### Implementation Location

**New hook needed:** `hooks/useStoreTokenTransfer.ts`

**Existing reference for token operations:**

- `hooks/useReclaimableTokenValue.ts` - Uses `currentReclaimableSurplusOf` for value calculation
- `hooks/juicebox/useJBProjectRead.ts` - Has `jbTokensAbi` reference

**Pay flow:** `components/containers/PayContainer.tsx`

### Contract Functions Needed

**Token Transfer (from juice-sdk-core):**

```typescript
// jbControllerAbi - transferCreditsFrom
functionName: 'transferCreditsFrom',
args: [
  holder,      // Address - token holder
  projectId,   // uint256 - project ID
  recipient,   // Address - store owner
  amount,      // uint256 - token amount
]
```

**Value Calculation (already implemented):**

```typescript
// jbTerminalStoreAbi - currentReclaimableSurplusOf (hooks/useReclaimableTokenValue.ts:62-74)
functionName: 'currentReclaimableSurplusOf',
args: [
  projectId,
  tokenBalance,
  [],  // tokensToExclude
  [],  // terminalsToExclude
  BigInt(USDC_DECIMALS),
  BigInt(USDC_CURRENCY),
]
```

### Files to Modify

1. **New:** `hooks/useStoreTokenTransfer.ts`
   - Transfer tokens via `transferCreditsFrom`
   - Use Alchemy batched transaction

2. **Modify:** `components/containers/PayContainer.tsx`
   - Add payment method selection (USDC vs Store Token)
   - Check if user has store tokens for this store
   - Route to appropriate payment method

3. **Modify:** `components/presentational/pay-store-info.tsx`
   - Display user's token balance for this store
   - Show value in USD (from reclaimable calculation)

4. **New:** `hooks/useUserStoreTokenBalance.ts`
   - Get user's token balance for specific project
   - Already have `useMultiChainParticipations` that tracks this

### UI Considerations

- Only show token payment option if user has tokens for that store
- Display "Pay with [tokenSymbol]" alongside "Pay with USDC"
- Show equivalent USD value using `currentReclaimableSurplusOf`
- Clarify: "No fees - direct transfer to store owner"

### Considerations

- Simpler transaction than USDC payment (no approve step)
- Value display should NOT include cash out tax (10%)
- Need to find store owner address (from project or splits)
- May need to update `useStoreDetails` to include owner address

---

## Mainnet Gas Tax (~20 cents in USDC)

### Description

When users pay a store in USDC on Ethereum mainnet, they must pay a small ~20 cent tax to CocoPay to cover gas costs. This should be bundled into the USDC payment transaction.

### Jango's Spec

> "If a user pays a store in USDC on mainnet, they must also pay a small ~20 cent tax to cocopay to cover gas. (q: can this be in USDC and bundled into the pay tx?)"

### Current State

- No mainnet-specific fee logic exists
- All payments go directly to store with no CocoPay fee
- Gas is sponsored via Alchemy account abstraction

### Implementation Location

**Primary file:** `hooks/useStorePay.ts`

**Chain detection:** `lib/network/chains.ts`

```typescript
import { mainnet } from 'viem/chains';
const IS_MAINNET_CHAIN = chainId === mainnet.id; // chainId === 1
```

### Approach Options

**Option A: Additional USDC Transfer in Batch**

```typescript
// In useStorePay.ts - add to batch when on mainnet
const MAINNET_GAS_FEE = parseUnits('0.20', USDC_DECIMALS); // 20 cents
const COCOPAY_FEE_RECIPIENT = '0x...'; // CocoPay treasury

if (chainId === 1) {
  // Ethereum mainnet
  const feeTransferData = encodeFunctionData({
    abi: ERC20_ABI,
    functionName: 'transfer',
    args: [COCOPAY_FEE_RECIPIENT, MAINNET_GAS_FEE],
  });

  // Add to batch before pay transaction
  batch.unshift({ target: usdcAddress, data: feeTransferData });
}
```

**Option B: Increase Payment Amount**

- Add 20 cents to payment, CocoPay takes it as a split
- Requires $COCO split implementation first

### Required Constants

Add to `lib/constants.ts`:

```typescript
export const MAINNET_GAS_FEE_USDC = parseUnits('0.20', 6); // 20 cents
export const COCOPAY_FEE_RECIPIENT = '0x...'; // Treasury address
```

### Files to Modify

1. **Modify:** `hooks/useStorePay.ts`
   - Detect if chainId is mainnet (1)
   - Add fee transfer to transaction batch
   - Update approval amount if needed

2. **Modify:** `components/containers/PayContainer.tsx`
   - Show fee breakdown when on mainnet
   - Display: "Amount: $X.XX + $0.20 network fee"

3. **Modify:** `components/presentational/pay-balance-display.tsx`
   - Account for fee in balance validation
   - Show total cost including fee

### UI Considerations

- Clearly display the fee before payment confirmation
- Only show fee on Ethereum mainnet, not L2s
- Fee should be included in total "you will pay" amount
- Consider: fee might need adjustment based on actual gas costs

### Considerations

- Fee recipient address needs to be determined
- Could be CocoPay multisig or treasury contract
- Answer to Jango's question: Yes, can be bundled via Alchemy batch
- Only applies to sponsored payments (in-app), not external wallets

---

## External Wallet Invoice Filling

### Description

Allow users to fill CocoPay invoices through external wallets (MetaMask, Rainbow, etc.). These payments will NOT be gas sponsored - users pay their own gas.

### Jango's Spec

> "The app should allow people to fill CocoPay invoices through other wallets, though these won't be gas sponsored."

### Current State

- All payments use Alchemy smart account (sponsored gas)
- No WalletConnect or external wallet connection
- Charge QR shows payment URL but only for in-app use

### Implementation Approach

**Option A: WalletConnect Integration**

- Add WalletConnect v2 to allow external wallet connections
- Generate payment transactions for external signing
- Complex: requires wallet state management

**Option B: Payment Link / Deep Link**

- Generate a payment URL that opens external wallets
- Use EIP-681 format for Ethereum payment requests
- Simpler: wallet handles everything

**Option C: Display Raw Transaction Data**

- Show contract address, function, and parameters
- User copies to their wallet manually
- Simplest but worst UX

### Payment URL Format (EIP-681)

```
ethereum:<terminal_address>/pay?
  uint256=<projectId>&
  address=<usdcAddress>&
  uint256=<amount>&
  address=<beneficiary>&
  uint256=0&
  bytes=<memo>&
  bytes=<metadata>
```

### Files to Create/Modify

1. **New:** `lib/payment-link.ts`
   - Generate EIP-681 payment URLs
   - Generate WalletConnect URIs

2. **Modify:** `components/presentational/charge-qr-display.tsx`
   - Add "Pay with External Wallet" option
   - Display payment link or WalletConnect QR

3. **New (if WalletConnect):** `hooks/useExternalWallet.ts`
   - WalletConnect session management
   - Transaction submission

4. **New (if WalletConnect):** `providers/WalletConnectProvider.tsx`
   - WalletConnect v2 initialization

### Package Dependencies (if WalletConnect)

```json
{
  "@walletconnect/modal-react-native": "^1.x",
  "@walletconnect/web3wallet": "^1.x"
}
```

### Contract Reference

External wallets need to call the same contract:

```typescript
// JBMultiTerminal.pay()
{
  address: getMultiTerminalAddress(chainId),
  abi: jbMultiTerminalAbi,
  functionName: 'pay',
  args: [projectId, usdcAddress, amount, beneficiary, 0n, memo, metadata],
}
```

### Considerations

- User must have USDC and approve terminal first
- No gas sponsorship - user pays their own gas
- Need to handle approval flow in external wallet
- Consider showing step-by-step instructions
- WalletConnect adds significant complexity

### Recommendation

Start with **Option B (Payment Link)** for simplest implementation. Merchants can share payment links that open in user's wallet app.

---

## Unlock Bonus (Loan Refinancing)

### Description

When a user's loan collateral increases in value over time, offer options to:

1. Borrow more USDC without adding collateral (refinance to borrow more)
2. Remove excess collateral while keeping the same loan amount (refinance to unlock tokens)

### Jango's Spec

> "To the extent loan collateral increases in value over time, give user option to 'Unlock bonus', which gives the user either access to more USDC without cashing out more tokens (refinancing the loan to borrow more against existing collateral), or more of the token (refinancing the loan to remove collateral to the minimum necessary to sustain the existing loaned amount)."

### Current State

- `BorrowContainer` only handles new loans
- `useJBLoanBorrow` creates new loans
- No refinance or collateral adjustment UI
- `useJBLoanRead` can read existing loan data

### Contract Functions (from REVLoans.sol)

**Reallocate Collateral (refinance):**

```typescript
// REVLoans.sol:619 - reallocateCollateralFromLoan
functionName: 'reallocateCollateralFromLoan',
args: [
  loanId,                    // uint256 - existing loan ID
  collateralCountToTransfer, // uint256 - amount to move to new loan
  source,                    // REVLoanSource - terminal/token
  minBorrowAmount,           // uint256 - minimum USDC to receive
  collateralCountToAdd,      // uint256 - additional collateral
  prepaidFeePercent,         // uint256 - fee percent
  beneficiary,               // address - receives funds
  allowance,                 // JBSingleAllowance - permit2
]
```

**Repay Loan (partial or full):**

```typescript
// REVLoans.sol:667 - repayLoan
functionName: 'repayLoan',
args: [
  loanId,                   // uint256 - loan to repay
  maxRepayBorrowAmount,     // uint256 - max USDC to repay
  collateralCountToReturn,  // uint256 - collateral to get back
  beneficiary,              // address - receives collateral
  allowance,                // JBSingleAllowance - permit2
]
```

### Implementation Location

**New files needed:**

- `hooks/juicebox/useJBLoanRefinance.ts` - Refinancing operations
- `hooks/useActiveLoan.ts` - Track user's active loans
- `components/containers/RefinanceContainer.tsx` - Refinance UI
- `components/presentational/unlock-bonus-card.tsx` - Display bonus available
- `app/(app)/refinance/index.tsx` - Refinance route

**Existing files to modify:**

- `components/presentational/borrow-success.tsx` - Link to manage loan
- `app/(app)/store/[id].tsx` - Show "Unlock Bonus" when available

### Value Calculation Logic

```typescript
// Check if collateral value increased
const currentCollateralValue = await getCurrentReclaimableValue(loan.collateral);
const originalBorrowAmount = loan.amount;

// If collateral now worth more, bonus is available
const bonusValue = currentCollateralValue - originalBorrowAmount;
const hasBonusAvailable = bonusValue > 0;

// Option 1: Borrow more against same collateral
const additionalBorrowable = bonusValue * (1 - feePercent);

// Option 2: Unlock excess collateral
const minimumCollateral = getMinimumCollateralFor(originalBorrowAmount);
const unlockableCollateral = loan.collateral - minimumCollateral;
```

### UI Flow

1. User views store → sees "Unlock Bonus Available" badge
2. Taps badge → opens refinance screen
3. Two options presented:
   - "Borrow More" - Shows additional USDC available
   - "Unlock Tokens" - Shows tokens that can be retrieved
4. User selects amount and confirms

### Considerations

- Need to track active loans per user per project
- Loan value depends on token price (reclaimable amount)
- Prepaid fee affects when refinancing is profitable
- UI should clearly show original loan vs current value
- Loan NFT ownership determines who can refinance

---

## Allow Codes for Merchant Launch

### Status: DEFERRED

_User decided to defer this feature for now._

### Description

Gate store creation behind one-time user allow codes that let merchants launch. Merchants without a code see a "Reach Us" button.

### Jango's Spec

> "Let's gas sponsor store creation, though gate it behind one-time user allow codes that let merchants launch."

### Implementation Notes (for future reference)

- Options: signed codes, merkle tree, on-chain registry, NFT gate
- Signed codes are simplest (no backend required)
- Code validation would happen in `CreateStoreContainer` before deployment
- Store `usedCodes` in contract or track off-chain

---

## "Reach Us" Button

### Status: DEFERRED

_Related to allow codes feature._

### Description

When a merchant doesn't have an allow code, show a "Reach Us" button so they can express interest.

### Jango's Spec

> "With a 'reach us' button if a store is interested."

### Implementation Notes (for future reference)

- Simple: Open email link or Discord invite
- Alternative: In-app form that sends to backend
- Would appear in create store flow when code is required but not provided

---

## Quick Reference: Key Files

| Area             | File                                        | Purpose                   |
| ---------------- | ------------------------------------------- | ------------------------- |
| Splits           | `lib/juicebox/revnet-transforms.ts`         | Configure store splits    |
| Constants        | `lib/juicebox/constants.ts`                 | Add COCO project ID, fees |
| Types            | `types/revnet.ts`                           | JBSplit, REVStageConfig   |
| Pay Hook         | `hooks/useStorePay.ts`                      | USDC payment execution    |
| Loan             | `hooks/juicebox/useJBLoanBorrow.ts`         | Borrow/cash out           |
| Loan Quote       | `hooks/juicebox/useJBLoanQuote.ts`          | Get borrowable amount     |
| Loan Read        | `hooks/juicebox/useJBLoanRead.ts`           | Read loan details         |
| Reclaimable      | `hooks/useReclaimableTokenValue.ts`         | Token → USD value         |
| Chain Config     | `lib/network/chains.ts`                     | Mainnet detection         |
| Pay Container    | `components/containers/PayContainer.tsx`    | Payment UI orchestration  |
| Borrow Container | `components/containers/BorrowContainer.tsx` | Cash out UI               |

---

## Quick Reference: Contract ABIs

| Contract        | ABI Import           | Key Functions                                             |
| --------------- | -------------------- | --------------------------------------------------------- |
| JBMultiTerminal | `jbMultiTerminalAbi` | `pay`, `addToBalanceOf`                                   |
| JBController    | `jbControllerAbi`    | `transferCreditsFrom`, `setSplitGroupsOf`                 |
| JBTerminalStore | `jbTerminalStoreAbi` | `currentReclaimableSurplusOf`                             |
| REVLoans        | `revLoans1_1Abi`     | `borrowFrom`, `repayLoan`, `reallocateCollateralFromLoan` |
| ERC20           | `ERC20_ABI` (local)  | `approve`, `transfer`, `transferFrom`                     |

---

## Quick Reference: Key Constants

```typescript
// From juice-sdk-core
SPLITS_TOTAL_PERCENT = 1_000_000_000  // 100% = 1 billion

// Percent calculations
1% split = 10_000_000
5% split = 50_000_000
99% split = 990_000_000

// USDC
USDC_DECIMALS = 6
parseUnits('1.00', 6) = 1000000n  // $1.00

// JB Tokens
JB_TOKEN_DECIMALS = 18
parseUnits('1', 18) = 1000000000000000000n

// Chain IDs
Ethereum Mainnet = 1
Base = 8453
Arbitrum = 42161
Optimism = 10
```
