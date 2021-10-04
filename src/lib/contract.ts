import type { Penguins } from '../../typechain'

import PenguinsContract from '../../artifacts/src/contracts/Penguins.sol/Penguins.json'

import { ethers } from 'ethers'

export const address = '0x73e9ea250549d1646DE2295CE779b2Cf97Bc4ace'

export function getContract() {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner()

  return new ethers.Contract(address, PenguinsContract.abi, signer) as Penguins
}
