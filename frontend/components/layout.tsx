import {Container} from '@mantine/core';
import type {FC, ReactNode} from 'react';
import styles from '../styles/layout.module.scss';

const Layout: FC<{
  children: ReactNode;
  centered?: boolean;
}> = ({children, centered}) => {
  return (
    <div className={styles['layout']}>
      {/* <Header /> */}
      {centered && <div style={{flexGrow: 1}} />}
      <Container size="xl">{children}</Container>
      <div style={{flexGrow: 1}} />
      {/* <Footer /> */}
    </div>
  );
};

export default Layout;
