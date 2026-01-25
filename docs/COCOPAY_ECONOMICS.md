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
    • Cash out tax: 0.1% (essentially zero - cashOutTaxRate: 10 out of 10,000)
    • Protocol fees on cash out: ~5% (2.5% Revnet + 2.5% JB DAO)
    • Cocopay token revenue: 1% of store's token share
    • Treasury yield: $0 (idle USDC)

    IMPLICATIONS:
    • Exit fees do NOT benefit stores or customers significantly
    • Protocol fees (Revnet + JB) capture most of the cash-out friction
    • Store owners get tokens, not USDC directly
    • No meaningful loyalty reward from "stayers vs leavers" dynamic

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
    │ Cash Out Tax       │ 0.1%*      │ Treasury (benefits remaining        │
    │                    │            │ token holders)                      │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ Revnet Fee         │ 2.5%       │ Revnet Protocol (FEE_REVNET_ID)     │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ JB DAO Fee         │ 2.5%       │ Juicebox Protocol ($NANA revnet)    │
    ├────────────────────┼────────────┼─────────────────────────────────────┤
    │ TOTAL              │ ~5.1%      │                                     │
    └────────────────────┴────────────┴─────────────────────────────────────┘

    * Current Cocopay config: cashOutTaxRate = 10 (out of 10,000 = 0.1%)


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
    Step 2: Apply Cash Out Tax (0.1%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tax = $100.00 × 0.1% = $0.10                                     │
    │   Reclaimable = $100.00 - $0.10 = $99.90                          │
    │   $0.10 stays in treasury (benefits other holders)                │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    Step 3: Apply Revnet Fee (2.5%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Fee = $99.90 × 2.5% = $2.50                                      │
    │   After = $99.90 - $2.50 = $97.40                                 │
    │   $2.50 → Revnet Protocol                                         │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    Step 4: Apply JB DAO Fee (2.5%)
    ┌────────────────────────────────────────────────────────────────────┐
    │   Fee = $97.40 × 2.5% = $2.44                                      │
    │   After = $97.40 - $2.44 = $94.96                                 │
    │   $2.44 → Juicebox Protocol                                       │
    └────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
    RESULT: Customer receives $94.96 (94.96% of backing)

    FEE BREAKDOWN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Cash Out Tax (to treasury):     $0.10  (0.1%)                   │
    │   Revnet Fee:                     $2.50  (2.5%)                   │
    │   JB DAO Fee:                     $2.44  (2.44% of remainder)     │
    │   ─────────────────────────────────────────────────────────       │
    │   Total Fees:                     $5.04  (5.04%)                  │
    │   Customer Receives:              $94.96 (94.96%)                 │
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
    cashOutTaxRate = 10                      // 0.1% (out of 10,000)
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

    cashOutTaxRate = 10 out of 10,000 = 0.1%

    THIS IS ESSENTIALLY ZERO.

    The UI in revnet-app allows 0-80% cash out tax.
    Cocopay is using 0.1%.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   QUESTION: Is this intentional?                                   │
    │                                                                    │
    │   If the goal is loyalty rewards, 0.1% provides almost none.      │
    │   If the goal is frictionless cash out, this makes sense.         │
    │                                                                    │
    │   Trade-off:                                                       │
    │   • Low tax = easy cash out, no loyalty reward                    │
    │   • High tax = harder to leave, rewards long-term holders         │
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

### Simulation 1: Current Config ($100 Payment → Cash Out)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│     CURRENT: 5% Cashback, 0.1% Cash Out Tax                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    PAYMENT ($100):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Treasury: +$100                                                  │
    │   Customer: 5 tokens ($5.00)                                       │
    │   Cocopay: 0.95 tokens ($0.95)                                     │
    │   Store: 94.05 tokens ($94.05)                                     │
    └────────────────────────────────────────────────────────────────────┘

    CASH OUT (Customer, 5 tokens):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross: $5.00                                                     │
    │   Cash out tax (0.1%): -$0.005 → Treasury                         │
    │   Revnet fee: -$0.125 → Revnet                                    │
    │   JB fee: -$0.122 → JB                                            │
    │   Net: $4.75 (95%)                                                 │
    │                                                                    │
    │   Customer profit: -$0.25 on $5 cashback (lost to protocol fees)  │
    └────────────────────────────────────────────────────────────────────┘

    CASH OUT (Store Owner, 94.05 tokens):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross: $94.05                                                    │
    │   Cash out tax (0.1%): -$0.09 → Treasury                          │
    │   Revnet fee: -$2.35 → Revnet                                     │
    │   JB fee: -$2.29 → JB                                             │
    │   Net: $89.32 (95%)                                                │
    │                                                                    │
    │   Store net revenue: $89.32 on $100 payment (89.32%)              │
    └────────────────────────────────────────────────────────────────────┘

    CASH OUT (Cocopay, 0.95 tokens):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross: $0.95                                                     │
    │   Fees: -$0.05                                                     │
    │   Net: $0.90                                                       │
    │                                                                    │
    │   Cocopay net revenue: $0.90 per $100 payment (0.9%)              │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 2: Higher Cash Out Tax (15%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│     ALTERNATIVE: 5% Cashback, 15% Cash Out Tax                              │
└─────────────────────────────────────────────────────────────────────────────┘

    PAYMENT ($100): Same as above

    CASH OUT (Customer, 5 tokens):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Gross: $5.00                                                     │
    │   Cash out tax (15%): -$0.75 → Treasury                           │
    │   Revnet fee: -$0.106 → Revnet                                    │
    │   JB fee: -$0.104 → JB                                            │
    │   Net: $4.04 (80.8%)                                               │
    │                                                                    │
    │   BUT: $0.75 stays in ecosystem (not lost to protocols)           │
    │   Backing for remaining holders increases                          │
    └────────────────────────────────────────────────────────────────────┘

    IMPLICATION:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Higher cash out tax means:                                       │
    │   • Customer gets less on cash out                                 │
    │   • BUT more value stays in treasury                               │
    │   • Remaining token holders benefit                                │
    │   • Creates incentive to SPEND at store instead of cash out       │
    │                                                                    │
    │   COMMUNITY COMMERCE becomes more valuable:                        │
    │   • Cash out: Get 80.8% of value                                  │
    │   • Spend at store: Get 100% of value                             │
    │   • Spending is 24% better than cashing out!                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 3: Store Owner Strategies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│     STORE OWNER: Cash Out vs Hold                                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Store processes $10,000/month, 5% cashback

    STRATEGY A: Cash out monthly
    ┌────────────────────────────────────────────────────────────────────┐
    │   Monthly tokens: 9,405                                            │
    │   Cash out value: $9,405 × 95% = $8,935/month                     │
    │   Annual: $107,220                                                 │
    │                                                                    │
    │   Predictable revenue, no token risk                              │
    └────────────────────────────────────────────────────────────────────┘

    STRATEGY B: Hold tokens (with 15% cash out tax)
    ┌────────────────────────────────────────────────────────────────────┐
    │   After 12 months: 112,860 tokens                                  │
    │                                                                    │
    │   If customer churn increases backing to $1.10:                   │
    │   Value: 112,860 × $1.10 = $124,146                               │
    │   Cash out: $124,146 × 80.8% = $100,310                           │
    │                                                                    │
    │   vs monthly cash out: $107,220                                   │
    │   WORSE by $6,910 (holding didn't pay off)                        │
    │                                                                    │
    │   If backing rises to $1.25:                                       │
    │   Value: 112,860 × $1.25 = $141,075                               │
    │   Cash out: $141,075 × 80.8% = $113,989                           │
    │   BETTER by $6,769                                                 │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    CONCLUSION: Store owners should cash out regularly unless
    they strongly believe backing will increase significantly.
```

---

## Recommendations

### Immediate Changes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION 1: INCREASE CASH OUT TAX                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Current: cashOutTaxRate = 10 (0.1%)
    Recommended: cashOutTaxRate = 1000-1500 (10-15%)

    Why:
    • Creates meaningful loyalty rewards
    • More value stays in ecosystem (not to protocols)
    • Encourages community commerce (spending vs cashing out)
    • Aligns with "exit fee" messaging

    Implementation:
    • Change in lib/juicebox/revnet-transforms.ts line 95
    • Consider making configurable per store
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION 2: COMMUNITY COMMERCE UX                  │
└─────────────────────────────────────────────────────────────────────────────┘

    With higher cash out tax, emphasize spending over cashing out.

    UX messaging:
    • "Pay with $STORE and save 15%!" (vs cash out)
    • Show comparison: Cash out value vs Spend value
    • Make token payments frictionless

    Implementation:
    • Token transfer (not burn/remint) for spending
    • Store receives tokens directly
    • No protocol fees on transfers
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION 3: REVENUE DIVERSIFICATION                │
└─────────────────────────────────────────────────────────────────────────────┘

    Current revenue: Tokens only (requires cash out, loses 5%)

    Add:
    1. Payment fee option (0.5-1% direct USDC)
    2. Premium features (analytics, custom branding)
    3. Treasury yield (longer term, requires protocol work)

    Avoid:
    • Increasing Cocopay split significantly (hurts stores)
    • Complex fee structures (confuses users)
```

### Configuration Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RECOMMENDED CONFIGURATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────┬──────────────┬──────────────┐
    │ Parameter          │ Current      │ Recommended  │
    ├────────────────────┼──────────────┼──────────────┤
    │ Cash Out Tax       │ 0.1%         │ 10-15%       │
    │ Cashback Range     │ 0-10%        │ 0-10%        │
    │ Cocopay Split      │ 1%           │ 1% (keep)    │
    │ Issuance Decay     │ 0.5%/90d     │ 0.5%/90d     │
    └────────────────────┴──────────────┴──────────────┘

    RATIONALE:
    • Higher cash out tax creates loyalty mechanics
    • Keeps cashback flexible for stores
    • Cocopay split is reasonable (not extractive)
    • Issuance decay creates early adopter advantage
```

---

## Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    KEY TAKEAWAYS                                            │
└─────────────────────────────────────────────────────────────────────────────┘

    1. PROTOCOL FEES ARE FIXED
       • Revnet: 2.5% on cash outs
       • JB DAO: 2.5% on cash outs
       • ~5% total unavoidable on any cash out

    2. CASH OUT TAX IS NEARLY ZERO
       • Current 0.1% provides no loyalty benefit
       • Consider increasing to 10-15%

    3. COCOPAY REVENUE IS TOKEN-BASED
       • 1% of store's token share
       • Must cash out to realize (pay 5% fees)
       • Consider payment fee for direct USDC

    4. COMMUNITY COMMERCE IS THE ANSWER
       • Spending at store avoids ALL fees
       • With higher cash out tax, spending is clearly better
       • This is the "loyalty" value prop

    5. TREASURY YIELD IS UNTAPPED
       • All USDC sits idle
       • Opportunity for passive revenue
       • Requires protocol-level changes
```
