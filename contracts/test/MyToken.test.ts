import { ethers } from "hardhat"
import chai from "chai"
import chaiAsPromised from "chai-as-promised"
import { MyToken__factory, MyToken } from "../../frontend/types/typechain/index"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers"
import { BigNumber } from "ethers"
import contractConstants from "../../frontend/constants/contractConstants"
import { expectEvent } from "../utilities/testing"

chai.use(chaiAsPromised)
const { expect } = chai

describe(contractConstants.MyToken.contractName, function () {
  let myTokenContract: MyToken

  // signers, first one is the owner (the one who deploys)
  let owner: SignerWithAddress
  let addr1: SignerWithAddress
  let addr2: SignerWithAddress
  let addrs: SignerWithAddress[]

  // deploy the contract before each test
  beforeEach(async function () {
    const factory = ((await ethers.getContractFactory(
      contractConstants.MyToken.contractName
    )) as unknown) as MyToken__factory
    ;[owner, addr1, addr2, ...addrs] = await ethers.getSigners()
    myTokenContract = await factory.deploy(
      contractConstants.MyToken.totalSupply,
      contractConstants.MyToken.tokenName,
      contractConstants.MyToken.tokenSymbol
    )
    await myTokenContract.deployed()
  })

  // test about the state on deployment
  describe("deployment", function () {
    it("should have the correct name, symbol and total supply", async function () {
      expect(await myTokenContract.name()).to.equal(contractConstants.MyToken.tokenName)
      expect(await myTokenContract.symbol()).to.equal(contractConstants.MyToken.tokenSymbol)
      expect(await myTokenContract.totalSupply()).to.equal(contractConstants.MyToken.totalSupply)
      expect(myTokenContract.address).to.properAddress
    })

    it("should assign the total supply of tokens to the owner", async function () {
      expect(await myTokenContract.totalSupply()).to.equal(await myTokenContract.balanceOf(owner.address))
    })
  })

  // test transferring tokens
  describe("transactions", function () {
    it("should transfer tokens between accounts", async function () {
      const t: number = 50 // how many tokens to transfer
      const ownerBalance: BigNumber = await myTokenContract.balanceOf(owner.address)

      // transfer tokens from owner to addr1
      const tx = await myTokenContract.transfer(addr1.address, t)
      expectEvent(await tx.wait(), "Transfer", (r) => {
        expect(r.from).to.eq(owner.address)
        expect(r.to).to.eq(addr1.address)
        expect(r.value).to.eq(t)
        return true
      })
      expect(await myTokenContract.balanceOf(owner.address)).to.equal(ownerBalance.sub(t))
      expect(await myTokenContract.balanceOf(addr1.address)).to.equal(t)

      // transfer tokens from addr1 to addr2
      // use .connect(signer) to send a transaction from another account
      await myTokenContract.connect(addr1).transfer(addr2.address, t)
      expect(await myTokenContract.balanceOf(addr1.address)).to.equal(0)
      expect(await myTokenContract.balanceOf(addr2.address)).to.equal(t)

      // transfer tokens back from addr2 to owner
      await myTokenContract.connect(addr2).transfer(owner.address, t)
      expect(await myTokenContract.balanceOf(addr2.address)).to.equal(0)
      expect(await myTokenContract.balanceOf(owner.address)).to.equal(ownerBalance)
    })

    it("should fail if the sender doesn't have enough tokens", async function () {
      const initialOwnerBalance: BigNumber = await myTokenContract.balanceOf(owner.address)

      // try to send 1 token from addr1 (who has 0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(myTokenContract.connect(addr1).transfer(owner.address, 1)).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      )

      // owner balance shouldn't have changed.
      expect(await myTokenContract.balanceOf(owner.address)).to.equal(initialOwnerBalance)
    })

    it("should only transferFrom if the sender has allowance for receiver", async function () {
      const t: number = 10 // how many tokens to transfer
      const initialOwnerBalance: BigNumber = await myTokenContract.balanceOf(owner.address)

      // try to send 1 token from addr1 (who has 0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(myTokenContract.connect(addr1).transferFrom(owner.address, addr1.address, 10)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      )

      // owner approves addr1 to take t tokens
      const tx = await myTokenContract.approve(addr1.address, t)
      expectEvent(await tx.wait(), "Approval", (r) => {
        expect(r.owner).to.eq(owner.address)
        expect(r.spender).to.eq(addr1.address)
        expect(r.value).to.eq(t)
        return true
      })

      // addr1 transfers t tokens from owner to itself
      await myTokenContract.connect(addr1).transferFrom(owner.address, addr1.address, 10)

      // addr1 should have t, and owner should have whatever minus t tokens
      expect(await myTokenContract.balanceOf(addr1.address)).to.equal(t)
      expect(await myTokenContract.balanceOf(owner.address)).to.equal(initialOwnerBalance.sub(t))
    })
  })
})
