import { useEffect, useState } from 'react';
import { alchemy, type AlchemyTransport } from '@account-kit/infra';
import {
  createModularAccountV2Client,
  type ModularAccountV2Client,
} from '@account-kit/smart-contracts';
import { LocalAccountSigner, type SmartAccountSigner } from '@aa-sdk/core';
import type { Chain } from 'viem';
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from '@/lib/alchemy';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { ALCHEMY_AA_CHAINS, type SupportedChainId } from '@/lib/network';
import { useParaAccount } from './useParaAccount';

type AlchemySmartAccountClient = ModularAccountV2Client<
  SmartAccountSigner,
  Chain,
  AlchemyTransport
>;

function getAlchemyChain(chain: Chain): Chain {
  return ALCHEMY_AA_CHAINS[chain.id as SupportedChainId] ?? chain;
}

export function useAlchemySmartAccountClient(
  chain: Chain = DEFAULT_CHAIN
): AlchemySmartAccountClient | null {
  const { account } = useParaAccount();
  const [client, setClient] = useState<AlchemySmartAccountClient | null>(null);

  useEffect(() => {
    if (!account) {
      setClient(null);
      return;
    }

    const initClient = async () => {
      const signer = new LocalAccountSigner(account);

      const transport = alchemy({
        apiKey: ALCHEMY_API_KEY,
      });

      const alchemyChain = getAlchemyChain(chain);

      const smartClient = await createModularAccountV2Client({
        transport,
        chain: alchemyChain,
        signer,
        policyId: GAS_POLICY_ID,
        mode: '7702',
      });

      setClient(smartClient);
    };

    initClient();
  }, [account, chain]);

  return client;
}
