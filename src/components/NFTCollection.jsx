import React, { useMemo, useState } from "react";
import {
  useMoralis,
  useNFTBalances,
  useWeb3ExecuteFunction,
} from "react-moralis";
import { Card, Image, Input, Modal, Skeleton, Tooltip } from "antd";
import { FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { getExplorer } from "helpers/networks";
import { useVerifyMetadata } from "hooks/useVerifyMetadata";
import MoralisNFTMarketJson from "contracts/MoralisNFTMarket.json";
import ERC721 from "contracts/ERC721.json";

const { Meta } = Card;

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

const { ethereum } = window;

function NFTCollection() {
  const { data: NFTBalances, isLoading } = useNFTBalances();
  const { Moralis, chainId, account } = useMoralis();
  const [nftToSell, setNftToSell] = useState(null);
  const [visible, setVisibility] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const { verifyMetadata } = useVerifyMetadata();
  const [price, setPrice] = useState("");

  const ethers = Moralis.web3Library;
  const MoralisNFTMarket = useWeb3ExecuteFunction();

  async function sellNft(nft, price) {
    const etherPrice = ethers.utils.parseUnits(String(price), "ether");
    console.log("account: ", account);

    const provider = new ethers.providers.Web3Provider(ethereum);
    const signer = provider.getSigner();
    const MoralisNFTMarketContract = new ethers.Contract(
      MoralisNFTMarketJson.address,
      MoralisNFTMarketJson.abi,
      signer,
    );

    const ERC721Contract = new ethers.Contract(
      nft.token_address,
      ERC721.abi,
      signer,
    );

    const approveTx = await ERC721Contract.approve(
      MoralisNFTMarketJson.address,
      nft.token_id,
    );
    await approveTx.wait();

    console.log("approveTx: ", approveTx);

    const createTx = await MoralisNFTMarketContract.createMarketItem(
      nft.token_address,
      nft.token_id,
      etherPrice,
    );

    await createTx.wait();

    console.log("createTx: ", createTx);

    // console.log("nftContract: ", nft.token_address);
    // console.log("tokenId: ", nft.token_id);
    //
    // const contract = ethers.Contract()
    //
    // const options = {
    //   abi: MoralisNFTMarketJson.abi,
    //   contractAddress: MoralisNFTMarketJson.address,
    //   functionName: "createMarketItem",
    //   params: {
    //     nftContract: nft.token_address,
    //     tokenId: nft.token_id,
    //     price: etherPrice,
    //   },
    // };
    //
    // const res = await MoralisNFTMarket.fetch({
    //   params: options,
    //   onSuccess: () => {
    //     alert("Item sold");
    //   },
    //   onError: (error) => {
    //     alert(`something went wrong: ${error}`);
    //     console.error(error);
    //   },
    // });
    // sending a token with token id = 1
  }

  const handleSellToken = (nft) => {
    setNftToSell(nft);
    setVisibility(true);
    console.log("nft: ", nft);
  };

  console.log("NFTs: ", NFTBalances?.result);

  const availableNFTBalances = useMemo(() => {
    if (NFTBalances?.result) {
      return NFTBalances.result.map((nft) => {
        return verifyMetadata(nft);
      });
    }

    return [];
  }, [NFTBalances?.result, verifyMetadata]);

  return (
    <div style={{ padding: "15px", maxWidth: "1030px", width: "100%" }}>
      <h1>NFT Balances</h1>

      <div style={styles.NFTs}>
        <Skeleton loading={isLoading}>
          {availableNFTBalances.map((nft, index) => {
            return (
              <Card
                hoverable
                actions={[
                  <Tooltip title="View On Blockexplorer">
                    <FileSearchOutlined
                      onClick={() =>
                        window.open(
                          `${getExplorer(chainId)}address/${nft.token_address}`,
                          "_blank",
                        )
                      }
                    />
                  </Tooltip>,
                  <Tooltip title="Sell this NFT">
                    <ShoppingCartOutlined
                      onClick={() => handleSellToken(nft)}
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
                    src={nft?.image || "error"}
                    fallback="data:image/png;base64,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"
                    alt=""
                    style={{ height: "300px" }}
                  />
                }
                key={index}
              >
                <Meta title={nft.name} description={`#${nft.token_id}`} />
              </Card>
            );
          })}
        </Skeleton>
      </div>

      <Modal
        title={`Transfer ${nftToSell?.name || "NFT"}`}
        visible={visible}
        onCancel={() => setVisibility(false)}
        onOk={() => sellNft(nftToSell, price)}
        confirmLoading={isPending}
        okText="Sell"
      >
        <img
          style={{
            width: "250px",
            margin: "auto",
            borderRadius: "10px",
            marginBottom: "15px",
          }}
          src={nftToSell?.metadata?.image}
          alt="IMAGE"
        />

        <Input
          autoFocus
          placeholder="Set Price in ETH"
          onChange={(e) => setPrice(e.target.value)}
        />
      </Modal>
    </div>
  );
}

export default NFTCollection;
