import { expect } from 'chai'
import { ethers } from 'hardhat'

async function deploy(maxTotalSupply = 256) {
  const Contract = await ethers.getContractFactory('Penguins')
  const contract = await Contract.deploy(maxTotalSupply)

  await contract.deployed()

  return contract
}

describe('Penguins', function () {
  it('should provide max tokens available', async function () {
    const contract = await deploy()
    const maxTokens = await contract.maxTotalSupply()

    expect(maxTokens.toNumber()).to.eql(256)
  })

  it('should provide current token count', async function () {
    const contract = await deploy()
    const [owner] = await ethers.getSigners()

    const zeroTokenCount = await contract.getTokenCount()

    const mintTx = await contract.makeAnEpicNFT()
    const receipt = await mintTx.wait()

    const oneTokenCount = await contract.getTokenCount()

    expect(zeroTokenCount.toNumber()).to.eql(0)
    expect(oneTokenCount.toNumber()).to.eql(1)
    expect(
      receipt.events?.map(({ args, event }) => [event, args?.slice(0, 2)])
    ).to.eql([
      [
        'Transfer',
        ['0x0000000000000000000000000000000000000000', owner.address],
      ],
      ['Minted', [owner.address, ethers.BigNumber.from(0)]],
    ])
  })

  it('should throw an error if minting when max tokens exist', async function () {
    const contract = await deploy(2)

    // Mint 2 tokens
    await Promise.all(
      Array(2)
        .fill(0)
        .map(async () => {
          const mintTx = await contract.makeAnEpicNFT()

          await mintTx.wait()
        })
    )

    try {
      await contract.makeAnEpicNFT()

      // Put a failure to make sure we go into our catch block
      expect(1).to.eql(2)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.have.string('Max tokens have been minted.')
      } else {
        throw error
      }
    }
  })

  it('should generate a random first word', async () => {
    const contract = await deploy()
    const word = await contract.firstWord(1)

    expect(word).to.eql('Epic')
  })

  it('should generate a random second word', async () => {
    const contract = await deploy()
    const word = await contract.secondWord(1)

    expect(word).to.eql('Angry')
  })

  it('should generate a random third word', async () => {
    const contract = await deploy()
    const word = await contract.thirdWord(1)

    expect(word).to.eql('Erect-crested')
  })
})
