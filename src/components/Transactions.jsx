import React, { useState } from "react";
import { useMoralis, useMoralisQuery, useNFTTransfers } from "react-moralis";
import { Table, Tag, Space } from "antd";
import { PolygonCurrency } from "./Chains/Logos";
import moment from "moment";

const styles = {
  table: {
    margin: "0 auto",
    width: "1000px",
  },
};

function NFTMarketTransactions() {
  const { Moralis, account } = useMoralis();
  const queryItemImages = useMoralisQuery("ItemImages");

  const { fetch, data, error, isLoading, isFetching } = useNFTTransfers();

  console.log("data: ", data);

  return (
    <>
      <div>
        <div style={styles.table}>1</div>
      </div>
    </>
  );
}

export default NFTMarketTransactions;
