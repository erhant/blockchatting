import chai from "chai"
import chaiAsPromised from "chai-as-promised"

import { ContractReceipt } from "ethers"
import { Result } from "ethers/lib/utils"

chai.use(chaiAsPromised)
const { expect } = chai

/**
 * A general purpose event-checking utility.
 * @param receipt transaction receipt
 * @param name name of the event
 * @param checkArgs if there are arguments, this check should return true.
 */
export const expectEvent = (receipt: ContractReceipt, name: string, checkArgs?: (r: Result) => boolean) => {
  if (receipt.events) {
    // there should be one event related to us here
    expect(
      receipt.events.some((e) => {
        // should have the event name
        expect(e.event).to.eq(name)
        // if it has arguments, it must pass our check function
        if (e.args) {
          expect(checkArgs).to.be.not.undefined
          expect(checkArgs!(e.args)).to.eq(true)
        }
        return true
      })
    ).to.be.true
  } else {
    expect.fail("No events found in this receipt!")
  }
}
