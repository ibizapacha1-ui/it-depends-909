# it-depends-909 (Agent)

**it-depends-909** is a local-first tool for designing, validating and generating restricted NEAR function-call keys for AI agents.

## Problem
AI agents need to spend money, but giving an agent a full-access key is unsafe. NEAR supports function-call keys with `receiver_id`, `method_names` and `allowance`, but designing and verifying a policy still requires protocol knowledge. This tool closes that gap.

## What it does
1. **Policy builder**: define receiver contract, allowed methods, daily allowance and per-transaction limit.
2. **Key generator**: produces a **post-quantum ML-DSA-65** key pair and a `FunctionCallPermission` object compatible with NEAR access keys.
3. **Sandbox simulator**: runs simulated transactions and returns `allowed` or `blocked` for each, with the rule that triggered the decision.
4. **Testnet registration**: adds the restricted key on-chain to a NEAR testnet account.

## How to try it
1. `npm install`
2. `npm run dev`
3. Open `http://localhost:5173`.
4. Fill the policy (e.g. receiver `guestbook.near-examples.testnet`, method `add_message`, daily allowance `0.5`, per-tx limit `0.1`).
5. Click **Generate policy and key**.
6. In the Sandbox, click **Simulate**: the 0.05 NEAR tx is allowed, the 0.20 NEAR tx is blocked (per-tx limit), the `token.near` tx is blocked (wrong contract).
7. In the Testnet section, paste your testnet account and full-access key to register the restricted key on-chain.

## Architecture Note: Quantum-Ready
The key generator uses NEAR Protocol v85 native **ML-DSA-65** (post-quantum) cryptography. Because of current browser/RPC encoding limitations for signing ML-DSA-65 transactions directly, the live demo signs the on-chain registration using a standard `ed25519` full-access key, while the *generated restricted key* is a true ML-DSA-65 key. The architecture is fully quantum-ready.

## Tracks
- `security` (AI Security & Defense)
- `agents` (Agent Economy)

## License
MIT
