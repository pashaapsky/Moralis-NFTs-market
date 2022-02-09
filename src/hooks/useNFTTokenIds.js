import { useEffect, useState, useCallback } from "react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";

export const useNFTTokenIds = (tokensCollectionAddress) => {
  const { account, token } = useMoralisWeb3Api();
  const { isInitialized, chainId, account: walletAddress } = useMoralis();

  const [NFTTokenIds, setNFTTokenIds] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAllTokensIds = useCallback(async () => {
    setIsLoading(true);

    const tokensIds = await token
      .getAllTokenIds({
        address: tokensCollectionAddress,
        chain: chainId,
      })
      .then((result) => result.result);

    setNFTTokenIds(tokensIds);
    setIsLoading(false);

    return tokensIds;
  }, [chainId, token, tokensCollectionAddress]);

  useEffect(() => {
    if (isInitialized) {
      fetchAllTokensIds();
    }
  }, [isInitialized, fetchAllTokensIds]);

  return { fetchAllTokensIds, NFTTokenIds, isLoading };
};
