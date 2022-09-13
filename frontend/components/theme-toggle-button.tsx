import {ActionIcon, useMantineColorScheme} from '@mantine/core';
import {FC} from 'react';
import {SunIcon, MoonIcon} from '@heroicons/react/24/solid';

const ICON_SIZE = 24;
const ThemeToggleButton: FC = () => {
  const {colorScheme, toggleColorScheme} = useMantineColorScheme();

  return (
    <ActionIcon onClick={() => toggleColorScheme()}>
      {colorScheme === 'dark' ? <SunIcon fontSize="1.2em" /> : <MoonIcon fontSize="1.2em" />}
    </ActionIcon>
  );
};

export default ThemeToggleButton;
