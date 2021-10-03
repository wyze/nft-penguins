# nft-penguins &middot; [![Website][website-image]][website-url]

> A NFT and frontend built following _buildspace's NFT project.

## Setup

- Clone Project
    ```sh
    $ git clone https://github.com/wyze/nft-penguins.git
    $ cd nft-penguins
    $ yarn
    ```
- Install [MetaMask](https://metamask.io)
- Setup Environment Variables
  - `RINKEBY_ACCOUNTS`: Your wallet's private key (**Recommended: Make new wallet just for this**)
  - `RINKEBY_URL`: Url to Alchemy or Infura

## Development

### Smart Contract

The deployment script for the contract will automatically update the frontend code to use the latest contract address and ABI.

```sh
$ yarn contract:deploy
```

### Frontend

```sh
$ yarn dev
```

## Test

```sh
$ yarn test
```

## Build

```sh
$ yarn build
```

## License

MIT © [Neil Kistner](https://neilkistner.com)

[website-image]: https://img.shields.io/website-up-down-green-red/https/nft.wyze.dev.svg?style=flat-square
[website-url]: https://nft.wyze.dev

