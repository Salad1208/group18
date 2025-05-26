===============================================================================
UniCertify - Decentralized Academic Transcript Management System
===============================================================================

-------------------------------------------------------------------------------
1. Project Overview
-------------------------------------------------------------------------------

UniCertify is a blockchain-based system designed to manage the issuance, verification, and student review of academic transcripts. It leverages Ethereum smart contracts to ensure the integrity, immutability, and accessibility of academic records. The system provides distinct web portals for Institutions, Students, and Employers, each with tailored functionalities.

-------------------------------------------------------------------------------
2. Key Features
-------------------------------------------------------------------------------

* **Decentralized Storage**: Transcripts are recorded on the Ethereum blockchain (Sepolia testnet for this setup).
* **Role-Based Access**:
    * **Institutions**: Can issue new academic transcripts to students.
    * **Students**: Can view their transcript IDs, review their full transcript details, and accept or reject the accuracy of their issued transcripts.
    * **Employers/Verifiers**: Can verify the authenticity of a transcript by its ID and view its full details, including its status (e.g., Accepted by Student, Pending).
* **Wallet Integration**: Uses MetaMask for user authentication and interaction with the blockchain.
* **Transcript Status**: Transcripts go through a lifecycle (Pending, Accepted by Student, Rejected byStudent, Revoked by Institution).
* **Client-Side Interaction**: Most blockchain interactions are handled directly from the user's browser via Ethers.js.
* **Simple Web Server**: A Node.js/Express server is provided to serve the static HTML, CSS, and JavaScript files.

-------------------------------------------------------------------------------
3. Technology Stack
-------------------------------------------------------------------------------

* **Smart Contracts**: Solidity
    * `TranscriptDefs.sol`: Library defining shared data structures (Transcript, Course, Status enum) and events.
    * `TranscriptIssuance.sol`: Manages transcript issuance, status updates, and role-based access for institutions.
    * `TranscriptVerification.sol`: Handles retrieval and verification of transcript data by querying the Issuance contract.
* **Blockchain**: Ethereum (specifically for Sepolia testnet in this guide).
* **Frontend**: HTML, Tailwind CSS, JavaScript
* **Ethereum Interaction**: Ethers.js (v5)
* **Wallet**: MetaMask browser extension
* **Smart Contract IDE**: Remix IDE (https://remix.ethereum.org/)
* **Local Server (for Frontend)**: Node.js, Express.js

-------------------------------------------------------------------------------
4. Prerequisites
-------------------------------------------------------------------------------

Before you begin, ensure you have the following installed/set up:

* **Node.js and npm/yarn**: For running the local web server. (https://nodejs.org/)
* **MetaMask**: Browser extension for interacting with the Ethereum blockchain. (https://metamask.io/)
    * Configured with an account on the Sepolia testnet.
    * Funded with some Sepolia ETH (for gas fees). You can get Sepolia ETH from a faucet (e.g., sepoliafaucet.com, sepolia-faucet.pk910.de).
* **Web Browser**: A modern web browser like Chrome, Firefox, or Brave that supports MetaMask.
* **Project Files**: The `contracts` directory (containing `.sol` files) and the `public` directory (containing HTML, JS, etc.), and `server.js`.

-------------------------------------------------------------------------------
5. Project Setup and Installation
-------------------------------------------------------------------------------

**Step 1: Prepare Smart Contracts in Remix IDE**

   a. **Open Remix IDE**: Go to https://remix.ethereum.org/.

   b. **Load Contracts**:
      * Create a new workspace or use the default one.
      * In the "File Explorers" panel, create the following files and paste their respective code:
         * `TranscriptDefs.sol`
         * `TranscriptIssuance.sol` (ensure its `import "./TranscriptDefs.sol";` path is correct)
         * `TranscriptVerification.sol` (ensure its `import "./TranscriptDefs.sol";` path is correct)
      * If your contracts import OpenZeppelin contracts (e.g., `@openzeppelin/contracts/...`), ensure the import paths are correct for Remix. Remix can often resolve these from GitHub directly (e.g., `import "@openzeppelin/contracts/access/AccessControl.sol";`).

   c. **Compile Smart Contracts**:
      * Go to the "Solidity compiler" tab (third icon from the top on the left).
      * Select the correct compiler version (e.g., `0.8.20` or as specified in your `pragma solidity` line).
      * Select `TranscriptIssuance.sol` from the contract dropdown and click "Compile TranscriptIssuance.sol". Check for any errors.
      * Then, select `TranscriptVerification.sol` and click "Compile TranscriptVerification.sol". Check for errors.
      * (Compiling `TranscriptDefs.sol` directly isn't necessary if it's only a library imported by others, but ensure no errors arise from it during the compilation of the main contracts).

   d. **Deploy Smart Contracts to Sepolia using Remix**:
      * Go to the "Deploy & Run Transactions" tab in Remix (fourth icon).
      * **Environment**: Select "Injected Provider - MetaMask". MetaMask should pop up asking you to connect your account. Ensure MetaMask is set to the **Sepolia testnet**.
      * **Account**: Your connected MetaMask account address and balance (in Sepolia ETH) should be visible.

      * **Deploy `TranscriptIssuance.sol`**:
         1. From the "CONTRACT" dropdown, select `TranscriptIssuance - contracts/TranscriptIssuance.sol`.
         2. Click the orange "Deploy" button.
         3. MetaMask will pop up asking you to confirm the transaction (pay gas fees). Confirm it.
         4. Wait for the transaction to be mined. Once successful, the deployed contract will appear under "Deployed Contracts" at the bottom of the Remix panel.
         5. **CRITICAL**: Copy the deployed address of `TranscriptIssuance` (using the copy icon next to its name/address) and save it in a temporary text file. You'll need this for the next step and for `scripts.js`.

      * **Deploy `TranscriptVerification.sol`**:
         1. From the "CONTRACT" dropdown, select `TranscriptVerification - contracts/TranscriptVerification.sol`.
         2. Next to the "Deploy" button, there's an input field for constructor arguments. Paste the **deployed address of `TranscriptIssuance`** (that you just copied) into this field.
         3. Click the orange "Deploy" button.
         4. MetaMask will pop up for confirmation. Confirm it.
         5. Wait for the transaction. The `TranscriptVerification` contract will appear under "Deployed Contracts".
         6. **CRITICAL**: Copy the deployed address of `TranscriptVerification` and save it.

      * **Grant INSTITUTION_ROLE **:
         1. Under "Deployed Contracts" in Remix, find your deployed `TranscriptIssuance` contract.
         2. Expand it to see its functions.
         3. Find the `grantInstitutionRole` function.
         4. In the input field next to `_institutionAccount (address)`, paste the Ethereum address you want to grant the institution role to (e.g., your MetaMask account address that will be issuing transcripts).
         5. Click the `grantInstitutionRole` button.
         6. MetaMask will pop up to confirm the transaction. Confirm it.

**Step 2: Configure Frontend (`public/scripts.js`)**

   a. **Open `public/scripts.js`** in a text editor.

   b. **Update Contract Addresses**:
      Find these lines and replace the placeholder/old addresses with your actual deployed Sepolia contract addresses that you saved from Remix:
      ```javascript
      const issuanceContractAddress = "YOUR_DEPLOYED_TRANSCRIPT_ISSUANCE_ADDRESS"; 
      // ...
      const verificationContractAddress = "YOUR_DEPLOYED_TRANSCRIPT_VERIFICATION_ADDRESS"; 
      ```
**Step 3: Run the Local Web Server**

   a. **Navigate to your project's root directory** in your terminal/command prompt (the directory containing `server.js` and the `public` folder).

   b. **Install Server Dependencies** (if not already done):
      If you have a `package.json` file in this directory:
      ```bash
      npm install
      ```
      Otherwise, to install Express locally for this project:
      ```bash
      npm install express
      ```

   c. **Start the Server**:
      ```bash
      node server.js
      ```
      You should see a message like: `Server is running on http://localhost:3000`.

-------------------------------------------------------------------------------
6. Running the Application
-------------------------------------------------------------------------------

1.  **MetaMask Setup**:
    * Ensure MetaMask is installed and unlocked.
    * **Crucially, ensure MetaMask is connected to the Sepolia testnet.**
    * The account you use for issuing transcripts must have been granted the `INSTITUTION_ROLE` on the `TranscriptIssuance` contract.

2.  **Access the Application**:
    * Open your web browser and navigate to `http://localhost:3000`. This should load the `index.html` page.

3.  **Using the Portals**:
    * **Login Page (`index.html`)**: Select your role and click "Go to Portal".
    * **Institution Portal (`institution.html`)**:
        * Click "Connect Wallet". MetaMask will prompt for connection (ensure it's the account with `INSTITUTION_ROLE`).
        * Fill in transcript details and click "Issue Transcript (On-Chain)". Confirm in MetaMask.
    * **Student Portal (`student.html`)**:
        * Click "Connect Wallet".
        * Click "Load My Transcripts".
        * Click "View Details" for a transcript.
        * If "Pending" and you are the student, "Accept" / "Reject" buttons will appear. Use them and confirm in MetaMask.
    * **Employer Portal (`employer.html`)**:
        * Enter a Transcript ID and click "Verify" to see its details and status.

-------------------------------------------------------------------------------
7. Project Structure (Simplified)
-------------------------------------------------------------------------------

/
|-- contracts/                 # .sol files (you'll manage these in Remix)
|   |-- TranscriptDefs.sol
|   |-- TranscriptIssuance.sol
|   |-- TranscriptVerification.sol
|-- public/                    # Frontend files served by the server
|   |-- login.html
|   |-- institution.html
|   |-- student.html
|   |-- employer.html
|   |-- scripts.js             # Main client-side JavaScript logic
|-- server.js                  # Node.js/Express server for static files
|-- package.json               # (Optional, for server dependencies like Express)
|-- README.txt                 # This file

-------------------------------------------------------------------------------
8. Important Notes
-------------------------------------------------------------------------------

* **Contract Addresses & ABIs**: The most common setup issue is incorrect contract addresses or ABIs in `public/scripts.js`. Always ensure they match your latest Sepolia deployment from Remix.
* **Gas Fees**: All transactions on Sepolia (issuing, accepting, rejecting) require Sepolia ETH for gas.
* **Network**: Ensure MetaMask is always set to Sepolia when interacting with the dApp.
* **Remix for Contract Interaction**: You can also directly interact with your deployed contracts on Sepolia using the "Deployed Contracts" section in Remix for debugging or administrative tasks.

-------------------------------------------------------------------------------
9. Troubleshooting
-------------------------------------------------------------------------------

* **"MetaMask not installed"**: Ensure the MetaMask extension is installed.
* **"Wallet not connected" / Buttons disabled**: Click "Connect Wallet". Check MetaMask is on Sepolia.
* **Transactions fail/revert**:
    * Check the browser console (F12) and Remix console for errors.
    * Ensure the active MetaMask account has Sepolia ETH.
    * Verify necessary roles (e.g., `INSTITUTION_ROLE`).
* **"Function not found on contract object" (in browser console)**: This means the ABI in `scripts.js` does not match the deployed contract. Get the fresh ABI from Remix's compiler details and update `scripts.js`.
* **Data not loading**: Verify contract addresses in `scripts.js` and MetaMask network.

===============================================================================


