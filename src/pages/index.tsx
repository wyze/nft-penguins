import { Button, Center, Flex, Link, SimpleGrid, Text } from '@chakra-ui/react'
import { address, getContract } from '../lib/contract'
import { ethers } from 'ethers'
import { useAccount } from '../lib/hooks'
import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from 'react-query'

import Head from 'next/head'

const mintPrice = '0.0025'

export default function Home() {
  const [tokenId, setTokenId] = useState(-1)

  const queryClient = useQueryClient()
  const { account, status } = useAccount()
  const request = useMutation(
    () => window.ethereum.request({ method: 'eth_requestAccounts' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('accounts')
      },
    }
  )

  const balanceOfWallet = useQuery(
    ['balance-of-wallet', account],
    async () => {
      const transaction = await getContract().balanceOf(account)

      return transaction.toNumber() + 1
    },
    { enabled: Boolean(account) }
  )
  const maxPerAddress = useQuery(
    'max-per-address',
    async () => {
      const transaction = await getContract().maxPerAddress()

      return transaction.toNumber()
    },
    { enabled: Boolean(account) }
  )

  const currentTokens = useQuery('current-tokens', async () => {
    const transaction = await getContract().totalSupply()

    return transaction.toNumber()
  })
  const maxTokens = useQuery('max-tokens', async () => {
    const transaction = await getContract().maxTotalSupply()

    return transaction.toNumber()
  })

  const chainId = useQuery('chain', () =>
    window.ethereum.request<string>({ method: 'eth_chainId' })
  )

  const mint = useMutation(
    async () => {
      const transaction = await getContract().mint({
        value: ethers.utils.parseEther(mintPrice),
      })

      await transaction.wait()

      return transaction.hash
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries([
          'current-tokens',
          ['balance-of-wallet', account],
        ])
      },
    }
  )

  // const change = useMutation(() =>
  //   window.ethereum.request({
  //     method: 'wallet_switchEthereumChain',
  //     params: [{ chainId: `0x4` }],
  //   })
  // )

  useEffect(() => {
    if (window.ethereum) {
      const invalidateChain = () => {
        queryClient.invalidateQueries('chain')
      }

      window.ethereum.on('chainChanged', invalidateChain)

      return () => {
        window.ethereum.removeListener('chainChanged', invalidateChain)
      }
    }
  }, [queryClient])

  useEffect(() => {
    if (window.ethereum) {
      getContract().on('Minted', (_, tokenId) => {
        setTokenId(tokenId.toNumber())
        queryClient.invalidateQueries([
          'current-tokens',
          ['balance-of-wallet', account],
        ])
      })
    }
  }, [account, queryClient])

  return (
    <SimpleGrid column={1} spacing={10} w="75vw">
      <Head>
        <title>Penguins</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>⛏</text></svg>"
        ></link>
      </Head>

      {account ? (
        chainId.data === '0x4' ? (
          <>
            <Text color="teal.700" textAlign="center">
              Each unique. Each beautiful. Discover your NFT today.
            </Text>
            <Text
              color="orange.500"
              fontSize="lg"
              textAlign="center"
              fontWeight="bold"
            >
              Minted: {currentTokens.data} / {maxTokens.data}
            </Text>
          </>
        ) : (
          <Text color="red.600" fontSize="lg" textAlign="center">
            You are not connected to Rinkeby network. Please change the network
            you are connected to in your wallet.
          </Text>
        )
      ) : (
        <Text color="gray.500" textAlign="center">
          Connect your Ethereum wallet to Rinkeby Testnet and mint a sweet NFT!
        </Text>
      )}

      <Center>
        {account || status === 'loading' ? (
          <Flex direction="column" gridGap={5}>
            {Number(balanceOfWallet.data) > Number(maxPerAddress.data) ||
            Number(currentTokens.data) === Number(maxTokens.data) ? (
              <Button
                colorScheme="teal"
                isDisabled
                isLoading={status === 'loading' || mint.status === 'loading'}
                variant="outline"
              >
                Max NFTs Minted
              </Button>
            ) : (
              <Button
                colorScheme="teal"
                isLoading={status === 'loading' || mint.status === 'loading'}
                onClick={() => mint.mutate()}
                variant="outline"
              >
                Mint NFT {balanceOfWallet.data}/{maxPerAddress.data} for{' '}
                {mintPrice}
              </Button>
            )}
            {mint.status === 'success' ? (
              <Flex direction="column" gridGap={1}>
                <Text fontSize="sm" textAlign="center">
                  View on{' '}
                  <Link
                    color="blue.300"
                    href={`https://rinkeby.etherscan.io/tx/${mint.data}`}
                    isExternal
                  >
                    Etherscan
                  </Link>
                </Text>
                <Text fontSize="sm" textAlign="center">
                  View on{' '}
                  <Link
                    color="blue.300"
                    href={`https://testnets.opensea.io/assets/${address}/${tokenId}`}
                    isExternal
                  >
                    OpenSea
                  </Link>
                </Text>
              </Flex>
            ) : null}
          </Flex>
        ) : (
          <Button
            colorScheme="orange"
            isLoading={request.status === 'loading'}
            onClick={() => request.mutate()}
          >
            Connect Wallet
          </Button>
        )}
      </Center>
    </SimpleGrid>
  )
}
