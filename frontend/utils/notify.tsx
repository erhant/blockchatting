import { NotificationProps, showNotification, updateNotification } from "@mantine/notifications"
import { ContractTransaction } from "ethers"
import { ReactNode } from "react"
import { X, InfoCircle, Check } from "tabler-icons-react"
import { randomUniqueString, truncateAddress } from "./utility"

const ICONSIZE = 18
const NOTIF_SX = {
  width: "min(90vw,400px)",
}
const AUTO_CLOSE_DEFAULT: number = 4000 // ms
type VariantType = "error" | "info" | "success"
function variantToColor(variant: VariantType): string {
  return {
    error: "red",
    info: "yellow",
    success: "green",
  }[variant]
}
function variantToIcon(variant: VariantType): ReactNode {
  return {
    error: <X size={ICONSIZE} />,
    info: <InfoCircle size={ICONSIZE} />,
    success: <Check size={ICONSIZE} />,
  }[variant]
}

/**
 * Create a notification using @mantine/notifications.
 * @param {ReactNode} title notification title, appears at the top
 * @param {ReactNode} message notification body
 * @param {VariantType} variant adjust styling
 * @returns {string} notification ID
 */
export const notify = (title: ReactNode, message: ReactNode, variant: VariantType): string => {
  if (variant == "error") console.log(message)
  const id = randomUniqueString()
  showNotification({
    id,
    title,
    message,
    icon: variantToIcon(variant),
    color: variantToColor(variant),
    sx: NOTIF_SX,
    autoClose: AUTO_CLOSE_DEFAULT,
  })
  return id
}

/**
 * A generic error message notifier. Parses the error in the given object.
 * - if error has data property, and data has message property, we use that
 * - else if error has message property, we use that
 * - else just use error as is
 *
 * @param {any} error object caught during try-catch
 * @param {string} title optional title
 * @returns {string} notification ID
 */
export const notifyError = (error: any, title: string = "Error", log: boolean = true): string => {
  // extract message
  let message = ""
  if (Object.hasOwn(error, "data") && Object.hasOwn(error.data, "message")) {
    message = error.data.message
  } else if (Object.hasOwn(error, "message")) {
    message = error.message
  } else {
    message = error.toString()
  }

  // log to console optionally
  if (log) {
    console.log("!!!", title, "!!!")
    console.log(error)
  }

  const id = randomUniqueString()
  showNotification({
    id,
    title,
    message,
    icon: variantToIcon("error"),
    color: variantToColor("error"),
    autoClose: false,
    sx: NOTIF_SX,
  })
  return id
}

/**
 * A generic transaction notifier. It tells you that the transaction is waiting to be mined.
 * @param {ContractTransaction} tx transaction object
 * @returns {string} notification ID
 */
export const notifyTransaction = (tx: ContractTransaction): string => {
  const id = randomUniqueString()
  showNotification({
    id,
    title: "Transaction Submitted",
    message: `Waiting ${truncateAddress(tx.hash)} to be mined`,
    icon: variantToIcon("info"),
    color: variantToColor("info"),
    autoClose: false,
    disallowClose: true,
    loading: true,
    sx: NOTIF_SX,
  })
  return id
}

/**
 * Update an existing transaction notification. Mostly done to show the result of a pending transaction.
 * @param {string} id notification ID from the notifyTransaction
 * @param message message to be updated
 * @param variant
 * @see notifyTransaction
 */
export const notifyTransactionUpdate = (id: string, message?: ReactNode, variant?: VariantType) => {
  updateNotification({
    id,
    title: "Transaction Complete",
    message,
    icon: variant && variantToIcon(variant),
    color: variant && variantToColor(variant),
    autoClose: AUTO_CLOSE_DEFAULT,
    disallowClose: false,
  })
}
