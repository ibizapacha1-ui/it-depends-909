export type Policy = {
  receiverId: string;
  methodNames: string[];
  dailyAllowanceNear: string; 
  maxPerTxNear: string;       
};

export type SimulatedTx = {
  amount: string;   
  receiver: string;
  method: string;
};

export type SimulationResult = {
  tx: SimulatedTx;
  allowed: boolean;
  reason: string;
};

function nearToYocto(near: string): bigint {
  const [whole, frac = ""] = near.split(".");
  const padded = (frac + "0".repeat(24)).slice(0, 24);
  return BigInt(whole + padded);
}

export function simulate(policy: Policy, txs: SimulatedTx[]): SimulationResult[] {
  const dailyLimit = nearToYocto(policy.dailyAllowanceNear);
  const perTxLimit = nearToYocto(policy.maxPerTxNear);
  let spentToday = 0n;

  return txs.map((tx) => {
    const amount = nearToYocto(tx.amount);

    if (tx.receiver !== policy.receiverId) {
      return { tx, allowed: false, reason: `receiver ${tx.receiver} is not ${policy.receiverId}` };
    }
    if (policy.methodNames.length > 0 && !policy.methodNames.includes(tx.method)) {
      return { tx, allowed: false, reason: `method ${tx.method} is not in the allowed list` };
    }
    if (amount > perTxLimit) {
      return { tx, allowed: false, reason: `amount exceeds per-transaction limit of ${policy.maxPerTxNear} NEAR` };
    }
    if (spentToday + amount > dailyLimit) {
      return { tx, allowed: false, reason: `daily allowance of ${policy.dailyAllowanceNear} NEAR would be exceeded` };
    }

    spentToday += amount;
    return { tx, allowed: true, reason: "within policy" };
  });
}