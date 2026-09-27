import { PollarProvider } from "@pollar/react";
import { development, TrustlessWorkConfig } from "@trustless-work/escrow";
import DApp from "./DApp";
import { env, NETWORK } from "./config";
import Login from "./screens/Login";

export default function DAppRoot() {
  if (!env.pollarKey) {
    return (
      <div className="fa-app">
        <Login configured={false} onLogin={() => undefined} />
      </div>
    );
  }
  return (
    <PollarProvider client={{ apiKey: env.pollarKey, stellarNetwork: NETWORK }}>
      <TrustlessWorkConfig
        baseURL={development}
        apiKey={env.trustlessWorkKey ?? ""}
      >
        <DApp escrowConfigured={Boolean(env.trustlessWorkKey)} />
      </TrustlessWorkConfig>
    </PollarProvider>
  );
}
