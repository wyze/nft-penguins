import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  Link,
  SimpleGrid,
  Text,
} from '@chakra-ui/react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { address, getContract } from '../lib/contract'
import { useMutation, useQuery, useQueryClient } from 'react-query'
import { useEffect, useState } from 'react'

import Head from 'next/head'

export default function Home() {
  const [tokenId, setTokenId] = useState(-1)

  const queryClient = useQueryClient()
  const { data: [account] = [], status } = useQuery('accounts', () =>
    window.ethereum.request<string[]>({ method: 'eth_accounts' })
  )
  const request = useMutation(
    () => window.ethereum.request({ method: 'eth_requestAccounts' }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('accounts')
      },
    }
  )

  const current = useQuery('current', async () => {
    const transaction = await getContract().getTokenCount()

    return transaction.toNumber()
  })
  const max = useQuery('max', async () => {
    const transaction = await getContract().maxTotalSupply()

    return transaction.toNumber()
  })

  const chainId = useQuery('chain', () =>
    window.ethereum.request<string>({ method: 'eth_chainId' })
  )

  const mint = useMutation(
    async () => {
      const transaction = await getContract().makeAnEpicNFT()

      await transaction.wait()

      return transaction.hash
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('current')
      },
    }
  )

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
    getContract().on('Minted', (_, tokenId) => {
      setTokenId(tokenId.toNumber())
      queryClient.invalidateQueries('current')
    })
  }, [queryClient])

  return (
    <Flex direction="column" flex="1" minHeight="100vh">
      <Box boxShadow="md">
        <Flex align="center" p="5">
          <Heading color="cyan.700" size="md">
            Penguins
          </Heading>

          <Link
            href="https://testnets.opensea.io/collection/wyze-penguins"
            color="blue.600"
            isExternal
            display="flex"
            alignItems="center"
            ml="auto"
            gridGap={2}
          >
            OpenSea <ExternalLinkIcon height={18} width={18} />
          </Link>
          <Link
            href={`https://rinkeby.etherscan.io/address/${address}`}
            color="blue.600"
            isExternal
            display="flex"
            alignItems="center"
            ml={5}
            gridGap={2}
          >
            Etherscan <ExternalLinkIcon height={18} width={18} />
          </Link>
          <Link
            href="https://github.com/wyze/nft-penguins"
            color="blue.600"
            isExternal
            display="flex"
            alignItems="center"
            ml={5}
            gridGap={2}
          >
            GitHub <ExternalLinkIcon height={18} width={18} />
          </Link>
        </Flex>
      </Box>
      <Container
        centerContent
        justifyContent="center"
        mt="10ch"
        maxW="container.xl"
      >
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
                  Minted: {current.data} / {max.data}
                </Text>
              </>
            ) : (
              <Text color="red.600" fontSize="lg" textAlign="center">
                You are not connected to Rinkeby network. Please change the
                network you are connected to in your wallet.
              </Text>
            )
          ) : (
            <Text color="gray.500" textAlign="center">
              Connect your Ethereum wallet to Rinkeby Testnet and mint a sweet
              NFT!
            </Text>
          )}

          <Center>
            {account || status === 'loading' ? (
              <Flex direction="column" gridGap={5}>
                <Button
                  colorScheme="teal"
                  isLoading={status === 'loading' || mint.status === 'loading'}
                  onClick={() => mint.mutate()}
                  variant="outline"
                >
                  Mint NFT
                </Button>
                {mint.status === 'success' ? (
                  <Flex direction="column" gridGap={1}>
                    <Text fontSize="sm">
                      View on{' '}
                      <Link
                        color="blue.300"
                        href={`https://rinkeby.etherscan.io/tx/${mint.data}`}
                        isExternal
                      >
                        Etherscan
                      </Link>
                    </Text>
                    <Text fontSize="sm">
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
      </Container>
    </Flex>
  )
}
