import { useEffect, useState } from 'react';
import { alchemy } from '@account-kit/infra';
import { createModularAccountV2Client } from '@account-kit/smart-contracts';
import { LocalAccountSigner } from '@aa-sdk/core';
import type { Chain } from 'viem';
import { ALCHEMY_API_KEY, GAS_POLICY_ID } from '@/lib/alchemy';
import { DEFAULT_CHAIN } from '@/lib/chains';
import { useParaAccount } from './useParaAccount';

type AlchemySmartAccountClient = Awaited<ReturnType<typeof createModularAccountV2Client>>;

export function useAlchemySmartAccountClient(chain: Chain = DEFAULT_CHAIN) {
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

      const smartClient = await createModularAccountV2Client({
        transport,
        chain,
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
