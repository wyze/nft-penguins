// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {Base64} from "./libraries/Base64.sol";

contract Penguins is ERC721Enumerable, ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;

    uint256 public immutable maxTotalSupply;
    uint256 public immutable maxPerAddress = 2;
    uint256 public immutable mintPrice = 0.0025 ether;

    string baseSvg =
        "<svg xmlns='http://www.w3.org/2000/svg' preserveAspectRatio='xMinYMin meet' viewBox='0 0 350 350'><style>.base { fill: white; font-family: serif; font-size: 24px; }</style><rect width='100%' height='100%' fill='black' /><text x='50%' y='50%' class='base' dominant-baseline='middle' text-anchor='middle'>";

    string[] firstWords = ["Epic", "King", "Rare", "One", "Crazy"];
    string[] secondWords = [
        "Lost",
        "Cold",
        "Lonely",
        "Mean",
        "Friendly",
        "Nice",
        "Angry",
        "King",
        "Chill"
    ];
    string[] thirdWords = [
        "Adelie",
        "Chinstrap",
        "Emperor",
        "Erect-crested",
        "Fiordland",
        "Galapagos",
        "Gentoo",
        "Humboldt",
        "King",
        "Macaroni",
        "Magellanic",
        "Rockhopper",
        "Royal",
        "Snares",
        "Yellow-eyed"
    ];

    event Minted(address indexed sender, uint256 tokenId);

    constructor(uint256 _maxTotalSupply) ERC721("Wyze Penguins", "WPNGN") {
        maxTotalSupply = _maxTotalSupply;
    }

    function random(string memory input) internal pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(input)));
    }

    function firstWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(
            string(abi.encodePacked("FIRST_WORD", Strings.toString(tokenId)))
        );

        rand = rand % firstWords.length;

        return firstWords[rand];
    }

    function secondWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(
            string(abi.encodePacked("SECOND_WORD", Strings.toString(tokenId)))
        );

        rand = rand % secondWords.length;

        return secondWords[rand];
    }

    function thirdWord(uint256 tokenId) public view returns (string memory) {
        uint256 rand = random(
            string(abi.encodePacked("THIRD_WORD", Strings.toString(tokenId)))
        );

        rand = rand % thirdWords.length;

        return thirdWords[rand];
    }

    function mint() public payable virtual nonReentrant {
        uint256 nextId = _tokenIds.current();

        require(msg.value == mintPrice, "Price to mint is incorrect.");
        require(
            balanceOf(_msgSender()) < maxPerAddress,
            "You've minted the max per wallet."
        );
        require(nextId < maxTotalSupply, "Max tokens have been minted.");

        _safeMint(msg.sender, nextId);
        _tokenIds.increment();

        emit Minted(msg.sender, nextId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        string memory first = firstWord(tokenId);
        string memory second = secondWord(tokenId);
        string memory third = thirdWord(tokenId);
        string memory combined = string(abi.encodePacked(first, second, third));

        string memory finalSvg = string(
            abi.encodePacked(baseSvg, combined, "</text></svg>")
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        combined,
                        '", "description": "A simple collection of penguins.", "image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(finalSvg)),
                        '", "attributes": [{"value": "',
                        first,
                        '"}, {"value": "',
                        second,
                        '"}, {"value": "',
                        third,
                        '"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
