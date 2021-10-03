import type { Penguins } from '../../typechain'

import PenguinsContract from '../../artifacts/src/contracts/Penguins.sol/Penguins.json'

import { ethers } from 'ethers'

export const address = '0x4AD14f72305AE95204E1b085CC1aBb8aaa1ea881'

export function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, PenguinsContract.abi, signer) as Penguins
}
