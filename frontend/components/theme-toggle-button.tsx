import {ActionIcon, Affix, useMantineColorScheme} from '@mantine/core';
import {FC} from 'react';
import {IconSun, IconMoon} from '@tabler/icons';

const ICON_SIZE = 24;
const ThemeToggleButton: FC = () => {
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();

  return (
    <Affix position={{left: 20, bottom: 20}}>
      <ActionIcon onClick={() => toggleColorScheme()}>
        {colorScheme === 'dark' ? <IconSun size={ICON_SIZE} /> : <IconMoon size={ICON_SIZE} />}
      </ActionIcon>
    </Affix>
  );
};

export default ThemeToggleButton;
