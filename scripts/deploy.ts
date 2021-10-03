import { ethers } from 'hardhat'
import { readFile, writeFile } from 'fs/promises'

async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('Deploying contracts with the account:', deployer.address)

  const Contract = await ethers.getContractFactory('Penguins')
  const contract = await Contract.deploy(256)

  // Write contract address into the front end project
  const file = './src/lib/contract.ts'
  const contents = await readFile(file, 'utf8')

  console.log('Contract deployed:', contract.address)

  await writeFile(file, contents.replace(/0x[^']+/, contract.address))
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })

export {}
