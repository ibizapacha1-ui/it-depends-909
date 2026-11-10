import { useState } from "react";
import { simulate, type Policy, type SimulatedTx } from "./policyEngine";
import { generateRestrictedKey, type GeneratedKey } from "./keygenerator";
import { addRestrictedKeyToTestnet } from "./testnetRegistration";

export default function App() {
  const [policy, setPolicy] = useState<Policy>({
    receiverId: "guestbook.near-examples.testnet",
    methodNames: ["add_message"],
    dailyAllowanceNear: "0.5",
    maxPerTxNear: "0.1",
  });

  const [key, setKey] = useState<GeneratedKey | null>(null);
  const [txsInput, setTxsInput] = useState(
    `[
  {"amount":"0.05","receiver":"guestbook.near-examples.testnet","method":"add_message"},
  {"amount":"0.20","receiver":"guestbook.near-examples.testnet","method":"add_message"},
  {"amount":"0.05","receiver":"token.near","method":"ft_transfer"}
]`
  );
  const [results, setResults] = useState<ReturnType<typeof simulate>>([]);
  
  const [testnetAccountId, setTestnetAccountId] = useState("");
  const [testnetFullAccessKey, setTestnetFullAccessKey] = useState("");
  const [testnetStatus, setTestnetStatus] = useState("");

  function handleGenerate() {
    setKey(generateRestrictedKey(policy));
  }

  function handleSimulate() {
    try {
      const txs: SimulatedTx[] = JSON.parse(txsInput);
      setResults(simulate(policy, txs));
    } catch {
      alert("Invalid JSON");
    }
  }

  async function handleAddToTestnet() {
    if (!key) {
      alert("Genera prima una policy e una chiave.");
      return;
    }
    if (!testnetAccountId || !testnetFullAccessKey) {
      alert("Inserisci l'ID dell'account testnet e la chiave di accesso completa.");
      return;
    }

    setTestnetStatus("Invio della transazione in corso...");
    try {
      const message = await addRestrictedKeyToTestnet(testnetAccountId, testnetFullAccessKey, key);
      setTestnetStatus(message);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Errore sconosciuto";
      setTestnetStatus(`Errore: ${message}`);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "2rem auto", fontFamily: "system-ui" }}>
      <h1>it-depends-909</h1>

      <section>
        <h2>1. Policy builder</h2>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Receiver contract
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            value={policy.receiverId}
            onChange={(e) => setPolicy({ ...policy, receiverId: e.target.value })}
          />
        </label>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Allowed methods (comma-separated)
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            value={policy.methodNames.join(",")}
            onChange={(e) =>
              setPolicy({
                ...policy,
                methodNames: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
              })
            }
          />
        </label>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Daily allowance (NEAR)
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            value={policy.dailyAllowanceNear}
            onChange={(e) => setPolicy({ ...policy, dailyAllowanceNear: e.target.value })}
          />
        </label>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Max per transaction (NEAR)
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            value={policy.maxPerTxNear}
            onChange={(e) => setPolicy({ ...policy, maxPerTxNear: e.target.value })}
          />
        </label>
        <button onClick={handleGenerate} style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}>
          Generate policy and key
        </button>

        {key && (
          <pre style={{ background: "#f4f4f4", padding: 12, overflow: "auto", marginTop: "1rem" }}>
            {JSON.stringify(key, null, 2)}
          </pre>
        )}
      </section>

      <section style={{ marginTop: "2rem" }}>
        <h2>2. Sandbox simulator</h2>
        <textarea
          rows={10}
          style={{ width: "100%", padding: "0.5rem" }}
          value={txsInput}
          onChange={(e) => setTxsInput(e.target.value)}
        />
        <button onClick={handleSimulate} style={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}>
          Simulate
        </button>

        <ul style={{ marginTop: "1rem" }}>
          {results.map((r, i) => (
            <li key={i} style={{ color: r.allowed ? "green" : "crimson", margin: "0.5rem 0" }}>
              {r.tx.amount} NEAR → {r.tx.method}@{r.tx.receiver}:{" "}
              <strong>{r.allowed ? "ALLOWED" : "BLOCKED"}</strong> — {r.reason}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "2rem", borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
        <h2>3. Registrazione su Testnet (opzionale)</h2>
        <p>
          Aggiungi la chiave ristretta generata a un account NEAR testnet. Usa un account
          dedicato e la sua chiave di accesso completa. <strong>Non usare mai la mainnet.</strong>
        </p>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Account ID testnet (es. mio-account.testnet)
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            value={testnetAccountId}
            onChange={(e) => setTestnetAccountId(e.target.value)}
            placeholder="mio-account.testnet"
          />
        </label>
        <label style={{ display: "block", margin: "0.5rem 0" }}>
          Chiave di accesso completa (full-access key)
          <input
            style={{ width: "100%", padding: "0.5rem" }}
            type="password"
            value={testnetFullAccessKey}
            onChange={(e) => setTestnetFullAccessKey(e.target.value)}
            placeholder="ed25519:..."
          />
        </label>
        <button
          onClick={handleAddToTestnet}
          disabled={!key}
          style={{ padding: "0.5rem 1rem", marginTop: "1rem" }}
        >
          Aggiungi chiave ristretta all'account testnet
        </button>
        {testnetStatus && (
          <p style={{ marginTop: "1rem", fontStyle: "italic", color: "blue" }}>{testnetStatus}</p>
        )}
      </section>
    </main>
  );
}