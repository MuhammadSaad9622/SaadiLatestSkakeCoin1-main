"use client"; // This is a client component 👈🏽
import Image from "next/image";
import { ConnectButton } from "thirdweb/react";
import { client } from "./client";
import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { defineChain } from "thirdweb";
import { readContract } from "thirdweb";
import { useState, useEffect, SetStateAction } from "react";
import { useActiveAccount } from "thirdweb/react";
import { prepareTransaction, toWei } from "thirdweb";
import { sendAndConfirmTransaction } from "thirdweb";
import { useWalletBalance } from "thirdweb/react";
import { ethers } from "ethers";
import dynamic from "next/dynamic";

import Toast from "./Toast";
import { useReadContract } from "thirdweb/react";

// const BSTChain = defineChain({
//   id: 7007,
//   rpc: "https://polygon.llamarpc.com	",
// });
const BSTChain = defineChain(137);

// src/global.d.ts
interface Window {
  ethereum: any;
}

export default function Home() {
  const [rewards, setRewards] = useState<number | null>(null);
  // const activeAccount = useActiveAccount()?.address;
  const [stakedAmount, setStakedAmount] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [stakeData, setStakeData] = useState<{
    amount: number;
    stakeTime: number;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loading1, setLoading1] = useState<boolean>(false);

  const activeAccountop = useActiveAccount();
  const activeAccount = useActiveAccount();
  const activeAccountaddress = useActiveAccount()?.address;
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [stakeAmount, setStakeAmount] = useState("");

  const [activeTab, setActiveTab] = useState("stake");
  const [balance, setBalance] = useState<string | null>(null);

  const [elligible, setElligible] = useState<boolean>(false);

  const [providers, setProvider] =
    useState<ethers.providers.Web3Provider | null>(null);

  const provider = new ethers.providers.JsonRpcProvider(
    "https://polygon-rpc.com"
  );
  const providerUrl = process.env.NEXT_PUBLIC_INFURA_URL;

  // const getBalance = async () => {
  //   try {
  //     if (!providerUrl || !activeAccountaddress) {
  //       throw new Error("Provider URL or address is not defined");
  //     }

  //     const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  //     const balance = await provider.getBalance(activeAccountaddress);
  //     const balanceInEther = ethers.utils.formatEther(balance);
  //     setBalance(balanceInEther);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };
  const openTab = (tabName: SetStateAction<string>) => {
    setActiveTab(tabName);
  };
  const contract = getContract({
    client,
    chain: BSTChain,
    address: "0x9914C8dC70288486a796eF0284C2992942836c40",
    abi: [
      {
        inputs: [
          { internalType: "address", name: "_xrbToken", type: "address" },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "AdminXRBAdded",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "AdminXRBRemoved",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "newRate",
            type: "uint256",
          },
        ],
        name: "MonthlyRateUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address",
          },
        ],
        name: "OwnershipTransferred",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "bool",
            name: "isPaused",
            type: "bool",
          },
        ],
        name: "Paused",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
        ],
        name: "Staked",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "user",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "amount",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "reward",
            type: "uint256",
          },
        ],
        name: "Withdrawn",
        type: "event",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "addXRB",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "emergencyWithdrawAll",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "getStakedAmount",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "hasStaked",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "monthlyRate",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "owner",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "paused",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "removeXRB",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "stake",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "", type: "address" }],
        name: "stakes",
        outputs: [
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "stakeTime", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalStaked",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "newOwner", type: "address" },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "newRate", type: "uint256" }],
        name: "updateMonthlyRate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "user", type: "address" }],
        name: "viewClaimableRewards",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "withdraw",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "withdrawExcess",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "xrbToken",
        outputs: [
          { internalType: "contract IERC20", name: "", type: "address" },
        ],
        stateMutability: "view",
        type: "function",
      },
      { stateMutability: "payable", type: "receive" },
    ],
  });

  const contract1 = getContract({
    client,
    chain: BSTChain,
    address: "0xF72ac7C2d6e473d291748267EE1143157fDdb44E",
    abi: [
      { inputs: [], stateMutability: "nonpayable", type: "constructor" },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "owner",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "spender",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Approval",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "startTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxClaimableSupply",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "supplyClaimed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "quantityLimitPerWallet",
                type: "uint256",
              },
              { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
              {
                internalType: "uint256",
                name: "pricePerToken",
                type: "uint256",
              },
              { internalType: "address", name: "currency", type: "address" },
              { internalType: "string", name: "metadata", type: "string" },
            ],
            indexed: false,
            internalType: "struct IClaimCondition.ClaimCondition[]",
            name: "claimConditions",
            type: "tuple[]",
          },
          {
            indexed: false,
            internalType: "bool",
            name: "resetEligibility",
            type: "bool",
          },
        ],
        name: "ClaimConditionsUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "string",
            name: "prevURI",
            type: "string",
          },
          {
            indexed: false,
            internalType: "string",
            name: "newURI",
            type: "string",
          },
        ],
        name: "ContractURIUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "delegator",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "fromDelegate",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "toDelegate",
            type: "address",
          },
        ],
        name: "DelegateChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "delegate",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "previousBalance",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "newBalance",
            type: "uint256",
          },
        ],
        name: "DelegateVotesChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [],
        name: "EIP712DomainChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "address",
            name: "platformFeeRecipient",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "flatFee",
            type: "uint256",
          },
        ],
        name: "FlatPlatformFeeUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint8",
            name: "version",
            type: "uint8",
          },
        ],
        name: "Initialized",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "uint256",
            name: "maxTotalSupply",
            type: "uint256",
          },
        ],
        name: "MaxTotalSupplyUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "platformFeeRecipient",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "platformFeeBps",
            type: "uint256",
          },
        ],
        name: "PlatformFeeInfoUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: false,
            internalType: "enum IPlatformFee.PlatformFeeType",
            name: "feeType",
            type: "uint8",
          },
        ],
        name: "PlatformFeeTypeUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "recipient",
            type: "address",
          },
        ],
        name: "PrimarySaleRecipientUpdated",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "previousAdminRole",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "bytes32",
            name: "newAdminRole",
            type: "bytes32",
          },
        ],
        name: "RoleAdminChanged",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleGranted",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes32",
            name: "role",
            type: "bytes32",
          },
          {
            indexed: true,
            internalType: "address",
            name: "account",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "sender",
            type: "address",
          },
        ],
        name: "RoleRevoked",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "uint256",
            name: "claimConditionIndex",
            type: "uint256",
          },
          {
            indexed: true,
            internalType: "address",
            name: "claimer",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "receiver",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "startTokenId",
            type: "uint256",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "quantityClaimed",
            type: "uint256",
          },
        ],
        name: "TokensClaimed",
        type: "event",
      },
      {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "address",
            name: "from",
            type: "address",
          },
          {
            indexed: true,
            internalType: "address",
            name: "to",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint256",
            name: "value",
            type: "uint256",
          },
        ],
        name: "Transfer",
        type: "event",
      },
      {
        inputs: [],
        name: "CLOCK_MODE",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "DOMAIN_SEPARATOR",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
        ],
        name: "allowance",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "approve",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "uint256", name: "amount", type: "uint256" }],
        name: "burn",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "burnFrom",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint32", name: "pos", type: "uint32" },
        ],
        name: "checkpoints",
        outputs: [
          {
            components: [
              { internalType: "uint32", name: "fromBlock", type: "uint32" },
              { internalType: "uint224", name: "votes", type: "uint224" },
            ],
            internalType: "struct ERC20VotesUpgradeable.Checkpoint",
            name: "",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "_receiver", type: "address" },
          { internalType: "uint256", name: "_quantity", type: "uint256" },
          { internalType: "address", name: "_currency", type: "address" },
          { internalType: "uint256", name: "_pricePerToken", type: "uint256" },
          {
            components: [
              { internalType: "bytes32[]", name: "proof", type: "bytes32[]" },
              {
                internalType: "uint256",
                name: "quantityLimitPerWallet",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricePerToken",
                type: "uint256",
              },
              { internalType: "address", name: "currency", type: "address" },
            ],
            internalType: "struct IDrop.AllowlistProof",
            name: "_allowlistProof",
            type: "tuple",
          },
          { internalType: "bytes", name: "_data", type: "bytes" },
        ],
        name: "claim",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
      {
        inputs: [],
        name: "claimCondition",
        outputs: [
          { internalType: "uint256", name: "currentStartId", type: "uint256" },
          { internalType: "uint256", name: "count", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "clock",
        outputs: [{ internalType: "uint48", name: "", type: "uint48" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "contractType",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [],
        name: "contractURI",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "contractVersion",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "pure",
        type: "function",
      },
      {
        inputs: [],
        name: "decimals",
        outputs: [{ internalType: "uint8", name: "", type: "uint8" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "subtractedValue", type: "uint256" },
        ],
        name: "decreaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "delegatee", type: "address" },
        ],
        name: "delegate",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "delegatee", type: "address" },
          { internalType: "uint256", name: "nonce", type: "uint256" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "delegateBySig",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "delegates",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "eip712Domain",
        outputs: [
          { internalType: "bytes1", name: "fields", type: "bytes1" },
          { internalType: "string", name: "name", type: "string" },
          { internalType: "string", name: "version", type: "string" },
          { internalType: "uint256", name: "chainId", type: "uint256" },
          {
            internalType: "address",
            name: "verifyingContract",
            type: "address",
          },
          { internalType: "bytes32", name: "salt", type: "bytes32" },
          { internalType: "uint256[]", name: "extensions", type: "uint256[]" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getActiveClaimConditionId",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_conditionId", type: "uint256" },
        ],
        name: "getClaimConditionById",
        outputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "startTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxClaimableSupply",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "supplyClaimed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "quantityLimitPerWallet",
                type: "uint256",
              },
              { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
              {
                internalType: "uint256",
                name: "pricePerToken",
                type: "uint256",
              },
              { internalType: "address", name: "currency", type: "address" },
              { internalType: "string", name: "metadata", type: "string" },
            ],
            internalType: "struct IClaimCondition.ClaimCondition",
            name: "condition",
            type: "tuple",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getFlatPlatformFeeInfo",
        outputs: [
          { internalType: "address", name: "", type: "address" },
          { internalType: "uint256", name: "", type: "uint256" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "timepoint", type: "uint256" },
        ],
        name: "getPastTotalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "account", type: "address" },
          { internalType: "uint256", name: "timepoint", type: "uint256" },
        ],
        name: "getPastVotes",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getPlatformFeeInfo",
        outputs: [
          { internalType: "address", name: "", type: "address" },
          { internalType: "uint16", name: "", type: "uint16" },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "getPlatformFeeType",
        outputs: [
          {
            internalType: "enum IPlatformFee.PlatformFeeType",
            name: "",
            type: "uint8",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "uint256", name: "index", type: "uint256" },
        ],
        name: "getRoleMember",
        outputs: [{ internalType: "address", name: "member", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
        name: "getRoleMemberCount",
        outputs: [{ internalType: "uint256", name: "count", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_conditionId", type: "uint256" },
          { internalType: "address", name: "_claimer", type: "address" },
        ],
        name: "getSupplyClaimedByWallet",
        outputs: [
          {
            internalType: "uint256",
            name: "supplyClaimedByWallet",
            type: "uint256",
          },
        ],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "getVotes",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "hasRoleWithSwitch",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "addedValue", type: "uint256" },
        ],
        name: "increaseAllowance",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "_defaultAdmin", type: "address" },
          { internalType: "string", name: "_name", type: "string" },
          { internalType: "string", name: "_symbol", type: "string" },
          { internalType: "string", name: "_contractURI", type: "string" },
          {
            internalType: "address[]",
            name: "_trustedForwarders",
            type: "address[]",
          },
          { internalType: "address", name: "_saleRecipient", type: "address" },
          {
            internalType: "address",
            name: "_platformFeeRecipient",
            type: "address",
          },
          { internalType: "uint128", name: "_platformFeeBps", type: "uint128" },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "forwarder", type: "address" },
        ],
        name: "isTrustedForwarder",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "maxTotalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "bytes[]", name: "data", type: "bytes[]" }],
        name: "multicall",
        outputs: [
          { internalType: "bytes[]", name: "results", type: "bytes[]" },
        ],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "name",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "owner", type: "address" }],
        name: "nonces",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [{ internalType: "address", name: "account", type: "address" }],
        name: "numCheckpoints",
        outputs: [{ internalType: "uint32", name: "", type: "uint32" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "owner", type: "address" },
          { internalType: "address", name: "spender", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
          { internalType: "uint256", name: "deadline", type: "uint256" },
          { internalType: "uint8", name: "v", type: "uint8" },
          { internalType: "bytes32", name: "r", type: "bytes32" },
          { internalType: "bytes32", name: "s", type: "bytes32" },
        ],
        name: "permit",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "primarySaleRecipient",
        outputs: [{ internalType: "address", name: "", type: "address" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "bytes32", name: "role", type: "bytes32" },
          { internalType: "address", name: "account", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            components: [
              {
                internalType: "uint256",
                name: "startTimestamp",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "maxClaimableSupply",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "supplyClaimed",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "quantityLimitPerWallet",
                type: "uint256",
              },
              { internalType: "bytes32", name: "merkleRoot", type: "bytes32" },
              {
                internalType: "uint256",
                name: "pricePerToken",
                type: "uint256",
              },
              { internalType: "address", name: "currency", type: "address" },
              { internalType: "string", name: "metadata", type: "string" },
            ],
            internalType: "struct IClaimCondition.ClaimCondition[]",
            name: "_conditions",
            type: "tuple[]",
          },
          {
            internalType: "bool",
            name: "_resetClaimEligibility",
            type: "bool",
          },
        ],
        name: "setClaimConditions",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [{ internalType: "string", name: "_uri", type: "string" }],
        name: "setContractURI",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_platformFeeRecipient",
            type: "address",
          },
          { internalType: "uint256", name: "_flatFee", type: "uint256" },
        ],
        name: "setFlatPlatformFeeInfo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_maxTotalSupply", type: "uint256" },
        ],
        name: "setMaxTotalSupply",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "address",
            name: "_platformFeeRecipient",
            type: "address",
          },
          { internalType: "uint256", name: "_platformFeeBps", type: "uint256" },
        ],
        name: "setPlatformFeeInfo",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          {
            internalType: "enum IPlatformFee.PlatformFeeType",
            name: "_feeType",
            type: "uint8",
          },
        ],
        name: "setPlatformFeeType",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "_saleRecipient", type: "address" },
        ],
        name: "setPrimarySaleRecipient",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [],
        name: "symbol",
        outputs: [{ internalType: "string", name: "", type: "string" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [],
        name: "totalSupply",
        outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "address", name: "from", type: "address" },
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transferFrom",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
      {
        inputs: [
          { internalType: "uint256", name: "_conditionId", type: "uint256" },
          { internalType: "address", name: "_claimer", type: "address" },
          { internalType: "uint256", name: "_quantity", type: "uint256" },
          { internalType: "address", name: "_currency", type: "address" },
          { internalType: "uint256", name: "_pricePerToken", type: "uint256" },
          {
            components: [
              { internalType: "bytes32[]", name: "proof", type: "bytes32[]" },
              {
                internalType: "uint256",
                name: "quantityLimitPerWallet",
                type: "uint256",
              },
              {
                internalType: "uint256",
                name: "pricePerToken",
                type: "uint256",
              },
              { internalType: "address", name: "currency", type: "address" },
            ],
            internalType: "struct IDrop.AllowlistProof",
            name: "_allowlistProof",
            type: "tuple",
          },
        ],
        name: "verifyClaim",
        outputs: [{ internalType: "bool", name: "isOverride", type: "bool" }],
        stateMutability: "view",
        type: "function",
      },
    ],
  });


  const getBalance = async () => {
    if (!activeAccountaddress) return;

    try {
      const result = await readContract({
        contract: contract1,
        method: "balanceOf",
        params: [activeAccountaddress],
      });
  
      // Convert the balance from wei to Ether (ETH)
      const balanceInEth = (parseFloat(result.toString()) / 10 ** 18).toString();
  
      // Set the balance in Ether as a string
      setBalance(balanceInEth);
    
} catch (error) {
      console.error("Error fetching rewards:", error);
      // Handle error state if needed
    }
  };

  const fetchClaimableRewards = async () => {
    if (!activeAccountaddress) return;

    try {
      const result = await readContract({
        contract,
        method: "hasStaked",
        params: [activeAccountaddress],
      });

      console.log("data is ", result);
      setElligible(result);

      const rewardData: bigint = await readContract({
        contract,
        method: "viewClaimableRewards",
        params: [activeAccountaddress],
      });

      // Convert bigint to number and handle potential errors
      const parsedReward = Number(rewardData.toString());
      if (isNaN(parsedReward)) {
        throw new Error("Invalid reward data received");
      }

      // Set the rewards state as a number
      setRewards(parsedReward);
    } catch (error) {
      console.error("Error fetching rewards:", error);
      // Handle error state if needed
      setRewards(null); // Reset rewards to null or handle error state
    }
  };

  useEffect(() => {
    if (activeAccountaddress) {
      fetchClaimableRewards();
      getBalance();
    }
  }, [activeAccountaddress]);

  useEffect(() => {
    const fetchStakedAmount = async () => {
      if (!activeAccountaddress) {
        setLoading(false);
        return;
      }

      try {
        // Create the contract instance

        // Read staked amount from the contract
        const result = await readContract({
          contract,
          method: "getStakedAmount",
          params: [activeAccountaddress],
        });

        const amount = result as bigint;
        const stakedAmountInEther = ethers.utils.formatEther(amount.toString());
        setStakedAmount(stakedAmountInEther);
        // setStakedAmount(Number(amount.toString()));
      } catch (error) {
        console.error("Error fetching staked amount:", error);
        setStakedAmount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStakedAmount();
  }, [activeAccountaddress]);

  if (loading) {
    return <p>Loading staked amount...</p>;
  }

  const handleStake = async () => {
    setLoading1(true);

    try {
      if (!activeAccount) {
        throw new Error("No active account found.");
      }

      if (elligible) {
        setToastMessage("Widthraw First For More Stake!");
        setShowToast(true);
        return;
      }

      // Prepare the contract call for staking
      const transaction = prepareContractCall({
        contract,
        method: "stake",
        params: [toWei(stakeAmount)]
      });
      // await tx.SetValue("0.00000000001");

      // Send the transaction
      const { transactionHash } = await sendAndConfirmTransaction({
        transaction,
        account: activeAccount,
      });

      // Update state with transaction hash
      setTransactionHash(transactionHash);
      setToastMessage("Stake successful!");
      setShowToast(true);
    } catch (error) {
      console.error("Error staking:", error);
      setTransactionHash(null); // Reset transaction hash on error
     
      setShowToast(true);
    } finally {
      setLoading1(false);
    }
  };

  // Function to handle the withdrawal
  const handleWithdraw = async () => {
    setLoading1(true);
    try {
      if (!activeAccount) {
        throw new Error("No active account found.");
      }

      // Prepare the contract call
      const transaction = await prepareContractCall({
        contract,
        method: "withdraw",
        params: [],
      });

      // Send the transaction
      const { transactionHash } = await sendTransaction({
        transaction,
        account: activeAccount, // Ensure this is the address of the user
      });

      // Set the transaction hash to display to the user
      setTransactionHash(transactionHash);
      setToastMessage("Action successful!");
      setShowToast(true);
    } catch (error) {
      console.error("Error during withdrawal:", error);
      setTransactionHash(null);
      setToastMessage("You Dont Have Any Stake Coin");
      setShowToast(true);
    } finally {
      setLoading1(false);
    }
  };

  const closeToast = () => {
    setShowToast(false);
    setToastMessage("");
  };

  // useEffect(() => {
  //   const getBalance = async () => {
  //     try {
  //       if (!providerUrl || !activeAccountaddress) {
  //         throw new Error("Provider URL or address is not defined");
  //       }

  //       const provider = new ethers.providers.JsonRpcProvider(providerUrl);
  //       const balance = await provider.getBalance(activeAccountaddress);
  //       const balanceInEther = ethers.utils.formatEther(balance);
  //       setBalance(balanceInEther);
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };

  //   getBalance();
  // }, []);
  // useEffect(() => {
  //   if (window) {
  //    console.log("nsaa")
  //     }
  //    else {
  //     console.error("Please install MetaMask!");
  //   }
  // }, []);

  return (
    <>
      <div className="container">
        <div className="flex flex-col items-center justify-center space-y-8 mt-8">
          <div className="w-full md:w-3/4  flex flex-col items-center justify-center  p-6 rounded-lg shadow">
            <h1 className="text-xl font-semibold text-gray-800 mb-4 cbtn">
              Connect to Your Wallet
            </h1>
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Example App",
                url: "https://example.com",
              }}
            />
          </div>
        </div>
        <div className="tabs">
          <div
            className={`tab ${activeTab === "stake" ? "active" : ""}`}
            onClick={() => openTab("stake")}
          >
            Stake
          </div>
          <div
            className={`tab ${activeTab === "unstake" ? "active" : ""}`}
            onClick={() => openTab("unstake")}
          >
            Unstake
          </div>
          {/* <div
            className={`tab ${activeTab === "history" ? "active" : ""}`}
            onClick={() => openTab("history")}
          >
            X Currencies
          </div> */}
        </div>
        <div className={`content ${activeTab === "stake" ? "active" : ""}`}>
          <div className="eth-balance">
            <span>Stake XRB</span>
            <span>Balance:</span>
            {balance !== null ? <p>{balance}</p> : <p>Loading...</p>}
          </div>
          <div className="eth-balance">
            <input
              type="number"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              placeholder="Enter  Amount"
              style={{
                background: "none",
                border: "none",
                color: "white",
                width: "100%",
              }}
            />
            {/* <button className="max-button">MAX</button> */}
          </div>
          <div className="transaction-summary">
            <div>Monthly Max</div>
            <div>
              {balance !== null
                ? (parseFloat(balance) * 0.01).toFixed(4)
                : "Loading..."}
            </div>
          </div>
          <div className="transaction-summary">
            <div>APY</div>
            <div>1%</div>
          </div>
          <div className="transaction-summary">
            <div>Staking Fee</div>
            <div>(0%)</div>
          </div>
          <br />
          <button
            className="button"
            onClick={handleStake}
            disabled={loading1 || !activeAccount}
          >
            {loading1 ? "Loading..." : "Stake Tokens"}
          </button>
          {/* <p className="alert">
            You Will See Your Staking Rewards After One Month
          </p> */}
        </div>
        <div className={`content ${activeTab === "unstake" ? "active" : ""}`}>
          <div className="eth-balance">
            <span>Unstake XRB</span>
            {/* <span>Balance: 100:1 BST</span> */}
            {stakedAmount !== null ? <p>{stakedAmount}</p> : <p>Loading...</p>}
          </div>
          {/* <div className="transaction-summary">
            <div>Staked Rewards</div>
            {stakedAmount !== null ? (
              <p>
                 {stakedAmount}
              </p>
            ) : (
              <p>Loading...</p>
            )}
          </div> */}
          <div className="transaction-summary">
            <div>Claimable Rewards</div>
            {rewards !== null ? <p>{rewards}</p> : <p>Loading...</p>}
          </div>
          <div className="transaction-summary">
            <div>Transaction Fee</div>
            <div>(0%)</div>
          </div>
          <br />
          <button
            className="button"
            onClick={handleWithdraw}
            disabled={loading1 || !activeAccount}
          >
            {loading1 ? "Loading..." : "Withdraw Tokens"}
          </button>
        </div>
        <div className={`content ${activeTab === "history" ? "active" : ""}`}>
          <br />
          <br />
          <h1 className="cs">Coming Soon</h1>
          <br />
          <br />
        </div>
        {showToast && <Toast message={toastMessage} onClose={closeToast} />}
        <style jsx>{`
          body {
            font-family: Outfit, sans-serif;
            background-color: #1e1e2d;
            color: white;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
          }
          .container {
            border-radius: 2px;
            padding: 20px;
            width: 440px;
          }
          .tabs {
            display: flex;
            margin-bottom: 20px;
          }
          .tab {
            flex: 1;
            padding: 10px;
            text-align: center;
            cursor: pointer;
            border-bottom: 2px solid transparent;
          }
          .tab.active {
            border-bottom: 2px solid #6b6bff;
          }
          .content {
            display: none;
          }
          .content.active {
            display: block;
          }
          .transaction-summary {
            margin-top: 20px;
          }
          .button {
            background-color: #6b6bff;
            border: none;
            padding: 10px;
            color: white;
            width: 100%;
            border-radius: 2px;
            cursor: pointer;
            text-align: center;
          }
          .button:disabled {
            background-color: #444;
            cursor: not-allowed;
          }
          .transaction-summary div {
            margin: 10px 0;
          }
          .eth-balance {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #3b3b4b;
            border-radius: 5px;
            padding: 10px;
            margin-top: 20px;
          }
          .max-button {
            background-color: #444;
            border: none;
            padding: 5px;
            color: white;
            border-radius: 3px;
            cursor: pointer;
          }
          .transaction-summary {
            margin-top: 20px;
            display: flex;
            justify-content: space-between;
          }
          body {
            background-image: url("https://ildattero.com/wp-content/uploads/2024/01/Untitled-design.png");
            background-size: cover;
            background-position: center center;
            background-repeat: repeat;
          }
        `}</style>
      </div>
    </>
  );
}

// Marking the Header and ThirdwebResources components as Server Components
function Header() {
  // @ts-ignore
  return (
    <header className="flex flex-col items-center mb-20 md:mb-20">
      <h1 className="text-2xl md:text-6xl font-semibold md:font-bold tracking-tighter mb-6 text-zinc-100">
        Sapphire
        <span className="text-zinc-300 inline-block mx-1"> </span>
        <span className="inline-block  text-blue-500">Chain </span>
      </h1>
    </header>
  );
}

function ThirdwebResources() {
  // @ts-ignore
  return (
    <div className="grid gap-4 lg:grid-cols-3 justify-center">
      <ArticleCard
        title="thirdweb SDK Docs"
        href="https://portal.thirdweb.com/typescript/v5"
        description="thirdweb TypeScript SDK documentation"
      />

      <ArticleCard
        title="Components and Hooks"
        href="https://portal.thirdweb.com/typescript/v5/react"
        description="Learn about the thirdweb React components and hooks in thirdweb SDK"
      />

      <ArticleCard
        title="thirdweb Dashboard"
        href="https://thirdweb.com/dashboard"
        description="Deploy, configure, and manage your smart contracts from the dashboard."
      />
    </div>
  );
}

function ArticleCard(props: {
  title: string;
  href: string;
  description: string;
}) {
  return (
    <a
      href={props.href + "?utm_source=next-template"}
      target="_blank"
      className="flex flex-col border border-zinc-800 p-4 rounded-lg hover:bg-zinc-900 transition-colors hover:border-zinc-700"
    >
      <article>
        <h2 className="text-lg font-semibold mb-2">{props.title}</h2>
        <p className="text-sm text-zinc-400">{props.description}</p>
      </article>
    </a>
  );
}
