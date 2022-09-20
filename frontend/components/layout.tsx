import {Container} from '@mantine/core';
import type {FC, ReactNode} from 'react';
import styles from '../styles/layout.module.scss';

const Layout: FC<{
  children: ReactNode;
  centered?: boolean;
}> = ({children, centered}) => {
  return (
    <div className={styles['layout']}>
      {centered && <div style={{flexGrow: 1}} />}
      <Container>{children}</Container>
      <div style={{flexGrow: 1}} />
    </div>
  );
};

export default Layout;
