import {
  hashMessage,
  parseSignature,
  serializeSignature,
  type Hex,
  type LocalAccount,
  type SignableMessage,
  type Authorization,
} from 'viem';
import { hashAuthorization } from 'viem/utils';
import { createParaAccount } from '@getpara/viem-v2-integration';
import type { ParaMobile } from '@getpara/react-native-wallet';
import { Buffer } from 'buffer';

function normalizeSignature(signature: Hex): Hex {
  const parsed = parseSignature(signature);
  return serializeSignature({
    r: parsed.r,
    s: parsed.s,
    yParity: parsed.yParity,
  });
}

function createSignMessage(para: ParaMobile, walletId: string) {
  return async ({ message }: { message: SignableMessage }): Promise<Hex> => {
    const messageHash = hashMessage(message);
    const messageBase64 = Buffer.from(messageHash.slice(2), 'hex').toString('base64');
    const result = await para.signMessage({ walletId, messageBase64 });
    if (!('signature' in result)) {
      throw new Error('Signing was denied or failed');
    }
    const sigHex = `0x${result.signature}` as Hex;
    const parsed = parseSignature(sigHex);
    console.log('[signMessage] raw signature:', sigHex);
    console.log('[signMessage] parsed:', {
      r: parsed.r,
      s: parsed.s,
      v: parsed.v,
      yParity: parsed.yParity,
    });
    const normalized = normalizeSignature(sigHex);
    console.log('[signMessage] normalized:', normalized);
    return normalized;
  };
}

type AuthorizationRequest = Authorization & {
  contractAddress?: Hex;
};

type SignedAuthorization = {
  address: Hex;
  chainId: number;
  nonce: number;
  r: Hex;
  s: Hex;
  yParity: 0 | 1;
  v: bigint;
};

function createSignAuthorization(para: ParaMobile, walletId: string) {
  return async (authorization: AuthorizationRequest): Promise<SignedAuthorization> => {
    const address = (authorization.address ?? authorization.contractAddress) as Hex;
    if (!address) {
      throw new Error('Authorization must include address or contractAddress');
    }

    const authHash = hashAuthorization({
      address,
      chainId: authorization.chainId,
      nonce: authorization.nonce,
    });
    const hashBase64 = Buffer.from(authHash.slice(2), 'hex').toString('base64');
    const result = await para.signMessage({ walletId, messageBase64: hashBase64 });
    if (!('signature' in result)) {
      throw new Error('Authorization signing was denied or failed');
    }
    const sigHex = `0x${result.signature}` as Hex;
    const parsed = parseSignature(sigHex);
    console.log('[signAuthorization] raw signature:', sigHex);
    console.log('[signAuthorization] parsed:', {
      r: parsed.r,
      s: parsed.s,
      v: parsed.v,
      yParity: parsed.yParity,
    });
    console.log('[signAuthorization] address:', address);

    const yParity = parsed.yParity as 0 | 1;

    return {
      address,
      chainId: Number(authorization.chainId),
      nonce: Number(authorization.nonce),
      r: parsed.r,
      s: parsed.s,
      yParity,
      v: BigInt(yParity),
    };
  };
}

export function createEip7702ParaAccount(
  para: ParaMobile,
  address: Hex,
  walletId: string
): LocalAccount {
  const baseAccount = createParaAccount(para, address);

  return {
    ...baseAccount,
    signMessage: createSignMessage(para, walletId),
    signAuthorization: createSignAuthorization(para, walletId),
  } as LocalAccount;
}
