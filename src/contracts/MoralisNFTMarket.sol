// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract MoralisNFTMarket is ReentrancyGuard {
    //для удобных счетчиков
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    Counters.Counter private _itemsSold;

    address public owner;

    constructor() {
        owner = msg.sender;
    }

    struct MarketItem {
        uint itemId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 price;
        bool sold;
    }

    mapping(uint256 => MarketItem) private idToMarketItem;

    event MarketItemCreated (
        uint indexed itemId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        address owner,
        uint256 price,
        bool sold
    );

    event MarketItemSold (
        uint indexed itemId,
        address owner
    );


    //создает item в маркете
    function createMarketItem(
        address nftContract, //адресс NFT контракта 
        uint256 tokenId, // id токена
        uint256 price // цена
    ) public payable nonReentrant {
        require(price > 0, "Price must be greater than 0");

        _itemIds.increment();
        uint256 itemId = _itemIds.current();

        idToMarketItem[itemId] = MarketItem(
            itemId,
            nftContract,
            tokenId,
            payable(msg.sender),
            payable(address(0)),
            price,
            false
        );

        //отправляем токен с nft контракта в наш Market контракт
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        emit MarketItemCreated(
            itemId,
            nftContract,
            tokenId,
            msg.sender,
            address(0),
            price,
            false
        );
    }

    //продаем item   
    function createMarketSale(
        address nftContract, //адресс NFT контракта 
        uint256 itemId // id item
    ) public payable nonReentrant {
        uint price = idToMarketItem[itemId].price; //узнаем цену item
        uint tokenId = idToMarketItem[itemId].tokenId; //токен item
        bool sold = idToMarketItem[itemId].sold; //был ли он продан

        require(msg.value == price, "Please submit the asking price in order to complete the purchase");
        require(sold != true, "This Sale has already finnished");

        emit MarketItemSold(
            itemId,
            msg.sender
        );

        idToMarketItem[itemId].seller.transfer(msg.value); //тот кто создал, тот продает
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId); //контракт отправляет токен
        idToMarketItem[itemId].owner = payable(msg.sender); //меняем владельца
        _itemsSold.increment();
        idToMarketItem[itemId].sold = true;
    }

    //получить все items    
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current(); //сколько всего items в маркете
        uint unsoldItemCount = _itemIds.current() - _itemsSold.current(); //сколько непроданных items 
        uint currentIndex = 0;

        MarketItem[] memory items = new MarketItem[](unsoldItemCount); //массив с непроданными 

        for (uint i = 0; i < itemCount; i++) {
            if (idToMarketItem[i + 1].owner == address(0)) {
                uint currentId = i + 1;
                MarketItem storage currentItem = idToMarketItem[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }

        return items;
    }
}