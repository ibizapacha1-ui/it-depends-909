import { KeyPair, PublicKey } from "near-api-js";
import type { Policy } from "./policyEngine";

export type GeneratedKey = {
  publicKey: PublicKey; // Oggetto, non stringa
  privateKey: string;
  permission: {
    FunctionCall: {
      receiver_id: string;
      method_names: string[];
      allowance: string;
    };
  };
};

function nearToYocto(near: string): string {
  const [whole, frac = ""] = near.split(".");
  const padded = (frac + "0".repeat(24)).slice(0, 24);
  return BigInt(whole + padded).toString();
}

export function generateRestrictedKey(policy: Policy): GeneratedKey {
  const keyPair = KeyPair.fromRandom("ml-dsa-65");
  return {
    publicKey: keyPair.getPublicKey(), // <-- Oggetto PublicKey
    privateKey: keyPair.toString(),
    permission: {
      FunctionCall: {
        receiver_id: policy.receiverId,
        method_names: policy.methodNames,
        allowance: nearToYocto(policy.dailyAllowanceNear),
      },
    },
  };
}