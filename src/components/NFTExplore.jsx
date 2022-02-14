import React, { useEffect, useState } from "react";
import {
  useMoralis,
  useMoralisQuery,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { Card, Image, Tooltip, Modal, Badge, Skeleton, Alert } from "antd";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import { useNFTTokenIds } from "hooks/useNFTTokenIds";
import { networkCollections } from "helpers/collections";
import { getNativeByChain } from "helpers/networks";
import MoralisNFTMarketJson from "contracts/MoralisNFTMarket.json";
import useQueryMarketItems from "../hooks/useQueryMarketItems";
import ERC721 from "../contracts/ERC721.json";

const styles = {
  NFTs: {
    display: "flex",
    flexWrap: "wrap",
    WebkitBoxPack: "start",
    justifyContent: "flex-start",
    margin: "0 auto",
    maxWidth: "1000px",
    width: "100%",
    gap: "10px",
  },
};

const { Meta } = Card;
const { ethereum } = window;

function NFTExplore({ tokensCollectionAddress, setTokensCollectionAddress }) {
  const [visible, setVisibility] = useState(false);
  const [nftToBuy, setNftToBuy] = useState(null);
  const [isPending, setIsPending] = useState(false);
  const { NFTTokenIds, isLoading } = useNFTTokenIds(tokensCollectionAddress);
  const { chainId, Moralis, account } = useMoralis();
  const { verifyMetadata } = useVerifyMetadata();
  const nativeNetworkName = getNativeByChain(chainId);
  const ethers = Moralis.web3Library;
  const MoralisNFTMarket = useWeb3ExecuteFunction();
  const { queryMarketItems } = useQueryMarketItems();
  // const queryMarketItems = useMoralisQuery("CreatedMarketItems");

  useEffect(() => {}, []);

  // const fetchMarketItems = JSON.parse(
  //   JSON.stringify(queryMarketItems.data, [
  //     "objectID",
  //     "createdAt",
  //     "price",
  //     "nftContract",
  //     "itemId",
  //     "sold",
  //     "tokenId",
  //     "seller",
  //     "owner",
  //     "confirmed",
  //   ]),
  // );

  console.log("queryMarketItems: ", queryMarketItems);

  const getMarketItem = (nft) => {
    return queryMarketItems.find(
      (item) =>
        item.nftContract.toLowerCase() === nft?.token_address.toLowerCase() &&
        item.tokenId === nft?.token_id,
    );
  };

  const handleStartBuyToken = (nft) => {
    const item = getMarketItem(nft);

    setNftToBuy(nft);
    setVisibility(true);
  };

  const updateSoldMarketItem = async () => {
    const id = getMarketItem(nftToBuy).objectId;
    const marketList = Moralis.Object.extend("CreatedMarketItems");
    const query = new Moralis.Query(marketList);

    await query.get(id).then((item) => {
      item.set("sold", true);
      item.set("owner", account);
      item.save();
    });
  };

  const handleConfirmBuyToken = async () => {
    const tokenToBuy = getMarketItem(nftToBuy);

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const MoralisNFTMarketContract = new ethers.Contract(
      MoralisNFTMarketJson.address,
      MoralisNFTMarketJson.abi,
      signer,
    );

    const createTx = await MoralisNFTMarketContract.createMarketSale(
      tokenToBuy.nftContract,
      tokenToBuy.itemId,
      { value: ethers.utils.parseUnits(tokenToBuy.price, "ether") },
    );

    await createTx.wait();

    console.log("createTx: ", createTx);

    // const ERC721Contract = new ethers.Contract(
    //   nft.token_address,
    //   ERC721.abi,
    //   signer,
    // );

    // const approveTx = await ERC721Contract.approve(account, nft.token_id);
    // await approveTx.wait();

    // console.log("approveTx: ", approveTx);

    // const options = {
    //   abi: MoralisNFTMarketJson.abi,
    //   contractAddress: MoralisNFTMarketJson.address,
    //   functionName: "createMarketSale",
    //   params: {
    //     nftContract: nft.token_address,
    //     itemId: nft.token_id,
    //   },
    // };
    //
    // const res = await MoralisNFTMarket.fetch({
    //   params: options,
    //   onSuccess: () => {
    //     alert("Item bought");
    //     updateSoldMarketItem();
    //   },
    //   onError: (error) => {
    //     alert(`something went wrong: ${error}`);
    //     console.error(error);
    //   },
    // });
  };

  const pageTitle = tokensCollectionAddress
    ? "NFT MARKET PLACE"
    : "AVAILABLE TOKENS COLLECTIONS";

  useEffect(() => {
    return () => {
      setTokensCollectionAddress("");
    };
  }, [setTokensCollectionAddress]);

  return (
    <>
      <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
        <h1>{pageTitle}</h1>

        <div style={styles.NFTs}>
          <Skeleton loading={isLoading}>
            {tokensCollectionAddress ? (
              <>
                {NFTTokenIds.slice(0, 15).map((nft, index) => {
                  nft = verifyMetadata(nft);

                  return (
                    <Card
                      hoverable
                      actions={[
                        <Tooltip title="View On Blockexplorer">
                          <FileSearchOutlined
                            onClick={() =>
                              window.open(
                                `${getExplorer(chainId)}address/${
                                  nft.token_address
                                }`,
                                "_blank",
                              )
                            }
                          />
                        </Tooltip>,
                        <Tooltip title="Buy this NFT">
                          <ShoppingCartOutlined
                            onClick={() => handleStartBuyToken(nft)}
                          />
                        </Tooltip>,
                      ]}
                      style={{
                        width: 240,
                        border: "2px solid #e7eaf3",
                      }}
                      cover={
                        <Image
                          preview={false}
                          src={nft?.metadata?.image || "error"}
                          fallback="data:image/png;base64,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"
                          alt=""
                          style={{ height: "300px" }}
                        />
                      }
                      key={index}
                    >
                      {getMarketItem(nft) && (
                        <Badge.Ribbon text="Buy now" color="green" />
                      )}
                      <Meta title={nft.name} description={`#${nft.token_id}`} />
                    </Card>
                  );
                })}
              </>
            ) : (
              <>
                {networkCollections[chainId]?.map((item, index) => {
                  return (
                    <Card
                      hoverable
                      actions={[
                        <Tooltip title="View This Collection">
                          <FileSearchOutlined
                            onClick={() => {
                              setTokensCollectionAddress(item.address);
                            }}
                          />
                        </Tooltip>,
                      ]}
                      style={{
                        width: 240,
                        border: "2px solid #e7eaf3",
                      }}
                      cover={
                        <Image
                          preview={false}
                          src={item.image || "error"}
                          fallback="data:image/png;base64,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"
                          alt=""
                          style={{
                            height: "300px",
                          }}
                        />
                      }
                      key={index}
                    >
                      <Meta title={item.name} />
                    </Card>
                  );
                })}
              </>
            )}
          </Skeleton>
        </div>
      </div>

      {getMarketItem(nftToBuy) ? (
        <Modal
          title={`Buy ${nftToBuy?.name || "NFT"}`}
          visible={visible}
          onCancel={() => setVisibility(false)}
          onOk={handleConfirmBuyToken}
          confirmLoading={isPending}
          okText="Buy"
        >
          <div style={{ width: "250px", margin: "auto" }}>
            <Badge.Ribbon
              text={`${getMarketItem(nftToBuy).price} ${nativeNetworkName}`}
              color="green"
            >
              <img
                style={{
                  width: "250px",
                  margin: "auto",
                  borderRadius: "10px",
                  marginBottom: "15px",
                }}
                src={nftToBuy?.metadata?.image}
                alt="IMAGE"
              />
            </Badge.Ribbon>
          </div>
        </Modal>
      ) : (
        <Modal
          title={`Buy ${nftToBuy?.name || "NFT"}`}
          visible={visible}
          onCancel={() => setVisibility(false)}
          onOk={() => setVisibility(false)}
          confirmLoading={isPending}
          okText="Ok"
        >
          <img
            style={{
              width: "250px",
              margin: "auto",
              borderRadius: "10px",
              marginBottom: "15px",
            }}
            src={nftToBuy?.metadata?.image}
            alt="IMAGE"
          />
          <Alert message="This NFT is currently not for sale" type="warning" />
        </Modal>
      )}
    </>
  );
}

export default NFTExplore;
