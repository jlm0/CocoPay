# Cocopay Economics: Complete Fee & Revenue Analysis

A comprehensive breakdown of all fees, revenue flows, and economic levers available to Cocopay stores.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Fee Structure Overview](#fee-structure-overview)
3. [Payment Flow Analysis](#payment-flow-analysis)
4. [Cash Out Flow Analysis](#cash-out-flow-analysis)
5. [Current Cocopay Configuration](#current-cocopay-configuration)
6. [Revenue Opportunities](#revenue-opportunities)
7. [Economic Levers](#economic-levers)
8. [Simulations](#simulations)
9. [Recommendations](#recommendations)

---

## Executive Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         KEY FINDINGS                                        │
└─────────────────────────────────────────────────────────────────────────────┘

    CURRENT STATE:
    • Cash out tax: 10% (cashOutTaxRate: 1000 out of 10,000)
    • Protocol fees on cash out: ~5% (2.5% Revnet + 2.5% JB DAO)
    • Cocopay token revenue: 1% of store's token share
    • Treasury yield: $0 (idle USDC)

    IMPLICATIONS:
    • 10% cash out tax creates meaningful loyalty incentive
    • Spending tokens is ~17% better than cashing out
    • Store owners get tokens, not USDC directly
    • Protocol fees still capture ~5% on any cash out

    ⚠️  CRITICAL BUSINESS PROBLEM:
    • ~15% total fees (10% tax + 5% protocol) on cash out
    • Cashing out makes Cocopay MORE EXPENSIVE than traditional payments
    • Only viable path: Community Commerce (spend tokens, don't cash out)

    ⚠️  CRITICAL DEPENDENCY: NETWORK DENSITY
    • Community Commerce REQUIRES enough participants
    • Customer needs stores to spend tokens at
    • Store needs customers with tokens to accept
    • Without critical mass → everyone cashes out → economics fail

    OPPORTUNITIES:
    • Increase cash out tax to create store/customer benefits
    • Implement treasury yield strategies
    • Add platform fee on payments
    • Leverage community commerce (spend vs cash out)
```

---

## Fee Structure Overview

### All Fees in the System

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE FEE MAP                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    ON PAYMENTS (Customer → Store):
    ┌────────────────────┬────────────┬─────────────────────────────────────┐
    │ Fee                │ Rate       │ Recipient                           │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ None currently     │ 0%         │ -                                   │
    └────────────────────┴────────────┴─────────────────────────────────────┘

    100% of payment goes to treasury (backs tokens 1:1)


    ON CASH OUTS (Token Holder → USDC):
    ┌────────────────────┬────────────┬─────────────────────────────────────┐
    │ Fee                │ Rate       │ Recipient                           │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ Cash Out Tax       │ 10%        │ Treasury (benefits remaining        │
    │                    │            │ token holders)                      │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ Revnet Fee         │ 2.5%       │ Revnet Protocol (FEE_REVNET_ID)     │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ JB DAO Fee         │ 2.5%       │ Juicebox Protocol ($NANA revnet)    │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ TOTAL              │ ~15%       │                                     │
    └────────────────────┴────────────┴─────────────────────────────────────┘

    * Cocopay config: cashOutTaxRate = 1000 (out of 10,000 = 10%)


    ON LOANS (if using REVLoans):
    ┌────────────────────┬────────────┬─────────────────────────────────────┐
    │ Fee                │ Rate       │ Recipient                           │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ JB Protocol Fee    │ 2.5%       │ Juicebox Protocol                   │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ Source Fee         │ 2.5-50%    │ Source Revnet (the store)           │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ REV Fee            │ 1%         │ REV ecosystem                       │
    └────────────────────┴────────────┴─────────────────────────────────────┘
```

### Fee Verification (Contract-Level Analysis)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FEE VERIFICATION FROM SOURCE CODE                        │
└─────────────────────────────────────────────────────────────────────────────┘

    CONFIRMED: TWO separate 2.5% fees exist

    FEE 1: REVNET FEE (2.5%)
    Source: revnet-core-v5/src/REVDeployer.sol
    ────────────────────────────────────────────────────────────────────────
    • FEE = 25 (out of JBConstants.MAX_FEE = 1000) = 2.5%
    • Applied to TOKENS being burned
    • Paid to FEE_REVNET_ID (the $REV revnet)
    • Code: feeCashOutCount = mulDiv(context.cashOutCount, FEE, MAX_FEE)

    FEE 2: JB DAO / NANA FEE (2.5%)
    Source: juice-sdk-core/constants.js
    ────────────────────────────────────────────────────────────────────────
    • JBDAO_CASHOUT_FEE_PERCENT = 0.025 = 2.5%
    • Applied to RECLAIMABLE AMOUNT (USDC output)
    • Paid to Bananapus/JB DAO
    • Code: applyJbDaoCashOutFee(reclaimableAmount) in SDK

    VERIFIED IN: revnet-app/src/lib/reclaimableSurplus.ts
    ────────────────────────────────────────────────────────────────────────
    const userReclaimable = await contract.read.currentReclaimableSurplusOf([
      BigInt(projectId),
      applyRevFee(tokenAmountWei),     // ← First: 2.5% off tokens
      ...
    ]);
    return applyNanaFee(userReclaimable);  // ← Then: 2.5% off USDC

    MATH: Fees are MULTIPLICATIVE, not additive
    ────────────────────────────────────────────────────────────────────────
    • Total fee ≠ 2.5% + 2.5% = 5%
    • Total fee = 1 - (0.975 × 0.975) = 1 - 0.950625 = 4.9375%
    • Plus 0.1% cash out tax = ~5.04% total

    KEY INSIGHT: Token Transfers = 0% Fees
    ────────────────────────────────────────────────────────────────────────
    • Cash out (burn tokens for USDC): ~5% protocol fees
    • Token transfer (send tokens to another wallet): 0% fees
    • This applies same-chain AND cross-chain (via suckers)
    • COMMUNITY COMMERCE: Pay with tokens = transfer, not cash out
```

### Fee Application Order (Cash Outs)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASH OUT FEE SEQUENCE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer cashes out 100 tokens (backing = $1.00/token):

    Step 1: Calculate gross reclaimable
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross = (tokens / supply) × treasury                             │
    │   Gross = 100 tokens × $1.00 = $100.00                            │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    Step 2: Apply Cash Out Tax (10%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tax = $100.00 × 10% = $10.00                                     │
    │   Reclaimable = $100.00 - $10.00 = $90.00                         │
    │   $10.00 stays in treasury (benefits other holders)               │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    Step 3: Apply Revnet Fee (2.5%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Fee = $90.00 × 2.5% = $2.25                                      │
    │   After = $90.00 - $2.25 = $87.75                                 │
    │   $2.25 → Revnet Protocol                                         │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    Step 4: Apply JB DAO Fee (2.5%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Fee = $87.75 × 2.5% = $2.19                                      │
    │   After = $87.75 - $2.19 = $85.56                                 │
    │   $2.19 → Juicebox Protocol                                       │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    RESULT: Customer receives $85.56 (85.56% of backing)

    FEE BREAKDOWN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cash Out Tax (to treasury):     $10.00 (10%)                    │
    │   Revnet Fee:                     $2.25  (2.5% of remainder)      │
    │   JB DAO Fee:                     $2.19  (2.5% of remainder)      │
    │   ─────────────────────────────────────────────────────────       │
    │   Total Fees:                     $14.44 (14.44%)                 │
    │   Customer Receives:              $85.56 (85.56%)                 │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Payment Flow Analysis

### Complete Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PAYMENT FLOW (No Fees on Payments)                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer pays $100 USDC with 5% cashback configured:

    $100 USDC ─────────────────────────────────────► TREASURY (+$100)
         │                                                │
         │ triggers mint                                  │ backs
         ▼                                                ▼
    100 $STORE tokens minted                    All tokens at $1.00 backing
         │
         │ split by cashback % and token splits
         ▼
    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │   CUSTOMER SHARE (5% cashback):                                     │
    │   └── 5.00 tokens → Customer                                        │
    │                                                                     │
    │   STORE SHARE (95%):                                                │
    │   ├── 0.95 tokens → Cocopay Labs (1% of 95)                        │
    │   └── 94.05 tokens → Store Owner (99% of 95)                       │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘

    VALUE DISTRIBUTION:
    ┌──────────────────┬─────────────┬────────────────┐
    │ Recipient        │ Tokens      │ Value at $1.00 │
    ├──────────────────┼─────────────┼────────────────┤
    │ Customer         │ 5.00        │ $5.00          │
    │ Cocopay Labs     │ 0.95        │ $0.95          │
    │ Store Owner      │ 94.05       │ $94.05         │
    ├──────────────────┼─────────────┼────────────────┤
    │ TOTAL            │ 100.00      │ $100.00        │
    └──────────────────┴─────────────┴────────────────┘
```

### Cashback Configuration Impact

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASHBACK % IMPACT (per $100 payment)                     │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌───────────┬──────────────┬───────────────┬──────────────┐
    │ Cashback  │ Customer     │ Cocopay Labs  │ Store Owner  │
    │ %         │ Tokens       │ Tokens        │ Tokens       │
    ├───────────┼──────────────┼───────────────┼──────────────┤
    │ 0%        │ 0            │ 1.00          │ 99.00        │
    │ 5%        │ 5            │ 0.95          │ 94.05        │
    │ 10%       │ 10           │ 0.90          │ 89.10        │
    │ 15%       │ 15           │ 0.85          │ 84.15        │
    │ 20%       │ 20           │ 0.80          │ 79.20        │
    └───────────┴──────────────┴───────────────┴──────────────┘

    COCOPAY REVENUE AT SCALE:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Monthly Payment Volume    Cocopay Tokens    Value (at $1.00)    │
    │   ─────────────────────     ──────────────    ─────────────────   │
    │   $10,000                   95                $95                  │
    │   $100,000                  950               $950                 │
    │   $1,000,000                9,500             $9,500               │
    │                                                                    │
    │   Note: Cocopay receives TOKENS, not USDC.                        │
    │   Must cash out (pay ~5% protocol fees) to realize revenue.       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Cash Out Flow Analysis

### Who Pays What When Cashing Out

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASH OUT SCENARIOS                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    SCENARIO: Customer cashes out 5 tokens ($5.00 backing)

    With current config (0.1% cash out tax):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross value:           $5.00                                     │
    │   Cash out tax (0.1%):   -$0.005 → Treasury                       │
    │   Revnet fee (2.5%):     -$0.125 → Revnet Protocol                │
    │   JB fee (2.5%):         -$0.122 → JB Protocol                    │
    │   ────────────────────────────────────────────────                │
    │   Customer receives:     $4.75 (95% of backing)                   │
    └────────────────────────────────────────────────────────────────────┘


    SCENARIO: Store owner cashes out 94 tokens ($94.00 backing)

    With current config (0.1% cash out tax):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross value:           $94.00                                    │
    │   Cash out tax (0.1%):   -$0.09 → Treasury                        │
    │   Revnet fee (2.5%):     -$2.35 → Revnet Protocol                 │
    │   JB fee (2.5%):         -$2.29 → JB Protocol                     │
    │   ────────────────────────────────────────────────────────        │
    │   Store owner receives:  $89.27 (95% of backing)                  │
    └────────────────────────────────────────────────────────────────────┘


    THE PROBLEM:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   With 0.1% cash out tax, almost nothing stays in treasury.       │
    │   The ~5% fee goes to PROTOCOLS (Revnet + JB), not to the         │
    │   store ecosystem.                                                 │
    │                                                                    │
    │   This means:                                                      │
    │   • No meaningful "stayer vs leaver" dynamics                     │
    │   • No value transfer to loyal customers                          │
    │   • Store owners lose 5% when converting to USDC                  │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Current Cocopay Configuration

### Hardcoded Values (from codebase)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT CONFIGURATION                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    FROM: lib/juicebox/constants.ts
    ─────────────────────────────────────────────────────────────────────────
    COCOPAY_ISSUANCE_CUT_PERCENT = 0.5      // 0.5% issuance decay
    COCOPAY_LABS_SPLIT_PERCENT = 10,000,000  // 1% of store share
    STORE_OWNER_SPLIT_PERCENT = 990,000,000  // 99% of store share

    FROM: lib/juicebox/revnet-transforms.ts
    ─────────────────────────────────────────────────────────────────────────
    cashOutTaxRate = 1000                    // 10% (out of 10,000)
    initialIssuance = 1e18                   // 1:1 token:USDC
    issuanceCutFrequency = 7,776,000         // ~90 days (quarterly)

    PROTOCOL FEES (not configurable):
    ─────────────────────────────────────────────────────────────────────────
    Revnet Fee = 2.5%                        // FEE = 25 out of 1000
    JB DAO Fee = 2.5%                        // JBDAO_CASHOUT_FEE_PERCENT

    MAX VALUES (from juice-sdk-core):
    ─────────────────────────────────────────────────────────────────────────
    MAX_RESERVED_PERCENT = 10,000            // 100%
    MAX_CASH_OUT_TAX_RATE = 10,000           // 100%
    MAX_WEIGHT_CUT_PERCENT = 1,000,000,000   // 100%
    SPLITS_TOTAL_PERCENT = 1,000,000,000     // 100%
```

### What This Means

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTERPRETATION                                           │
└─────────────────────────────────────────────────────────────────────────────┘

    cashOutTaxRate = 1000 out of 10,000 = 10%

    This creates meaningful loyalty incentives.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   With 10% cash out tax:                                           │
    │                                                                    │
    │   • Cash out $100 tokens → $10 stays in treasury                  │
    │   • Remaining holders benefit from increased backing              │
    │   • Spending tokens is ~17% better than cashing out               │
    │   • Creates clear "stay vs leave" incentive                       │
    │                                                                    │
    │   Trade-off:                                                       │
    │   • Higher friction to exit (may concern some users)              │
    │   • But value stays in ecosystem, not leaked to protocols         │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Loans as Cash Out Alternative

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LOAN VS CASH OUT COMPARISON                              │
└─────────────────────────────────────────────────────────────────────────────┘

    REVLoans allows borrowing against tokens instead of cashing out.
    If you "borrow and never repay" = effectively cash out with lower fees.

    CASH OUT FEES:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cash Out Tax (to treasury):     10%                              │
    │   Revnet Fee (to $REV):           ~2.25%                          │
    │   JB DAO Fee (to Bananapus):      ~2.19%                          │
    │   ────────────────────────────────────────────────────────        │
    │   TOTAL:                          ~14.44%                          │
    │   You receive:                    ~85.56%                          │
    └────────────────────────────────────────────────────────────────────┘

    LOAN FEES (minimum prepaid, never repay):
    ┌────────────────────────────────────────────────────────────────────┐
    │   JB Protocol Fee:                2.5%                             │
    │   Source Fee (to store treasury): 2.5% (minimum)                   │
    │   REV Fee (to $REV):              1%                               │
    │   ────────────────────────────────────────────────────────        │
    │   TOTAL:                          ~6%                              │
    │   You receive:                    ~94%                             │
    └────────────────────────────────────────────────────────────────────┘

    COMPARISON ($100 of tokens):
    ┌──────────────────┬──────────────┬──────────────┬──────────────┐
    │ Method           │ Fee          │ You Receive  │ Savings      │
    ├──────────────────┼──────────────┼──────────────┼──────────────┤
    │ Cash Out         │ $14.44       │ $85.56       │ -            │
    │ Loan (no repay)  │ $6.00        │ $94.00       │ +$8.44       │
    └──────────────────┴──────────────┴──────────────┴──────────────┘

    ✅  LOANS ARE ~8.5% CHEAPER THAN CASH OUTS

    HOW "BORROW AND NEVER REPAY" WORKS:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   1. Deposit tokens as collateral                                  │
    │   2. Borrow USDC against them (pay ~6% upfront fee)               │
    │   3. Never repay the loan                                          │
    │   4. After 10 years, collateral is liquidated                     │
    │                                                                    │
    │   Net effect: You got USDC, lost tokens, paid ~6%                 │
    │   Same as cash out, but 8.5% cheaper!                             │
    │                                                                    │
    │   With minimum prepaid (2.5%):                                     │
    │   • Prepaid duration = 6 months                                    │
    │   • After 6 months, variable fees start accruing                  │
    │   • After 10 years, collateral gone                               │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    WHERE THE FEES GO:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Cash Out:                                                        │
    │   • 10% → Store treasury (benefits holders)                       │
    │   • 4.5% → Protocols (leaked from ecosystem)                      │
    │                                                                    │
    │   Loan:                                                            │
    │   • 2.5% → Store treasury (benefits holders)                      │
    │   • 3.5% → Protocols (JB + REV)                                   │
    │                                                                    │
    │   Loan retains LESS in treasury but leaks LESS to protocols       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Loan Strategy for Cocopay Revenue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COCOPAY REVENUE VIA LOANS                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Cocopay earns 0.9% of payment volume in tokens.
    Per $10,000 payment volume: 90 tokens ($90 value)

    OPTION A: Cash out tokens
    ┌────────────────────────────────────────────────────────────────────┐
    │   90 tokens × $85.56% = $77.00 USDC                               │
    │   Lost to fees: $13.00 (14.44%)                                   │
    └────────────────────────────────────────────────────────────────────┘

    OPTION B: Borrow against tokens (never repay)
    ┌────────────────────────────────────────────────────────────────────┐
    │   90 tokens × $94% = $84.60 USDC                                  │
    │   Lost to fees: $5.40 (6%)                                        │
    └────────────────────────────────────────────────────────────────────┘

    SAVINGS: $7.60 per $10,000 payment volume (+10% more revenue)

    AT SCALE (100 stores, $100K/month each):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Payment volume: $10M/month                                       │
    │   Cocopay tokens: $90,000/month                                    │
    │                                                                    │
    │   Cash out revenue: $77,000/month                                  │
    │   Loan revenue: $84,600/month                                      │
    │   Savings: $7,600/month ($91,200/year)                            │
    └────────────────────────────────────────────────────────────────────┘
```

### Loan vs Cash Out Decision Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHEN TO USE LOANS VS CASH OUT                            │
└─────────────────────────────────────────────────────────────────────────────┘

    USE LOANS WHEN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   • You need liquidity but don't want to "exit"                   │
    │   • You want to minimize fees (6% vs 14.5%)                       │
    │   • You're OK losing collateral eventually                        │
    │   • You want to retain upside if token value increases            │
    │     (can repay loan and reclaim collateral)                       │
    └────────────────────────────────────────────────────────────────────┘

    USE CASH OUT WHEN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   • You want clean exit (no lingering loan)                       │
    │   • You want more value to stay in treasury (10% vs 2.5%)        │
    │   • You're philosophically opposed to "debt"                      │
    └────────────────────────────────────────────────────────────────────┘

    INTERESTING TRADE-OFF:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Cash out: More expensive, but 10% stays in treasury             │
    │   Loan: Cheaper, but only 2.5% goes to treasury                   │
    │                                                                    │
    │   If goal is ECOSYSTEM HEALTH → Cash out is better                │
    │   (more value retained for other holders)                         │
    │                                                                    │
    │   If goal is INDIVIDUAL GAIN → Loan is better                     │
    │   (you keep more, but ecosystem benefits less)                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Revenue Opportunities

### Current Revenue: Token Splits Only

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT COCOPAY REVENUE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Revenue source: 1% of store's token share

    Example: Store processes $100,000/month, 5% cashback
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Total tokens minted: 100,000                                     │
    │   Customer tokens (5%): 5,000                                      │
    │   Store side (95%): 95,000                                         │
    │                                                                    │
    │   Cocopay Labs (1% of 95,000): 950 tokens                         │
    │   Store Owner (99% of 95,000): 94,050 tokens                      │
    │                                                                    │
    │   Cocopay revenue: 950 tokens × $1.00 = $950/month                │
    │   If cashed out (5% fees): $902.50/month actual                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    AT SCALE (100 stores, $100K/month each):
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Total payment volume: $10M/month                                 │
    │   Cocopay tokens: 95,000/month                                     │
    │   Token value: $95,000                                             │
    │   After cash out fees: ~$90,250/month                             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Opportunity 1: Payment Fee

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION: PAYMENT FEE                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Add a small fee on payments (like Stripe's 2.9%).

    Example: 1% payment fee on $100:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer pays $100                                               │
    │   Payment fee (1%): $1.00 → Cocopay (USDC)                        │
    │   To treasury: $99.00                                              │
    │   Tokens minted: 99 (backing = $1.00/token)                       │
    │                                                                    │
    │   Cocopay gets USDC directly, no cash out fees!                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    AT SCALE (100 stores, $100K/month each):
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Payment volume: $10M/month                                       │
    │   1% fee: $100,000/month (direct USDC)                            │
    │                                                                    │
    │   vs current token model: ~$90,250/month                          │
    │   Increase: +$9,750/month (+10.8%)                                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    IMPLEMENTATION:
    • Would require payment wrapper or hook
    • Deduct fee before terminal receives funds
    • Tokens backed at slightly lower rate
```

### Opportunity 2: Treasury Yield

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION: TREASURY YIELD                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    Deploy idle treasury USDC to yield-generating protocols.

    Example: $1M total TVL across stores, 5% APY
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   TVL: $1,000,000                                                  │
    │   APY: 5%                                                          │
    │   Annual yield: $50,000                                            │
    │                                                                    │
    │   Split options:                                                   │
    │   • 100% to token holders: Backing increases                       │
    │   • 100% to Cocopay: Platform revenue                             │
    │   • 50/50 split: Both benefit                                      │
    │                                                                    │
    │   At 50/50: $25,000/year to Cocopay                               │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    IMPLEMENTATION CHALLENGES:
    • Revnet terminals hold USDC directly
    • Would need custom terminal or wrapper
    • Smart contract risk from DeFi protocols
    • Liquidity constraints (can't redeem instantly)
```

### Opportunity 3: Increase Cash Out Tax

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION: HIGHER CASH OUT TAX                              │
└─────────────────────────────────────────────────────────────────────────────┘

    Current: 0.1% (essentially zero)
    Option: Increase to 10-20%

    Why this matters:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   With 0.1% tax:                                                   │
    │   • $100 cash out → $0.10 stays in treasury                       │
    │   • No meaningful loyalty reward                                   │
    │                                                                    │
    │   With 15% tax:                                                    │
    │   • $100 cash out → $15.00 stays in treasury                      │
    │   • Backing increases for remaining holders                        │
    │   • Creates "stay vs leave" incentive                             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    COMBINED FEES WITH 15% CASH OUT TAX:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Cash out $100:                                                   │
    │   Cash out tax (15%):  $15.00 → Treasury                          │
    │   Revnet fee (2.5%):   $2.13 → Revnet                             │
    │   JB fee (2.5%):       $2.07 → JB                                 │
    │   ─────────────────────────────────────────────                   │
    │   Customer receives:   $80.80 (80.8%)                             │
    │                                                                    │
    │   BUT: $15 stays in ecosystem, not goes to protocols              │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    TRADE-OFF:
    • Higher friction to cash out
    • Better rewards for loyal customers
    • More meaningful token economics
```

---

## Economic Levers

### Available Levers for Cocopay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONFIGURABLE LEVERS                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    LEVER 1: Cashback Percentage (per store)
    ─────────────────────────────────────────
    Current: 0-10% (store configurable)
    Effect: Determines customer vs store token split
    Range: 0-100% technically possible

    LEVER 2: Cash Out Tax Rate
    ──────────────────────────
    Current: 0.1% (hardcoded in revnet-transforms.ts)
    Effect: Friction on cash outs, benefits remaining holders
    Range: 0-99.99% (MAX_CASH_OUT_TAX_RATE = 10,000)

    LEVER 3: Cocopay Split Percentage
    ─────────────────────────────────
    Current: 1% of store's share
    Effect: Cocopay's token revenue per payment
    Range: 0-100% of store share

    LEVER 4: Issuance Decay (Weight Cut)
    ────────────────────────────────────
    Current: 0.5% every ~90 days
    Effect: Tokens become "more expensive" over time
    Range: 0-100%

    LEVER 5: Initial Issuance Rate
    ──────────────────────────────
    Current: 1 token per 1 USDC (1:1)
    Effect: How many tokens per payment
    Range: Any positive number


    NOT CONFIGURABLE (Protocol Fees):
    ──────────────────────────────────
    • Revnet fee: 2.5% (hardcoded in protocol)
    • JB DAO fee: 2.5% (hardcoded in protocol)
```

### Lever Interaction Matrix

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOW LEVERS INTERACT                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────┬─────────────────────────────────────────────────────────┐
    │ If you...   │ Effect                                                  │
    ├─────────────┼─────────────────────────────────────────────────────────┤
    │ ↑ Cashback  │ • More tokens to customers                              │
    │             │ • Fewer tokens to store owner                           │
    │             │ • Fewer tokens to Cocopay                               │
    │             │ • Better customer value prop                            │
    ├─────────────┼─────────────────────────────────────────────────────────┤
    │ ↑ Cash Out  │ • Harder to leave ecosystem                             │
    │   Tax       │ • More value stays in treasury                          │
    │             │ • Backing increases over time                           │
    │             │ • Rewards loyalty                                       │
    ├─────────────┼─────────────────────────────────────────────────────────┤
    │ ↑ Cocopay   │ • More revenue for platform                             │
    │   Split     │ • Fewer tokens to store owner                           │
    │             │ • May disincentivize stores                             │
    ├─────────────┼─────────────────────────────────────────────────────────┤
    │ ↑ Issuance  │ • Fewer tokens per payment over time                    │
    │   Decay     │ • Early adopters get better rates                       │
    │             │ • Creates urgency to participate early                  │
    └─────────────┴─────────────────────────────────────────────────────────┘
```

---

## Simulations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SIMULATION PARAMETERS                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    BASE ASSUMPTIONS:
    • Cashback: 10% (customer gets 10% of minted tokens)
    • Cash Out Tax: 10% (cashOutTaxRate: 1000 out of 10,000)
    • Protocol Fees: ~5% (2.5% Revnet + 2.5% JB DAO, multiplicative)
    • Initial Backing: $1.00 per token
    • Cocopay Split: 1% of store's share

    TOTAL CASH OUT COST: ~14.5% (10% tax + ~4.5% protocol fees on remainder)

    CLEAN NUMBERS FOR SIMULATION:
    • Payment amounts: $10, $100, $1000
    • Cash out intervals: Immediate, Monthly, Quarterly, Annual
```

### Simulation 1: Single Payment Token Distribution (10% Cashback)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TOKEN DISTRIBUTION PER PAYMENT                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Payment → Treasury → Tokens Minted → Split

    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Payment  │ Tokens   │ Customer │ Cocopay  │ Store    │
    │ (USDC)   │ Minted   │ (10%)    │ (0.9%)   │ (89.1%)  │
    ├──────────┼──────────┼──────────┼──────────┼──────────┤
    │ $10      │ 10       │ 1        │ 0.09     │ 8.91     │
    │ $100     │ 100      │ 10       │ 0.9      │ 89.1     │
    │ $1000    │ 1000     │ 100      │ 9        │ 891      │
    └──────────┴──────────┴──────────┴──────────┴──────────┘

    Note: Cocopay gets 1% of store's 90% share = 0.9% of total
          Store gets 99% of store's 90% share = 89.1% of total
```

### Simulation 2: Cash Out Fee Breakdown

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASH OUT FEE CALCULATION                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    Formula (fees applied sequentially):
    1. Cash Out Tax: Amount × 10% → stays in treasury
    2. Revnet Fee: (Amount - Tax) × 2.5% → to $REV
    3. JB DAO Fee: (Amount - Tax - RevFee) × 2.5% → to Bananapus
    4. Net Received: Amount - Tax - RevFee - JBFee

    ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Tokens   │ Gross    │ Tax      │ Revnet   │ JB DAO   │ Net      │
    │ Burned   │ Value    │ (10%)    │ (2.5%)   │ (2.5%)   │ Received │
    ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
    │ 10       │ $10.00   │ $1.00    │ $0.23    │ $0.22    │ $8.55    │
    │ 100      │ $100.00  │ $10.00   │ $2.25    │ $2.19    │ $85.56   │
    │ 1000     │ $1000.00 │ $100.00  │ $22.50   │ $21.94   │ $855.56  │
    └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘

    EFFECTIVE CASH OUT RATE: ~85.5% (lose ~14.5% to fees)
    • 10% stays in treasury (benefits other holders)
    • ~4.5% goes to protocols

    ⚠️  COMPARISON TO STRIPE:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Stripe (2.9% + $0.30):                                          │
    │   • $10 payment → Store gets $9.41 (94.1%)                        │
    │   • $100 payment → Store gets $96.80 (96.8%)                      │
    │   • $1000 payment → Store gets $970.70 (97.1%)                    │
    │                                                                    │
    │   Cocopay (if store cashes out tokens):                           │
    │   • $10 payment → Store gets $7.62 (76.2%)                        │
    │   • $100 payment → Store gets $76.22 (76.2%)                      │
    │   • $1000 payment → Store gets $762.21 (76.2%)                    │
    │                                                                    │
    │   COCOPAY LOSES TO STRIPE BY ~21% ON CASH OUT                     │
    │   BUT: 10% stays in ecosystem (not lost to external protocols)    │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 3: Customer Cash Out Scenarios

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CUSTOMER: Cash Out vs Spend                              │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer pays $100, receives 10 tokens as cashback

    OPTION A: Cash out immediately
    ┌────────────────────────────────────────────────────────────────────┐
    │   10 tokens × $1.00 backing = $10.00 gross                        │
    │   After fees (~14.5%): $8.55 received                             │
    │                                                                    │
    │   Effective cashback: $8.55 on $100 = 8.55%                       │
    │   Lost to fees: $1.45 (14.5% of cashback value)                   │
    │   • $1.00 stays in treasury (benefits other holders)              │
    │   • $0.45 goes to protocols                                        │
    └────────────────────────────────────────────────────────────────────┘

    OPTION B: Spend tokens at store
    ┌────────────────────────────────────────────────────────────────────┐
    │   10 tokens transferred to store = $10.00 value                   │
    │   Token transfer fee: $0.00                                        │
    │                                                                    │
    │   Effective cashback: $10.00 on $100 = 10%                        │
    │   Lost to fees: $0.00                                              │
    │                                                                    │
    │   SPENDING IS 17% BETTER THAN CASHING OUT                         │
    │   ($10.00 vs $8.55 = 17% more value)                              │
    └────────────────────────────────────────────────────────────────────┘

    CUSTOMER VALUE AT DIFFERENT VOLUMES:
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Spent    │ Tokens   │ Cash Out │ Spend    │ Savings  │
    │ at Store │ Earned   │ Value    │ Value    │ (Spend)  │
    ├──────────┼──────────┼──────────┼──────────┼──────────┤
    │ $100     │ 10       │ $8.55    │ $10.00   │ $1.45    │
    │ $1000    │ 100      │ $85.56   │ $100.00  │ $14.44   │
    │ $10000   │ 1000     │ $855.56  │ $1000.00 │ $144.44  │
    └──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Simulation 4: Store Owner Cash Out Intervals

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORE OWNER: Cash Out Timing Analysis                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Store processes $1000/month with 10% cashback
    Store receives: 891 tokens/month ($891 backing)

    SCENARIO: Immediate cash out each month
    ┌────────────────────────────────────────────────────────────────────┐
    │   Monthly tokens: 891                                              │
    │   Monthly cash out: 891 × $0.856 = $762                           │
    │   Annual total: $762 × 12 = $9,144                                │
    │                                                                    │
    │   Effective rate: 76.2% of gross payment volume                   │
    │   (vs Stripe ~97% - Cocopay loses by 21%)                         │
    └────────────────────────────────────────────────────────────────────┘

    ┌──────────────┬──────────┬──────────┬──────────┬──────────┐
    │ Cash Out     │ Tokens   │ Gross    │ Net      │ Annual   │
    │ Frequency    │ Held     │ Value    │ After    │ Net      │
    │              │          │          │ Fees     │ Revenue  │
    ├──────────────┼──────────┼──────────┼──────────┼──────────┤
    │ Immediate    │ 891/mo   │ $891     │ $762     │ $9,144   │
    │ Monthly      │ 891/mo   │ $891     │ $762     │ $9,144   │
    │ Quarterly    │ 2673/qtr │ $2673    │ $2288    │ $9,152   │
    │ Annual       │ 10692/yr │ $10692   │ $9,152   │ $9,152   │
    └──────────────┴──────────┴──────────┴──────────┴──────────┘

    ⚠️  CASH OUT TIMING DOESN'T MATTER (without backing changes)
    With stable $1.00 backing, annual revenue is ~$9,150 regardless
    of cash out frequency.

    WHERE THE FEES GO:
    • $1,080/year stays in treasury (10% cash out tax)
    • $462/year goes to protocols (~4.5% of remainder)

    THE ONLY WAY TO WIN: Don't cash out, accept token payments
```

### Simulation 5: Impact of Backing Appreciation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORE OWNER: Backing Appreciation Scenarios              │
└─────────────────────────────────────────────────────────────────────────────┘

    Store holds 10000 tokens (from ~$11,200 in payments over time)
    Initial backing: $1.00/token

    SCENARIO: No appreciation (baseline)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tokens: 10000 × $1.00 = $10,000                                 │
    │   Cash out: $10,000 × 85.56% = $8,556                             │
    │   Loss: $1,444 (14.44%)                                            │
    │   • $1,000 stays in treasury                                       │
    │   • $444 goes to protocols                                         │
    └────────────────────────────────────────────────────────────────────┘

    SCENARIO: Backing increases due to customer churn
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Backing  │ Token    │ Gross    │ Net      │ Gain vs  │
    │ $/token  │ Value    │ Value    │ (85.56%) │ Baseline │
    ├──────────┼──────────┼──────────┼──────────┼──────────┤
    │ $1.00    │ 10000    │ $10,000  │ $8,556   │ $0       │
    │ $1.10    │ 10000    │ $11,000  │ $9,412   │ +$856    │
    │ $1.20    │ 10000    │ $12,000  │ $10,267  │ +$1,711  │
    │ $1.50    │ 10000    │ $15,000  │ $12,834  │ +$4,278  │
    │ $2.00    │ 10000    │ $20,000  │ $17,112  │ +$8,556  │
    └──────────┴──────────┴──────────┴──────────┴──────────┘

    BREAKEVEN ANALYSIS:
    ┌────────────────────────────────────────────────────────────────────┐
    │   To match Stripe's ~3% fee on $10,000 payment:                   │
    │   Store would receive $9,700 from Stripe                          │
    │   Store receives $8,556 from Cocopay at $1.00 backing             │
    │                                                                    │
    │   Breakeven: Backing must reach $1.134 (+13.4%)                   │
    │   to match Stripe's effective rate                                │
    │                                                                    │
    │   For Cocopay to be clearly better than Stripe:                   │
    │   Backing needs ~$1.20+ (20% appreciation)                        │
    │                                                                    │
    │   OR: Accept token payments (0% fees) instead of cash out        │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 6: Community Commerce (No Cash Out)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMMUNITY COMMERCE: Token Circulation                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Scenario: Customer earns 10 tokens, spends them back at store
    Store earns 891 tokens, receives 10 more from customer spending

    TOKEN FLOW (no cash outs):
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   PAYMENT: Customer pays $100                                      │
    │   ├── Treasury: +$100                                              │
    │   ├── Customer: +10 tokens                                         │
    │   ├── Cocopay: +0.9 tokens                                         │
    │   └── Store: +89.1 tokens                                          │
    │                                                                    │
    │   SPEND: Customer uses 10 tokens at store                          │
    │   ├── Customer: -10 tokens                                         │
    │   └── Store: +10 tokens                                            │
    │                                                                    │
    │   RESULT: Store now has 99.1 tokens                                │
    │   Fees paid: $0                                                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    COMMUNITY COMMERCE ECONOMICS:
    ┌──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Payment  │ Store    │ Customer │ Community│ Fees     │
    │ Volume   │ Tokens   │ Spends   │ Tokens   │ Paid     │
    ├──────────┼──────────┼──────────┼──────────┼──────────┤
    │ $100     │ 89.1     │ 10       │ 99.1     │ $0       │
    │ $1000    │ 891      │ 100      │ 991      │ $0       │
    │ $10000   │ 8910     │ 1000     │ 9910     │ $0       │
    └──────────┴──────────┴──────────┴──────────┴──────────┘

    vs CASH OUT MODEL:
    ┌──────────┬──────────┬──────────┬──────────┐
    │ Payment  │ Store    │ Fees     │ Store    │
    │ Volume   │ Tokens   │ (14.5%)  │ Net USDC │
    ├──────────┼──────────┼──────────┼──────────┤
    │ $100     │ 89.1     │ $12.89   │ $76.21   │
    │ $1000    │ 891      │ $128.92  │ $762.08  │
    │ $10000   │ 8910     │ $1289.19 │ $7620.81 │
    └──────────┴──────────┴──────────┴──────────┘

    ✅  COMMUNITY COMMERCE SAVES:
    • $12.89 per $100 (12.89%)
    • $128.92 per $1000 (12.89%)
    • $1289.19 per $10000 (12.89%)
```

### Simulation 7: Optimal Scenarios Analysis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUCCESS CONDITIONS FOR ALL PARTIES                       │
└─────────────────────────────────────────────────────────────────────────────┘

    CUSTOMER SUCCESS:
    ┌────────────────────────────────────────────────────────────────────┐
    │   WIN: Spend tokens at store (10% effective cashback)              │
    │   LOSE: Cash out tokens (8.55% effective cashback)                 │
    │                                                                    │
    │   Optimal behavior: Never cash out, always spend at store          │
    │   Incentive strength: 17% better to spend than cash out           │
    └────────────────────────────────────────────────────────────────────┘

    STORE SUCCESS:
    ┌────────────────────────────────────────────────────────────────────┐
    │   WIN Conditions:                                                  │
    │   1. Customers spend tokens (store accumulates tokens)             │
    │   2. Backing appreciates 10%+ before cash out                      │
    │   3. Store accepts tokens AND USDC (dual revenue)                  │
    │                                                                    │
    │   LOSE Conditions:                                                 │
    │   1. Cash out immediately (pays 5% fees, worse than Stripe)        │
    │   2. Backing depreciates (mass cash outs by others)                │
    │                                                                    │
    │   Optimal behavior: Accept tokens, minimize cash outs,             │
    │                     encourage customers to spend tokens            │
    └────────────────────────────────────────────────────────────────────┘

    COCOPAY SUCCESS:
    ┌────────────────────────────────────────────────────────────────────┐
    │   WIN Conditions:                                                  │
    │   1. High payment volume (0.9% token share)                        │
    │   2. Backing appreciates (token value increases)                   │
    │   3. Token payments to Cocopay (avoids cash out fees)              │
    │                                                                    │
    │   Revenue per $10,000 payment volume:                              │
    │   • Token value: $90 (0.9%)                                        │
    │   • If cash out: $85.50 (after 5% fees)                           │
    │   • If hold + 10% appreciation: $94.05                            │
    └────────────────────────────────────────────────────────────────────┘

    ECOSYSTEM SUCCESS (ALL WIN):
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   ✅  TOKENS CIRCULATE, NOBODY CASHES OUT                          │
    │                                                                    │
    │   • Customer pays USDC → Gets tokens → Spends at store             │
    │   • Store receives USDC + tokens → Holds tokens                    │
    │   • Cocopay receives tokens → Holds tokens                         │
    │   • Treasury grows → Backing stable or increases                   │
    │   • All fees: $0                                                   │
    │                                                                    │
    │   ❌  EVERYONE CASHES OUT                                          │
    │                                                                    │
    │   • Customer pays USDC → Gets tokens → Cashes out (5% loss)       │
    │   • Store receives USDC → Gets tokens → Cashes out (5% loss)      │
    │   • Cocopay receives tokens → Cashes out (5% loss)                │
    │   • All value leaks to protocols                                   │
    │                                                                    │
    │   CONCLUSION: Cocopay only beats traditional payments              │
    │   when the ecosystem achieves Community Commerce                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 8: Cash Out Tax Comparison

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASH OUT TAX RATE COMPARISON                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Current config: 10% cash out tax (cashOutTaxRate = 1000)

    CUSTOMER CASHES OUT 100 TOKENS ($100 backing):
    ┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
    │ Tax Rate │ Tax      │ Revnet   │ JB DAO   │ Net      │ Spend vs │
    │          │          │ (2.5%)   │ (2.5%)   │ Received │ Cash Out │
    ├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
    │ 0%       │ $0.00    │ $2.50    │ $2.44    │ $95.06   │ +5%      │
    │ 5%       │ $5.00    │ $2.38    │ $2.32    │ $90.30   │ +11%     │
    │ 10% ←    │ $10.00   │ $2.25    │ $2.19    │ $85.56   │ +17%     │
    │ 15%      │ $15.00   │ $2.13    │ $2.07    │ $80.80   │ +24%     │
    │ 20%      │ $20.00   │ $2.00    │ $1.95    │ $76.05   │ +31%     │
    └──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
    ← Current Cocopay setting

    WHERE THE FEES GO:
    ┌──────────┬──────────┬──────────┬──────────┐
    │ Tax Rate │ To       │ To       │ To       │
    │          │ Treasury │ Protocols│ User     │
    ├──────────┼──────────┼──────────┼──────────┤
    │ 0%       │ $0.00    │ $4.94    │ $95.06   │
    │ 5%       │ $5.00    │ $4.70    │ $90.30   │
    │ 10% ←    │ $10.00   │ $4.44    │ $85.56   │
    │ 15%      │ $15.00   │ $4.20    │ $80.80   │
    │ 20%      │ $20.00   │ $3.95    │ $76.05   │
    └──────────┴──────────┴──────────┴──────────┘

    CURRENT 10% TAX BENEFITS:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   With 10% cash out tax:                                           │
    │   • $10 of every $100 cash out stays in treasury                  │
    │   • Protocols get ~$4.44 (less than with 0% tax)                  │
    │   • Spending is 17% better than cashing out                       │
    │   • Creates meaningful loyalty incentive                          │
    │                                                                    │
    │   Trade-off accepted:                                              │
    │   • Users get 85.56% of value on cash out                         │
    │   • But value stays in ecosystem, not leaked                       │
    │   • Strong message: "Spend here, don't leave"                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Recommendations

### Path to Success: Community Commerce

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE FUNDAMENTAL TRUTH                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Cash out economics CANNOT compete with Stripe:

    ┌──────────────┬──────────────┬──────────────┐
    │ Payment      │ Stripe       │ Cocopay      │
    │              │ Net to Store │ (Cash Out)   │
    ├──────────────┼──────────────┼──────────────┤
    │ $100         │ $96.80       │ $84.64       │
    │ $1000        │ $970.70      │ $846.45      │
    └──────────────┴──────────────┴──────────────┘

    Cocopay ONLY wins when tokens circulate (no cash out):

    ┌──────────────┬──────────────┬──────────────┐
    │ Payment      │ Stripe       │ Cocopay      │
    │              │ Net to Store │ (Community)  │
    ├──────────────┼──────────────┼──────────────┤
    │ $100         │ $96.80       │ $99.10*      │
    │ $1000        │ $970.70      │ $991.00*     │
    └──────────────┴──────────────┴──────────────┘
    * Store tokens + customer token payments (0% fees)
```

### Recommendation 1: Design for Community Commerce

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MAKE TOKEN SPENDING THE DEFAULT                          │
└─────────────────────────────────────────────────────────────────────────────┘

    UX PRIORITIES:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   1. Token balance always visible                                  │
    │   2. "Pay with tokens" as primary action                          │
    │   3. Show savings vs cash out                                      │
    │      • "$10 tokens = $10 at store"                                │
    │      • "Cash out: $9.50 (lose $0.50)"                             │
    │   4. Cash out should feel like a "last resort"                    │
    │   5. Make token payments as easy as Apple Pay                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    STORE INCENTIVES:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   1. Stores should WANT token payments                             │
    │      • No payment processing fees                                  │
    │      • Customer already committed to ecosystem                     │
    │   2. Consider bonus for stores that accept tokens                  │
    │   3. Leaderboard: "Most community commerce"                       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Recommendation 2: Cash Out Tax (Current: 10%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT 10% CASH OUT TAX ANALYSIS                        │
└─────────────────────────────────────────────────────────────────────────────┘

    CURRENT SETTING: 10% (cashOutTaxRate = 1000)

    ┌────────────────────────────────────────────────────────────────────┐
    │   What it means:                                                   │
    │   • Cash out 100 tokens → Get $85.56 (lose $14.44)                │
    │   • $10 stays in treasury (benefits other holders)                │
    │   • $4.44 goes to protocols                                        │
    │   • Spending is 17% better than cashing out                       │
    └────────────────────────────────────────────────────────────────────┘

    ALTERNATIVES TO CONSIDER:

    LOWER (5%):
    ┌────────────────────────────────────────────────────────────────────┐
    │   • Cash out → Get $90.30 (less friction)                         │
    │   • Spending only 11% better than cash out                        │
    │   • Less value retained in treasury                                │
    │   • May be better for initial adoption                            │
    └────────────────────────────────────────────────────────────────────┘

    HIGHER (15%):
    ┌────────────────────────────────────────────────────────────────────┐
    │   • Cash out → Get $80.80 (more friction)                         │
    │   • Spending is 24% better than cash out                          │
    │   • More value retained in treasury                                │
    │   • Stronger community commerce incentive                         │
    └────────────────────────────────────────────────────────────────────┘

    RECOMMENDATION: 10% is a reasonable middle ground.
    Monitor adoption and adjust based on user behavior.
```

### Recommendation 3: Cocopay Revenue Strategy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COCOPAY REVENUE OPTIONS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    THE PROBLEM:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cocopay earns: 0.9% of payment volume (tokens)                  │
    │   Per $10,000 volume: $90 in tokens                               │
    │                                                                    │
    │   If everyone keeps tokens in network (Community Commerce):       │
    │   • Cocopay has tokens, not USDC                                  │
    │   • Can't pay expenses with tokens                                │
    │   • Must convert somehow                                           │
    └────────────────────────────────────────────────────────────────────┘

    OPTION 1: BORROW AGAINST TOKENS (Best Current Option)
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Use REVLoans to borrow USDC against token holdings              │
    │   • Fee: ~6% (vs 14.5% cash out)                                  │
    │   • Per $90 tokens: Get $84.60 USDC                               │
    │   • Never repay → collateral liquidated in 10 years              │
    │                                                                    │
    │   Pros:                                                            │
    │   • 8.5% cheaper than cash out                                    │
    │   • Retains option to repay if tokens appreciate                  │
    │   • Aligns with "don't cash out" message                          │
    │                                                                    │
    │   Cons:                                                            │
    │   • Still costs 6%                                                 │
    │   • Less value to treasury than cash out (2.5% vs 10%)           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    OPTION 2: PAYMENT FEE (Direct USDC)
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Add small fee on payments → direct USDC to Cocopay              │
    │   • 0.5% fee on payments                                           │
    │   • Per $10,000 volume: $50 direct USDC (no conversion needed)   │
    │   • Plus tokens (can hold or borrow against)                      │
    │                                                                    │
    │   Pros:                                                            │
    │   • Guaranteed USDC revenue                                        │
    │   • No conversion fees                                             │
    │                                                                    │
    │   Cons:                                                            │
    │   • Adds fee for stores (may hurt adoption)                       │
    │   • Still lower than Stripe, could position as advantage          │
    │                                                                    │
    │   Implementation:                                                  │
    │   • Deduct fee before funds hit terminal                          │
    │   • Or use pay hook to route fee                                  │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    OPTION 3: PREMIUM FEATURES (SaaS Model)
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Subscription revenue in USDC:                                    │
    │   • Advanced analytics dashboard                                   │
    │   • Custom branding                                                │
    │   • Priority support                                               │
    │   • API access                                                     │
    │   • Multi-location management                                      │
    │                                                                    │
    │   Pricing: $29-99/month per store                                 │
    │                                                                    │
    │   Pros:                                                            │
    │   • Predictable recurring revenue                                  │
    │   • Direct USDC                                                    │
    │   • Value-add, not extraction                                      │
    │                                                                    │
    │   Cons:                                                            │
    │   • Requires building premium features                             │
    │   • May limit free tier adoption                                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    OPTION 4: HOLD TOKENS + APPRECIATION
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Never convert - hold tokens, bet on appreciation                 │
    │   • Tokens backed by growing treasuries                           │
    │   • If ecosystem grows, token value grows                         │
    │                                                                    │
    │   Pros:                                                            │
    │   • Maximum alignment with ecosystem                               │
    │   • Potential upside if stores succeed                            │
    │                                                                    │
    │   Cons:                                                            │
    │   • Can't pay expenses                                             │
    │   • Requires outside funding or other revenue                     │
    │   • High risk                                                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    RECOMMENDED STRATEGY:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   HYBRID APPROACH:                                                 │
    │                                                                    │
    │   1. Payment fee (0.5%) → direct USDC for operations              │
    │   2. Token split (0.9%) → hold most, borrow against some         │
    │   3. Premium features → additional USDC revenue                   │
    │                                                                    │
    │   This provides:                                                   │
    │   • Operational USDC (payment fee + premium)                      │
    │   • Upside exposure (token holdings)                              │
    │   • Flexibility (borrow when needed)                              │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Configuration Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT CONFIGURATION                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────┬──────────────┬──────────────────────────────┐
    │ Parameter          │ Value        │ Effect                       │
    ├────────────────────┼──────────────┼──────────────────────────────┤
    │ Cash Out Tax       │ 10%          │ Spending 17% better than     │
    │                    │              │ cashing out                  │
    ├────────────────────┼──────────────┼──────────────────────────────┤
    │ Cashback Range     │ 0-10%        │ Customer token rewards       │
    ├────────────────────┼──────────────┼──────────────────────────────┤
    │ Cocopay Split      │ 1%           │ Platform revenue share       │
    ├────────────────────┼──────────────┼──────────────────────────────┤
    │ Protocol Fees      │ ~5%          │ Fixed, goes to Revnet + JB   │
    └────────────────────┴──────────────┴──────────────────────────────┘

    TOTAL CASH OUT COST: ~14.5%
    • 10% stays in treasury (benefits holders)
    • ~4.5% goes to protocols

    ALTERNATIVE CONFIGURATIONS:

    Lower friction (5% tax):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cash out → Get 90.3% | Spending 11% better than cash out        │
    └────────────────────────────────────────────────────────────────────┘

    Higher retention (15% tax):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cash out → Get 80.8% | Spending 24% better than cash out        │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Critical Dependency: Network Density

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE NETWORK EFFECT PROBLEM                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Cocopay's economics are CONTINGENT on network adoption.

    WITHOUT NETWORK DENSITY:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer earns 10 tokens at Store A                              │
    │   ├── No other stores accept $STORE_A tokens                      │
    │   ├── Customer must cash out → loses 14.5%                        │
    │   └── Cocopay is 7× worse than Stripe                             │
    │                                                                    │
    │   Store A earns 89 tokens from payments                            │
    │   ├── Customers don't have tokens to spend                         │
    │   ├── Store must cash out → loses 14.5%                           │
    │   └── Cocopay is 7× worse than Stripe                             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    WITH NETWORK DENSITY:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer earns 10 tokens at Store A                              │
    │   ├── Spends 10 tokens at Store A next visit                      │
    │   ├── Fee: $0                                                      │
    │   └── Cocopay beats Stripe                                         │
    │                                                                    │
    │   Store A earns 89 + 10 = 99 tokens                                │
    │   ├── Accepts more token payments                                  │
    │   ├── Never needs to cash out                                      │
    │   └── Cocopay beats Stripe                                         │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    THE CHICKEN-AND-EGG:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customers need → Stores that accept tokens                       │
    │   Stores need → Customers with tokens to spend                     │
    │                                                                    │
    │   If either side is missing, everyone cashes out.                 │
    │   If everyone cashes out, Cocopay loses.                          │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    IMPLICATIONS FOR GO-TO-MARKET:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   OPTION A: Single-Store Model (current)                          │
    │   • Each store has its own $STORE token                           │
    │   • Tokens only spendable at that one store                       │
    │   • Requires repeat customers at SAME store                       │
    │   • Works for: Coffee shops, restaurants, salons                  │
    │   • Fails for: One-time purchase stores                           │
    │                                                                    │
    │   OPTION B: Shared Token Model (future?)                          │
    │   • Multiple stores share a token (e.g., $COCO)                   │
    │   • Tokens spendable across all participating stores              │
    │   • Network effect across stores                                   │
    │   • Requires: Store onboarding, token standardization             │
    │                                                                    │
    │   OPTION C: Geographic Clustering                                  │
    │   • Onboard stores in same area (mall, street, neighborhood)      │
    │   • Customers likely to visit multiple stores                     │
    │   • Natural token circulation                                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    MINIMUM VIABLE NETWORK:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   For single-store model to work:                                  │
    │   • Store must have repeat customers                               │
    │   • Average customer visits 2+ times before wanting to exit       │
    │   • 10% cashback × 2 visits = 20% token balance                   │
    │   • Customer spends tokens on visit 3+                            │
    │                                                                    │
    │   For multi-store model to work:                                   │
    │   • Enough stores that customers have options                     │
    │   • Stores must accept shared token                                │
    │   • Requires coordination and standardization                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Competitive Analysis: Cocopay vs Traditional Payments

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COCOPAY vs STRIPE COMPARISON                             │
└─────────────────────────────────────────────────────────────────────────────┘

    STRIPE PRICING (US):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Card payments: 2.9% + $0.30 per transaction                      │
    │   $100 payment → Store receives $96.80                             │
    │   Net fee: 3.2% (including flat fee)                               │
    └────────────────────────────────────────────────────────────────────┘

    COCOPAY PRICING (Store Cashes Out):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Payment: 0% (all funds to treasury)                              │
    │   Cash out: ~5% (protocol fees)                                    │
    │   $100 payment → Store receives ~$90 after cash out                │
    │   Net fee: ~10% (including token split & cashback)                 │
    └────────────────────────────────────────────────────────────────────┘

    ⚠️  THE PROBLEM:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   If store owners cash out tokens → Cocopay is MORE EXPENSIVE      │
    │                                                                    │
    │   Full breakdown per $100 payment (10% cashback):                  │
    │   • Customer gets: 10 tokens ($10.00)                              │
    │   • Cocopay gets: 0.9 tokens ($0.90)                               │
    │   • Store gets: 89.1 tokens ($89.10)                               │
    │   • Store cash out: $89.10 × 85.56% = $76.23                      │
    │                                                                    │
    │   Store effective rate: 23.77% lost                                │
    │   vs Stripe: 3.2% lost                                             │
    │                                                                    │
    │   COCOPAY IS 7.4× MORE EXPENSIVE THAN STRIPE                       │
    │   (when store cashes out immediately)                              │
    │                                                                    │
    │   BUT: 10% stays in treasury (not lost to external parties)       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    ✅  THE SOLUTION: DON'T CASH OUT
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Cocopay only makes sense with COMMUNITY COMMERCE:                │
    │                                                                    │
    │   SCENARIO A: Store cashes out                                     │
    │   • $100 payment → $76.23 received (23.77% fee)                   │
    │   • WORSE than Stripe                                              │
    │                                                                    │
    │   SCENARIO B: Store holds, customers spend tokens                  │
    │   • $100 payment → 89.1 tokens received                           │
    │   • Customer pays with 10 tokens → Store gets 10 more tokens      │
    │   • Token transfers = 0% fee                                       │
    │   • BETTER than Stripe (effectively free after adoption)          │
    │                                                                    │
    │   SCENARIO C: Store holds, backing increases                       │
    │   • $100 payment → 89.1 tokens at $1.00                           │
    │   • Churn increases backing to $1.20                               │
    │   • Value: 89.1 × $1.20 = $106.92                                 │
    │   • Cash out: $106.92 × 85.56% = $91.48                           │
    │   • Still loses to Stripe, but treasury grew                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    VALUE PROPOSITION MESSAGING:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   DON'T SAY: "Cocopay has lower fees than Stripe"                 │
    │   (This is FALSE if users cash out)                                │
    │                                                                    │
    │   DO SAY: "Build a loyal customer base that spends directly        │
    │            with your store tokens - zero transaction fees"         │
    │                                                                    │
    │   Key selling points:                                              │
    │   • Customer loyalty through token ownership                       │
    │   • Zero fees on repeat purchases (token transfers)                │
    │   • Store value grows with community (backing appreciation)        │
    │   • Cashback rewards attract and retain customers                  │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                                            │
└─────────────────────────────────────────────────────────────────────────────┘

    1. CASH OUT ECONOMICS DON'T COMPETE WITH STRIPE
       ┌────────────────────────────────────────────────────────────────┐
       │   $100 payment to store:                                       │
       │   • Stripe: Store gets $96.80 (3.2% fee)                      │
       │   • Cocopay (cash out): Store gets $76.22 (23.8% fee)         │
       │   • Cocopay is 7.4× MORE EXPENSIVE than Stripe on cash out   │
       │                                                                │
       │   BUT: 10% stays in treasury, only 4.5% leaks to protocols   │
       └────────────────────────────────────────────────────────────────┘

    2. COMMUNITY COMMERCE IS THE ONLY PATH
       ┌────────────────────────────────────────────────────────────────┐
       │   $100 payment, customer spends 10 tokens back:               │
       │   • Store gets 89.1 + 10 = 99.1 tokens ($99.10 value)        │
       │   • Fees paid: $0                                              │
       │   • Cocopay BEATS Stripe when tokens circulate                │
       └────────────────────────────────────────────────────────────────┘

    3. THREE LIQUIDITY OPTIONS
       ┌────────────────────────────────────────────────────────────────┐
       │   Per $100 of tokens:                                          │
       │                                                                │
       │   OPTION A: Spend tokens (Community Commerce)                  │
       │   • Fee: 0%                                                    │
       │   • Get: $100 value                                            │
       │   • Best option if you have somewhere to spend                │
       │                                                                │
       │   OPTION B: Borrow against tokens (REVLoans)                   │
       │   • Fee: ~6%                                                   │
       │   • Get: $94 USDC                                              │
       │   • Best option for liquidity without full exit               │
       │                                                                │
       │   OPTION C: Cash out tokens                                    │
       │   • Fee: ~14.5%                                                │
       │   • Get: $85.56 USDC                                           │
       │   • Worst option, but 10% stays in treasury                   │
       │                                                                │
       └────────────────────────────────────────────────────────────────┘

    4. SUCCESS CONDITIONS
       ┌────────────────────────────────────────────────────────────────┐
       │   Customer wins: Spend tokens (10%) vs cash out (8.55%)       │
       │   Store wins: Accept tokens, minimize cash outs               │
       │   Cocopay wins: High volume + token appreciation              │
       │   Everyone wins: Tokens circulate, nobody cashes out          │
       └────────────────────────────────────────────────────────────────┘

    5. CURRENT 10% CASH OUT TAX
       ┌────────────────────────────────────────────────────────────────┐
       │   • Spending is 17% better than cashing out                   │
       │   • Creates meaningful loyalty incentive                      │
       │   • 10% stays in ecosystem, only ~4.5% leaks                  │
       │   • Trade-off: Higher friction to exit                        │
       └────────────────────────────────────────────────────────────────┘

    6. BRUTAL TRUTH: EVEN LOANS DON'T FIX IT
       ┌────────────────────────────────────────────────────────────────┐
       │                                                                │
       │   Exit costs (best to worst):                                  │
       │   • Stripe: ~3.2%                                              │
       │   • Cocopay Loan: ~6%                                          │
       │   • Cocopay Cash Out: ~14.5%                                   │
       │                                                                │
       │   COCOPAY IS STILL 2× MORE EXPENSIVE THAN STRIPE TO EXIT      │
       │   (even with the cheapest option)                              │
       │                                                                │
       │   Plus friction:                                               │
       │   • Friction IN: Wallet, tokens, learning curve               │
       │   • Friction STAYING: Need places to spend                    │
       │   • Friction OUT: 6-14.5% exit fee                            │
       │                                                                │
       │   THE MATH ONLY WORKS IF NOBODY EVER EXITS.                   │
       │   This requires a closed-loop economy.                        │
       │                                                                │
       └────────────────────────────────────────────────────────────────┘

    7. BOTTOM LINE
       ┌────────────────────────────────────────────────────────────────┐
       │                                                                │
       │   COCOPAY CANNOT COMPETE ON FEES. PERIOD.                     │
       │                                                                │
       │   • Enter network: friction (wallets, tokens)                 │
       │   • Exit network: 6-14.5% (vs Stripe 3.2%)                    │
       │   • Stay in network: need places to spend                     │
       │                                                                │
       │   THE ONLY PATH TO SUCCESS:                                   │
       │   Closed-loop economy where nobody ever needs to exit.        │
       │                                                                │
       │   This means:                                                  │
       │   • Customers spend ALL tokens back at stores                 │
       │   • Stores accept tokens AND can use them (pay suppliers?)    │
       │   • Cocopay operates on tokens or other revenue               │
       │                                                                │
       │   REALISTIC FIT:                                               │
       │   • High-frequency repeat businesses (coffee, lunch spots)    │
       │   • Where 10% cashback is compelling enough to return         │
       │   • Where customers spend tokens before wanting to exit       │
       │                                                                │
       │   HONEST MARKETING:                                            │
       │   "Rewards that bring customers back"                         │
       │   "Build a loyal community"                                   │
       │   NOT: "Lower fees" or "Better than Stripe"                   │
       │                                                                │
       └────────────────────────────────────────────────────────────────┘

    8. OPEN QUESTIONS
       ┌────────────────────────────────────────────────────────────────┐
       │                                                                │
       │   Q: Can these economics ever work?                           │
       │   A: Only with true closed-loop + compelling enough rewards   │
       │      to overcome friction.                                     │
       │                                                                │
       │   Q: Is 10% cashback compelling enough?                       │
       │   A: For daily purchases (coffee, lunch) - maybe.             │
       │      For occasional purchases - probably not.                 │
       │                                                                │
       │   Q: What would make this clearly better?                     │
       │   A: Lower protocol fees, or fee exemptions for Cocopay.     │
       │      Currently paying 2.5% JB + 2.5% REV + 1% loans.         │
       │      These are fixed protocol costs.                          │
       │                                                                │
       │   Q: Is there a path to lower protocol fees?                  │
       │   A: Possibly via governance, partnerships, or building      │
       │      on a different/custom protocol.                          │
       │                                                                │
       └────────────────────────────────────────────────────────────────┘
```
