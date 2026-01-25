# Juicebox & Revnet Omnichain Architecture

A comprehensive guide to understanding how multichain projects work in Juicebox V5 and Revnets.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Components](#core-components)
3. [Visual Architecture](#visual-architecture)
4. [The Sucker System](#the-sucker-system)
5. [Transaction Flows](#transaction-flows)
6. [Signing vs Broadcasting](#signing-vs-broadcasting)
7. [Contract Execution Locations](#contract-execution-locations)
8. [Cross-Chain Reconciliation](#cross-chain-reconciliation)
9. [User Scenarios](#user-scenarios)
10. [Data Structures](#data-structures)
11. [SDK Hooks Reference](#sdk-hooks-reference)

---

## Overview

A Juicebox/Revnet project can exist on **multiple EVM chains simultaneously**. This enables:

- Users can pay on any chain where the project exists
- Users can hold project tokens on any supported chain
- Users can bridge tokens between chains
- Project treasury is distributed across chains

**Supported Chains**: Ethereum, Arbitrum, Base, Optimism

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ONE PROJECT, MANY CHAINS                        │
│                                                                         │
│    Ethereum          Arbitrum           Base            Optimism        │
│    ┌───────┐         ┌───────┐        ┌───────┐        ┌───────┐       │
│    │ Proj  │         │ Proj  │        │ Proj  │        │ Proj  │       │
│    │  #42  │◄───────►│  #42  │◄──────►│  #42  │◄──────►│  #42  │       │
│    │       │         │       │        │       │        │       │       │
│    │$STORE │         │$STORE │        │$STORE │        │$STORE │       │
│    └───────┘         └───────┘        └───────┘        └───────┘       │
│                                                                         │
│    Same project ID, same token symbol, connected via SUCKERS            │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### Component Overview

| Component            | Location      | Role                                            |
| -------------------- | ------------- | ----------------------------------------------- |
| **JBSucker**         | On each chain | Bridge contract; handles prepare/toRemote/claim |
| **JBSuckerRegistry** | On each chain | Maps projectId → sucker pairs                   |
| **JBMultiTerminal**  | On each chain | Accepts payments, issues tokens                 |
| **Juicerkle**        | Off-chain API | Indexes events, generates Merkle proofs         |
| **Bendystraw**       | Off-chain API | GraphQL indexer for all Juicebox data           |
| **SuckerGroup**      | Conceptual    | Groups same project across all chains           |

### How They Connect

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM ARCHITECTURE                               │
└─────────────────────────────────────────────────────────────────────────────┘

                              OFF-CHAIN SERVICES
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │   ┌─────────────┐  ┌─────────────┐  │
                    │   │  JUICERKLE  │  │ BENDYSTRAW  │  │
                    │   │             │  │             │  │
                    │   │ - Merkle    │  │ - GraphQL   │  │
                    │   │   proofs    │  │   indexer   │  │
                    │   │ - Event     │  │ - Project   │  │
                    │   │   indexing  │  │   data      │  │
                    │   └──────┬──────┘  └──────┬──────┘  │
                    │          │                │         │
                    └──────────┼────────────────┼─────────┘
                               │                │
              Monitors events  │                │  Indexes all
              Returns proofs   │                │  project data
                               ▼                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ON-CHAIN (per chain)                           │
│                                                                             │
│   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│   │ JBSuckerRegistry│    │    JBSucker     │    │ JBMultiTerminal │        │
│   │                 │    │                 │    │                 │        │
│   │ Maps projects   │───►│ Bridge contract │◄───│ Payment terminal│        │
│   │ to suckers      │    │ for cross-chain │    │ issues tokens   │        │
│   └─────────────────┘    └─────────────────┘    └─────────────────┘        │
│                                   │                      │                  │
│                                   │                      │                  │
│                                   ▼                      ▼                  │
│                          ┌─────────────────────────────────┐               │
│                          │     JBTokens / JBController     │               │
│                          │     (Token management)          │               │
│                          └─────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Visual Architecture

### Multi-Chain Project Structure

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                    SUCKER GROUP: "My Store" (ID: 0x123...)                   │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ETHEREUM (Chain 1)              ARBITRUM (Chain 42161)                     │
│   ══════════════════              ══════════════════════                     │
│   ┌────────────────────────┐      ┌────────────────────────┐                │
│   │ Project ID: 42         │      │ Project ID: 42         │                │
│   │ Token: $STORE          │      │ Token: $STORE          │                │
│   │                        │      │                        │                │
│   │ ┌────────────────────┐ │      │ ┌────────────────────┐ │                │
│   │ │ JBMultiTerminal    │ │      │ │ JBMultiTerminal    │ │                │
│   │ │ Address: 0xTERM_E  │ │      │ │ Address: 0xTERM_A  │ │                │
│   │ │ Balance: 50 ETH    │ │      │ │ Balance: 30 ETH    │ │                │
│   │ └────────────────────┘ │      │ └────────────────────┘ │                │
│   │                        │      │                        │                │
│   │ ┌────────────────────┐ │      │ ┌────────────────────┐ │                │
│   │ │ JBSucker           │◄┼──────┼►│ JBSucker           │ │                │
│   │ │ Local: 0xSUCK_E    │ │      │ │ Local: 0xSUCK_A    │ │                │
│   │ │ Peer:  0xSUCK_A    │ │      │ │ Peer:  0xSUCK_E    │ │                │
│   │ │ PeerChain: 42161   │ │      │ │ PeerChain: 1       │ │                │
│   │ └────────────────────┘ │      │ └────────────────────┘ │                │
│   │                        │      │                        │                │
│   │ Token Supply: 1000     │      │ Token Supply: 500      │                │
│   └────────────────────────┘      └────────────────────────┘                │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────────┐  │
│   │                     AGGREGATED METRICS                                │  │
│   │                                                                       │  │
│   │   Total Balance: 80 ETH    │    Total Token Supply: 1500 $STORE      │  │
│   └──────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Sucker Pair Relationship

```
                         SUCKER PAIRS

    Each sucker knows its "peer" on another chain.
    Together they form a bidirectional bridge.

    ETHEREUM                              ARBITRUM
    ════════                              ════════

    ┌─────────────────────┐              ┌─────────────────────┐
    │     JBSucker        │              │     JBSucker        │
    │                     │              │                     │
    │  address: 0xAAA     │◄────────────►│  address: 0xBBB     │
    │                     │   PAIRED     │                     │
    │  peer(): 0xBBB      │              │  peer(): 0xAAA      │
    │  peerChainId(): ARB │              │  peerChainId(): ETH │
    │  projectId(): 42    │              │  projectId(): 42    │
    │                     │              │                     │
    │  ┌───────────────┐  │              │  ┌───────────────┐  │
    │  │ OUTBOX TREE   │  │  ────────►   │  │ INBOX TREE    │  │
    │  │ (sends here)  │  │  Merkle      │  │ (receives)    │  │
    │  └───────────────┘  │  Root        │  └───────────────┘  │
    │                     │              │                     │
    │  ┌───────────────┐  │              │  ┌───────────────┐  │
    │  │ INBOX TREE    │  │  ◄────────   │  │ OUTBOX TREE   │  │
    │  │ (receives)    │  │  Merkle      │  │ (sends here)  │  │
    │  └───────────────┘  │  Root        │  └───────────────┘  │
    └─────────────────────┘              └─────────────────────┘
```

---

## The Sucker System

### What is a Sucker?

A **Sucker** is a smart contract that enables cross-chain token bridging using Merkle trees. Each sucker maintains:

1. **Outbox Tree**: Pending transfers TO other chains
2. **Inbox Tree**: Received Merkle roots FROM other chains

### Sucker Contract Functions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         JBSucker Contract Functions                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PREPARATION (Source Chain)                                                 │
│  ══════════════════════════                                                 │
│                                                                             │
│  prepare(amount, beneficiary, minTokens, token)                             │
│  ├── Called by: USER (signs transaction)                                    │
│  ├── Executes on: SOURCE chain                                              │
│  ├── Does:                                                                  │
│  │   1. Transfers tokens from user to sucker                                │
│  │   2. Creates a leaf in the Outbox Merkle tree                            │
│  │   3. Emits InsertToOutboxTree event                                      │
│  └── Gas paid by: USER                                                      │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  RELAY (Source Chain → Destination Chain)                                   │
│  ═════════════════════════════════════════                                  │
│                                                                             │
│  toRemote(token)                                                            │
│  ├── Called by: ANYONE (usually batched by relayer or user)                 │
│  ├── Executes on: SOURCE chain                                              │
│  ├── Does:                                                                  │
│  │   1. Sends Merkle root via cross-chain message                           │
│  │   2. Uses native bridge (Arbitrum Inbox, OP CrossDomainMessenger, etc)   │
│  │   3. Emits RootToRemote event                                            │
│  ├── Gas paid by: CALLER (~0.01 ETH for cross-chain fees)                   │
│  └── Note: Can batch multiple prepare() calls into one toRemote()           │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  CLAIM (Destination Chain)                                                  │
│  ═════════════════════════                                                  │
│                                                                             │
│  claim({ token, leaf, proof[32] })                                          │
│  ├── Called by: USER (or anyone on their behalf)                            │
│  ├── Executes on: DESTINATION chain                                         │
│  ├── Does:                                                                  │
│  │   1. Verifies Merkle proof against inbox root                            │
│  │   2. Marks leaf as claimed (prevents double-claim)                       │
│  │   3. Mints/transfers tokens to beneficiary                               │
│  └── Gas paid by: CALLER                                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Chain-Specific Sucker Implementations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    SUCKER IMPLEMENTATIONS BY CHAIN                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  JBArbitrumSucker                                                           │
│  ├── Uses: Arbitrum Inbox/Outbox (native bridge)                            │
│  ├── Message path: L1 ↔ L2 via retryable tickets                            │
│  └── Finality: ~7 days for L2→L1, instant for L1→L2                         │
│                                                                             │
│  JBOptimismSucker                                                           │
│  ├── Uses: CrossDomainMessenger                                             │
│  ├── Message path: L1 ↔ L2 via OP Stack messaging                           │
│  └── Finality: ~7 days for L2→L1, instant for L1→L2                         │
│                                                                             │
│  JBBaseSucker                                                               │
│  ├── Uses: CrossDomainMessenger (OP Stack)                                  │
│  ├── Same as Optimism (Base is OP Stack)                                    │
│  └── Finality: ~7 days for L2→L1, instant for L1→L2                         │
│                                                                             │
│  JBCCIPSucker                                                               │
│  ├── Uses: Chainlink CCIP                                                   │
│  ├── Message path: Any chain ↔ Any chain                                    │
│  └── Finality: Minutes (depends on CCIP)                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Transaction Flows

### Flow 1: Simple Payment (Single Chain)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│          SIMPLE PAYMENT: User pays project on same chain                    │
└─────────────────────────────────────────────────────────────────────────────┘

    User (on Arbitrum)                    Project Terminal (on Arbitrum)
    Has: 100 USDC                         Accepts: USDC

         │
         │  1. USER SIGNS: Approve USDC to terminal
         │
         ▼
    ┌──────────────────┐
    │ USDC.approve()   │  ◄── Executes on: ARBITRUM
    │ spender=terminal │      Signed by: USER
    │ amount=10        │      Gas paid by: USER
    └──────────────────┘
         │
         │  2. USER SIGNS: Pay the project
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ JBMultiTerminal.pay()                                        │
    │                                                              │
    │ Executes on: ARBITRUM                                        │
    │ Signed by: USER                                              │
    │ Gas paid by: USER                                            │
    │                                                              │
    │ What happens:                                                │
    │ ├── 1. Transfers 10 USDC from user to terminal               │
    │ ├── 2. Calculates tokens based on price curve                │
    │ ├── 3. Mints $STORE tokens to user                           │
    │ └── 4. Emits Pay event                                       │
    └──────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────┐
    │ RESULT:          │
    │ User: +10 $STORE │  (on Arbitrum)
    │ Project: +10 USDC│  (on Arbitrum)
    └──────────────────┘
```

### Flow 2: Cross-Chain Token Bridge (Full Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│     CROSS-CHAIN BRIDGE: User moves tokens from Arbitrum to Ethereum         │
└─────────────────────────────────────────────────────────────────────────────┘


STEP 1: PREPARE (Arbitrum)
══════════════════════════════════════════════════════════════════════════════

    User (Arbitrum)
    Has: 500 $STORE
         │
         │  1a. USER SIGNS: Approve tokens to sucker
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ $STORE.approve(sucker, 500)                                  │
    │                                                              │
    │ Chain: ARBITRUM                                              │
    │ Signed by: USER                                              │
    │ Gas: USER pays                                               │
    └──────────────────────────────────────────────────────────────┘
         │
         │  1b. USER SIGNS: Prepare the bridge
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ JBSucker.prepare(500, userAddr, 0, tokenAddr)                │
    │                                                              │
    │ Chain: ARBITRUM                                              │
    │ Signed by: USER                                              │
    │ Gas: USER pays                                               │
    │                                                              │
    │ Contract actions:                                            │
    │ ├── 1. Transfer 500 $STORE from user to sucker               │
    │ ├── 2. Create Merkle leaf:                                   │
    │ │      {                                                     │
    │ │        index: 7,                                           │
    │ │        beneficiary: userAddr,                              │
    │ │        projectTokenCount: 500,                             │
    │ │        terminalTokenAmount: <calculated>                   │
    │ │      }                                                     │
    │ ├── 3. Insert leaf into Outbox tree                          │
    │ ├── 4. Update Merkle root                                    │
    │ └── 5. Emit InsertToOutboxTree event                         │
    └──────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ OUTBOX TREE STATE (Arbitrum Sucker)                          │
    │                                                              │
    │                    Root: 0xABC123...                         │
    │                         /        \                           │
    │                       /            \                         │
    │                 Hash(0,1)        Hash(2,3)                   │
    │                  /    \            /    \                    │
    │              Leaf0  Leaf1      Leaf2  ...                    │
    │                              (User's leaf)                   │
    │                                                              │
    │ Leaf2 = hash(index=7, beneficiary, tokenCount, amount)       │
    └──────────────────────────────────────────────────────────────┘


STEP 2: TO REMOTE (Cross-Chain Relay)
══════════════════════════════════════════════════════════════════════════════

    Anyone can call this (batches multiple prepares)
         │
         │  2. ANYONE SIGNS: Execute the bridge relay
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ JBSucker.toRemote(tokenAddr)                                 │
    │                                                              │
    │ Chain: ARBITRUM                                              │
    │ Signed by: ANYONE (user, relayer, or batcher)                │
    │ Gas: CALLER pays (~0.01 ETH for cross-chain fees)            │
    │                                                              │
    │ Contract actions:                                            │
    │ ├── 1. Get current Outbox Merkle root                        │
    │ ├── 2. Create cross-chain message:                           │
    │ │      {                                                     │
    │ │        root: 0xABC123...,                                  │
    │ │        nonce: 5,                                           │
    │ │        token: tokenAddr                                    │
    │ │      }                                                     │
    │ ├── 3. Send via Arbitrum Outbox → Ethereum Inbox             │
    │ └── 4. Emit RootToRemote event                               │
    └──────────────────────────────────────────────────────────────┘
         │
         │  Cross-chain message travels through native bridge
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │           ARBITRUM NATIVE BRIDGE                             │
    │                                                              │
    │   Arbitrum         ════════════►        Ethereum             │
    │   Outbox                                Inbox                │
    │                                                              │
    │   Message: "Root 0xABC123 is valid for token X"              │
    │                                                              │
    │   Delivery time: L2→L1 takes ~7 days (challenge period)      │
    │                  L1→L2 takes ~10 minutes                     │
    └──────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ JBSucker (Ethereum) receives message                         │
    │                                                              │
    │ Chain: ETHEREUM                                              │
    │ Executed by: BRIDGE SYSTEM (not user-initiated)              │
    │ Gas: Paid from cross-chain fee                               │
    │                                                              │
    │ Contract actions:                                            │
    │ ├── 1. Verify message came from peer sucker                  │
    │ ├── 2. Store root in Inbox tree                              │
    │ └── 3. Root is now "committed" and claimable                 │
    └──────────────────────────────────────────────────────────────┘


STEP 3: JUICERKLE INDEXES (Off-Chain)
══════════════════════════════════════════════════════════════════════════════

    ┌──────────────────────────────────────────────────────────────┐
    │                    JUICERKLE SERVICE                         │
    │            https://juicerkle-production.up.railway.app       │
    │                                                              │
    │  Runs continuously, NOT triggered by user                    │
    │                                                              │
    │  Actions:                                                    │
    │  ├── 1. Monitor InsertToOutboxTree events on all chains      │
    │  ├── 2. Monitor RootToRemote events                          │
    │  ├── 3. Reconstruct full Merkle trees                        │
    │  ├── 4. Compute proofs for each leaf                         │
    │  └── 5. Store proofs in database                             │
    │                                                              │
    │  API Endpoint:                                               │
    │  POST /claims                                                │
    │  Body: { chainId, sucker, token, beneficiary }               │
    │  Response: [{                                                │
    │    Token: "0x...",                                           │
    │    Leaf: { Index, Beneficiary, ProjectTokenCount, ... },     │
    │    Proof: [[...], [...], ...] // 32 hashes                   │
    │  }]                                                          │
    └──────────────────────────────────────────────────────────────┘


STEP 4: CLAIM (Ethereum)
══════════════════════════════════════════════════════════════════════════════

    User (now on Ethereum)
         │
         │  4a. FRONTEND: Fetch proof from Juicerkle
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ fetch("https://juicerkle.../claims", {                       │
    │   method: "POST",                                            │
    │   body: { chainId: 1, sucker, token, beneficiary }           │
    │ })                                                           │
    │                                                              │
    │ Returns proof for user's leaf                                │
    └──────────────────────────────────────────────────────────────┘
         │
         │  4b. USER SIGNS: Claim tokens
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ JBSucker.claim({ token, leaf, proof[32] })                   │
    │                                                              │
    │ Chain: ETHEREUM                                              │
    │ Signed by: USER (or anyone on behalf of beneficiary)         │
    │ Gas: CALLER pays                                             │
    │                                                              │
    │ Contract actions:                                            │
    │ ├── 1. Verify proof:                                         │
    │ │      hash(leaf) + proof[0..31] == inbox root?              │
    │ ├── 2. Check leaf not already claimed                        │
    │ ├── 3. Mark leaf as claimed                                  │
    │ ├── 4. Mint 500 $STORE to beneficiary                        │
    │ └── 5. Emit Claimed event                                    │
    └──────────────────────────────────────────────────────────────┘
         │
         ▼
    ┌──────────────────────────────────────────────────────────────┐
    │ RESULT:                                                      │
    │                                                              │
    │ User now has 500 $STORE on ETHEREUM                          │
    │ (Previously had them on Arbitrum)                            │
    │                                                              │
    │ Total supply unchanged - just moved between chains           │
    └──────────────────────────────────────────────────────────────┘
```

### Flow 3: Payment on Unsupported Chain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│     UNSUPPORTED CHAIN: Store only on ETH+ARB, user has USDC on Base         │
└─────────────────────────────────────────────────────────────────────────────┘

    Store Configuration:
    ├── Ethereum: ✓ Has terminal + sucker
    ├── Arbitrum: ✓ Has terminal + sucker
    ├── Base:     ✗ NOT DEPLOYED
    └── Optimism: ✗ NOT DEPLOYED

    User Situation:
    ├── Location: Base
    ├── Has: 100 USDC on Base
    └── Wants: Pay the store, get $STORE tokens


    ╔═══════════════════════════════════════════════════════════════════════╗
    ║  CANNOT PAY DIRECTLY - No sucker/terminal on Base for this project   ║
    ╚═══════════════════════════════════════════════════════════════════════╝


    OPTION A: User bridges funds externally first
    ═══════════════════════════════════════════════

         User (Base)
         Has: 100 USDC
              │
              │  1. Use external bridge (Across, Stargate, Circle CCTP)
              ▼
         ┌─────────────────────────────────────────┐
         │  EXTERNAL USDC BRIDGE                   │
         │                                         │
         │  Base USDC ────────► Arbitrum USDC      │
         │                                         │
         │  User signs bridge transaction          │
         │  Waits for bridge finality              │
         └─────────────────────────────────────────┘
              │
              │  2. Now user has USDC on Arbitrum
              ▼
         ┌─────────────────────────────────────────┐
         │  Pay on Arbitrum (normal flow)          │
         │                                         │
         │  terminal.pay(100 USDC)                 │
         │  User receives $STORE on Arbitrum       │
         └─────────────────────────────────────────┘


    OPTION B: Store owner expands to Base
    ═════════════════════════════════════

         Store Owner
              │
              │  Deploys project to Base via JBOmnichainDeployer
              ▼
         ┌─────────────────────────────────────────┐
         │  Deploy on Base:                        │
         │  ├── JBMultiTerminal                    │
         │  ├── JBSucker (paired with ETH+ARB)     │
         │  └── Project token contract             │
         └─────────────────────────────────────────┘
              │
              │  Now Base is supported
              ▼
         ┌─────────────────────────────────────────┐
         │  User can pay directly on Base!         │
         └─────────────────────────────────────────┘
```

---

## Signing vs Broadcasting

### Who Signs What?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TRANSACTION SIGNING BREAKDOWN                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  TRANSACTION          │ WHO SIGNS      │ WHO CAN BROADCAST │ WHO PAYS GAS  │
│  ═══════════════════════════════════════════════════════════════════════   │
│                       │                │                   │               │
│  token.approve()      │ Token owner    │ Anyone            │ Broadcaster   │
│                       │ (USER)         │                   │ (usually USER)│
│                       │                │                   │               │
│  ─────────────────────┼────────────────┼───────────────────┼───────────────│
│                       │                │                   │               │
│  terminal.pay()       │ Payer          │ Anyone            │ Broadcaster   │
│                       │ (USER)         │                   │ (usually USER)│
│                       │                │                   │               │
│  ─────────────────────┼────────────────┼───────────────────┼───────────────│
│                       │                │                   │               │
│  sucker.prepare()     │ Token owner    │ Anyone            │ Broadcaster   │
│                       │ (USER)         │                   │ (usually USER)│
│                       │                │                   │               │
│  ─────────────────────┼────────────────┼───────────────────┼───────────────│
│                       │                │                   │               │
│  sucker.toRemote()    │ ANYONE         │ Anyone            │ Broadcaster   │
│                       │ (permissionless│                   │ (USER, relayer│
│                       │  - batches     │                   │  or batcher)  │
│                       │  multiple txs) │                   │               │
│                       │                │                   │               │
│  ─────────────────────┼────────────────┼───────────────────┼───────────────│
│                       │                │                   │               │
│  sucker.claim()       │ ANYONE         │ Anyone            │ Broadcaster   │
│                       │ (permissionless│                   │ (usually the  │
│                       │  - benefits    │                   │  beneficiary) │
│                       │  the stated    │                   │               │
│                       │  beneficiary)  │                   │               │
│                       │                │                   │               │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Permissionless Operations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PERMISSIONLESS DESIGN                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  toRemote() - Anyone can call                                               │
│  ══════════════════════════════                                             │
│                                                                             │
│  WHY: Enables batching and relayer services                                 │
│                                                                             │
│  ┌─────────────────┐                                                        │
│  │ User A prepares │──┐                                                     │
│  └─────────────────┘  │                                                     │
│                       │     ┌─────────────────────────────┐                 │
│  ┌─────────────────┐  ├────►│ Relayer calls toRemote()    │                 │
│  │ User B prepares │──┤     │                             │                 │
│  └─────────────────┘  │     │ Batches all pending leaves  │                 │
│                       │     │ into one cross-chain msg    │                 │
│  ┌─────────────────┐  │     │                             │                 │
│  │ User C prepares │──┘     │ Saves gas for everyone!     │                 │
│  └─────────────────┘        └─────────────────────────────┘                 │
│                                                                             │
│  ─────────────────────────────────────────────────────────────────────────  │
│                                                                             │
│  claim() - Anyone can call                                                  │
│  ══════════════════════════                                                 │
│                                                                             │
│  WHY: Someone else can pay gas for beneficiary                              │
│                                                                             │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                                                                    │     │
│  │   Beneficiary has no ETH on destination chain?                     │     │
│  │                                                                    │     │
│  │   No problem! A friend, relayer, or service can call claim()       │     │
│  │   on their behalf. Tokens still go to the beneficiary address.     │     │
│  │                                                                    │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Contract Execution Locations

### Where Each Contract Executes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CONTRACT EXECUTION BY CHAIN                              │
└─────────────────────────────────────────────────────────────────────────────┘

                        ETHEREUM                    ARBITRUM
                        ════════                    ════════

    JBDirectory         ┌───────────┐              ┌───────────┐
    (project registry)  │ 0xDIR_ETH │              │ 0xDIR_ARB │
                        └───────────┘              └───────────┘
                              │                          │
                              ▼                          ▼
    JBController        ┌───────────┐              ┌───────────┐
    (ruleset manager)   │ 0xCTRL_ETH│              │ 0xCTRL_ARB│
                        └───────────┘              └───────────┘
                              │                          │
                              ▼                          ▼
    JBMultiTerminal     ┌───────────┐              ┌───────────┐
    (payment terminal)  │ 0xTERM_ETH│              │ 0xTERM_ARB│
                        │           │              │           │
                        │ pay()     │              │ pay()     │
                        │ redeem()  │              │ redeem()  │
                        └───────────┘              └───────────┘
                              │                          │
                              ▼                          ▼
    JBSucker            ┌───────────┐  ◄────────►  ┌───────────┐
    (cross-chain)       │ 0xSUCK_ETH│    PAIRED    │ 0xSUCK_ARB│
                        │           │              │           │
                        │ prepare() │              │ prepare() │
                        │ toRemote()│              │ toRemote()│
                        │ claim()   │              │ claim()   │
                        └───────────┘              └───────────┘
                              │                          │
                              ▼                          ▼
    JBTokens            ┌───────────┐              ┌───────────┐
    (token registry)    │ 0xTOK_ETH │              │ 0xTOK_ARB │
                        └───────────┘              └───────────┘


    ┌─────────────────────────────────────────────────────────────────────┐
    │  KEY INSIGHT: Each chain has its OWN instance of every contract.    │
    │  They share the same PROJECT ID but are independent deployments.    │
    │  Suckers are the ONLY contracts that communicate cross-chain.       │
    └─────────────────────────────────────────────────────────────────────┘
```

### Execution Flow Across Chains

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              WHICH CHAIN EXECUTES WHAT?                                     │
└─────────────────────────────────────────────────────────────────────────────┘

    USER ACTION                  EXECUTES ON           STATE CHANGES
    ═══════════════════════════════════════════════════════════════════════

    Pay project on Ethereum      ETHEREUM              - ETH terminal balance +
                                                       - User token balance +

    Pay project on Arbitrum      ARBITRUM              - ARB terminal balance +
                                                       - User token balance +

    Bridge tokens ETH→ARB:
      1. prepare()               ETHEREUM              - User tokens locked
                                                       - Outbox tree updated

      2. toRemote()              ETHEREUM              - Cross-chain msg sent
                                 (triggers)
                                 ARBITRUM              - Inbox root stored

      3. claim()                 ARBITRUM              - User tokens minted
                                                       - Leaf marked claimed

    Redeem tokens on Base        BASE                  - User tokens burned
                                                       - User receives ETH/USDC


    ┌─────────────────────────────────────────────────────────────────────┐
    │  IMPORTANT: State is NOT automatically synced between chains!       │
    │                                                                     │
    │  - Each chain tracks its own terminal balance                       │
    │  - Each chain tracks its own token supply                           │
    │  - Aggregated views are computed by off-chain indexers              │
    └─────────────────────────────────────────────────────────────────────┘
```

---

## Cross-Chain Reconciliation

### How Balances Stay Consistent

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BALANCE RECONCILIATION                                   │
└─────────────────────────────────────────────────────────────────────────────┘

    There is NO automatic balance sync. Each chain is independent.

    WHAT HAPPENS WHEN TOKENS BRIDGE:
    ════════════════════════════════

    BEFORE BRIDGE (User has 500 $STORE on Arbitrum):

    Arbitrum                          Ethereum
    ┌─────────────────────┐          ┌─────────────────────┐
    │ Supply: 1000 $STORE │          │ Supply: 500 $STORE  │
    │ User:   500 $STORE  │          │ User:   0 $STORE    │
    │ Terminal: 50 ETH    │          │ Terminal: 25 ETH    │
    └─────────────────────┘          └─────────────────────┘

    Total Supply: 1500 $STORE

    ──────────────────────────────────────────────────────────────────────

    STEP 1: prepare() on Arbitrum

    Arbitrum                          Ethereum
    ┌─────────────────────┐          ┌─────────────────────┐
    │ Supply: 1000 $STORE │          │ Supply: 500 $STORE  │
    │ User:   0 $STORE    │ ◄─ LOCKED│ User:   0 $STORE    │
    │ Sucker: 500 $STORE  │          │ Terminal: 25 ETH    │
    │ Terminal: 50 ETH    │          │                     │
    └─────────────────────┘          └─────────────────────┘

    Total Supply: Still 1500 (user's tokens held by sucker)

    ──────────────────────────────────────────────────────────────────────

    STEP 2: toRemote() + claim() on Ethereum

    Arbitrum                          Ethereum
    ┌─────────────────────┐          ┌─────────────────────┐
    │ Supply: 500 $STORE  │ ◄─BURNED │ Supply: 1000 $STORE │ ◄─MINTED
    │ User:   0 $STORE    │          │ User:   500 $STORE  │
    │ Sucker: 0 $STORE    │          │ Terminal: 25 ETH    │
    │ Terminal: 50 ETH    │          │                     │
    └─────────────────────┘          └─────────────────────┘

    Total Supply: Still 1500 (moved, not created)


    ┌─────────────────────────────────────────────────────────────────────┐
    │  THE INVARIANT:                                                     │
    │                                                                     │
    │  Total supply across all chains remains constant during bridges.    │
    │  Tokens are burned on source chain, minted on destination chain.    │
    │  The Merkle proof ensures 1:1 correspondence.                       │
    └─────────────────────────────────────────────────────────────────────┘
```

### Treasury Balance Reconciliation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    TREASURY RECONCILIATION                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    When tokens bridge, the treasury (ETH/USDC) can optionally move too.

    SCENARIO: User bridges 50% of their tokens (and 50% of backing value)
    ═══════════════════════════════════════════════════════════════════════

    User: "I want to move 500 $STORE (50% of my holdings) to Ethereum"

    The sucker can be configured to move proportional treasury funds:


    BEFORE:
    ┌─────────────────────┐          ┌─────────────────────┐
    │ Arbitrum            │          │ Ethereum            │
    │ Treasury: 100 ETH   │          │ Treasury: 50 ETH    │
    │ User: 1000 $STORE   │          │ User: 0 $STORE      │
    └─────────────────────┘          └─────────────────────┘


    AFTER BRIDGE (with proportional treasury movement):
    ┌─────────────────────┐          ┌─────────────────────┐
    │ Arbitrum            │          │ Ethereum            │
    │ Treasury: 50 ETH    │ ──50%──► │ Treasury: 100 ETH   │
    │ User: 500 $STORE    │          │ User: 500 $STORE    │
    └─────────────────────┘          └─────────────────────┘


    This ensures redemption value is consistent regardless of which
    chain the user redeems on.
```

### Merkle Proof Verification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    MERKLE PROOF VERIFICATION                                │
└─────────────────────────────────────────────────────────────────────────────┘

    The Merkle tree ensures claims are valid and prevents double-spending.

    TREE STRUCTURE:
    ═══════════════

                              ROOT
                         (0xABC123...)
                            /    \
                           /      \
                     Hash(0,1)   Hash(2,3)
                       /   \       /   \
                      /     \     /     \
                   Leaf0  Leaf1 Leaf2  Leaf3
                   (Alice)(Bob) (User) (Carol)


    LEAF CONTENTS:
    ══════════════

    Each leaf = hash(index, beneficiary, projectTokenCount, terminalTokenAmount)

    User's leaf (index 2):
    ┌────────────────────────────────────────┐
    │ index: 2                               │
    │ beneficiary: 0xUSER...                 │
    │ projectTokenCount: 500                 │
    │ terminalTokenAmount: 50 ETH            │
    └────────────────────────────────────────┘


    PROOF VERIFICATION:
    ═══════════════════

    To claim, user provides:
    1. Their leaf data
    2. Proof path (32 hashes)

    Contract verifies:

    hash(Leaf2)                              = 0x111...
    hash(0x111..., Leaf3)                    = Hash(2,3) = 0x222...
    hash(Hash(0,1), 0x222...)                = ROOT = 0xABC123...
                                               ▲
                                               │
                                    Matches stored inbox root? ✓


    WHY 32 HASHES?
    ══════════════

    32-level tree supports 2^32 = ~4 billion leaves
    More than enough for any realistic number of bridge transactions
```

---

## User Scenarios

### Scenario 1: Pay and Hold on Single Chain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: User pays $50 USDC, holds tokens on Arbitrum                     │
└─────────────────────────────────────────────────────────────────────────────┘

    Actors:
    ├── User: Has 100 USDC on Arbitrum
    └── Store: Exists on ETH, ARB, BASE, OP (all 4 chains)

    USER JOURNEY:

    1. User opens store page
    2. Selects "Pay on Arbitrum" (sees their USDC balance)
    3. Enters $50 USDC
    4. Signs approval transaction
    5. Signs pay transaction
    6. Receives $STORE tokens on Arbitrum

    TRANSACTIONS SIGNED: 2 (approve + pay)
    CHAINS INVOLVED: 1 (Arbitrum only)

    RESULT:
    ┌─────────────────────┐
    │ User's Wallet       │
    │ ─────────────────── │
    │ Arbitrum:           │
    │   USDC: 50 (-50)    │
    │   $STORE: 50 (+50)  │
    │                     │
    │ Other chains: 0     │
    └─────────────────────┘
```

### Scenario 2: Pay on One Chain, Bridge to Another

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: User pays on Arbitrum, bridges half to Ethereum                  │
└─────────────────────────────────────────────────────────────────────────────┘

    Actors:
    ├── User: Has USDC on Arbitrum, wants tokens on both chains
    └── Store: Exists on ETH + ARB

    USER JOURNEY:

    PHASE 1: Payment (Arbitrum)
    ═══════════════════════════
    1. Pay $100 USDC on Arbitrum → receive 100 $STORE

    Transactions: 2 (approve + pay)


    PHASE 2: Bridge (Arbitrum → Ethereum)
    ═════════════════════════════════════
    2. Click "Bridge" in UI
    3. Select: From Arbitrum, To Ethereum, Amount: 50
    4. Sign approve transaction (tokens to sucker)
    5. Sign prepare() transaction

    Transactions: 2 (approve + prepare)


    PHASE 3: Wait
    ═════════════
    6. Wait for toRemote() to be called (by anyone)
    7. Wait for cross-chain message (~7 days for L2→L1)
    8. Wait for Juicerkle to index and generate proof

    Transactions: 0 (waiting)


    PHASE 4: Claim (Ethereum)
    ═════════════════════════
    9. Switch wallet to Ethereum
    10. Click "Claim" in UI
    11. Sign claim() transaction

    Transactions: 1 (claim)


    TOTAL TRANSACTIONS SIGNED: 5
    TOTAL GAS PAID BY USER: 5 transactions across 2 chains

    RESULT:
    ┌─────────────────────┐
    │ User's Wallet       │
    │ ─────────────────── │
    │ Arbitrum:           │
    │   $STORE: 50        │
    │                     │
    │ Ethereum:           │
    │   $STORE: 50        │
    └─────────────────────┘
```

### Scenario 3: User on Unsupported Chain

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  SCENARIO: Store on ETH+ARB only, user has funds on Polygon                 │
└─────────────────────────────────────────────────────────────────────────────┘

    Actors:
    ├── User: Has 100 USDC on Polygon (not supported)
    └── Store: Only exists on ETH + ARB

    USER EXPERIENCE:

    1. User opens store page
    2. Sees payment options: "Pay on Ethereum" or "Pay on Arbitrum"
    3. User's Polygon USDC is NOT shown as an option

    ╔═══════════════════════════════════════════════════════════════════╗
    ║  The store has no presence on Polygon, so direct payment is       ║
    ║  impossible. The user must bridge their USDC first.               ║
    ╚═══════════════════════════════════════════════════════════════════╝

    USER OPTIONS:

    Option A: External Bridge First
    ───────────────────────────────
    1. Use Circle CCTP / Across / Stargate to bridge USDC
       Polygon USDC → Arbitrum USDC
    2. Then pay the store on Arbitrum

    Extra transactions: 1-2 (bridge approval + bridge)
    Extra wait time: Minutes to hours depending on bridge


    Option B: Swap to Native Asset + Bridge
    ───────────────────────────────────────
    1. Swap USDC → ETH on Polygon
    2. Bridge ETH to Arbitrum
    3. Pay store with ETH (if accepted)

    Extra transactions: 3+ (swap + bridge + pay)
```

---

## Data Structures

### Core Types

```typescript
// Sucker pair - connects two chains
interface SuckerPair {
  local: `0x${string}`; // Sucker address on current chain
  remote: `0x${string}`; // Sucker address on peer chain
  peerChainId: number; // The other chain's ID
  projectId: bigint; // Same across all chains
}

// Transaction in the bridge queue
interface SuckerTransaction {
  // Identifiers
  sucker: `0x${string}`; // Source sucker contract
  peer: `0x${string}`; // Destination sucker contract
  chainId: number; // Source chain ID
  peerChainId: number; // Destination chain ID

  // Transaction data
  token: `0x${string}`; // Token being bridged
  beneficiary: `0x${string}`; // Who receives on destination
  projectTokenCount: bigint; // Amount of project tokens
  terminalTokenAmount: bigint; // Corresponding terminal tokens

  // Merkle tree position
  index: number; // Leaf index in tree
  root: string; // Merkle root when inserted

  // Status tracking
  status: 'pending' | 'claimable' | 'claimed';
  createdAt: number; // Unix timestamp
}

// Claim proof from Juicerkle API
interface JBClaim {
  Token: string;
  Leaf: {
    Index: number;
    Beneficiary: string;
    ProjectTokenCount: string;
    TerminalTokenAmount: string;
  };
  Proof: number[][]; // 32 hashes, each is array of bytes
}

// SuckerGroup - aggregates project across chains
interface SuckerGroup {
  id: string; // Unique group identifier
  version: number; // Protocol version
  projects: Project[]; // One per chain
  tokenSupply: bigint; // Total across all chains
  balance: bigint; // Total treasury across chains
}

// Project instance on a single chain
interface Project {
  projectId: number;
  chainId: number;
  token: `0x${string}`; // Token address on this chain
  tokenSymbol: string;
  suckerGroupId: string; // Links to parent group
  balance: bigint; // Treasury on this chain
  tokenSupply: bigint; // Supply on this chain
}
```

### Contract ABIs (Key Functions)

```typescript
// JBSucker - Main bridge contract
const jbSuckerAbi = [
  // Read functions
  {
    name: 'peer',
    inputs: [],
    outputs: [{ type: 'address' }],
    stateMutability: 'view',
  },
  {
    name: 'peerChainId',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    name: 'projectId',
    inputs: [],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },

  // Write functions
  {
    name: 'prepare',
    inputs: [
      { name: 'amount', type: 'uint256' },
      { name: 'beneficiary', type: 'address' },
      { name: 'minTokensReclaimed', type: 'uint256' },
      { name: 'token', type: 'address' },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    name: 'toRemote',
    inputs: [{ name: 'token', type: 'address' }],
    outputs: [],
    stateMutability: 'payable', // Requires ETH for cross-chain gas
  },
  {
    name: 'claim',
    inputs: [
      {
        name: 'claimData',
        type: 'tuple',
        components: [
          { name: 'token', type: 'address' },
          {
            name: 'leaf',
            type: 'tuple',
            components: [
              { name: 'index', type: 'uint256' },
              { name: 'beneficiary', type: 'address' },
              { name: 'projectTokenCount', type: 'uint256' },
              { name: 'terminalTokenAmount', type: 'uint256' },
            ],
          },
          { name: 'proof', type: 'bytes32[32]' },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
];

// JBSuckerRegistry - Maps projects to suckers
const jbSuckerRegistryAbi = [
  {
    name: 'suckerPairsOf',
    inputs: [{ name: 'projectId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'local', type: 'address' },
          { name: 'remote', type: 'address' },
          { name: 'remoteChainId', type: 'uint256' },
        ],
      },
    ],
    stateMutability: 'view',
  },
];
```

---

## SDK Hooks Reference

### juice-sdk-react Hooks

```typescript
// Get all sucker pairs for current project
const { data: suckers } = useSuckers();
// Returns: SuckerPair[]

// Get user's token balance across all chains
const { data: balances } = useSuckersUserTokenBalance();
// Returns: { balance: FixedInt, chainId: number }[]

// Get native token (ETH) balance in terminals across chains
const { data: nativeBalances } = useSuckersNativeTokenBalance();
// Returns: { balance: bigint, chainId: number }[]

// Get surplus across chains
const { data: surplus } = useSuckersNativeTokenSurplus();
// Returns: { surplus: bigint, chainId: number }[]

// Get cash-out quote across chains
const { data: quote } = useSuckersCashOutQuote(tokenAmount);
// Returns: { quote: bigint, chainId: number }[]

// Get cash-out value for tokens across chains
const { data: value } = useSuckersTokenCashOutValue();
// Returns: { value: bigint, chainId: number }[]
```

### Custom Hooks (revnet-app)

```typescript
// Get sucker pairs for specific project and chain
const { suckerPairs } = useSuckerPairs(projectId, chainId);
// Returns: { local, remote, remoteChainId }[]

// Get token balance in terminals across suckers
const { data: balances } = useSuckersTokenBalance(projectId);
// Returns: { balance, chainId, projectId }[]

// Get token surplus across suckers
const { data: surplus } = useSuckersTokenSurplus(projectId);
// Returns: { surplus, chainId, projectId }[]
```

---

## Quick Reference

### Transaction Checklist

| Action         | Chain         | Signer | Gas Payer | Contract        |
| -------------- | ------------- | ------ | --------- | --------------- |
| Approve tokens | Source        | User   | User      | ERC20           |
| Pay project    | Any supported | User   | User      | JBMultiTerminal |
| Prepare bridge | Source        | User   | User      | JBSucker        |
| Execute relay  | Source        | Anyone | Caller    | JBSucker        |
| Claim tokens   | Destination   | Anyone | Caller    | JBSucker        |

### Timing Expectations

| Operation                      | Duration                   |
| ------------------------------ | -------------------------- |
| Payment confirmation           | ~seconds to minutes        |
| prepare() confirmation         | ~seconds to minutes        |
| toRemote() cross-chain (L1→L2) | ~10-20 minutes             |
| toRemote() cross-chain (L2→L1) | ~7 days (challenge period) |
| Juicerkle indexing             | ~minutes                   |
| claim() confirmation           | ~seconds to minutes        |

### Cost Breakdown

| Operation         | Approximate Cost                  |
| ----------------- | --------------------------------- |
| ERC20 approve     | ~$0.50-2                          |
| terminal.pay()    | ~$1-5                             |
| sucker.prepare()  | ~$1-3                             |
| sucker.toRemote() | ~$5-15 (includes cross-chain fee) |
| sucker.claim()    | ~$1-3                             |

_Costs vary significantly based on gas prices and chain._

---

## Glossary

| Term            | Definition                                                        |
| --------------- | ----------------------------------------------------------------- |
| **Sucker**      | Bridge contract enabling cross-chain token transfers              |
| **SuckerGroup** | Logical grouping of same project across multiple chains           |
| **Outbox Tree** | Merkle tree of pending outbound transfers on source chain         |
| **Inbox Tree**  | Received Merkle roots from peer chains on destination             |
| **Juicerkle**   | Off-chain service that indexes events and generates Merkle proofs |
| **Bendystraw**  | GraphQL indexer for all Juicebox/Revnet data                      |
| **Terminal**    | Contract that accepts payments and issues tokens                  |
| **Leaf**        | Single entry in the Merkle tree (one bridge transaction)          |
| **Proof**       | 32-hash path proving a leaf belongs to a committed root           |
