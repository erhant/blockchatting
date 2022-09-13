import {Box, Container, Text, Group} from '@mantine/core';
import ThemeToggleButton from './theme-toggle-button';
import WalletConnectionButton from './wallet-connection-button';
import Link from 'next/link';
import WalletDisplayButton from './wallet-display-button';
import {FC} from 'react';

const Header: FC = () => {
  return (
    <Box component="header">
      <Container>
        <Group>
          <Text
            variant="gradient"
            gradient={{from: 'primary', to: 'secondary', deg: 45}}
            sx={{fontSize: '1.5em', fontWeight: 800}}
            inline
          >
            <Link href="/">Blockchattin</Link>
          </Text>

          {/* pushes the succeeding contents to the right */}
          <span style={{flexGrow: 1}} />

          <WalletConnectionButton />
          <WalletDisplayButton />
          <ThemeToggleButton />
        </Group>
      </Container>
    </Box>
  );
};

export default Header;
