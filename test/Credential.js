const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("CraftLearnCredential", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployCraftLearnCredential() {
    // Contracts are deployed using the first signer/account by default
    const [owner, student1, student2, student3] = await ethers.getSigners();

    const CraftLearnCredential = await ethers.getContractFactory(
      "CraftLearnCredential"
    );
    const craftLearnCredential = await CraftLearnCredential.deploy();

    return { owner, student1, student2, student3, craftLearnCredential };
  }

  describe("Deployment", function () {
    it("Should set the right ERC721 name", async function () {
        const { craftLearnCredential } = await loadFixture(
            deployCraftLearnCredential
        );
    
        expect(await craftLearnCredential.name()).to.equal(
          "CraftLearn Skill Credential"
        );
    });

    it("Should set the right ERC721 symbol", async function () {
        const { craftLearnCredential } = await loadFixture(
            deployCraftLearnCredential
        );
    
        expect(await craftLearnCredential.symbol()).to.equal("CRAFT-CRED");
    });
  });

  describe("Credential Creation", function () {
    it("Should register students", async function () {
      const { student1, student2, craftLearnCredential } =
        await loadFixture(deployCraftLearnCredential);

      const studentAddresses = [student1.address, student2.address];

      const tx = await craftLearnCredential.registerStudents(studentAddresses);
      const receipt = await tx.wait();

      const checkStatus1 = await craftLearnCredential.isStudent(student1.address);
      const checkStatus2 = await craftLearnCredential.isStudent(student2.address);

      expect(checkStatus1).to.equal(true);
      expect(checkStatus2).to.equal(true);
    });
  });

  describe("Credential Minting", function () {
    it("Should mint a credential", async function () {
      const { student1, craftLearnCredential } =
        await loadFixture(deployCraftLearnCredential);

      //    "Course Name", "Issuer Name", "Issuer URL", "Certificate URL";
      const courseName = "Blockchain Basics";
      const tokenUri = "https://craftlearn.com/certificate/12345";
      const learnerName = "CraftLearn Academy";
      const issuerUrl = "https://craftlearn.com";

      const registrationTx = await craftLearnCredential.registerStudents([student1.address]);
      await registrationTx.wait();

      const tx = await craftLearnCredential
        .connect(student1)
        .mintCredential(courseName, tokenUri, learnerName);
      const receipt = await tx.wait();

      expect(await craftLearnCredential.ownerOf(1)).to.equal(student1.address);
    });
  });

//   describe("Withdrawals", function () {
//     describe("Validations", function () {
//       it("Should revert with the right error if called too soon", async function () {
//         const { lock } = await loadFixture(deployOneYearLockFixture);

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet"
//         );
//       });

//       it("Should revert with the right error if called from another account", async function () {
//         const { lock, unlockTime, otherAccount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime);

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner"
//         );
//       });

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const { lock, unlockTime } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).not.to.be.reverted;
//       });
//     });

//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });

//     describe("Transfers", function () {
//       it("Should transfer the funds to the owner", async function () {
//         const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount]
//         );
//       });
//     });
//   });
});
