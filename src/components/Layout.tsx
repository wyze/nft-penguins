import { Box, Button, Container, Flex, Heading, Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { address } from '../lib/contract'
import { useAccount } from '../lib/hooks'
import { useEffect } from 'react'
import { useQueryClient } from 'react-query'

import NextLink from 'next/link'
import Wallet from './Wallet'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const queryClient = useQueryClient()
  const { account } = useAccount()

  useEffect(() => {
    if (account) {
      queryClient.setDefaultOptions({ queries: { enabled: true } })
      queryClient.invalidateQueries()
    }
  }, [account, queryClient])

  return (
    <Flex direction="column" flex="1" minHeight="100vh">
      <Box boxShadow="md">
        <Flex align="center" p="5">
          <Heading color="cyan.700" size="md">
            <NextLink href="/">Penguins</NextLink>
          </Heading>

          <Flex gridGap={5} ml="auto">
            <Button variant="link">
              <NextLink href="/gallery">Gallery</NextLink>
            </Button>
            <Link
              href="https://testnets.opensea.io/collection/wyze-penguins"
              color="blue.600"
              isExternal
              display="flex"
              alignItems="center"
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
              gridGap={2}
            >
              GitHub <ExternalLinkIcon height={18} width={18} />
            </Link>
          </Flex>
        </Flex>
      </Box>
      <Container
        centerContent
        justifyContent="center"
        mt="3ch"
        maxW="container.xl"
      >
        <Wallet />
        <Box mb="6ch" />
        {children}
      </Container>
    </Flex>
  )
}
