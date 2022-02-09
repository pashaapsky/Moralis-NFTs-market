import React from "react";
import { Select } from "antd";
import { useMoralis, useChain } from "react-moralis";
import { getCollectionsByChain } from "../helpers/collections";

function SearchCollections({ setTokensCollectionAddress }) {
  const { Option } = Select;
  const { chainId, chain } = useChain();
  const NFTCollections = getCollectionsByChain(chainId);

  function onChange(value) {
    setTokensCollectionAddress(value);
  }

  return (
    <>
      <Select
        showSearch
        style={{ width: "1000px", marginLeft: "20px" }}
        placeholder="Find a Collection"
        optionFilterProp="children"
        onChange={onChange}
      >
        {NFTCollections &&
          NFTCollections.map((collection, i) => (
            <Option value={collection.address} key={i}>
              {collection.name}
            </Option>
          ))}
      </Select>
    </>
  );
}

export default SearchCollections;
