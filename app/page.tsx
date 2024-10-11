"use client";

import { BASE_SEPOLIA_USDC_ADDRESS, BASE_USDC_ADDRESS } from "@/lib/constants";
import { Button, Image, Link, Input, Divider } from "@nextui-org/react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import {
  CopyIcon,
  RefreshCcw,
  CheckIcon,
  Pen,
  Send,
  ChevronDown,
  ChevronUp,
  LogOut,
  BookOpen,
  Github,
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { encodeFunctionData, erc20Abi, formatUnits, parseUnits } from "viem";
import { base, baseSepolia } from "viem/chains";
import { useChainId, useSwitchChain, useBalance, useReadContract } from "wagmi";
import { formatEther } from "viem";

export default function Home() {
  const { ready, authenticated, logout, user } = usePrivy();
  const { login } = useLogin();
  const { client } = useSmartWallets();

  const [message, setMessage] = useState("");
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);
  const [signedMessage, setSignedMessage] = useState("");
  const [isSignedMessageExpanded, setIsSignedMessageExpanded] = useState(false);
  const [copiedSignedMessage, setCopiedSignedMessage] = useState(false);
  const [embeddedWalletAddress, setEmbeddedWalletAddress] = useState<
    string | undefined
  >();
  const [smartWalletAddress, setSmartWalletAddress] = useState<
    string | undefined
  >();
  const [usdcAmount, setUsdcAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { switchChain } = useSwitchChain();
  const chainId = useChainId();

  const signMessage = async () => {
    if (!client) {
      console.error("No smart account client found");
      return;
    }
    try {
      const signature = await client.signMessage({
        message,
      });
      console.log("Signature", signature);
      setSignedMessage(signature);
    } catch (error) {
      console.error("Error signing message:", error);
      setSignedMessage("Error signing message");
    }
  };

  const toggleChain = async () => {
    if (!client) {
      console.error("No smart account client found");
      return;
    }
    switchChain({
      chainId: chainId === baseSepolia.id ? base.id : baseSepolia.id,
    });
  };

  const execTransaction = async () => {
    setIsLoading(true);
    if (!client) {
      console.error("No smart account client found");
      return;
    }

    setErrorMessage("");

    // Convert USDC amount to smallest unit (6 decimal places)
    const amount = parseUnits(usdcAmount, 6);

    if (smartUsdcBalance && amount > smartUsdcBalance) {
      setErrorMessage("Insufficient USDC balance");
      return;
    }

    try {
      const tx = await client.sendTransaction({
        to:
          chainId === baseSepolia.id
            ? BASE_SEPOLIA_USDC_ADDRESS
            : BASE_USDC_ADDRESS,
        value: BigInt(0),
        data: encodeFunctionData({
          abi: erc20Abi,
          functionName: "transfer",
          args: [recipientAddress as `0x${string}`, amount],
        }),
        account: client.account,
      });
      console.log("tx", tx);
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrorMessage("Transaction failed. Please try again.");
    }
    setIsLoading(false);
  };

  const copyToClipboard = useCallback(
    async (text: string, walletType: string) => {
      await navigator.clipboard.writeText(text);
      setCopiedWallet(walletType);
      setTimeout(() => setCopiedWallet(null), 2000);
    },
    []
  );

  const copySignedMessage = async () => {
    await navigator.clipboard.writeText(signedMessage);
    setCopiedSignedMessage(true);
    setTimeout(() => setCopiedSignedMessage(false), 2000);
  };

  const toggleSignedMessageExpansion = () => {
    setIsSignedMessageExpanded(!isSignedMessageExpanded);
  };

  const handleLogout = () => {
    // Reset all input fields
    setMessage("");
    setUsdcAmount("");
    setRecipientAddress("");
    setSignedMessage("");
    setErrorMessage("");

    // Call the Privy logout function
    logout();
  };

  useEffect(() => {
    if (user?.wallet?.address) {
      setEmbeddedWalletAddress(user.wallet.address);
    }
    if (client?.account.address) {
      setSmartWalletAddress(client.account.address);
    }
  }, [user, client]);

  const { data: embeddedEthBalance } = useBalance({
    address: embeddedWalletAddress as `0x${string}`,
  });

  const { data: smartEthBalance } = useBalance({
    address: smartWalletAddress as `0x${string}`,
  });

  const { data: embeddedUsdcBalance } = useReadContract({
    abi: erc20Abi,
    address:
      chainId === baseSepolia.id
        ? BASE_SEPOLIA_USDC_ADDRESS
        : BASE_USDC_ADDRESS,
    functionName: "balanceOf",
    args: [embeddedWalletAddress as `0x${string}`],
  });

  const { data: smartUsdcBalance } = useReadContract({
    abi: erc20Abi,
    address:
      chainId === baseSepolia.id
        ? BASE_SEPOLIA_USDC_ADDRESS
        : BASE_USDC_ADDRESS,
    functionName: "balanceOf",
    args: [smartWalletAddress as `0x${string}`],
  });

  return (
    <div className="min-h-screen min-w-screen">
      <div className="grid grid-cols-1 lg:grid-cols-4 h-screen text-black">
        <div className="col-span-2 bg-gray-50 p-12 h-full flex flex-col lg:flex-row items-center justify-center space-y-2">
          <div className="flex flex-col justify-evenly h-full">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="text-sm font-semibold">Resources</div>
                <div className="flex flex-row gap-2">
                  <Link
                    href="https://github.com/builders-garden/privy-smart-wallet-nextjs-starter"
                    target="_blank"
                  >
                    <Button
                      radius="sm"
                      size="sm"
                      className="bg-black text-white"
                      startContent={<Github className="w-4 h-4" />}
                    >
                      Github
                    </Button>
                  </Link>
                  <Link
                    href="https://docs.privy.io/guide/react/wallets/smart-wallets/"
                    target="_blank"
                  >
                    <Button
                      radius="sm"
                      size="sm"
                      className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white"
                      startContent={<BookOpen className="w-4 h-4" />}
                    >
                      Overview
                    </Button>
                  </Link>
                  <Link
                    href="https://docs.privy.io/guide/react/wallets/smart-wallets/configuration"
                    target="_blank"
                  >
                    <Button
                      radius="sm"
                      size="sm"
                      className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white"
                      startContent={<BookOpen className="w-4 h-4" />}
                    >
                      Configuration
                    </Button>
                  </Link>
                  <Link
                    href="https://docs.privy.io/guide/react/wallets/smart-wallets/usage"
                    target="_blank"
                  >
                    <Button
                      radius="sm"
                      size="sm"
                      className="bg-transparent border-2 border-black text-black hover:bg-black hover:text-white"
                      startContent={<BookOpen className="w-4 h-4" />}
                    >
                      Usage
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="text-3xl lg:text-6xl font-black">
                Privy AA Starter
              </div>
              <div className="text-md lg:text-lg">
                This app demonstrates how to use Privy Smart Wallets to sign and
                execute transactions.
              </div>

              {ready && !authenticated && (
                <Button
                  radius="sm"
                  color="primary"
                  className="bg-secondary text-white lg:w-fit w-full"
                  onClick={() => login()}
                >
                  Start now
                </Button>
              )}
              {ready && authenticated && (
                <Button
                  radius="sm"
                  color="danger"
                  className="w-fit"
                  onClick={handleLogout}
                  startContent={<LogOut className="w-4 h-4" />}
                >
                  Logout
                </Button>
              )}
            </div>
            <div className="flex flex-row gap-2 items-center">
              <div className="text-sm">with ❤️ by</div>
              <Link href="https://builders.garden" target="_blank">
                <Image
                  src="/images/bg-logo.svg"
                  alt="logo"
                  width={75}
                  height={75}
                />
              </Link>
            </div>
          </div>
        </div>
        <div className="col-span-2 bg-white h-full p-12 lg:p-48 flex flex-col lg:flex-row items-center justify-center w-full space-y-4">
          {!user && <div className="lg:w-1/2"></div>}
          {user && (
            <div className="lg:flex lg:flex-row justify-center w-full">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-row items-center gap-1 bg-secondary p-1 rounded-lg text-xs text-white font-medium">
                      Connected to{" "}
                      <div className="flex flex-row gap-1 bg-white text-secondary p-1 rounded-md">
                        <Image
                          src="/images/base-logo.png"
                          alt="base"
                          width={16}
                          height={16}
                        />
                        {chainId === base.id ? "Base" : "Base Sepolia"}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="bordered"
                      color="secondary"
                      className="hover:bg-secondary-50"
                      onClick={() => toggleChain()}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" />
                      Switch to {chainId === base.id ? "Base Sepolia" : "Base"}
                    </Button>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Input
                          size="sm"
                          value={user.wallet?.address}
                          label="Embedded Wallet"
                          isReadOnly
                          className="flex-grow"
                          endContent={
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  user.wallet?.address || "",
                                  "embedded"
                                )
                              }
                            >
                              {copiedWallet === "embedded" ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          }
                        />
                      </div>
                      <div className="text-xs mt-1">
                        <span className="font-semibold">Balance:</span>
                        {embeddedEthBalance &&
                          `${formatEther(embeddedEthBalance.value)} ETH`}
                        {embeddedUsdcBalance !== undefined &&
                          `, ${formatUnits(embeddedUsdcBalance, 6)} USDC`}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <Input
                          size="sm"
                          value={client?.account.address}
                          label="Smart Wallet"
                          isReadOnly
                          className="flex-grow"
                          endContent={
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  client?.account.address || "",
                                  "smart"
                                )
                              }
                            >
                              {copiedWallet === "smart" ? (
                                <CheckIcon className="w-4 h-4 text-green-500" />
                              ) : (
                                <CopyIcon className="w-4 h-4" />
                              )}
                            </button>
                          }
                        />
                      </div>
                      <div className="text-xs mt-1">
                        <span className="font-semibold">Balance:</span>
                        {smartEthBalance &&
                          `${formatEther(smartEthBalance.value)} ETH`}
                        {smartUsdcBalance !== undefined &&
                          `, ${formatUnits(smartUsdcBalance, 6)} USDC`}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-semibold">Operations</div>
                <div className="flex flex-col gap-1">
                  <div className="text-sm font-semibold">Sign Message</div>
                  <div className="flex flex-row gap-2 w-full items-center">
                    <Input
                      size="sm"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter message to sign"
                      className="flex-grow"
                    />
                    <Button
                      size="sm"
                      variant="solid"
                      color="primary"
                      onClick={() => signMessage()}
                      startContent={<Pen className="w-4 h-4" />}
                      isDisabled={!message.trim()}
                    >
                      Sign Message
                    </Button>
                  </div>

                  {signedMessage && (
                    <div className="mt-2">
                      <div className="text-xs font-semibold">
                        Signed Message
                      </div>
                      <div className="bg-gray-100 p-2 rounded-md break-all">
                        {isSignedMessageExpanded
                          ? signedMessage
                          : `${signedMessage.slice(0, 50)}...`}
                      </div>
                      <div className="flex flex-row gap-2 mt-1">
                        <Button
                          size="sm"
                          variant="light"
                          onClick={copySignedMessage}
                          startContent={
                            copiedSignedMessage ? (
                              <CheckIcon className="w-4 h-4" />
                            ) : (
                              <CopyIcon className="w-4 h-4" />
                            )
                          }
                        >
                          {copiedSignedMessage
                            ? "Copied!"
                            : "Copy to Clipboard"}
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          onClick={toggleSignedMessageExpansion}
                          startContent={
                            isSignedMessageExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )
                          }
                        >
                          {isSignedMessageExpanded ? "Collapse" : "Expand"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <Divider />
                <div className="flex flex-col gap-2">
                  <div className="text-sm font-semibold">
                    Send USDC Transaction
                  </div>
                  <div className="flex flex-row gap-2">
                    <Input
                      size="sm"
                      value={usdcAmount}
                      onChange={(e) => setUsdcAmount(e.target.value)}
                      placeholder="Enter amount"
                      type="number"
                      min="0"
                      step="0.1"
                      className="w-1/3"
                      label="USDC Amount"
                    />
                    <Input
                      size="sm"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="Enter recipient address"
                      label="Recipient Address"
                    />
                  </div>
                  <Button
                    size="sm"
                    color="primary"
                    onClick={() => execTransaction()}
                    startContent={<Send className="w-4 h-4" />}
                    isLoading={isLoading}
                    className="w-full"
                    isDisabled={
                      !usdcAmount ||
                      !recipientAddress ||
                      smartUsdcBalance === undefined ||
                      smartUsdcBalance < parseUnits(usdcAmount, 6)
                    }
                  >
                    Send USDC
                  </Button>
                  {smartUsdcBalance !== undefined &&
                    parseFloat(usdcAmount) > 0 &&
                    smartUsdcBalance < parseUnits(usdcAmount, 6) && (
                      <div className="text-red-500 text-xs text-center mt-1">
                        Insufficient USDC balance
                      </div>
                    )}
                  {errorMessage && (
                    <div className="text-red-500 text-xs text-center mt-1">
                      {errorMessage}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
