# Tokenomics: From Juicebox to Revnets to Cocopay

Understanding the economic model from first principles, then applying it to stores.

---

## Table of Contents

### Part 1: Juicebox Fundamentals

1. [The Basic Model](#the-basic-model)
2. [Paying In (Minting)](#paying-in-minting)
3. [The Treasury](#the-treasury)
4. [Cashing Out (Redeeming)](#cashing-out-redeeming)
5. [The Exit Fee](#the-exit-fee)
6. [Two Perspectives: Payer vs Creator](#two-perspectives-payer-vs-creator)
7. [Juicebox Simulations](#juicebox-simulations)

### Part 2: Revnets

8. [What Revnets Add](#what-revnets-add)
9. [The Levers](#the-levers)
10. [Lever Relationships](#lever-relationships)
11. [Revnet Simulations](#revnet-simulations)

### Part 3: Cocopay Stores

12. [Applying to Stores](#applying-to-stores)
13. [Store Token Economics](#store-token-economics)
14. [Store Simulations](#store-simulations)

### Reference

15. [Key Takeaways](#key-takeaways)
16. [Glossary](#glossary)

---

# Part 1: Juicebox Fundamentals

## The Basic Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE JUICEBOX MODEL                                │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────────┐
                              │    TREASURY     │
         PAY IN               │                 │              CASH OUT
        ────────►             │   Asset Pool    │             ◄────────
                              │   (USDC/ETH)    │
    User sends assets         │                 │         User burns tokens
    Receives tokens           │  Backs all      │         Receives assets
                              │  token supply   │         (minus exit fee)
                              │                 │
                              └─────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │              BACKING = Treasury Balance / Token Supply              │
    │                                                                     │
    │              This is the "floor price" per token                    │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘
```

---

## Paying In (Minting)

The **issuance rate** determines how many tokens you receive per asset paid.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAYING IN                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Example: Issuance rate = 1 token per $1 USDC

                    $100 USDC
                        │
                        ▼
              ┌─────────────────┐
              │     PROJECT     │
              │                 │
              │  Mints tokens   │
              │  Adds to        │
              │  treasury       │
              └─────────────────┘
                        │
                        ▼
                  100 $TOKEN


    TREASURY STATE:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   BEFORE                          AFTER                            │
    │   ──────                          ─────                            │
    │   Treasury: $1,000                Treasury: $1,100 (+$100)         │
    │   Supply:   1,000 tokens          Supply:   1,100 tokens (+100)    │
    │   Backing:  $1.00/token           Backing:  $1.00/token            │
    │                                                                    │
    │   Backing unchanged - proportional increase in both                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## The Treasury

The treasury holds all paid assets. These assets **back** every token in circulation.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              THE TREASURY                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │                         TREASURY                                    │
    │                    ┌──────────────┐                                 │
    │                    │              │                                 │
    │                    │  $10,000     │                                 │
    │                    │  USDC        │                                 │
    │                    │              │                                 │
    │                    └──────────────┘                                 │
    │                           │                                         │
    │                           │ backs                                   │
    │                           ▼                                         │
    │                    ┌──────────────┐                                 │
    │                    │              │                                 │
    │                    │  10,000      │                                 │
    │                    │  $TOKEN      │                                 │
    │                    │              │                                 │
    │                    └──────────────┘                                 │
    │                                                                     │
    │              Each token = $10,000 / 10,000 = $1.00                  │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘

    By default, treasury funds sit idle - no yield, no risk.
    Pure backing for token holders.
```

---

## Cashing Out (Redeeming)

Token holders can burn tokens to reclaim their proportional share of the treasury.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CASHING OUT (No Fee)                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Formula: USDC Received = (Tokens Burned / Total Supply) × Treasury

    Example: User holds 1,000 of 10,000 tokens (10%)

                  1,000 $TOKEN
                        │
                        │ burn
                        ▼
              ┌─────────────────┐
              │     PROJECT     │
              │                 │
              │  Burns tokens   │
              │  Releases       │
              │  proportional   │
              │  treasury       │
              └─────────────────┘
                        │
                        ▼
                  $1,000 USDC
                  (10% of $10,000)


    TREASURY STATE:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   BEFORE                          AFTER                            │
    │   ──────                          ─────                            │
    │   Treasury: $10,000               Treasury: $9,000 (-$1,000)       │
    │   Supply:   10,000 tokens         Supply:   9,000 tokens (-1,000)  │
    │   Backing:  $1.00/token           Backing:  $1.00/token            │
    │                                                                    │
    │   Backing unchanged - proportional decrease in both                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## The Exit Fee

The exit fee changes everything. It's the percentage of redemption value that **stays in the treasury**.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           THE EXIT FEE                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Formula: USDC Received = Proportional Share × (1 - Exit Fee)

    Example: 20% exit fee, user cashes out 1,000 tokens

                  1,000 $TOKEN
                        │
                        │ burn (ALL tokens destroyed)
                        ▼
              ┌─────────────────┐
              │     PROJECT     │
              │                 │
              │  Exit Fee: 20%  │───────┐
              │                 │       │
              └─────────────────┘       │
                        │               │
                        ▼               ▼
                  $800 USDC        $200 USDC
                  (to user)        (stays in treasury)


    THE KEY INSIGHT:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Tokens burned:   1,000 (100% of user's tokens)                   │
    │   USDC removed:    $800  (80% of user's value)                     │
    │                                                                    │
    │   The $200 stays in treasury but the tokens that                   │
    │   "owned" that value are GONE.                                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘


    TREASURY STATE:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   BEFORE                          AFTER                            │
    │   ──────                          ─────                            │
    │   Treasury: $10,000               Treasury: $9,200 (-$800)         │
    │   Supply:   10,000 tokens         Supply:   9,000 tokens (-1,000)  │
    │   Backing:  $1.00/token           Backing:  $1.022/token           │
    │                                              ▲                     │
    │                                              │                     │
    │                              BACKING INCREASED (+2.2%)             │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Value Flows to Remaining Holders

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    VALUE REDISTRIBUTION                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    BEFORE EXIT:

    $10,000 backing 10,000 tokens = $1.00 each

    ████████████████████████████████████████  $10,000 treasury
    ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲  10,000 tokens
    ││││││││││││││││││││││││││││││││││││││││
    $1 $1 $1 $1 $1 $1 $1 $1 $1 $1 ... (each)


    AFTER EXIT (1,000 tokens burned, only $800 withdrawn):

    $9,200 backing 9,000 tokens = $1.022 each

    ████████████████████████████████████░░░░  $9,200 treasury
    ▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲▲      9,000 tokens
    │││││││││││││││││││││││││││││││││││││
    $1.02 each (the $200 "leftover" distributed)


    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   The exit fee transfers value from leavers to stayers.            │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Two Perspectives: Payer vs Creator

Juicebox serves two parties with different goals.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE PAYER'S PERSPECTIVE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    WHY PAY IN?
    ───────────
    1. Support a project/creator you believe in
    2. Receive tokens that may appreciate via:
       - Exit fees from others leaving
       - Project success increasing demand
    3. Access token-gated benefits
    4. Participate in governance (if applicable)

    RISKS:
    ──────
    - Exit fee reduces liquidity (cost to leave)
    - Project may fail (treasury depletes)
    - Token value tied to project health

    BEST OUTCOME:
    ─────────────
    - Hold long-term through churn
    - Others exit, backing increases
    - Token appreciates from exit fees
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    THE CREATOR'S PERSPECTIVE                                │
└─────────────────────────────────────────────────────────────────────────────┘

    WHY CREATE A PROJECT?
    ─────────────────────
    1. Raise funds from supporters
    2. Build a community with aligned incentives
    3. Create sustainable revenue via:
       - Splits (take % of incoming payments)
       - Reserved tokens (receive tokens when others pay)

    CREATOR REVENUE MECHANISMS:
    ───────────────────────────

    Option A: Splits
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   User pays $100                                                   │
    │        │                                                           │
    │        ├── $90 → Treasury (backs tokens)                           │
    │        │                                                           │
    │        └── $10 → Creator wallet (10% split)                        │
    │                                                                    │
    │   Creator earns immediately from each payment.                     │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    Option B: Reserved Tokens
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   User pays $100 → 100 tokens minted                               │
    │        │                                                           │
    │        ├── 80 tokens → User (80%)                                  │
    │        │                                                           │
    │        └── 20 tokens → Creator (20% reserved)                      │
    │                                                                    │
    │   Creator accumulates tokens, can cash out later.                  │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    BEST OUTCOME:
    ─────────────
    - Steady inflow of payments
    - Healthy churn (exit fees boost remaining value)
    - Token becomes valuable, creator's reserved tokens appreciate
```

---

## Juicebox Simulations

Single-lever simulations to understand each mechanism in isolation.

### Simulation 1: No Exit Fee (Baseline)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             SIMULATION: No Exit Fee (0%)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Setup: 10 holders, each with 1,000 tokens, $10,000 treasury

    EVENT LOG:
    ┌────────┬──────────────────┬───────────┬─────────┬──────────┐
    │ Event  │ Action           │ Treasury  │ Supply  │ Backing  │
    ├────────┼──────────────────┼───────────┼─────────┼──────────┤
    │ Start  │ -                │ $10,000   │ 10,000  │ $1.00    │
    │ 1      │ Holder A exits   │ $9,000    │ 9,000   │ $1.00    │
    │ 2      │ Holder B exits   │ $8,000    │ 8,000   │ $1.00    │
    │ 3      │ Holder C exits   │ $7,000    │ 7,000   │ $1.00    │
    │ 4      │ Holder D exits   │ $6,000    │ 6,000   │ $1.00    │
    │ 5      │ Holder E exits   │ $5,000    │ 5,000   │ $1.00    │
    └────────┴──────────────────┴───────────┴─────────┴──────────┘

    RESULT: Backing never changes. Leavers and stayers break even.

    PAYER OUTCOME:  Neutral (got back exactly what they put in)
    CREATOR OUTCOME: No ongoing benefit from churn
```

### Simulation 2: 20% Exit Fee

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             SIMULATION: 20% Exit Fee                                        │
└─────────────────────────────────────────────────────────────────────────────┘

    Setup: 10 holders, each with 1,000 tokens, $10,000 treasury

    EVENT LOG:
    ┌────────┬────────────────────┬───────────┬─────────┬──────────┬───────────┐
    │ Event  │ Action             │ Treasury  │ Supply  │ Backing  │ Exiter    │
    │        │                    │           │         │          │ Received  │
    ├────────┼────────────────────┼───────────┼─────────┼──────────┼───────────┤
    │ Start  │ -                  │ $10,000   │ 10,000  │ $1.000   │ -         │
    │ 1      │ Holder A exits     │ $9,200    │ 9,000   │ $1.022   │ $800      │
    │ 2      │ Holder B exits     │ $8,382    │ 8,000   │ $1.048   │ $818      │
    │ 3      │ Holder C exits     │ $7,543    │ 7,000   │ $1.078   │ $839      │
    │ 4      │ Holder D exits     │ $6,681    │ 6,000   │ $1.113   │ $862      │
    │ 5      │ Holder E exits     │ $5,791    │ 5,000   │ $1.158   │ $890      │
    └────────┴────────────────────┴───────────┴─────────┴──────────┴───────────┘

    RESULT: 50% of holders exited, backing increased 15.8%

    EXITER OUTCOMES (each started with $1,000 worth):
    - Holder A: Received $800 (lost $200, -20%)
    - Holder B: Received $818 (lost $182, -18.2%)
    - Holder C: Received $839 (lost $161, -16.1%)
    - Holder D: Received $862 (lost $138, -13.8%)
    - Holder E: Received $890 (lost $110, -11%)

    Note: Later exiters lose less because backing increased.

    STAYER OUTCOMES (5 remaining holders):
    - Started with 1,000 tokens × $1.00 = $1,000
    - Now have 1,000 tokens × $1.158 = $1,158
    - Gained $158 (+15.8%) by doing nothing
```

### Simulation 3: High Exit Fee (40%)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             SIMULATION: 40% Exit Fee (Aggressive)                           │
└─────────────────────────────────────────────────────────────────────────────┘

    Setup: 10 holders, each with 1,000 tokens, $10,000 treasury

    EVENT LOG (5 holders exit):
    ┌────────┬────────────────────┬───────────┬─────────┬──────────┬───────────┐
    │ Event  │ Action             │ Treasury  │ Supply  │ Backing  │ Exiter    │
    │        │                    │           │         │          │ Received  │
    ├────────┼────────────────────┼───────────┼─────────┼──────────┼───────────┤
    │ Start  │ -                  │ $10,000   │ 10,000  │ $1.000   │ -         │
    │ 1      │ Holder A exits     │ $9,400    │ 9,000   │ $1.044   │ $600      │
    │ 2      │ Holder B exits     │ $8,774    │ 8,000   │ $1.097   │ $627      │
    │ 3      │ Holder C exits     │ $8,116    │ 7,000   │ $1.159   │ $658      │
    │ 4      │ Holder D exits     │ $7,420    │ 6,000   │ $1.237   │ $696      │
    │ 5      │ Holder E exits     │ $6,678    │ 5,000   │ $1.336   │ $742      │
    └────────┴────────────────────┴───────────┴─────────┴──────────┴───────────┘

    RESULT: 50% of holders exited, backing increased 33.6%

    STAYER OUTCOMES:
    - Started: 1,000 tokens × $1.00 = $1,000
    - Now: 1,000 tokens × $1.336 = $1,336
    - Gained $336 (+33.6%)

    Higher exit fee = More value transfer to stayers
```

### Simulation 4: Creator with 10% Split

```
┌─────────────────────────────────────────────────────────────────────────────┐
│             SIMULATION: Creator Takes 10% Split                             │
└─────────────────────────────────────────────────────────────────────────────┘

    Setup: Creator takes 10% of all incoming payments

    PAYMENT FLOW:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   User pays $100                                                   │
    │        │                                                           │
    │        ├── $90 → Treasury                                          │
    │        └── $10 → Creator                                           │
    │                                                                    │
    │   User receives: 100 tokens                                        │
    │   Token backing: $90 / 100 = $0.90/token                           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    EVENT LOG:
    ┌────────┬───────────────────┬───────────┬─────────┬──────────┬──────────┐
    │ Event  │ Action            │ Treasury  │ Supply  │ Backing  │ Creator  │
    │        │                   │           │         │          │ Earned   │
    ├────────┼───────────────────┼───────────┼─────────┼──────────┼──────────┤
    │ Start  │ -                 │ $0        │ 0       │ -        │ $0       │
    │ 1      │ User A pays $100  │ $90       │ 100     │ $0.90    │ $10      │
    │ 2      │ User B pays $100  │ $180      │ 200     │ $0.90    │ $20      │
    │ 3      │ User C pays $500  │ $630      │ 700     │ $0.90    │ $70      │
    │ 4      │ User D pays $300  │ $900      │ 1,000   │ $0.90    │ $100     │
    └────────┴───────────────────┴───────────┴─────────┴──────────┴──────────┘

    RESULT: $1,000 paid in total

    PAYER OUTCOME: Tokens backed at $0.90 (10% "cost" to creator)
    CREATOR OUTCOME: Earned $100 (10% of all payments)

    Note: Backing is permanently lower due to split.
    Exit fees can still increase backing from $0.90 base.
```

---

# Part 2: Revnets

## What Revnets Add

Revnets are Juicebox projects with preset configurations and additional mechanisms.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    JUICEBOX vs REVNET                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    JUICEBOX PROJECT                    REVNET
    ────────────────                    ──────
    ┌─────────────────┐                ┌─────────────────┐
    │ • Pay in        │                │ • Pay in        │
    │ • Treasury      │                │ • Treasury      │
    │ • Cash out      │                │ • Cash out      │
    │ • Exit fee      │                │ • Exit fee      │
    │ • Splits        │                │ • Splits        │
    │                 │                │                 │
    │ (Flexible       │                │ + BOOST PERIOD  │
    │  configuration) │                │ + PRICE CEILING │
    │                 │                │ + ISSUANCE DECAY│
    │                 │                │ + LOCKED RULES  │
    └─────────────────┘                └─────────────────┘

    Revnets lock certain rules to create predictable, trustless economics.
```

---

## The Levers

Revnets have several configurable "levers" that affect economics.

### Lever 1: Boost Period

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVER: BOOST PERIOD                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    During boost: Extra tokens allocated to designated recipients (founders, team)
    After boost: All tokens go to payers

    EXAMPLE: 6-month boost, 30% to founder

    DURING BOOST:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   User pays $100 → 100 tokens minted                               │
    │        │                                                           │
    │        ├── 70 tokens → User (70%)                                  │
    │        └── 30 tokens → Founder (30%)                               │
    │                                                                    │
    │   Treasury: +$100                                                  │
    │   User effective price: $100 / 70 = $1.43/token                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    AFTER BOOST:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   User pays $100 → 100 tokens minted                               │
    │        │                                                           │
    │        └── 100 tokens → User (100%)                                │
    │                                                                    │
    │   User effective price: $100 / 100 = $1.00/token                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    CREATOR BENEFIT: Accumulates tokens early
    PAYER COST: Pays premium during boost period
```

### Lever 2: Issuance Decay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVER: ISSUANCE DECAY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Reduces tokens minted per dollar over time (rewards early supporters)

    EXAMPLE: 10% decay per funding cycle

    ┌─────────┬──────────────────┬─────────────────┬────────────────┐
    │ Cycle   │ Issuance Rate    │ $100 Gets You   │ Effective Cost │
    ├─────────┼──────────────────┼─────────────────┼────────────────┤
    │ 1       │ 1000 tokens/$1   │ 100,000 tokens  │ $0.001/token   │
    │ 2       │ 900 tokens/$1    │ 90,000 tokens   │ $0.00111/token │
    │ 3       │ 810 tokens/$1    │ 81,000 tokens   │ $0.00123/token │
    │ 5       │ 656 tokens/$1    │ 65,600 tokens   │ $0.00152/token │
    │ 10      │ 387 tokens/$1    │ 38,700 tokens   │ $0.00258/token │
    │ 20      │ 135 tokens/$1    │ 13,500 tokens   │ $0.00741/token │
    └─────────┴──────────────────┴─────────────────┴────────────────┘

    EARLY PAYER BENEFIT: Gets 2.5-7x more tokens than late payers
    LATE PAYER COST: Pays higher effective price
```

### Lever 3: Exit Fee (Cash Out Tax)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVER: EXIT FEE                                          │
└─────────────────────────────────────────────────────────────────────────────┘

    Percentage retained by treasury when users cash out

    ┌──────────┬───────────────┬────────────────┬─────────────────┐
    │ Exit Fee │ User Receives │ Treasury Keeps │ Stayer Benefit  │
    ├──────────┼───────────────┼────────────────┼─────────────────┤
    │ 0%       │ 100%          │ 0%             │ None            │
    │ 10%      │ 90%           │ 10%            │ Moderate        │
    │ 20%      │ 80%           │ 20%            │ Good            │
    │ 40%      │ 60%           │ 40%            │ High            │
    │ 50%      │ 50%           │ 50%            │ Very high       │
    └──────────┴───────────────┴────────────────┴─────────────────┘

    STAYER BENEFIT: Higher fee = more value from exits
    EXITER COST: Higher fee = more loss on exit
```

### Lever 4: Price Ceiling

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVER: PRICE CEILING                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Maximum price per token. If market exceeds ceiling, anyone can mint at ceiling.

    EXAMPLE: Ceiling = $2.00/token

    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Current backing: $1.50/token                                     │
    │   Market price: $3.00/token (trading above ceiling)                │
    │                                                                    │
    │   Arbitrage opportunity:                                           │
    │   - Pay $2.00 at ceiling                                           │
    │   - Receive 1 token                                                │
    │   - Sell at $3.00 market                                           │
    │   - Profit $1.00                                                   │
    │                                                                    │
    │   This continues until market price = ceiling                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    PAYER BENEFIT: Prevents runaway speculation
    CREATOR CONSIDERATION: Caps potential upside
```

### Lever 5: Operator Splits

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    LEVER: OPERATOR SPLITS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    Percentage of incoming payments sent to operator/creator

    ┌──────────┬─────────────────┬─────────────────┬─────────────────┐
    │ Split %  │ To Treasury     │ To Operator     │ Token Backing   │
    ├──────────┼─────────────────┼─────────────────┼─────────────────┤
    │ 0%       │ $100            │ $0              │ $1.00/token     │
    │ 5%       │ $95             │ $5              │ $0.95/token     │
    │ 10%      │ $90             │ $10             │ $0.90/token     │
    │ 20%      │ $80             │ $20             │ $0.80/token     │
    └──────────┴─────────────────┴─────────────────┴─────────────────┘

    CREATOR BENEFIT: Direct revenue from payments
    PAYER COST: Lower token backing (operator takes cut)
```

---

## Lever Relationships

The levers interact with each other, creating complex economic dynamics.

### Interaction: Boost + Decay

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               INTERACTION: BOOST + DECAY                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Boost: 30% to founder for 6 months
    Decay: 10% per cycle

    COMBINED EFFECT ON EARLY vs LATE PAYERS:

    EARLY PAYER (Cycle 1, during boost):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Pays $100                                                        │
    │   Issuance: 1000 tokens/$1 → 100,000 tokens minted                 │
    │   Split: 70% to payer = 70,000 tokens                              │
    │   Effective cost: $100 / 70,000 = $0.00143/token                   │
    └────────────────────────────────────────────────────────────────────┘

    LATE PAYER (Cycle 10, after boost):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Pays $100                                                        │
    │   Issuance: 387 tokens/$1 → 38,700 tokens minted                   │
    │   Split: 100% to payer = 38,700 tokens                             │
    │   Effective cost: $100 / 38,700 = $0.00258/token                   │
    └────────────────────────────────────────────────────────────────────┘

    Early payer: $0.00143/token (with boost penalty)
    Late payer: $0.00258/token (no boost, but decay)

    Early payer STILL got better deal despite 30% going to founder!
```

### Interaction: Exit Fee + Splits

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               INTERACTION: EXIT FEE + SPLITS                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Exit Fee: 20%
    Operator Split: 10%

    SCENARIO: User pays $100, later exits

    PAY IN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   User pays $100                                                   │
    │   Treasury receives: $90 (after 10% split)                         │
    │   User receives: 100 tokens                                        │
    │   Initial backing: $0.90/token                                     │
    └────────────────────────────────────────────────────────────────────┘

    CASH OUT (assuming no other activity):
    ┌────────────────────────────────────────────────────────────────────┐
    │   User burns 100 tokens                                            │
    │   Proportional value: $90                                          │
    │   Exit fee (20%): $18 stays in treasury                            │
    │   User receives: $72                                               │
    │                                                                    │
    │   Total loss: $100 - $72 = $28 (28%)                               │
    │   - $10 to operator (split)                                        │
    │   - $18 to treasury (exit fee on $90)                              │
    └────────────────────────────────────────────────────────────────────┘

    Combined effect: Splits AND exit fees both reduce payer returns
```

### Interaction: Ceiling + Exit Fee

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               INTERACTION: CEILING + EXIT FEE                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Price Ceiling: $2.00
    Exit Fee: 20%

    SCENARIO: Backing reaches $1.50, demand pushes market to $2.50

    WITHOUT CEILING:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Market trades at $2.50                                           │
    │   Speculation drives price higher                                  │
    │   Backing: $1.50 (unchanged)                                       │
    │   Premium over backing: 67%                                        │
    └────────────────────────────────────────────────────────────────────┘

    WITH CEILING:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Arbitrageurs mint at $2.00 ceiling                               │
    │   New tokens enter circulation                                     │
    │   Treasury increases (new payments)                                │
    │   Market price pulled down toward $2.00                            │
    │                                                                    │
    │   Result: Price capped, treasury grows, backing adjusts            │
    └────────────────────────────────────────────────────────────────────┘

    Exit fee still applies regardless of ceiling activity
```

---

## Revnet Simulations

Multi-lever scenarios showing combined effects.

### Simulation 1: Founder-Friendly Revnet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       SIMULATION: Founder-Friendly Configuration                            │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Boost: 40% to founder for 12 months
    - Decay: 5% per month
    - Exit fee: 25%
    - Operator split: 5%

    YEAR 1 RESULTS (Founder perspective):

    ┌────────────────────────────────────────────────────────────────────┐
    │   Total payments received: $100,000                                │
    │                                                                    │
    │   Founder earnings:                                                │
    │   - Operator split (5%): $5,000 (direct cash)                      │
    │   - Boost tokens (40%): ~45% of supply                             │
    │                                                                    │
    │   If backing reaches $0.02/token at end of boost:                  │
    │   - Founder tokens value: ~$40,000                                 │
    │   - Total founder value: $45,000                                   │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    YEAR 1 RESULTS (Early payer perspective):

    ┌────────────────────────────────────────────────────────────────────┐
    │   Pays $1,000 in month 1                                           │
    │   Receives 60% of minted tokens (boost takes 40%)                  │
    │   Effective entry: ~600,000 tokens at $0.00167/token               │
    │                                                                    │
    │   After churn and 12 months:                                       │
    │   Backing rises to $0.02/token (exit fees)                         │
    │   Holdings worth: 600,000 × $0.02 = $12,000                        │
    │   Gain: $11,000 (1100% return!)                                    │
    │                                                                    │
    │   Despite 40% going to founder, early entry + exit fees =          │
    │   massive gains for early payers who hold.                         │
    └────────────────────────────────────────────────────────────────────┘

    YEAR 1 RESULTS (Late payer perspective):

    ┌────────────────────────────────────────────────────────────────────┐
    │   Pays $1,000 in month 11 (still during boost)                     │
    │   Decay has reduced issuance by ~60%                               │
    │   Receives 60% of minted tokens (boost takes 40%)                  │
    │   Effective entry: ~240,000 tokens at $0.00417/token               │
    │                                                                    │
    │   After 1 more month:                                              │
    │   Backing: $0.02/token                                             │
    │   Holdings worth: 240,000 × $0.02 = $4,800                         │
    │   Gain: $3,800 (380% return)                                       │
    │                                                                    │
    │   Still profitable, but much less than early payers.               │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation 2: Community-Friendly Revnet

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       SIMULATION: Community-Friendly Configuration                          │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Boost: 10% to founder for 3 months only
    - Decay: 2% per month (slow)
    - Exit fee: 15%
    - Operator split: 0%

    YEAR 1 RESULTS (Founder perspective):

    ┌────────────────────────────────────────────────────────────────────┐
    │   Total payments received: $100,000                                │
    │                                                                    │
    │   Founder earnings:                                                │
    │   - Operator split: $0 (no split)                                  │
    │   - Boost tokens: ~5% of supply (short boost, low %)               │
    │                                                                    │
    │   Founder dependent on token appreciation.                         │
    │   Must believe in long-term success to benefit.                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    YEAR 1 RESULTS (Payer perspective):

    ┌────────────────────────────────────────────────────────────────────┐
    │   Pays $1,000 in month 1                                           │
    │   Receives 90% of minted tokens (minimal boost)                    │
    │   100% of payment backs tokens (no split)                          │
    │                                                                    │
    │   Effective entry: Very favorable                                  │
    │   Token backing: Full $1.00/token equivalent                       │
    │                                                                    │
    │   Payers capture most value, founder gets small stake.             │
    └────────────────────────────────────────────────────────────────────┘

    WHO BENEFITS: Community/payers get better terms
    WHO LOSES: Founder has minimal guaranteed revenue
```

### Simulation 3: Balanced Revnet with Churn

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       SIMULATION: Balanced Config with Realistic Churn                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Boost: 20% to founder for 6 months
    - Decay: 5% per month
    - Exit fee: 20%
    - Operator split: 5%

    Monthly activity pattern:
    - New payments: $10,000/month
    - Exits: 15% of holders per month

    12-MONTH PROJECTION:

    ┌────────┬───────────┬───────────┬──────────┬──────────┬──────────┐
    │ Month  │ Inflows   │ Exits     │ Treasury │ Supply   │ Backing  │
    ├────────┼───────────┼───────────┼──────────┼──────────┼──────────┤
    │ 1      │ $9,500    │ -         │ $9,500   │ 9,500    │ $1.00    │
    │ 3      │ $9,048    │ $5,700    │ $21,048  │ 20,500   │ $1.03    │
    │ 6      │ $8,145    │ $8,200    │ $38,500  │ 36,000   │ $1.07    │
    │ 9      │ $7,336    │ $9,800    │ $48,200  │ 42,000   │ $1.15    │
    │ 12     │ $6,603    │ $10,500   │ $55,300  │ 45,000   │ $1.23    │
    └────────┴───────────┴───────────┴──────────┴──────────┴──────────┘

    OUTCOMES:

    Founder:
    - Split income: ~$5,000 (5% of $100k)
    - Token holdings: ~15% of supply (boost + decay effect)
    - Token value: ~$10,200 (at $1.23 backing)
    - Total: ~$15,200

    Early holder (month 1, holds through):
    - Paid $1,000, received 800 tokens (after boost)
    - Value at month 12: 800 × $1.23 = $984
    - BUT: Decay means they got premium issuance
    - Actual return depends on when issuance rate vs backing

    Active trader (buys month 3, sells month 9):
    - Buys $1,000 worth at $1.03 backing
    - Sells at $1.15 backing
    - Exit fee: 20%
    - Net: $1,115 × 0.80 = $892
    - Loss: $108 (trading costs exceed gains)
```

---

# Part 3: Cocopay Stores

## Applying to Stores

Cocopay uses Revnet economics for retail stores with specific configurations.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    COCOPAY STORE MODEL                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Core concept: Store tokens as loyalty/payment tokens backed 1:1 by USDC

    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │   TRADITIONAL LOYALTY              COCOPAY STORE                    │
    │   ──────────────────              ──────────────                    │
    │   Points with no backing   vs     Tokens backed by real USDC       │
    │   Arbitrary value                 Transparent floor price          │
    │   No exit option                  Can cash out (with fee)          │
    │   Centralized control             On-chain, trustless              │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘

    STORE CONFIGURATION:
    - Issuance: 1 $STORE token per $1 USDC (1:1)
    - Exit fee: Configurable (e.g., 10-20%)
    - Cash back %: Customer's share of minted tokens (e.g., 5-10%)
    - Store gets: Remaining tokens (e.g., 90-95%)
```

---

## Store Token Economics

### The 1:1 Mint Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    1:1 STABLECOIN-LIKE TOKENS                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Customer pays $10 USDC at coffee shop:

              $10 USDC
                  │
                  ▼
        ┌─────────────────┐
        │   COFFEE STORE  │
        │                 │
        │  Mint 1:1       │
        │                 │
        └─────────────────┘
                  │
                  ▼
            10 $COFFEE tokens

    RESULT:
    - Treasury: +$10 USDC
    - Supply: +10 $COFFEE
    - Backing: $1.00 per token (always, at mint)

    Tokens START at $1.00 backing, but exit fees can increase it over time.
```

### Cash Back Mechanics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CASH BACK (Token Split)                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Cash back determines HOW MINTED TOKENS ARE SPLIT between customer and store.

    Store offers 5% cash back on purchases:

    Customer pays $100:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Payment: $100 USDC → Treasury                                    │
    │                                                                    │
    │   Tokens minted: 100 $STORE (1:1)                                  │
    │                                                                    │
    │   Token split:                                                     │
    │   ├── 5 tokens → Customer (5% cash back)                           │
    │   └── 95 tokens → Store owner (95% retained)                       │
    │                                                                    │
    │   Treasury: +$100 USDC                                             │
    │   Backing: $100 / 100 = $1.00/token                                │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    KEY INSIGHT:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   100% of payment backs ALL tokens at $1.00 each.                  │
    │   Cash back is NOT bonus tokens - it's the customer's share.       │
    │   Store owner receives tokens, not direct USDC.                    │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    VISUAL: Token Flow
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   $100 USDC ──────────────────────────► TREASURY ($100)            │
    │       │                                      │                     │
    │       │ triggers mint                        │ backs               │
    │       ▼                                      ▼                     │
    │   100 $STORE tokens              All tokens worth $1.00 each       │
    │       │                                                            │
    │       ├── 5% ──► Customer (5 tokens)                               │
    │       │                                                            │
    │       └── 95% ─► Store owner (95 tokens)                           │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

### Store Owner Revenue

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORE OWNER EARNINGS                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Store owners earn via TOKEN ACCUMULATION, not direct USDC.

    PRIMARY REVENUE: Token Splits
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customer pays $100 with 5% cash back:                            │
    │                                                                    │
    │   $100 USDC → Treasury                                             │
    │   100 tokens minted:                                               │
    │   ├── 5 tokens → Customer                                          │
    │   └── 95 tokens → Store owner                                      │
    │                                                                    │
    │   Store owner's 95 tokens are worth $95 at backing.                │
    │   Owner can HOLD or CASH OUT (with exit fee).                      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    OWNER STRATEGY: Hold vs Cash Out
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   CASH OUT IMMEDIATELY (with 10% exit fee):                        │
    │   95 tokens × $1.00 × 90% = $85.50 USDC                            │
    │                                                                    │
    │   HOLD LONG-TERM (exit fees accumulate):                           │
    │   If backing rises to $1.20 from churn:                            │
    │   95 tokens × $1.20 × 90% = $102.60 USDC                           │
    │                                                                    │
    │   Holding = betting on customer churn increasing backing.          │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    VALUE FLOW COMPARISON:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Cash Back %    Customer Gets    Store Gets    Store Net*         │
    │   ───────────    ─────────────    ──────────    ─────────          │
    │   0%             0 tokens         100 tokens    $90.00             │
    │   5%             5 tokens         95 tokens     $85.50             │
    │   10%            10 tokens        90 tokens     $81.00             │
    │   20%            20 tokens        80 tokens     $72.00             │
    │                                                                    │
    │   * Net after 10% exit fee if cashed out immediately               │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Store Simulations

### Simulation: Thriving Coffee Shop

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       STORE SUCCESS: Loyal Customer Base                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Issuance: 1:1 USDC
    - Exit fee: 15%
    - Cash back: 5% (customer gets 5%, store gets 95% of tokens)

    Customer pattern:
    - 200 regular customers
    - Average $50/month spend
    - 5% monthly churn (leave)
    - 3% monthly growth (new customers)

    YEAR 1:

    ┌────────┬───────────┬───────────┬──────────┬──────────┬──────────────┐
    │ Month  │ Payments  │ Exits     │ Treasury │ Backing  │ Owner Tokens │
    ├────────┼───────────┼───────────┼──────────┼──────────┼──────────────┤
    │ 1      │ $10,000   │ $0        │ $10,000  │ $1.00    │ 9,500        │
    │ 3      │ $10,600   │ $1,700    │ $27,155  │ $1.02    │ 28,785       │
    │ 6      │ $11,250   │ $3,800    │ $51,700  │ $1.05    │ 55,195       │
    │ 9      │ $11,940   │ $5,400    │ $73,800  │ $1.08    │ 78,565       │
    │ 12     │ $12,670   │ $6,800    │ $93,500  │ $1.11    │ 99,085       │
    └────────┴───────────┴───────────┴──────────┴──────────┴──────────────┘

    OUTCOMES:

    Store Owner:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tokens accumulated: ~99,085                                      │
    │   Token backing: $1.11                                             │
    │   Token value: $110,000                                            │
    │                                                                    │
    │   If cashed out (15% exit fee): $93,500                            │
    │   Strategy: Hold for appreciation or cash out as needed.           │
    └────────────────────────────────────────────────────────────────────┘

    Loyal Customer (joined month 1, never cashed out):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Total spent: $600 (12 × $50)                                     │
    │   Tokens accumulated: 30 (5% of 600)                               │
    │   Token backing: $1.11                                             │
    │   Token value: $33.30                                              │
    │                                                                    │
    │   Effective reward: 5.5% back on spending (backing increased)      │
    └────────────────────────────────────────────────────────────────────┘

    Churned Customer (joined month 3, left month 8):
    ┌────────────────────────────────────────────────────────────────────┐
    │   Total spent: $250 (5 × $50)                                      │
    │   Tokens accumulated: 12.5 (5% of 250)                             │
    │   Backing at exit: $1.06                                           │
    │   Exit value: 12.5 × $1.06 × 85% = $11.26                          │
    │                                                                    │
    │   Effective reward: 4.5% back (slightly reduced by exit fee)       │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation: Failing Restaurant

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       STORE FAILURE: High Churn, Low Retention                              │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Issuance: 1:1 USDC
    - Exit fee: 10%
    - Cash back: 0% (customer gets 0%, store gets 100% of tokens)

    Customer pattern:
    - 100 initial customers
    - Average $30/month spend
    - 25% monthly churn (high!)
    - 5% monthly growth (can't replace losses)

    THE PROBLEM: No Customer Incentive
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   With 0% cash back, customers receive ZERO tokens.               │
    │   They're just paying USDC with no reward or stake.               │
    │   No reason to stay loyal - they might as well pay anywhere.      │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘

    YEAR 1:

    ┌────────┬───────────┬───────────┬──────────┬──────────┬──────────────┐
    │ Month  │ Payments  │ Treasury  │ Customers│ Backing  │ Owner Tokens │
    ├────────┼───────────┼───────────┼──────────┼──────────┼──────────────┤
    │ 1      │ $3,000    │ $3,000    │ 100      │ $1.00    │ 3,000        │
    │ 3      │ $2,025    │ $6,900    │ 68       │ $1.00    │ 6,900        │
    │ 6      │ $1,140    │ $9,450    │ 38       │ $1.00    │ 9,450        │
    │ 9      │ $645      │ $10,750   │ 22       │ $1.00    │ 10,750       │
    │ 12     │ $365      │ $11,350   │ 12       │ $1.00    │ 11,350       │
    └────────┴───────────┴───────────┴──────────┴──────────┴──────────────┘

    Note: Backing stays $1.00 because no customers have tokens to exit!

    OUTCOMES:

    Store Owner:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tokens accumulated: 11,350                                       │
    │   Token value: $11,350 (if cashed out: $10,215 after 10% fee)      │
    │                                                                    │
    │   BUT: Customer count collapsed 100 → 12                           │
    │   Revenue declining rapidly - store is dying.                      │
    │   Owner captured short-term value, destroyed long-term business.   │
    └────────────────────────────────────────────────────────────────────┘

    Customer Experience:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Spent $360 over 12 months                                        │
    │   Tokens received: 0                                               │
    │   Value back: $0                                                   │
    │                                                                    │
    │   No incentive to stay. Left for competitors with rewards.         │
    └────────────────────────────────────────────────────────────────────┘

    WHY IT FAILED:
    ┌────────────────────────────────────────────────────────────────────┐
    │   1. 0% cash back - customers get nothing, no loyalty              │
    │   2. No token stake - customers have no reason to return           │
    │   3. High churn - customers leaving faster than joining            │
    │   4. Death spiral - fewer customers = less revenue = store dies    │
    │                                                                    │
    │   Recipe: No customer rewards = no customer loyalty = failure      │
    └────────────────────────────────────────────────────────────────────┘
```

### Simulation: Balanced Boutique

```
┌─────────────────────────────────────────────────────────────────────────────┐
│       STORE BALANCED: Sustainable Growth                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Configuration:
    - Issuance: 1:1 USDC
    - Exit fee: 20%
    - Cash back: 10% (customer gets 10%, store gets 90% of tokens)

    Customer pattern:
    - 50 initial customers
    - Average $100/month spend
    - 10% monthly churn
    - 12% monthly growth

    YEAR 1:

    ┌────────┬───────────┬───────────┬──────────┬──────────┬──────────────┐
    │ Month  │ Payments  │ Exits     │ Treasury │ Backing  │ Owner Tokens │
    ├────────┼───────────┼───────────┼──────────┼──────────┼──────────────┤
    │ 1      │ $5,000    │ $0        │ $5,000   │ $1.00    │ 4,500        │
    │ 3      │ $6,270    │ $380      │ $14,800  │ $1.03    │ 13,122       │
    │ 6      │ $8,850    │ $1,200    │ $33,500  │ $1.07    │ 28,935       │
    │ 9      │ $12,500   │ $2,400    │ $56,800  │ $1.12    │ 47,610       │
    │ 12     │ $17,650   │ $3,800    │ $85,200  │ $1.18    │ 68,445       │
    └────────┴───────────┴───────────┴──────────┴──────────┴──────────────┘

    OUTCOMES:

    Store Owner:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Tokens accumulated: ~68,445                                      │
    │   Token backing: $1.18                                             │
    │   Token value: $80,765                                             │
    │                                                                    │
    │   If cashed out (20% fee): $64,612                                 │
    │   Customer growth: 50 → ~120                                       │
    │   Healthy growth, value increasing for everyone.                   │
    └────────────────────────────────────────────────────────────────────┘

    Loyal Customer:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Spent: $1,200                                                    │
    │   Tokens: 120 (10% of $1,200)                                      │
    │   Backing: $1.18                                                   │
    │   Value: $141.60                                                   │
    │                                                                    │
    │   Effective reward: 11.8% back on spending.                        │
    │   Exit fees from others increased their token value.               │
    └────────────────────────────────────────────────────────────────────┘

    Churned Customer:
    ┌────────────────────────────────────────────────────────────────────┐
    │   Spent: $400 (4 months)                                           │
    │   Tokens: 40 (10% of $400)                                         │
    │   Exit at $1.10 backing, 20% fee                                   │
    │   Received: 40 × $1.10 × 0.80 = $35.20                             │
    │                                                                    │
    │   Effective reward: 8.8% back (reduced by exit fee)                │
    │   Still got value, but less than loyal customers.                  │
    └────────────────────────────────────────────────────────────────────┘

    WHY IT WORKS:
    ┌────────────────────────────────────────────────────────────────────┐
    │   1. 10% cash back - customers have stake and incentive            │
    │   2. Higher exit fee (20%) - churners fund stayers                 │
    │   3. Growth > churn - expanding customer base                      │
    │   4. Win-win - owner accumulates tokens, customers get rewards     │
    │                                                                    │
    │   Recipe: Shared incentives + sustainable growth = success         │
    └────────────────────────────────────────────────────────────────────┘
```

### Comparison Table

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    STORE COMPARISON AFTER 1 YEAR                            │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────────────┬────────────┬────────────┬────────────┐
    │ Metric          │ Coffee     │ Restaurant │ Boutique   │
    │                 │ (Success)  │ (Failure)  │ (Balanced) │
    ├─────────────────┼────────────┼────────────┼────────────┤
    │ Exit fee        │ 15%        │ 10%        │ 20%        │
    │ Cash back       │ 5%         │ 0%         │ 10%        │
    │ Store gets      │ 95%        │ 100%       │ 90%        │
    │                 │            │            │            │
    │ Treasury        │ $93,500    │ $11,350    │ $85,200    │
    │ Backing         │ $1.11      │ $1.00      │ $1.18      │
    │ Owner tokens    │ 99,085     │ 11,350     │ 68,445     │
    │ Owner value     │ $110,000   │ $11,350    │ $80,765    │
    │                 │            │            │            │
    │ Loyal customer  │ +5.5%      │ 0%         │ +11.8%     │
    │ reward          │            │            │            │
    │                 │            │            │            │
    │ Customers       │ Growing    │ Dying      │ Growing    │
    │                 │            │            │            │
    │ Verdict         │ THRIVING   │ DYING      │ GROWING    │
    └─────────────────┴────────────┴────────────┴────────────┘

    KEY INSIGHTS:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   0% cash back = FAILURE                                           │
    │   (Customers get nothing, no loyalty, they leave)                  │
    │                                                                    │
    │   Higher cash back + exit fee = SUCCESS                            │
    │   (Customers have stake, exit fees reward loyal holders)           │
    │                                                                    │
    │   The key is SHARED INCENTIVES - both owner and customer           │
    │   hold tokens that appreciate when the store does well.            │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

# Reference

## Key Takeaways

### The Simple Mental Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         THE CORE CONCEPT                                    │
└─────────────────────────────────────────────────────────────────────────────┘

    Treasury    =  Shared pot of money
    Tokens      =  Ownership shares of the pot
    Exit fee    =  Leaving some of your share behind when you leave
    Stayers     =  Get the leftovers from leavers

    ┌─────────────────────────────────────────────────────────────────────┐
    │                                                                     │
    │         PAYING IN adds to pot proportionally (neutral)              │
    │         CASHING OUT removes from pot with penalty (exit fee)        │
    │         EXIT FEES flow from leavers to stayers                      │
    │                                                                     │
    └─────────────────────────────────────────────────────────────────────┘
```

### Lever Effects Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         LEVER EFFECTS                                       │
└─────────────────────────────────────────────────────────────────────────────┘

    JUICEBOX / REVNET LEVERS:

    LEVER              HIGHER VALUE →          BENEFITS        COSTS
    ─────              ──────────────          ────────        ─────
    Exit Fee           More to stayers         Long-term       Liquidity
                                               holders

    Reserved %         More to project         Creator         Payer tokens
    (Boost/Splits)

    Issuance Decay     Higher early value      Early buyers    Late buyers

    Price Ceiling      Caps speculation        Stability       Upside limit


    COCOPAY STORE LEVERS:

    LEVER              HIGHER VALUE →          BENEFITS        COSTS
    ─────              ──────────────          ────────        ─────
    Cash Back %        More tokens to          Customers       Owner tokens
                       customer                (loyalty)       (revenue)

    Exit Fee           More to stayers         Loyal           Churner
                                               customers       losses

    The key trade-off: Higher cash back = happier customers, but
    store owner gets fewer tokens per payment.
```

### When Things Work vs Fail

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SUCCESS vs FAILURE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    COCOPAY STORE SUCCESS PATTERN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   • Cash back 5-10% (customers get meaningful reward)              │
    │   • Exit fee 15-25% (rewards loyalty, discourages churn)           │
    │   • Growth ≥ churn (customer base expanding)                       │
    │   • Owner holds tokens (aligned with customer success)             │
    └────────────────────────────────────────────────────────────────────┘

    COCOPAY STORE FAILURE PATTERN:
    ┌────────────────────────────────────────────────────────────────────┐
    │   • Cash back 0% (customers get nothing, no loyalty)               │
    │   • Low exit fee (<10%) (no penalty for leaving)                   │
    │   • Churn > growth (customer base shrinking)                       │
    │   • Owner cashes out immediately (misaligned incentives)           │
    └────────────────────────────────────────────────────────────────────┘

    THE CORE INSIGHT:
    ┌────────────────────────────────────────────────────────────────────┐
    │                                                                    │
    │   Customers need a STAKE to be loyal.                              │
    │   0% cash back = customers are just spending, not investing.       │
    │   With tokens, customers become stakeholders who benefit           │
    │   when the store succeeds.                                         │
    │                                                                    │
    └────────────────────────────────────────────────────────────────────┘
```

---

## Glossary

| Term                | Definition                                                                                                                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **Backing**         | Treasury balance divided by token supply. The floor value per token that can be redeemed.                                      |
| **Boost Period**    | Initial phase where a percentage of minted tokens go to designated recipients (founders/team).                                 |
| **Cash Back**       | The percentage of minted tokens that go to the payer (customer). The remainder goes to the store owner via splits.             |
| **Cash Out Tax**    | See Exit Fee.                                                                                                                  |
| **Decay Rate**      | Percentage reduction in issuance rate per funding cycle. Rewards early supporters.                                             |
| **Exit Fee**        | Percentage of redemption value kept by treasury when tokens are burned. Transfers value from leavers to stayers.               |
| **Floor Price**     | Same as backing. The minimum guaranteed value per token.                                                                       |
| **Issuance Rate**   | Number of tokens minted per unit of payment (e.g., 1 token per $1 USDC).                                                       |
| **Operator Split**  | (Juicebox) Percentage of incoming payments sent directly to the project owner wallet. Cocopay stores use token splits instead. |
| **Price Ceiling**   | Maximum price at which new tokens can be minted. Prevents runaway speculation.                                                 |
| **Redemption Rate** | 100% minus the exit fee. The percentage of backing value a user receives when cashing out.                                     |
| **Reserved Tokens** | Tokens minted to designated recipients when others pay (similar to boost but can be permanent).                                |
| **Splits**          | Configuration that distributes minted tokens to recipients. In Cocopay, splits go to the store owner.                          |
| **Surplus**         | Treasury balance available for redemption. May be less than total balance if some funds are reserved.                          |
| **Treasury**        | Pool of assets (USDC, ETH) backing all tokens in circulation. Held in the project's terminal contract.                         |
