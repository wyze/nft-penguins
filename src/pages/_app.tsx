import type { AppProps } from 'next/app'

import { Box, Button, Container, Flex, Heading, Link } from '@chakra-ui/react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import { address } from '../lib/contract'

import NextLink from 'next/link'

const queryClient = new QueryClient()
const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue, sans-serif',
        height: '100vh',
        margin: 0,
        padding: 0,
      },
    },
  },
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
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
            mt="10ch"
            maxW="container.xl"
          >
            <Component {...pageProps} />
          </Container>
        </Flex>
      </QueryClientProvider>
    </ChakraProvider>
  )
}
