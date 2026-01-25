# Cocopay Store Economics

A deep dive into the economic model, revenue opportunities, and value alignment for Cocopay stores.

---

## Table of Contents

1. [Current Model](#current-model)
2. [The Exit Fee Paradox](#the-exit-fee-paradox)
3. [Revenue Opportunities](#revenue-opportunities)
4. [Treasury Yield](#treasury-yield)
5. [Community Commerce](#community-commerce)
6. [$COCO Token Potential](#coco-token-potential)
7. [Recommendations](#recommendations)

---

## Current Model

### How Payments Flow Today

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT COCOPAY PAYMENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer pays $100 USDC (5% cashback configured):

    $100 USDC ─────────────────────────────► TREASURY
                                                 │
                                                 │ backs
                                                 ▼
                                           100 $STORE tokens
                                                 │
                    ┌────────────────────────────┼────────────────────────────┐
                    │                            │                            │
                    ▼                            ▼                            ▼
              5 tokens                     0.95 tokens                  94.05 tokens
              CUSTOMER                     COCOPAY LABS                 STORE OWNER
              (5% cashback)                (1% of 95%)                  (99% of 95%)
```

### Current Configuration (from codebase)

```
┌────────────────────────────────────────────────────────────────────────────┐
│   HARDCODED VALUES:                                                        │
│   ─────────────────                                                        │
│   • COCOPAY_LABS_SPLIT_PERCENT: 10,000,000 (1% of store's share)          │
│   • STORE_OWNER_SPLIT_PERCENT: 990,000,000 (99% of store's share)         │
│   • cashOutTaxRate: 10 (exit fee - scale TBD)                             │
│   • COCOPAY_ISSUANCE_CUT_PERCENT: 0.5 (issuance decay rate)               │
│                                                                            │
│   CONFIGURABLE:                                                            │
│   ──────────────                                                           │
│   • cashBackPercent: 0-10% (customer's share of minted tokens)            │
└────────────────────────────────────────────────────────────────────────────┘
```

### Value Distribution Per $100 Payment

```
    With 5% cashback:
    ┌──────────────────┬─────────────┬────────────────┐
    │ Recipient        │ Tokens      │ Value at $1.00 │
    ├──────────────────┼─────────────┼────────────────┤
    │ Customer         │ 5.00        │ $5.00          │
    │ Cocopay Labs     │ 0.95        │ $0.95          │
    │ Store Owner      │ 94.05       │ $94.05         │
    ├──────────────────┼─────────────┼────────────────┤
    │ TOTAL            │ 100.00      │ $100.00        │
    └──────────────────┴─────────────┴────────────────┘

    Treasury holds: $100 USDC (backing all tokens)
```

---

## The Exit Fee Paradox

### The Problem

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE EXIT FEE PARADOX                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    SCENARIO: Store owner holds 94% of tokens, customers hold 6%

    When a customer cashes out with 10% exit fee:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer burns 5 tokens                                          │
    │   Customer receives: 5 × $1.00 × 90% = $4.50                       │
    │   Treasury retains: $0.50                                          │
    │                                                                    │
    │   WHO BENEFITS FROM THE $0.50?                                     │
    │   ────────────────────────────                                     │
    │   All remaining token holders, proportionally:                     │
    │   • Store Owner (94%): Gets ~$0.47 in backing increase             │
    │   • Other customers (6%): Get ~$0.03 in backing increase           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    THE PARADOX:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   The exit fee is designed to reward "stayers" over "leavers".    │
    │   But if the store owner holds most tokens, they capture most     │
    │   of the exit fee benefit.                                         │
    │                                                                    │
    │   IS THIS A PROBLEM?                                               │
    │   ─────────────────                                                │
    │   Not necessarily. The exit fee still:                             │
    │   1. Discourages frivolous cash-outs                               │
    │   2. Creates a "switching cost" for leaving the ecosystem          │
    │   3. Rewards ALL holders including loyal customers                 │
    │                                                                    │
    │   The exit fee's primary purpose is FRICTION, not redistribution. │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### When Exit Fees Matter More

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    EXIT FEE VALUE BY TOKEN DISTRIBUTION                     │
└─────────────────────────────────────────────────────────────────────────────┘

    SCENARIO A: Store owner holds 95%, customers hold 5%
    ────────────────────────────────────────────────────
    Exit fees mostly benefit store owner.
    Exit fee acts as friction/switching cost.

    SCENARIO B: Store owner holds 50%, customers hold 50%
    ────────────────────────────────────────────────────
    Exit fees create meaningful redistribution.
    Loyal customers benefit from others leaving.

    SCENARIO C: Store owner cashed out, customers hold 100%
    ───────────────────────────────────────────────────────
    Exit fees purely benefit remaining community.
    True "community token" economics.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   INSIGHT: The exit fee's value as a loyalty mechanism depends    │
    │   on HOW MUCH the store owner holds. If they hold everything,     │
    │   customers have no "community" benefit from staying.             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Should Store Owners Cash Out?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORE OWNER STRATEGIES                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    STRATEGY A: Cash out immediately (pay exit fee)
    ────────────────────────────────────────────────
    • Get 90% of token value as USDC immediately
    • Simple revenue model
    • Exit fee goes back to treasury (benefits remaining holders)
    • Creates better token distribution for customers

    STRATEGY B: Hold tokens long-term
    ─────────────────────────────────
    • Bet on backing appreciation from customer exits
    • Tokens locked up (no immediate revenue)
    • If store fails, tokens become worthless
    • Owner and customers both benefit from exits

    STRATEGY C: Partial cash-out
    ────────────────────────────
    • Cash out portion for revenue, hold portion for upside
    • Balanced approach
    • Still maintains some skin in the game

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   RECOMMENDATION: Encourage stores to cash out regularly.         │
    │   This creates:                                                    │
    │   1. Real revenue for the store (their actual business)           │
    │   2. Better token distribution (customers become larger %)        │
    │   3. Exit fee revenue back to treasury                            │
    │   4. More meaningful loyalty rewards for customers                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Revenue Opportunities

### Current Cocopay Revenue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CURRENT: TOKEN SPLIT REVENUE                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Cocopay Labs receives 1% of the "store side" tokens.

    Example: $10,000 monthly payments, 5% cashback
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Total tokens minted: 10,000                                      │
    │   Customer tokens (5%): 500                                        │
    │   Store side tokens (95%): 9,500                                   │
    │                                                                    │
    │   Cocopay Labs (1% of 9,500): 95 tokens = $95/month               │
    │   Store Owner (99% of 9,500): 9,405 tokens = $9,405/month         │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • Aligned with store success (more payments = more tokens)
    • No upfront cost to stores
    • Scales automatically

    CONS:
    • Tokens, not USDC (must cash out to realize revenue)
    • Subject to exit fee when cashing out
    • Revenue depends on store volume
```

### Potential Revenue Models

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 1: PAYMENT FEE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Charge a small fee on each payment (like Stripe's 2.9% + $0.30).

    $100 payment with 1% Cocopay fee:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   $100 USDC from customer                                          │
    │       │                                                            │
    │       ├── $1.00 → Cocopay (1% fee)                                │
    │       │                                                            │
    │       └── $99.00 → Treasury (backs 99 tokens)                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • Immediate USDC revenue (no cashing out tokens)
    • Simple, predictable
    • Industry-standard model

    CONS:
    • Reduces token backing (tokens worth $0.99 not $1.00)
    • Visible cost to stores
    • May be unattractive vs competitors

    IMPLEMENTATION:
    • Would require modifying the payment terminal or adding a hook
    • Could be done via a wrapper contract
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 2: EXIT FEE SHARE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    Take a portion of exit fees when anyone cashes out.

    Customer cashes out 100 tokens with 10% exit fee:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   100 tokens burned                                                │
    │   Exit fee (10%): $10 retained by treasury                         │
    │                                                                    │
    │   Current: $10 → Treasury (benefits all holders)                   │
    │                                                                    │
    │   With Cocopay share (20% of exit fee):                           │
    │   $2 → Cocopay                                                     │
    │   $8 → Treasury                                                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • Revenue tied to economic activity
    • Doesn't affect payment flow or token backing
    • Aligns Cocopay with long-term ecosystem health

    CONS:
    • Complex to implement (may need protocol-level changes)
    • Unpredictable revenue (depends on cash-out volume)
    • May not be possible with current Revnet contracts
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 3: SUBSCRIPTION / SaaS                            │
└─────────────────────────────────────────────────────────────────────────────┘

    Charge stores a monthly subscription fee.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   TIER 1 (Free): Basic store, limited features                     │
    │   TIER 2 ($29/mo): Full features, analytics                        │
    │   TIER 3 ($99/mo): Enterprise, custom branding, support           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • Predictable, recurring revenue
    • No token mechanics involved
    • Standard SaaS model

    CONS:
    • Barrier to entry for small stores
    • Not aligned with store success
    • Requires significant feature differentiation
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OPTION 4: HYBRID MODEL (RECOMMENDED)                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Combine multiple revenue streams:

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   1. Token Split (current): 1% of store tokens                     │
    │      → Aligned with payment volume                                 │
    │                                                                    │
    │   2. Treasury Yield (new): Earn yield on idle USDC                │
    │      → Passive income from all treasuries                          │
    │                                                                    │
    │   3. Premium Features (new): Analytics, custom branding            │
    │      → Upsell to successful stores                                 │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Treasury Yield

### The Opportunity

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    IDLE TREASURY PROBLEM                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Currently, all treasury USDC sits idle in the terminal contract.
    This is a massive opportunity cost.

    Example: $1M total USDC across all store treasuries
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Current yield: $0/year (0% APY)                                  │
    │                                                                    │
    │   Potential yield at various rates:                                │
    │   • 3% APY (conservative): $30,000/year                           │
    │   • 5% APY (moderate): $50,000/year                               │
    │   • 8% APY (aggressive): $80,000/year                             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Yield Strategies

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGY 1: LENDING PROTOCOLS                            │
└─────────────────────────────────────────────────────────────────────────────┘

    Deploy USDC to Aave, Compound, or similar.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   TREASURY ──deposit──► AAVE ──aUSDC──► TREASURY                  │
    │                           │                                        │
    │                           └── Earns 3-5% APY                       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • Battle-tested protocols
    • Highly liquid (can withdraw anytime)
    • Predictable yield

    CONS:
    • Smart contract risk
    • Requires integration work
    • May need governance approval for Revnet changes
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STRATEGY 2: YIELD-BEARING STABLECOINS                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Accept yield-bearing stablecoins instead of USDC.

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Options:                                                         │
    │   • sDAI (Maker's savings DAI): ~5% APY                           │
    │   • aUSDC (Aave USDC): ~3-5% APY                                  │
    │   • cUSDC (Compound USDC): ~3-5% APY                              │
    │                                                                    │
    │   User pays sDAI → Treasury holds sDAI → Yield accrues            │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PROS:
    • No active management needed
    • Yield automatic

    CONS:
    • Users need to acquire yield-bearing tokens first
    • Complexity for mainstream adoption
    • Different backing asset
```

### Yield Distribution Options

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    WHO GETS THE YIELD?                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    OPTION A: Yield → Token Holders (increases backing)
    ────────────────────────────────────────────────────
    • All yield adds to treasury
    • Token backing naturally increases
    • Benefits all holders equally

    OPTION B: Yield → Cocopay (platform revenue)
    ─────────────────────────────────────────────
    • Cocopay captures all yield
    • Significant revenue stream
    • Stores/customers get no direct benefit

    OPTION C: Yield Split (RECOMMENDED)
    ────────────────────────────────────
    • 50% → Treasury (increases backing)
    • 50% → Cocopay (platform revenue)
    • Or other split ratio

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Example: $1M TVL at 5% APY = $50,000/year                       │
    │                                                                    │
    │   50/50 split:                                                     │
    │   • $25,000 → Token holders (backing +2.5%)                       │
    │   • $25,000 → Cocopay revenue                                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Community Commerce

### The Value of Spending vs Cashing Out

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COMMUNITY COMMERCE                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer has 100 $STORE tokens worth $100 (at $1.00 backing).

    OPTION A: Cash out
    ──────────────────
    100 tokens × $1.00 × 90% (exit fee) = $90 USDC
    Value captured: $90

    OPTION B: Spend at store
    ────────────────────────
    100 tokens → $100 purchase at store
    Value captured: $100 (no exit fee!)

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   SPENDING IS 11% MORE VALUABLE THAN CASHING OUT                  │
    │   (with 10% exit fee)                                              │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Implementation Question

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HOW DOES SPENDING WORK?                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    When customer spends $STORE tokens at the store:

    OPTION A: Burn & Re-mint
    ────────────────────────
    1. Customer burns 100 $STORE tokens
    2. Store receives 100 newly minted tokens (split applies)
    3. Treasury unchanged

    Problem: This is just a disguised cash-out + payment.

    OPTION B: Direct Transfer
    ─────────────────────────
    1. Customer transfers 100 $STORE to store owner wallet
    2. No burn, no mint, no exit fee
    3. Treasury unchanged

    This is TRUE community commerce!

    OPTION C: Store Accepts at Premium
    ──────────────────────────────────
    1. Customer's 100 $STORE → worth $100 at backing
    2. Store accepts for $105 in goods (5% premium)
    3. Customer gets MORE value than backing

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   COMMUNITY COMMERCE VALUE PROP:                                   │
    │   • Customers: Get full value (no exit fee)                        │
    │   • Store: Receives tokens they can cash out or hold               │
    │   • Ecosystem: Tokens stay circulating, not burned                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Circular Economy

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CIRCULAR ECONOMY                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    TRADITIONAL:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer ──USDC──► Store ──tokens──► Customer ──cash out──►     │
    │                                                                    │
    │   Linear flow: money in, tokens out, money out                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    COMMUNITY COMMERCE:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │         ┌──────────────────────────────────────────┐               │
    │         │                                          │               │
    │         ▼                                          │               │
    │   Customer ──$STORE──► Store ──$STORE──► Customer  │               │
    │         │                                          │               │
    │         └──────────────────────────────────────────┘               │
    │                                                                    │
    │   Circular flow: tokens stay in ecosystem                          │
    │   Value preserved, no exit fees triggered                          │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    WHY THIS MATTERS:
    • Tokens become a local currency
    • Exit fee only triggers when leaving the ecosystem
    • Store builds community, not just customers
```

---

## $COCO Token Potential

### Possible Roles for a $COCO Token

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    $COCO TOKEN USE CASES                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    1. GOVERNANCE
    ─────────────
    • Vote on protocol parameters
    • Vote on yield distribution
    • Vote on new features

    2. FEE DISCOUNTS
    ────────────────
    • Stake $COCO to reduce exit fees
    • Pay fees in $COCO at discount
    • Store owners stake for reduced platform fees

    3. YIELD AGGREGATION
    ────────────────────
    • $COCO holders receive share of all treasury yields
    • Creates demand for $COCO
    • Aligns holders with platform success

    4. STORE BOOSTS
    ───────────────
    • Stake $COCO to boost store visibility
    • Featured stores in discover
    • Marketing/promotion benefits

    5. CROSS-STORE VALUE
    ────────────────────
    • $COCO as universal token across all stores
    • Exchange $STORE tokens for $COCO
    • Use $COCO at any participating store
```

### $COCO Economics Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    $COCO AS YIELD AGGREGATOR                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   STORE A              STORE B              STORE C                │
    │   Treasury             Treasury             Treasury               │
    │   $100K USDC           $50K USDC            $200K USDC            │
    │       │                    │                    │                  │
    │       │                    │                    │                  │
    │       └────────────────────┼────────────────────┘                  │
    │                            │                                       │
    │                            ▼                                       │
    │                    YIELD AGGREGATOR                                │
    │                    (deploys to DeFi)                               │
    │                            │                                       │
    │                            ▼                                       │
    │                    5% APY on $350K                                 │
    │                    = $17,500/year                                  │
    │                            │                                       │
    │              ┌─────────────┼─────────────┐                         │
    │              │             │             │                         │
    │              ▼             ▼             ▼                         │
    │          STORES       $COCO          COCOPAY                       │
    │          (40%)        STAKERS        (20%)                         │
    │          $7,000       (40%)          $3,500                        │
    │                       $7,000                                       │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    $COCO VALUE PROP:
    • Stake $COCO → receive yield from ALL store treasuries
    • More stores + more TVL = more yield = $COCO appreciates
    • Aligned incentive: grow the platform, grow $COCO value
```

---

## Recommendations

### Immediate Actions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRIORITY 1: CLARIFY THE MODEL                            │
└─────────────────────────────────────────────────────────────────────────────┘

    1. Document the ACTUAL current model clearly
       • Token splits (who gets what)
       • Exit fee mechanics
       • How community commerce works (or will work)

    2. Decide on store owner expectations
       • Should they cash out regularly? (recommended)
       • Or hold tokens long-term?
       • How does this affect customer experience?

    3. Validate exit fee value
       • What does cashOutTaxRate: 10 actually mean?
       • Is this optimal for the use case?
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRIORITY 2: TREASURY YIELD                               │
└─────────────────────────────────────────────────────────────────────────────┘

    1. Research implementation options
       • Can Revnet terminals be modified to hold aUSDC?
       • Can we add a yield-generating wrapper?
       • What protocol changes would be needed?

    2. Define yield split
       • How much to token holders?
       • How much to Cocopay?
       • Is this configurable per store?

    3. Consider risks
       • Smart contract risk
       • Liquidity constraints
       • Regulatory implications
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PRIORITY 3: COMMUNITY COMMERCE UX                        │
└─────────────────────────────────────────────────────────────────────────────┘

    1. Implement "Pay with $STORE" feature
       • Customer can pay with tokens they've accumulated
       • No exit fee (direct transfer)
       • Store receives tokens

    2. Educate users on value
       • "Save 10% by paying with $STORE!"
       • Show comparison: cash out vs spend

    3. Consider token-to-token payments
       • Can $COFFEE be spent at a bakery?
       • Universal acceptance layer?
```

### Future Considerations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    $COCO TOKEN: DO WE NEED IT?                              │
└─────────────────────────────────────────────────────────────────────────────┘

    ARGUMENTS FOR:
    • Creates unified value layer across stores
    • Enables yield aggregation revenue
    • Governance and community alignment
    • Marketing/fundraising tool

    ARGUMENTS AGAINST:
    • Adds complexity for users
    • Regulatory uncertainty
    • May not be necessary if $STORE tokens work well
    • Token fatigue in market

    RECOMMENDATION:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Focus on making $STORE tokens valuable first.                   │
    │   $COCO can be introduced later as a yield/governance layer       │
    │   once there's significant TVL across stores.                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Open Questions

1. **Exit fee implementation**: What does `cashOutTaxRate: 10` represent? Is it 10% or a different scale?

2. **Treasury yield feasibility**: Can we modify Revnet terminals to deploy to yield protocols? What governance is needed?

3. **Community commerce implementation**: How do we enable $STORE → Store payments without triggering exit fees?

4. **Cross-store payments**: Should $STORE tokens be usable at other stores? How would conversion work?

5. **Cocopay Labs token strategy**: Should Cocopay hold tokens or cash out for operational revenue?

6. **Exit fee share**: Is it technically possible to take a portion of exit fees? Would this require protocol changes?

---

## Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE BIG PICTURE                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    CURRENT STATE:
    • Stores accept USDC, mint tokens 1:1
    • Tokens split: customer (cashback%), store (rest), Cocopay (1% of store)
    • Exit fee exists but benefits mostly store owner
    • Treasury USDC sits idle

    OPPORTUNITY:
    • Treasury yield could generate significant revenue
    • Community commerce creates stickiness
    • $COCO could unify the ecosystem

    KEY INSIGHT:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   For customers, the value prop is SIMPLE:                         │
    │   • Pay at store → get cashback tokens                             │
    │   • Hold tokens → value may increase                               │
    │   • Spend at store → get full value (no exit fee)                 │
    │   • Cash out → get backing minus fee                               │
    │                                                                    │
    │   For stores, the value prop is SIMPLE:                            │
    │   • Accept crypto payments easily                                  │
    │   • Offer loyalty rewards automatically                            │
    │   • Get tokens → cash out for revenue                              │
    │                                                                    │
    │   For Cocopay, the opportunity is:                                 │
    │   • Token splits (current)                                         │
    │   • Treasury yield (future)                                        │
    │   • Premium features (future)                                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```
