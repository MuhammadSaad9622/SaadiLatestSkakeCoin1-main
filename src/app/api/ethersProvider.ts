// pages/api/ethersProvider.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address, providerUrl } = req.body;

  if (!address || !providerUrl) {
    return res.status(400).json({ error: 'Address or Provider URL is not defined' });
  }

  try {
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const balance = await provider.getBalance(address);
    const balanceInEther = ethers.utils.formatEther(balance);
    res.status(200).json({ balance: balanceInEther });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};

export default handler;
