// scripts.js (Conceptual for On-Chain with Multi-Page Structure)

document.addEventListener('DOMContentLoaded', () => {
    // --- On-Chain Configuration ---
    const contractAddress = "0xa157aa2b4a15f6425821dd6f121f37f93977a758"; // Needs to be set
    const contractAbi = [
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
				"internalType": "struct UniCertify.Course[]",
				"name": "_courses",
				"type": "tuple[]"
			}
		],
		"name": "issueTranscript",
		"outputs": [],
		"stateMutability": "nonpayable",
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
		"name": "getMyTranscriptIds",
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
		"name": "getTranscript",
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
						"internalType": "struct UniCertify.Course[]",
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
					}
				],
				"internalType": "struct UniCertify.Transcript",
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
];         // Needs to be set


    // --- Ethers.js Setup ---
    let provider;
    let signer;
    let contract;
    let userAddress = null;

    // --- DOM Elements (Get them based on which page is loaded) ---
    // Shared (assuming you add these to each portal's header)
    const connectWalletBtn = document.getElementById('connectWalletBtnOnPage'); // Use unique IDs or classes
    const walletAddressSpan = document.getElementById('walletAddressOnPage');
    const logoutBtn = document.getElementById('logoutBtn'); // Assuming one logout button

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
            sessionStorage.removeItem('uniCertifySimulatedRole'); // Clear simulated role
            // For on-chain, disconnecting wallet is handled by MetaMask, here we just clear UI
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            userAddress = null;
            signer = null;
            contract = null; // Invalidate contract instance
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
                contract = new ethers.Contract(contractAddress, contractAbi, signer);

                if (connectWalletBtn) {
                    connectWalletBtn.textContent = 'Wallet Connected';
                    connectWalletBtn.disabled = true;
                }
                if (walletAddressSpan) {
                    walletAddressSpan.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                }
                console.log("Wallet Connected. Address:", userAddress, "Contract Initialized.");

                window.ethereum.on('accountsChanged', handleAccountsChangedOnChain);
                return true; // Indicate success
            } catch (error) {
                console.error("Error connecting wallet:", error);
                alert("Failed to connect wallet. Ensure MetaMask is unlocked and configured.");
                return false; // Indicate failure
            }
        } else {
            alert('MetaMask is not installed. Please install it to use this dApp.');
            return false; // Indicate failure
        }
    }

    function handleAccountsChangedOnChain(accounts) {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
            userAddress = null; signer = null; contract = null;
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            alert("Wallet disconnected. Please reconnect if needed.");
            // Potentially clear page-specific data
            if(studentTranscriptListArea) studentTranscriptListArea.innerHTML = '<p>Wallet disconnected.</p>';

        } else {
            // Reconnect with the new account
            connectWalletAndInitialize().then(success => {
                if (success) {
                    // If on student page, prompt to reload transcripts
                    if (document.body.id === 'studentPage' && studentTranscriptListArea) {
                        studentTranscriptListArea.innerHTML = '<p>Account changed. Click "Load My Transcripts".</p>';
                    }
                }
            });
        }
    }

    // Attach connect wallet listener if button exists on current page
    if (connectWalletBtn) {
        connectWalletBtn.addEventListener('click', connectWalletAndInitialize);
    }


    // --- LOGIN PAGE (login.html) ---
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const role = loginForm.role.value;
            // Store the intended role for UI purposes on the next page, actual auth is by wallet.
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
            // In a real app, institution name might come from a profile or be less relevant
            // if the connected wallet IS the institution.
            institutionNameDisplay.textContent = `Institution Portal (Connect Wallet to Issue)`;
        }

        // Add dynamic course rows logic (copy from your on-chain index.html)
        // ...
        window.removeCourse = function(button) { /* ... */ };
        const addCourseBtn = document.getElementById('addCourseBtn');
        if(addCourseBtn) addCourseBtn.addEventListener('click', () => { /* ... */ });
        // ...

        issueTranscriptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!contract || !signer || !userAddress) {
                alert("Please connect your Institution's wallet first.");
                return;
            }
            displayMessage(institutionMessageArea, "Processing transaction...", false);
            // ... (Get all form data: studentName, studentEthAddress, studentId, etc.)
            const formData = new FormData(issueTranscriptForm);
            const studentName = formData.get('studentName');
            const studentEthAddress = formData.get('studentEthAddress');
            const studentId = formData.get('studentId');
            const issuingInstitution = formData.get('issuingInstitution'); // This should ideally come from a trusted source or be the institution's name linked to their role.
            const programName = formData.get('programName');
            const graduationDateStr = formData.get('graduationDate');
            const graduationTimestamp = Math.floor(new Date(graduationDateStr).getTime() / 1000);
            const courseNames = formData.getAll('courseName[]');
            const courseGrades = formData.getAll('courseGrade[]');

            if (!ethers.utils.isAddress(studentEthAddress)) {
                displayMessage(institutionMessageArea, "Invalid Student Ethereum Address.", true); return;
            }

            try {
                console.log("Calling issueTranscriptManual on-chain...");
                const tx = await contract.issueTranscriptManual(
                    studentName, studentEthAddress, studentId, issuingInstitution,
                    programName, graduationTimestamp, courseNames, courseGrades
                );
                displayMessage(institutionMessageArea, "Transaction sent, waiting for confirmation...", false, `Tx: ${tx.hash}`);
                const receipt = await tx.wait();
                console.log("Transaction confirmed:", receipt);

                let issuedTranscriptId = "N/A";
                // IMPORTANT: Event parsing logic (ensure it's robust)
                if (receipt && receipt.events && receipt.events.length > 0) {
                    const issueEvent = receipt.events.find(ev => ev.event === "TranscriptIssued");
                    if (issueEvent && issueEvent.args && issueEvent.args.transcriptId !== undefined) {
                        issuedTranscriptId = issueEvent.args.transcriptId.toString();
                    }
                }
                displayMessage(institutionMessageArea, `Transcript Issued! ID: ${issuedTranscriptId}`, false, `Tx: ${receipt.transactionHash}`);
                issueTranscriptForm.reset();
                // Reset course rows...
            } catch (error) {
                console.error("Error issuing transcript:", error);
                let errMsg = "Failed to issue transcript.";
                if (error.reason) errMsg += ` Reason: ${error.reason}`;
                else if (error.data?.message) errMsg += ` Reason: ${error.data.message}`;
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
            if (!contract || !userAddress) {
                alert("Please connect your Student wallet first.");
                return;
            }
            studentTranscriptListArea.innerHTML = '<p>Loading your transcript IDs from blockchain...</p>';
            try {
                const ids = await contract.getMyTranscriptIds();
                if (ids.length === 0) {
                    studentTranscriptListArea.innerHTML = '<p>No transcripts found for your address.</p>';
                    return;
                }
                let html = '<h3>Your Transcript IDs:</h3><ul>';
                ids.forEach(idBigNum => {
                    const id = idBigNum.toString();
                    html += `<li>ID: ${id} <button class="transcript-id-button" onclick="viewSpecificOnChainTranscript(${id})">View Details</button></li>`;
                });
                html += "</ul>";
                studentTranscriptListArea.innerHTML = html;
            } catch (error) {
                console.error("Error fetching student transcript IDs:", error);
                studentTranscriptListArea.innerHTML = '<p class="text-red-500">Could not load IDs.</p>';
            }
        });
    }

    window.viewSpecificOnChainTranscript = async function(transcriptId) {
        if (!contract || !provider) {
             studentTranscriptDetailsArea.textContent = 'Wallet not connected or provider not ready.';
             return;
        }
        studentTranscriptDetailsArea.textContent = `Workspaceing Transcript ID: ${transcriptId}...`;
        try {
            const readOnlyContract = new ethers.Contract(contractAddress, contractAbi, provider);
            const transcript = await readOnlyContract.getTranscript(transcriptId);

            if (!transcript || transcript.issuerAddress === ethers.constants.AddressZero) {
                studentTranscriptDetailsArea.textContent = `Transcript ID: ${transcriptId} not found.`;
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
                `;
        } catch (error) {
            console.error(`Error fetching transcript ${transcriptId}:`, error);
            studentTranscriptDetailsArea.textContent = `Error fetching transcript ${transcriptId}.`;
        }
    };

    // --- EMPLOYER PORTAL (employer.html) ---
    if (verifyTranscriptBtn) {
         const currentRole = sessionStorage.getItem('uniCertifySimulatedRole');
        if (employerNameDisplay && currentRole === 'employer') {
            employerNameDisplay.textContent = `Employer Portal`;
        }
        verifyTranscriptBtn.addEventListener('click', async () => {
            if (!provider) { // Only provider needed for read-only verification
                alert("Blockchain provider not available. Please ensure MetaMask is running or refresh.");
                return;
            }
            const idToVerify = verifyTranscriptIdInput.value;
            if (!idToVerify) {
                verificationResultArea.textContent = 'Please enter Transcript ID.';
                return;
            }
            verificationResultArea.textContent = `Verifying ID: ${idToVerify}...`;
            try {
                const readOnlyContract = new ethers.Contract(contractAddress, contractAbi, provider);
                const transcript = await readOnlyContract.getTranscript(idToVerify);
                if (transcript && transcript.issuerAddress !== ethers.constants.AddressZero) {
                    verificationResultArea.innerHTML = `<p class="text-green-600">Transcript ID ${idToVerify} is VERIFIED.</p> 
                                                        <p>Student: ${transcript.studentName}</p>`;
                } else {
                    verificationResultArea.innerHTML = `<p class="text-red-600">Transcript ID ${idToVerify} NOT FOUND.</p>`;
                }
            } catch (error) {
                console.error(`Error verifying transcript ${idToVerify}:`, error);
                verificationResultArea.innerHTML = `<p class="text-red-600">Error verifying ID ${idToVerify}. It may be invalid.</p>`;
            }
        });
    }

    // --- Footer Year ---
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});