// scripts.js (Conceptual for On-Chain with Multi-Page Structure)

document.addEventListener('DOMContentLoaded', () => {
    // --- On-Chain Configuration ---
    // !!! IMPORTANT: Replace with your deployed contract addresses and ABIs !!!
    const issuanceContractAddress = "0x55c1ca87b9dba3f83885fd51ae684e949a32e112";
    const issuanceContractAbi = [
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [],
		"name": "AccessControlBadConfirmation",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "neededRole",
				"type": "bytes32"
			}
		],
		"name": "AccessControlUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "previousAdminRole",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "newAdminRole",
				"type": "bytes32"
			}
		],
		"name": "RoleAdminChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleGranted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "account",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "sender",
				"type": "address"
			}
		],
		"name": "RoleRevoked",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "transcriptId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "studentAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "studentId",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "issuingInstitution",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "issuer",
				"type": "address"
			}
		],
		"name": "TranscriptIssued",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "DEFAULT_ADMIN_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "INSTITUTION_ROLE",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_transcriptId",
				"type": "uint256"
			}
		],
		"name": "doesTranscriptExist",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			}
		],
		"name": "getRoleAdmin",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "",
				"type": "bytes32"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_transcriptId",
				"type": "uint256"
			}
		],
		"name": "getTranscriptById",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "studentAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "studentName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "studentId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "issuingInstitution",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "programName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "graduationDate",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "string",
								"name": "name",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "grade",
								"type": "string"
							}
						],
						"internalType": "struct TranscriptIssuance.Course[]",
						"name": "courses",
						"type": "tuple[]"
					},
					{
						"internalType": "address",
						"name": "issuerAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "issueTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isValid",
						"type": "bool"
					}
				],
				"internalType": "struct TranscriptIssuance.Transcript",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			}
		],
		"name": "getTranscriptIdsForStudent",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_institutionAccount",
				"type": "address"
			}
		],
		"name": "grantInstitutionRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "grantRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "hasRole",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_account",
				"type": "address"
			}
		],
		"name": "isInstitution",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_studentName",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "_studentId",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_issuingInstitution",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_programName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_graduationDate",
				"type": "uint256"
			},
			{
				"internalType": "string[]",
				"name": "courseNames",
				"type": "string[]"
			},
			{
				"internalType": "string[]",
				"name": "courseGrades",
				"type": "string[]"
			}
		],
		"name": "issueTranscriptManual",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "callerConfirmation",
				"type": "address"
			}
		],
		"name": "renounceRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_institutionAccount",
				"type": "address"
			}
		],
		"name": "revokeInstitutionRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "role",
				"type": "bytes32"
			},
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "revokeRole",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes4",
				"name": "interfaceId",
				"type": "bytes4"
			}
		],
		"name": "supportsInterface",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]; // Get from compiled TranscriptIssuance.sol

    const verificationContractAddress = "0x35d400dccb5680b58bec11091724bf3d3f77eee0";
    const verificationContractAbi = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_transcriptId",
				"type": "uint256"
			}
		],
		"name": "doesTranscriptExist",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_transcriptId",
				"type": "uint256"
			}
		],
		"name": "getTranscriptById",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "studentAddress",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "studentName",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "studentId",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "issuingInstitution",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "programName",
						"type": "string"
					},
					{
						"internalType": "uint256",
						"name": "graduationDate",
						"type": "uint256"
					},
					{
						"components": [
							{
								"internalType": "string",
								"name": "name",
								"type": "string"
							},
							{
								"internalType": "string",
								"name": "grade",
								"type": "string"
							}
						],
						"internalType": "struct ITranscriptIssuance.Course[]",
						"name": "courses",
						"type": "tuple[]"
					},
					{
						"internalType": "address",
						"name": "issuerAddress",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "issueTimestamp",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isValid",
						"type": "bool"
					}
				],
				"internalType": "struct ITranscriptIssuance.Transcript",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_studentAddress",
				"type": "address"
			}
		],
		"name": "getTranscriptIdsForStudent",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];



    // --- Ethers.js Setup ---
    let provider;
    let signer;
    let issuanceContract;       // For TranscriptIssuance
    let verificationContract;   // For TranscriptVerification
    let userAddress = null;

    // --- DOM Elements (Get them based on which page is loaded) ---
    // Shared
    const connectWalletBtn = document.getElementById('connectWalletBtnOnPage');
    const walletAddressSpan = document.getElementById('walletAddressOnPage');
    const logoutBtn = document.getElementById('logoutBtn');

    // Login Page (login.html)
    const loginForm = document.getElementById('loginForm');

    // Institution Page (institution.html)
    const issueTranscriptForm = document.getElementById('issueTranscriptForm');
    const institutionNameDisplay = document.getElementById('institutionName');
    const institutionMessageArea = document.getElementById('messageArea'); // Specific to institution page

    // Student Page (student.html)
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const studentTranscriptListArea = document.getElementById('studentTranscriptListArea');
    const studentTranscriptDetailsArea = document.getElementById('studentTranscriptDetailsArea');
    const loadMyTranscriptsBtn = document.getElementById('loadMyTranscriptsBtn');

    // Employer Page (employer.html)
    const employerNameDisplay = document.getElementById('employerNameDisplay');
    const verifyTranscriptIdInput = document.getElementById('verifyTranscriptId');
    const verifyTranscriptBtn = document.getElementById('verifyTranscriptBtn');
    const verificationResultArea = document.getElementById('verificationResult');

    // --- SHARED FUNCTIONS ---
    function displayMessage(areaElement, msg, isError = false, details = null) {
        if (!areaElement) return;
        areaElement.innerHTML = `
            <div class="${isError ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'} border-l-4 p-4 rounded-md">
                <p class="font-bold">${isError ? 'Error!' : 'Success!'}</p>
                <p>${msg}</p>
                ${details ? `<p class="text-xs mt-2">Details: ${details}</p>` : ''}
            </div>`;
        areaElement.style.display = 'block';
        setTimeout(() => { areaElement.style.display = 'none'; }, 10000);
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('uniCertifySimulatedRole');
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            userAddress = null;
            signer = null;
            issuanceContract = null;      // Invalidate contract instance
            verificationContract = null;  // Invalidate contract instance
            window.location.href = 'index.html';
        });
    }

    // --- Wallet Connection Logic (SHARED) ---
    async function connectWalletAndInitialize() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = await signer.getAddress();

                // Initialize both contract instances
                issuanceContract = new ethers.Contract(issuanceContractAddress, issuanceContractAbi, signer);
                // Verification contract can also use signer, or provider if only for reads initially
                verificationContract = new ethers.Contract(verificationContractAddress, verificationContractAbi, signer);


                if (connectWalletBtn) {
                    connectWalletBtn.textContent = 'Wallet Connected';
                    connectWalletBtn.disabled = true;
                }
                if (walletAddressSpan) {
                    walletAddressSpan.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                }
                console.log("Wallet Connected. Address:", userAddress);
                console.log("Issuance Contract Initialized:", issuanceContract.address);
                console.log("Verification Contract Initialized:", verificationContract.address);


                window.ethereum.on('accountsChanged', handleAccountsChangedOnChain);
                return true;
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Failed to connect wallet. Ensure MetaMask is unlocked and configured.");
                return false;
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this dApp.');
            return false;
        }
    }

    function handleAccountsChangedOnChain(accounts) {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
            userAddress = null;
            signer = null;
            issuanceContract = null;
            verificationContract = null;
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            alert("Wallet disconnected. Please reconnect if needed.");
            if (studentTranscriptListArea) studentTranscriptListArea.innerHTML = '<p>Wallet disconnected.</p>';
        } else {
            connectWalletAndInitialize().then(success => {
                if (success) {
                    if (document.body.id === 'studentPage' && studentTranscriptListArea) {
                        studentTranscriptListArea.innerHTML = '<p>Account changed. Click "Load My Transcripts".</p>';
                    }
                    // Could also refresh other page-specific data if needed
                }
            });
        }
    }

    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWalletAndInitialize);
    }


    // --- LOGIN PAGE (login.html) ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = loginForm.role.value;
            sessionStorage.setItem('uniCertifySimulatedRole', role);
            if (role === 'institution') window.location.href = 'institution.html';
            else if (role === 'student') window.location.href = 'student.html';
            else if (role === 'employer') window.location.href = 'employer.html';
        });
    }

    // --- INSTITUTION PORTAL (institution.html) ---
    if (issueTranscriptForm) {
        const currentRole = sessionStorage.getItem('uniCertifySimulatedRole');
        if (institutionNameDisplay && currentRole === 'institution') {
            institutionNameDisplay.textContent = `Institution Portal (Connect Wallet to Issue)`;
        }

        // Placeholder for dynamic course rows logic - ensure this is implemented
        // window.addCourse = function() { /* ... */ };
        // window.removeCourse = function(button) { /* ... */ };
        // const addCourseBtn = document.getElementById('addCourseBtn');
        // if(addCourseBtn) addCourseBtn.addEventListener('click', addCourse);
        // Make sure your HTML has these elements and functions for adding/removing courses.

        issueTranscriptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!issuanceContract || !signer || !userAddress) { // Check issuanceContract
                alert("Please connect your Institution's wallet first.");
                return;
            }
            // Check if connected account is an institution (optional client-side check, contract enforces it)
            // try {
            //     const isInst = await issuanceContract.isInstitution(userAddress);
            //     if (!isInst) {
            //         alert("Connected wallet does not have the Institution role on-chain.");
            //         return;
            //     }
            // } catch (roleError) {
            //     console.error("Error checking institution role:", roleError);
            //     alert("Could not verify institution role. Ensure contracts are correctly set up.");
            //     return;
            // }


            displayMessage(institutionMessageArea, "Processing transaction...", false);
            const formData = new FormData(issueTranscriptForm);
            const studentName = formData.get('studentName');
            const studentEthAddress = formData.get('studentEthAddress');
            const studentId = formData.get('studentId');
            const issuingInstitutionName = formData.get('issuingInstitution'); // Changed to issuingInstitutionName for clarity
            const programName = formData.get('programName');
            const graduationDateStr = formData.get('graduationDate');
            const graduationTimestamp = Math.floor(new Date(graduationDateStr).getTime() / 1000);
            const courseNames = formData.getAll('courseName[]');
            const courseGrades = formData.getAll('courseGrade[]');

            if (!ethers.utils.isAddress(studentEthAddress)) {
                displayMessage(institutionMessageArea, "Invalid Student Ethereum Address.", true); return;
            }

            try {
                console.log("Calling issueTranscriptManual on Issuance Contract...");
                // Call issueTranscriptManual on issuanceContract
                const tx = await issuanceContract.issueTranscriptManual(
                    studentName, studentEthAddress, studentId, issuingInstitutionName,
                    programName, graduationTimestamp, courseNames, courseGrades
                );
                displayMessage(institutionMessageArea, "Transaction sent, waiting for confirmation...", false, `Tx: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log("Transaction confirmed:", receipt);

                let issuedTranscriptId = "N/A";
                // Event "TranscriptIssued" is emitted by TranscriptIssuance contract
                if (receipt && receipt.events && receipt.events.length > 0) {
                    const issueEvent = receipt.events.find(ev => ev.event === "TranscriptIssued");
                    if (issueEvent && issueEvent.args && issueEvent.args.transcriptId !== undefined) {
                        issuedTranscriptId = issueEvent.args.transcriptId.toString();
                    }
                }
                displayMessage(institutionMessageArea, `Transcript Issued! ID: ${issuedTranscriptId}`, false, `Tx: ${receipt.transactionHash}`);
                issueTranscriptForm.reset();
                // Reset course rows if you have dynamic course row logic
                // document.getElementById('coursesContainer').innerHTML = ''; // Example
                // addCourse(); // Add one initial course row back
            } catch (error) {
                console.error("Error issuing transcript:", error);
                let errMsg = "Failed to issue transcript.";
                if (error.reason) errMsg += ` Reason: ${error.reason}`;
                else if (error.data?.message) errMsg += ` Reason: ${error.data.message}`;
                else if (error.message) errMsg += ` Details: ${error.message}`;
                displayMessage(institutionMessageArea, errMsg, true);
            }
        });
    }

    // --- STUDENT PORTAL (student.html) ---
    if (loadMyTranscriptsBtn) {
        const currentRole = sessionStorage.getItem('uniCertifySimulatedRole');
        if (studentNameDisplay && currentRole === 'student') {
            studentNameDisplay.textContent = `Student Portal (Connect Wallet to View)`;
        }

        loadMyTranscriptsBtn.addEventListener('click', async () => {
            // Use verificationContract for read operations
            if (!verificationContract || !userAddress) {
                alert("Please connect your Student wallet first.");
                return;
            }
            studentTranscriptListArea.innerHTML = '<p>Loading your transcript IDs from blockchain...</p>';
            try {
                // Call getMyTranscriptIds on verificationContract
                const ids = await verificationContract.getMyTranscriptIds();
                if (ids.length === 0) {
                    studentTranscriptListArea.innerHTML = '<p>No transcripts found for your address.</p>';
                    return;
                }
                let html = '<h3>Your Transcript IDs:</h3><ul>';
                ids.forEach(idBigNum => {
                    const id = idBigNum.toString();
                    // Ensure viewSpecificOnChainTranscript is globally accessible or correctly bound
                    html += `<li>ID: ${id} <button class="transcript-id-button" onclick="viewSpecificOnChainTranscript('${id}')">View Details</button></li>`;
                });
                html += "</ul>";
                studentTranscriptListArea.innerHTML = html;
            } catch (error) {
                console.error("Error fetching student transcript IDs:", error);
                studentTranscriptListArea.innerHTML = '<p class="text-red-500">Could not load IDs.</p>';
            }
        });
    }

    // Made globally accessible for the inline onclick handler
    window.viewSpecificOnChainTranscript = async function(transcriptIdString) {
        const transcriptId = ethers.BigNumber.from(transcriptIdString); // Ensure it's a BigNumber if needed by contract, or string
        if (!provider) { // Provider is sufficient for read-only calls
            studentTranscriptDetailsArea.textContent = 'Wallet provider not ready. Please connect your wallet.';
            return;
        }
        studentTranscriptDetailsArea.textContent = `Workspaceing Transcript ID: ${transcriptId.toString()}...`;
        try {
            // Create a read-only instance of the verification contract using the provider
            const readOnlyVerifier = new ethers.Contract(verificationContractAddress, verificationContractAbi, provider);
            const transcript = await readOnlyVerifier.getTranscript(transcriptId); // Call getTranscript on verification contract

            // The contract's getTranscriptById (called by readOnlyVerifier.getTranscript)
            // already checks for transcript.isValid. If it reverts, this part won't be reached.
            // If it doesn't revert, a valid transcript object is returned.
            // The check below is a good client-side confirmation.
            if (!transcript || transcript.issuerAddress === ethers.constants.AddressZero || !transcript.isValid) {
                studentTranscriptDetailsArea.textContent = `Transcript ID: ${transcriptId.toString()} not found or is invalid.`;
                return;
            }

            let coursesHtml = transcript.courses.map(c => `<li>${c.name}: ${c.grade}</li>`).join('');
            const gradDate = new Date(transcript.graduationDate.toNumber() * 1000).toLocaleDateString();
            studentTranscriptDetailsArea.innerHTML = `
                <h3>Transcript ID: ${transcript.id.toString()}</h3>
                <p><strong>Student:</strong> ${transcript.studentName} (${transcript.studentId})</p>
                <p><strong>Student Address:</strong> ${transcript.studentAddress}</p>
                <p><strong>Institution:</strong> ${transcript.issuingInstitution}</p>
                <p><strong>Program:</strong> ${transcript.programName}</p>
                <p><strong>Graduation Date:</strong> ${gradDate}</p>
                <h4>Courses:</h4><ul>${coursesHtml}</ul>
                <p><small>Issued by: ${transcript.issuerAddress} at ${new Date(transcript.issueTimestamp.toNumber() * 1000).toLocaleString()}</small></p>
                `;
        } catch (error) {
            console.error(`Error fetching transcript ${transcriptId.toString()}:`, error);
            let errMsg = `Error fetching transcript ${transcriptId.toString()}.`;
            if (error.reason) errMsg += ` Reason: ${error.reason}`;
            studentTranscriptDetailsArea.textContent = errMsg;
        }
    };

    // --- EMPLOYER PORTAL (employer.html) ---
    if (verifyTranscriptBtn) {
        const currentRole = sessionStorage.getItem('uniCertifySimulatedRole');
        if (employerNameDisplay && currentRole === 'employer') {
            employerNameDisplay.textContent = `Employer Portal`;
        }
        verifyTranscriptBtn.addEventListener('click', async () => {
            if (!provider) { // Provider is sufficient for read-only calls
                alert("Blockchain provider not available. Please ensure MetaMask is running or refresh.");
                return;
            }
            const idToVerifyStr = verifyTranscriptIdInput.value;
            if (!idToVerifyStr) {
                verificationResultArea.textContent = 'Please enter Transcript ID.';
                return;
            }
            const idToVerify = ethers.BigNumber.from(idToVerifyStr); // Or keep as string if contract expects string
            verificationResultArea.textContent = `Verifying ID: ${idToVerify.toString()}...`;

            try {
                // Create a read-only instance of the verification contract
                const readOnlyVerifier = new ethers.Contract(verificationContractAddress, verificationContractAbi, provider);
                const transcript = await readOnlyVerifier.getTranscript(idToVerify); // Call getTranscript on verification contract

                // As with student view, contract handles revert for non-existent/invalid.
                // This client-side check is a good confirmation.
                if (transcript && transcript.issuerAddress !== ethers.constants.AddressZero && transcript.isValid) {
                    verificationResultArea.innerHTML = `<p class="text-green-600">Transcript ID ${idToVerify.toString()} is VERIFIED.</p>
                                                        <p>Student: ${transcript.studentName}</p>
                                                        <p>Institution: ${transcript.issuingInstitution}</p>`;
                } else {
                    // This else might not be reached if getTranscript reverts hard.
                    // The catch block would handle that.
                    verificationResultArea.innerHTML = `<p class="text-red-600">Transcript ID ${idToVerify.toString()} NOT FOUND or INVALID.</p>`;
                }
            } catch (error) {
                console.error(`Error verifying transcript ${idToVerify.toString()}:`, error);
                let errMsg = `Error verifying ID ${idToVerify.toString()}.`;
                if (error.reason) errMsg += ` Reason: ${error.reason}`;
                else errMsg += ` It may be invalid or not found.`;
                verificationResultArea.innerHTML = `<p class="text-red-600">${errMsg}</p>`;
            }
        });
    }

    // --- Footer Year ---
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});