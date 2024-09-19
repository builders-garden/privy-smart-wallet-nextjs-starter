"use client";

import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "@privy-io/wagmi";
import { wagmiConfig } from "@/lib/wagmi";
import { SmartWalletsProvider } from "@privy-io/react-auth/smart-wallets";
import { base, baseSepolia } from "viem/chains";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID as string}
        config={{
          appearance: {
            theme: "light",
            accentColor: "#676FFF",
          },
          embeddedWallets: {
            createOnLogin: "all-users",
          },
          defaultChain: baseSepolia,
          supportedChains: [base, baseSepolia],
        }}
      >
        <SmartWalletsProvider>
          <QueryClientProvider client={queryClient}>
            <WagmiProvider config={wagmiConfig}>
              <main className="h-full">{children}</main>
            </WagmiProvider>
          </QueryClientProvider>
        </SmartWalletsProvider>
      </PrivyProvider>
    </NextUIProvider>
  );
}
