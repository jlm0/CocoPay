# CocoPay

A mobile payments and rewards app built on the [Juicebox Protocol](https://juicebox.money). CocoPay enables merchants to create stores that accept crypto payments while automatically rewarding customers with loyalty tokens backed by real value.

## How It Works

1. **Merchants** create a store (powered by Juicebox v5 projects) with a few taps
2. **Customers** pay via QR code and receive store tokens as rewards
3. **Tokens** can be spent at participating stores or cashed out for USDC
4. **Community commerce** incentivizes spending tokens over cashing out, creating a circular local economy

## Tech Stack

- **Framework:** Expo with Expo Router
- **Styling:** NativeWind (TailwindCSS for React Native)
- **Blockchain:** Viem + Juicebox SDK
- **Auth:** Para single-click login with passkeys
- **Data:** Bendystraw GraphQL + React Query
- **Infrastructure:** Alchemy (RPC, gas sponsorship)

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn 4.x (`corepack enable`)
- Xcode (for iOS) or Android Studio (for Android)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/cocopay.git
cd cocopay

# Install dependencies
yarn install
```

### Environment Setup

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

Required environment variables:

| Variable                            | Description                        |
| ----------------------------------- | ---------------------------------- |
| `EXPO_PUBLIC_NETWORK_ENV`           | `testnet` or `mainnet`             |
| `EXPO_PUBLIC_PARA_API_KEY`          | Para authentication API key        |
| `EXPO_PUBLIC_ALCHEMY_API_KEY`       | Alchemy API key for RPC            |
| `EXPO_PUBLIC_ALCHEMY_GAS_POLICY_ID` | Alchemy gas policy for sponsorship |
| `EXPO_PUBLIC_PINATA_JWT`            | Pinata JWT for IPFS uploads        |
| `EXPO_PUBLIC_BENDYSTRAW_URL`        | Bendystraw GraphQL endpoint        |
| `EXPO_PUBLIC_GOOGLE_PLACES_API_KEY` | Google Places API key              |

### Running the App

```bash
# Generate native projects
yarn prebuild

# Run on iOS
yarn ios

# Run on Android
yarn android

# Run on web
yarn web
```

### Development

```bash
# Lint and format
yarn lint
yarn format

# Type check
yarn typecheck

# Generate GraphQL types
yarn codegen
```

## License

Copyright © 2025 CocoPay. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use of this software is strictly prohibited.
