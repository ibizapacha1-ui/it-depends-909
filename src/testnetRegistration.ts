// src/testnetRegistration.ts
import { Account, JsonRpcProvider, KeyPairSigner, type KeyPairString } from "near-api-js";
import type { GeneratedKey } from "./keygenerator";

export async function addRestrictedKeyToTestnet(
  accountId: string,
  fullAccessPrivateKey: string,
  generatedKey: GeneratedKey
): Promise<string> {
  const cleanAccountId = accountId.trim();
  
  const provider = new JsonRpcProvider({
    url: "https://rpc.testnet.near.org",
  });

  try {
    const signer = KeyPairSigner.fromSecretKey(fullAccessPrivateKey.trim() as KeyPairString);
    const account = new Account(cleanAccountId, provider, signer);
    const signerPublicKey = (await signer.getPublicKey()).toString();
    const accessKeys = await account.getAccessKeyList();
    const signerKey = accessKeys.keys.find(({ public_key }) => public_key === signerPublicKey);

    if (!signerKey) {
      throw new Error(
        `La chiave privata inserita non è registrata sull'account ${cleanAccountId} in Testnet. ` +
          "Inserisci la chiave privata completa associata a questo account, non la chiave ristretta appena generata."
      );
    }
    if (signerKey.access_key.permission !== "FullAccess") {
      throw new Error(
        `La chiave ${signerPublicKey} è registrata su ${cleanAccountId}, ma non ha permessi full-access.`
      );
    }

    const { publicKey, permission } = generatedKey;
    const policy = permission.FunctionCall;
    const result = await account.addFunctionCallAccessKey({
      publicKey: publicKey,
      contractId: policy.receiver_id,
      methodNames: policy.method_names,
      allowance: BigInt(policy.allowance),
    });

    return `Chiave quantistica aggiunta con successo! Hash: ${result.transaction.hash}`;
  } catch (error: unknown) {
    console.error("Errore RPC:", error);
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    throw new Error(`Impossibile aggiungere la chiave: ${message}`);
  }
}