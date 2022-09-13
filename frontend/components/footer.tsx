import {Anchor, Box, Text} from '@mantine/core';
import {FC} from 'react';

const Footer: FC = () => {
  return (
    <Box component="footer">
      <Text>
        Made with &hearts; by <Anchor href="https://github.com/erhant">erhant</Anchor>
      </Text>
    </Box>
  );
};

export default Footer;
