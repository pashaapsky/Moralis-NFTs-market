import React, { useState, useEffect, useCallback } from "react";
import MoralisNFTMarketJson from "contracts/MoralisNFTMarket.json";
import { useMoralis } from "react-moralis";

const { ethereum } = window;

const useQueryMarketItems = () => {
  const [queryMarketItems, setQueryMarketItems] = useState([]);
  const { Moralis } = useMoralis();
  const ethers = Moralis.web3Library;

  const getQueryMarketItems = useCallback(async () => {
    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();

    const MoralisNFTMarketContract = new ethers.Contract(
      MoralisNFTMarketJson.address,
      MoralisNFTMarketJson.abi,
      signer,
    );

    try {
      const res = await MoralisNFTMarketContract.fetchMarketItems();

      const formattedRes = res.map((item) => ({
        itemId: parseInt(item[0]),
        nftContract: item[1],
        tokenId: item[2].toString(),
        seller: item[3],
        owner: item[4],
        price: ethers.utils.formatEther(item[5].toString()),
        sold: item[6],
      }));

      setQueryMarketItems(formattedRes);
    } catch (e) {
      console.error(e.message);
    }
  }, [ethers.Contract, ethers.providers.Web3Provider, ethers.utils]);

  useEffect(() => {
    getQueryMarketItems();
  }, [getQueryMarketItems]);

  return { queryMarketItems, setQueryMarketItems, getQueryMarketItems };
};

export default useQueryMarketItems;
