import { Container } from "@mantine/core"
import type { FC, ReactNode } from "react"
import Footer from "./footer"
import Header from "./header"
import styles from "../styles/layout.module.scss"

const Layout: FC<{
  children: ReactNode
}> = ({ children }) => {
  return (
    <div className={styles["layout"]}>
      <Header />
      <Container>{children}</Container>
      <div style={{ flexGrow: 1 }} />
      <Footer />
    </div>
  )
}

export default Layout
