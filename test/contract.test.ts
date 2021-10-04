import { expect } from 'chai'
import { ethers } from 'hardhat'

const value = ethers.utils.parseEther('0.0025')

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

    const zeroTokenCount = await contract.totalSupply()

    const mintTx = await contract.mint({ value })
    const receipt = await mintTx.wait()

    const oneTokenCount = await contract.totalSupply()

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
    const [, other] = await ethers.getSigners()

    // Mint 2 tokens
    await Promise.all(
      Array(2)
        .fill(0)
        .map(async () => {
          const mintTx = await contract.mint({ value })

          await mintTx.wait()
        })
    )

    try {
      await contract.connect(other).mint({ value })

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

  it('should throw an error when minting more than max tokens per wallet', async function () {
    const contract = await deploy()

    // Mint max tokens per wallet
    await Promise.all(
      Array(2)
        .fill(0)
        .map(async () => {
          const mintTx = await contract.mint({ value })

          await mintTx.wait()
        })
    )

    try {
      await contract.mint({ value })

      // Put a failure to make sure we go into our catch block
      expect(1).to.eql(2)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.have.string(
          "You've minted the max per wallet."
        )
      } else {
        throw error
      }
    }
  })

  it('should throw an error when mint price not provided', async function () {
    const contract = await deploy()

    try {
      await contract.mint()

      // Put a failure to make sure we go into our catch block
      expect(1).to.eql(2)
    } catch (error) {
      if (error instanceof Error) {
        expect(error.message).to.have.string('Price to mint is incorrect.')
      } else {
        throw error
      }
    }
  })

  it('should be able to get tokens by owner', async function () {
    const contract = await deploy()
    const [, user] = await ethers.getSigners()

    {
      const mintTx = await contract.mint({ value })

      await mintTx.wait()
    }
    {
      const mintTx = await contract.connect(user).mint({ value })

      await mintTx.wait()
    }

    const balanceOf = (await contract.balanceOf(user.address)).toNumber()

    await Promise.all(
      Array(balanceOf)
        .fill(0)
        .map(async (_, index) => {
          const token = await contract.tokenOfOwnerByIndex(user.address, index)

          expect(token).to.eql(ethers.BigNumber.from(1))
        })
    )
  })

  it('should be able to get tokenURI', async function () {
    const contract = await deploy()

    const mintTx = await contract.mint({ value })

    await mintTx.wait()

    const tokenURI = await contract.tokenURI(1)

    expect(tokenURI).to.eql(
      'data:application/json;base64,eyJuYW1lIjogIkVwaWNBbmdyeUVyZWN0LWNyZXN0ZWQiLCAiZGVzY3JpcHRpb24iOiAiQSBzaW1wbGUgY29sbGVjdGlvbiBvZiBwZW5ndWlucy4iLCAiaW1hZ2UiOiAiZGF0YTppbWFnZS9zdmcreG1sO2Jhc2U2NCxQSE4yWnlCNGJXeHVjejBuYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWNuSUhCeVpYTmxjblpsUVhOd1pXTjBVbUYwYVc4OUozaE5hVzVaVFdsdUlHMWxaWFFuSUhacFpYZENiM2c5SnpBZ01DQXpOVEFnTXpVd0p6NDhjM1I1YkdVK0xtSmhjMlVnZXlCbWFXeHNPaUIzYUdsMFpUc2dabTl1ZEMxbVlXMXBiSGs2SUhObGNtbG1PeUJtYjI1MExYTnBlbVU2SURJMGNIZzdJSDA4TDNOMGVXeGxQanh5WldOMElIZHBaSFJvUFNjeE1EQWxKeUJvWldsbmFIUTlKekV3TUNVbklHWnBiR3c5SjJKc1lXTnJKeUF2UGp4MFpYaDBJSGc5SnpVd0pTY2dlVDBuTlRBbEp5QmpiR0Z6Y3owblltRnpaU2NnWkc5dGFXNWhiblF0WW1GelpXeHBibVU5SjIxcFpHUnNaU2NnZEdWNGRDMWhibU5vYjNJOUoyMXBaR1JzWlNjK1JYQnBZMEZ1WjNKNVJYSmxZM1F0WTNKbGMzUmxaRHd2ZEdWNGRENDhMM04yWno0PSIsICJhdHRyaWJ1dGVzIjogW3sidmFsdWUiOiAiRXBpYyJ9LCB7InZhbHVlIjogIkFuZ3J5In0sIHsidmFsdWUiOiAiRXJlY3QtY3Jlc3RlZCJ9XX0='
    )
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
