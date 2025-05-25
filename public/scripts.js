// Ensure this script is loaded after ethers.js in your HTML files

document.addEventListener('DOMContentLoaded', () => {
    // --- Ethers.js Setup ---
    let provider;
    let signer;
    let issuanceContract;       // For actions like issuing transcripts & status changes
    let verificationContract;   // For read-only verification/viewing by anyone (uses provider)
    let verificationContractWithSigner; // For student-specific views like getMyTranscriptIds (uses signer)
    let userAddress = null;

    // Enum for Transcript Status (mirroring Solidity)
    const TranscriptStatus = {
        Pending: 0,
        AcceptedByStudent: 1,
        RejectedByStudent: 2,
        RevokedByInstitution: 3,
        toString: function(statusValue) {
            switch(statusValue) {
                case this.Pending: return "Pending Student Review";
                case this.AcceptedByStudent: return "Accepted by Student";
                case this.RejectedByStudent: return "Rejected by Student";
                case this.RevokedByInstitution: return "Revoked by Institution";
                default: return "Unknown Status";
            }
        }
    };
    // --- TranscriptIssuance Contract Details ---
    const issuanceContractAddress = "0x3eff9ad8e31e375e4b40f58efedf3da37d00717c"; 

    const verificationContractAddress = "0xd4cd826eb69021b80c320ceedd39ac2e393b3cc7"; 

    const issuanceContractAbi = [
        { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
        { "inputs": [], "name": "AccessControlBadConfirmation", "type": "error" },
        { "inputs": [ { "internalType": "address", "name": "account", "type": "address" }, { "internalType": "bytes32", "name": "neededRole", "type": "bytes32" } ], "name": "AccessControlUnauthorizedAccount", "type": "error" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "previousAdminRole", "type": "bytes32" }, { "indexed": true, "internalType": "bytes32", "name": "newAdminRole", "type": "bytes32" } ], "name": "RoleAdminChanged", "type": "event" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" } ], "name": "RoleGranted", "type": "event" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "indexed": true, "internalType": "address", "name": "account", "type": "address" }, { "indexed": true, "internalType": "address", "name": "sender", "type": "address" } ], "name": "RoleRevoked", "type": "event" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "transcriptId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "studentAddress", "type": "address" }, { "indexed": false, "internalType": "string", "name": "studentId", "type": "string" }, { "indexed": false, "internalType": "string", "name": "issuingInstitution", "type": "string" }, { "indexed": true, "internalType": "address", "name": "issuer", "type": "address" }, { "indexed": false, "internalType": "enum TranscriptDefs.Status", "name": "initialStatus", "type": "uint8" } ], "name": "TranscriptIssued", "type": "event" },
        { "anonymous": false, "inputs": [ { "indexed": true, "internalType": "uint256", "name": "transcriptId", "type": "uint256" }, { "indexed": true, "internalType": "address", "name": "studentAddress", "type": "address" }, { "indexed": true, "internalType": "address", "name": "changedBy", "type": "address" }, { "indexed": false, "internalType": "enum TranscriptDefs.Status", "name": "newStatus", "type": "uint8" }, { "indexed": false, "internalType": "string", "name": "reason", "type": "string" } ], "name": "TranscriptStatusChanged", "type": "event" },
        { "inputs": [], "name": "DEFAULT_ADMIN_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "INSTITUTION_ROLE", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" } ], "name": "acceptTranscript", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" } ], "name": "doesTranscriptExist", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" } ], "name": "getRoleAdmin", "outputs": [ { "internalType": "bytes32", "name": "", "type": "bytes32" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" } ], "name": "getTranscriptById", "outputs": [ { "components": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "studentAddress", "type": "address" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "studentId", "type": "string" }, { "internalType": "string", "name": "issuingInstitution", "type": "string" }, { "internalType": "string", "name": "programName", "type": "string" }, { "internalType": "uint256", "name": "graduationDate", "type": "uint256" }, { "components": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "grade", "type": "string" } ], "internalType": "struct TranscriptDefs.Course[]", "name": "courses", "type": "tuple[]" }, { "internalType": "address", "name": "issuerAddress", "type": "address" }, { "internalType": "uint256", "name": "issueTimestamp", "type": "uint256" }, { "internalType": "enum TranscriptDefs.Status", "name": "status", "type": "uint8" } ], "internalType": "struct TranscriptDefs.Transcript", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "_studentAddress", "type": "address" } ], "name": "getTranscriptIdsForStudent", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "_institutionAccount", "type": "address" } ], "name": "grantInstitutionRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "grantRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "hasRole", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "string", "name": "_studentName", "type": "string" }, { "internalType": "address", "name": "_studentAddress", "type": "address" }, { "internalType": "string", "name": "_studentId", "type": "string" }, { "internalType": "string", "name": "_issuingInstitution", "type": "string" }, { "internalType": "string", "name": "_programName", "type": "string" }, { "internalType": "uint256", "name": "_graduationDate", "type": "uint256" }, { "internalType": "string[]", "name": "_courseNames", "type": "string[]" }, { "internalType": "string[]", "name": "_courseGrades", "type": "string[]" } ], "name": "issueTranscriptManual", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" }, { "internalType": "string", "name": "_reason", "type": "string" } ], "name": "rejectTranscript", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "callerConfirmation", "type": "address" } ], "name": "renounceRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "_institutionAccount", "type": "address" } ], "name": "revokeInstitutionRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "bytes32", "name": "role", "type": "bytes32" }, { "internalType": "address", "name": "account", "type": "address" } ], "name": "revokeRole", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" }, { "internalType": "string", "name": "_reason", "type": "string" } ], "name": "revokeTranscriptByInstitution", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
        { "inputs": [ { "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" } ], "name": "supportsInterface", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }
    ];

    // --- TranscriptVerification Contract Details ---

    const verificationContractAbi = [
        { "inputs": [ { "internalType": "address", "name": "_issuanceContractAddress", "type": "address" } ], "stateMutability": "nonpayable", "type": "constructor" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" } ], "name": "checkTranscriptExistence", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "getMyTranscriptIds", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "address", "name": "_studentAddress", "type": "address" } ], "name": "getTranscriptIdsForGivenStudent", "outputs": [ { "internalType": "uint256[]", "name": "", "type": "uint256[]" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [], "name": "issuanceContract", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" },
        { "inputs": [ { "internalType": "uint256", "name": "_transcriptId", "type": "uint256" } ], "name": "viewTranscript", "outputs": [ { "components": [ { "internalType": "uint256", "name": "id", "type": "uint256" }, { "internalType": "address", "name": "studentAddress", "type": "address" }, { "internalType": "string", "name": "studentName", "type": "string" }, { "internalType": "string", "name": "studentId", "type": "string" }, { "internalType": "string", "name": "issuingInstitution", "type": "string" }, { "internalType": "string", "name": "programName", "type": "string" }, { "internalType": "uint256", "name": "graduationDate", "type": "uint256" }, { "components": [ { "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "grade", "type": "string" } ], "internalType": "struct TranscriptDefs.Course[]", "name": "courses", "type": "tuple[]" }, { "internalType": "address", "name": "issuerAddress", "type": "address" }, { "internalType": "uint256", "name": "issueTimestamp", "type": "uint256" }, { "internalType": "enum TranscriptDefs.Status", "name": "status", "type": "uint8" } ], "internalType": "struct TranscriptDefs.Transcript", "name": "", "type": "tuple" } ], "stateMutability": "view", "type": "function" }
    ];

    // --- DOM Elements ---
    const connectWalletBtn = document.getElementById('connectWalletBtnOnPage');
    const walletAddressSpan = document.getElementById('walletAddressOnPage');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginForm = document.getElementById('loginForm');
    const issueTranscriptForm = document.getElementById('issueTranscriptForm');
    const institutionNameDisplay = document.getElementById('institutionName');
    const institutionMessageArea = document.getElementById('messageArea');
    const addCourseBtn = document.getElementById('addCourseBtn');
    const coursesContainer = document.getElementById('coursesContainer');
    const studentNameDisplay = document.getElementById('studentNameDisplay');
    const studentTranscriptListArea = document.getElementById('studentTranscriptListArea');
    const studentTranscriptDetailsArea = document.getElementById('studentTranscriptDetailsArea');
    const loadMyTranscriptsBtn = document.getElementById('loadMyTranscriptsBtn');
    const employerNameDisplay = document.getElementById('employerNameDisplay');
    const verifyTranscriptIdInput = document.getElementById('verifyTranscriptId');
    const verifyTranscriptBtn = document.getElementById('verifyTranscriptBtn');
    const verificationResultArea = document.getElementById('verificationResult');

    // --- SHARED FUNCTIONS ---
    function displayMessage(areaElement, msg, isError = false, details = null) {
        if (!areaElement) return;
        areaElement.innerHTML = `
            <div class="${isError ? 'bg-red-100 border-red-500 text-red-700' : 'bg-green-100 border-green-500 text-green-700'} border-l-4 p-4 rounded-md shadow-md">
                <p class="font-bold">${isError ? 'Error!' : 'Success!'}</p>
                <p>${msg}</p>
                ${details ? `<p class="text-xs mt-2">Details: ${details}</p>` : ''}
            </div>`;
        areaElement.style.display = 'block';
        setTimeout(() => {
            if (areaElement) areaElement.style.display = 'none';
        }, 10000);
    }

    function showModal(message, isError = false) {
        const modalId = 'customModal';
        let modal = document.getElementById(modalId);
        if (!modal) {
            modal = document.createElement('div');
            modal.id = modalId;
            modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50 p-4';
            modal.innerHTML = `
                <div class="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                    <div class="mt-3 text-center">
                        <h3 class="text-lg leading-6 font-medium ${isError ? 'text-red-700' : 'text-gray-900'}" id="modalTitle">${isError ? 'Error' : 'Notification'}</h3>
                        <div class="mt-2 px-7 py-3">
                            <p class="text-sm text-gray-500" id="modalMessage">${message}</p>
                        </div>
                        <div class="items-center px-4 py-3">
                            <button id="closeModalButton" class="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300">
                                OK
                            </button>
                        </div>
                    </div>
                </div>`;
            document.body.appendChild(modal);
            document.getElementById('closeModalButton').addEventListener('click', () => {
                modal.style.display = 'none';
            });
        } else {
            document.getElementById('modalMessage').textContent = message;
            document.getElementById('modalTitle').textContent = isError ? 'Error' : 'Notification';
            document.getElementById('modalTitle').className = `text-lg leading-6 font-medium ${isError ? 'text-red-700' : 'text-gray-900'}`;
        }
        modal.style.display = 'flex';
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('uniCertifySimulatedRole');
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            userAddress = null; signer = null; issuanceContract = null; verificationContract = null; verificationContractWithSigner = null;
            window.location.href = 'index.html';
        });
    }

    async function connectWalletAndInitialize() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                await window.ethereum.request({ method: 'eth_requestAccounts' });
                provider = new ethers.providers.Web3Provider(window.ethereum);
                signer = provider.getSigner();
                userAddress = await signer.getAddress();

                if (!issuanceContractAddress || issuanceContractAddress.startsWith("YOUR_")) {
                    showModal("Issuance contract address is not set in scripts.js. Please update it with your deployed address.", true); return false;
                }
                if (!verificationContractAddress || verificationContractAddress.startsWith("YOUR_")) {
                    showModal("Verification contract address is not set in scripts.js. Please update it with your deployed address.", true); return false;
                }
                
                issuanceContract = new ethers.Contract(issuanceContractAddress, issuanceContractAbi, signer);
                verificationContract = new ethers.Contract(verificationContractAddress, verificationContractAbi, provider);
                verificationContractWithSigner = new ethers.Contract(verificationContractAddress, verificationContractAbi, signer);

                if (connectWalletBtn) {
                    connectWalletBtn.textContent = 'Wallet Connected';
                    connectWalletBtn.disabled = true;
                }
                if (walletAddressSpan) {
                    walletAddressSpan.textContent = `Connected: ${userAddress.substring(0, 6)}...${userAddress.substring(userAddress.length - 4)}`;
                }
                console.log("Wallet Connected. Address:", userAddress);
                console.log("Issuance Contract Initialized. Functions:", issuanceContract ? Object.keys(issuanceContract.functions).join(', ') : "Not initialized");
                console.log("Verification Contract (Signer) Initialized. Functions:", verificationContractWithSigner ? Object.keys(verificationContractWithSigner.functions).join(', ') : "Not initialized");
                showModal("Wallet connected successfully!");

                window.ethereum.on('accountsChanged', handleAccountsChangedOnChain);
                return true;
            } catch (error) {
                console.error("Error connecting wallet or initializing contracts:", error);
                showModal(`Failed to connect wallet: ${error.message}. Ensure contract details are correct.`, true);
                return false;
            }
        } else {
            showModal('MetaMask is not installed.', true);
            return false;
        }
    }

    function handleAccountsChangedOnChain(accounts) {
        console.log("Accounts changed:", accounts);
        if (accounts.length === 0) {
            userAddress = null; signer = null; issuanceContract = null; verificationContract = null; verificationContractWithSigner = null;
            if (connectWalletBtn) {
                connectWalletBtn.textContent = 'Connect Wallet';
                connectWalletBtn.disabled = false;
            }
            if (walletAddressSpan) walletAddressSpan.textContent = '';
            showModal("Wallet disconnected. Please reconnect if needed.", true);
            if(studentTranscriptListArea) studentTranscriptListArea.innerHTML = '<p class="text-gray-600">Wallet disconnected. Please reconnect and try again.</p>';
            if(studentTranscriptDetailsArea) studentTranscriptDetailsArea.innerHTML = 'Details will appear here once a transcript is selected.';
        } else {
            connectWalletAndInitialize().then(success => {
                if (success) {
                    if (document.body.id === 'studentPage' && studentTranscriptListArea) {
                        studentTranscriptListArea.innerHTML = '<p class="text-gray-600">Account changed. Click "Load My Transcripts" again.</p>';
                        if(studentTranscriptDetailsArea) studentTranscriptDetailsArea.innerHTML = 'Details will appear here once a transcript is selected.';
                    }
                     // Potentially refresh other page-specific data or UI elements
                }
            });
        }
    }

    if (connectWalletBtn) connectWalletBtn.addEventListener('click', connectWalletAndInitialize);
    
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
    
    const currentSimulatedRole = sessionStorage.getItem('uniCertifySimulatedRole');
    if (document.body.id === 'institutionPage' && institutionNameDisplay) {
        institutionNameDisplay.textContent = `Institution Portal`;
    } else if (document.body.id === 'studentPage' && studentNameDisplay) {
        studentNameDisplay.textContent = `Student Portal`;
    } else if (document.body.id === 'employerPage' && employerNameDisplay) {
        employerNameDisplay.textContent = `Employer Portal`;
    }

    // --- INSTITUTION PORTAL ---
    if (issueTranscriptForm) { 
        function addCourseRow() {
            const newRow = document.createElement('div');
            newRow.className = 'course-row'; // Ensure this class is defined in institution.html styles
            newRow.innerHTML = `
                <input type="text" name="courseName[]" class="w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Course Name" required>
                <input type="text" name="courseGrade[]" class="w-1/3 px-3 py-2 border border-gray-300 rounded-md" placeholder="Grade" required>
                <button type="button" class="removeCourseBtn bg-red-500 hover:bg-red-600 text-white p-2 rounded-md" onclick="window.removeCourse(this)"><i class="fas fa-trash"></i></button>
            `;
            if (coursesContainer) coursesContainer.appendChild(newRow);
            updateRemoveCourseButtons();
        }

        window.removeCourse = function(button) { // Make it globally accessible
            button.closest('.course-row').remove();
            updateRemoveCourseButtons();
        }

        function updateRemoveCourseButtons() {
            if (!coursesContainer) return;
            const rows = coursesContainer.querySelectorAll('.course-row');
            rows.forEach((row, index) => {
                const btn = row.querySelector('.removeCourseBtn');
                if (btn) btn.disabled = rows.length === 1;
            });
        }
        
        if (addCourseBtn) addCourseBtn.addEventListener('click', addCourseRow);
        // Initialize with one course row if container is empty
        if (coursesContainer && coursesContainer.children.length === 0) {
            addCourseRow();
        }
        updateRemoveCourseButtons(); // Call initially


        issueTranscriptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!issuanceContract || !signer || !userAddress) {
                showModal("Please connect your Institution's wallet first.", true);
                return;
            }
            displayMessage(institutionMessageArea, "Processing transaction, please wait...", false);

            const formData = new FormData(issueTranscriptForm);
            const studentName = formData.get('studentName');
            const studentEthAddress = formData.get('studentEthAddress');
            const studentId = formData.get('studentId');
            const issuingInstitution = formData.get('issuingInstitution');
            const programName = formData.get('programName');
            const graduationDateStr = formData.get('graduationDate');
            const graduationTimestamp = Math.floor(new Date(graduationDateStr).getTime() / 1000);
            const courseNames = formData.getAll('courseName[]');
            const courseGrades = formData.getAll('courseGrade[]');

            if (!ethers.utils.isAddress(studentEthAddress)) {
                displayMessage(institutionMessageArea, "Invalid Student Ethereum Address.", true); return;
            }
            if (!studentName || !studentId || !issuingInstitution || !programName || !graduationDateStr || courseNames.length === 0 || courseNames.some(name => !name) || courseGrades.some(grade => !grade)) {
                 displayMessage(institutionMessageArea, "Please fill all required fields, including at least one course with name and grade.", true); return;
            }

            try {
                const tx = await issuanceContract.issueTranscriptManual(
                    studentName, studentEthAddress, studentId, issuingInstitution,
                    programName, graduationTimestamp, courseNames, courseGrades
                );
                displayMessage(institutionMessageArea, "Transaction sent, waiting for confirmation...", false, `Tx Hash: ${tx.hash}`);
                const receipt = await tx.wait();
                
                let issuedTranscriptId = "N/A";
                if (receipt && receipt.events) {
                    const issueEvent = receipt.events.find(ev => ev.event === "TranscriptIssued" && ev.args);
                    if (issueEvent && issueEvent.args.transcriptId !== undefined) {
                        issuedTranscriptId = issueEvent.args.transcriptId.toString();
                    }
                }
                displayMessage(institutionMessageArea, `Transcript Issued Successfully! ID: ${issuedTranscriptId}. Status: Pending Student Review.`, false, `Tx Confirmed: ${receipt.transactionHash}`);
                issueTranscriptForm.reset();
                if(coursesContainer) { // Reset course rows to one empty row
                    while(coursesContainer.children.length > 1) {
                        coursesContainer.removeChild(coursesContainer.lastChild);
                    }
                    if(coursesContainer.children.length === 1){ 
                        coursesContainer.querySelector('input[name="courseName[]"]').value = '';
                        coursesContainer.querySelector('input[name="courseGrade[]"]').value = '';
                    }
                    updateRemoveCourseButtons();
                }
            } catch (error) {
                console.error("Error issuing transcript:", error);
                let errMsg = "Failed to issue transcript.";
                if (error.reason) errMsg += ` Reason: ${error.reason}`;
                else if (error.data?.message) errMsg += ` Reason: ${error.data.message.substring(0,100)}...`;
                else if (error.message) errMsg += ` Details: ${error.message.substring(0,100)}...`;
                displayMessage(institutionMessageArea, errMsg, true, error.transactionHash ? `Tx Hash: ${error.transactionHash}`: null);
            }
        });
    }


    // --- STUDENT PORTAL ---
    if (loadMyTranscriptsBtn) {
        loadMyTranscriptsBtn.addEventListener('click', async () => {
            if (!verificationContractWithSigner || !userAddress) {
                showModal("Please connect your Student wallet first.", true); return;
            }
            studentTranscriptListArea.innerHTML = '<p class="text-gray-700">Loading transcript IDs...</p>';
            studentTranscriptDetailsArea.innerHTML = 'Select a transcript ID to view details.';
            try {
                const ids = await verificationContractWithSigner.getMyTranscriptIds();
                if (ids.length === 0) {
                    studentTranscriptListArea.innerHTML = '<p class="text-gray-700">No transcripts found.</p>'; return;
                }
                let html = '<h3 class="text-lg font-semibold text-gray-800 mb-2">Your Transcript IDs:</h3><ul class="list-disc pl-5 space-y-1">';
                ids.forEach(idBigNum => {
                    const id = idBigNum.toString();
                    html += `<li class="text-gray-700">ID: <span class="font-medium">${id}</span> <button class="transcript-id-button" data-id="${id}">View Details</button></li>`;
                });
                html += "</ul>";
                studentTranscriptListArea.innerHTML = html;
                studentTranscriptListArea.querySelectorAll('.transcript-id-button').forEach(button => {
                    button.addEventListener('click', (e) => viewSpecificOnChainTranscript(e.target.dataset.id));
                });
            } catch (error) {
                console.error("Error fetching student transcript IDs:", error);
                studentTranscriptListArea.innerHTML = `<p class="text-red-500">Could not load IDs: ${error.message}</p>`;
            }
        });
    }

    async function viewSpecificOnChainTranscript(transcriptId) {
        // For viewing, verificationContract (using provider) is fine.
        // For actions (accept/reject), issuanceContract (using signer) is needed.
        // We fetch with verificationContract first to display, then actions use issuanceContract.
        if (!verificationContract || !provider) {
            studentTranscriptDetailsArea.innerHTML = '<p class="text-red-600">Wallet not connected or provider not ready.</p>'; return;
        }
        studentTranscriptDetailsArea.innerHTML = `<p class="text-gray-700">Fetching details for Transcript ID: ${transcriptId}...</p>`;
        try {
            const transcript = await verificationContract.viewTranscript(transcriptId); 

            if (!transcript || transcript.issuerAddress === ethers.constants.AddressZero) {
                 studentTranscriptDetailsArea.innerHTML = `<p class="text-orange-600 font-semibold">Transcript ID: ${transcriptId} not found.</p>`; return;
            }

            let coursesHtml = transcript.courses.map(c => `<li class="text-sm">${c.name || 'N/A'}: <span class="font-semibold">${c.grade || 'N/A'}</span></li>`).join('');
            if (transcript.courses.length === 0) coursesHtml = '<li>No course data available.</li>';

            const gradDate = new Date(transcript.graduationDate.toNumber() * 1000).toLocaleDateString();
            const issueDate = new Date(transcript.issueTimestamp.toNumber() * 1000).toLocaleString();
            const statusString = TranscriptStatus.toString(transcript.status); // Use the JS enum helper

            let actionButtonsHtml = '';
            // Show Accept/Reject buttons only if the current user is the student and status is Pending
            if (userAddress && transcript.studentAddress.toLowerCase() === userAddress.toLowerCase() && transcript.status === TranscriptStatus.Pending) {
                actionButtonsHtml = `
                    <div class="mt-4 pt-4 border-t">
                        <h4 class="text-md font-semibold mb-2">Actions:</h4>
                        <button id="acceptTranscriptBtn" data-id="${transcriptId}" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md mr-2">Accept Transcript</button>
                        <button id="rejectTranscriptBtn" data-id="${transcriptId}" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md">Reject Transcript</button>
                    </div>
                `;
            }

            let statusColorClass = "text-yellow-600"; // Default for Pending
            if (transcript.status === TranscriptStatus.AcceptedByStudent) statusColorClass = "text-green-600";
            else if (transcript.status === TranscriptStatus.RejectedByStudent || transcript.status === TranscriptStatus.RevokedByInstitution) statusColorClass = "text-red-600";


            studentTranscriptDetailsArea.innerHTML = `
                <h3 class="text-xl font-semibold text-blue-700 mb-3">Transcript ID: ${transcript.id.toString()}</h3>
                <p class="mb-3"><strong>Status:</strong> <span class="font-semibold ${statusColorClass}">${statusString}</span></p>
                <div class="space-y-2 text-gray-800">
                    <p><strong>Student:</strong> ${transcript.studentName} (ID: ${transcript.studentId})</p>
                    <p><strong>Student ETH Address:</strong> ${transcript.studentAddress}</p>
                    <p><strong>Issuing Institution:</strong> ${transcript.issuingInstitution}</p>
                    <p><strong>Program:</strong> ${transcript.programName}</p>
                    <p><strong>Graduation Date:</strong> ${gradDate}</p>
                    <p><strong>Issued By (Address):</strong> ${transcript.issuerAddress}</p>
                    <p><strong>Issued On:</strong> ${issueDate}</p>
                    <h4 class="text-md font-semibold mt-3">Courses:</h4>
                    <ul class="list-disc pl-6 space-y-1">${coursesHtml}</ul>
                </div>
                ${actionButtonsHtml}
            `;

            if (actionButtonsHtml) { // Add event listeners if buttons were added
                document.getElementById('acceptTranscriptBtn')?.addEventListener('click', handleAcceptTranscript);
                document.getElementById('rejectTranscriptBtn')?.addEventListener('click', handleRejectTranscript);
            }

        } catch (error) {
            console.error(`Error fetching transcript ${transcriptId}:`, error);
            studentTranscriptDetailsArea.innerHTML = `<p class="text-red-600">Error fetching transcript: ${error.message}</p>`;
        }
    }

    async function handleAcceptTranscript(event) {
        const transcriptId = event.target.dataset.id;
        if (!issuanceContract || !userAddress) { // Actions go through issuanceContract with signer
            showModal("Please ensure your wallet is connected.", true); return;
        }
        // Optional: Add a confirmation modal before proceeding
        // const confirmed = await showConfirmationModal("Are you sure you want to accept this transcript? This action cannot be undone.");
        // if (!confirmed) return;

        showModal("Processing acceptance...", false); // Indicate processing
        try {
            const tx = await issuanceContract.acceptTranscript(transcriptId);
            // Use a temporary message area or update studentTranscriptDetailsArea for tx status
            displayMessage(studentTranscriptDetailsArea, "Acceptance transaction sent, waiting for confirmation...", false, `Tx: ${tx.hash}`);
            await tx.wait();
            showModal("Transcript accepted successfully!", false);
            viewSpecificOnChainTranscript(transcriptId); // Refresh details to show new status
            if(loadMyTranscriptsBtn) loadMyTranscriptsBtn.click(); // Refresh list if needed
        } catch (error) {
            console.error("Error accepting transcript:", error);
            let errMsg = error.reason || (error.data ? error.data.message : null) || error.message;
            showModal(`Failed to accept transcript: ${errMsg.substring(0,150)}`, true);
            // Optionally, re-enable buttons or refresh view if tx fails mid-way
            viewSpecificOnChainTranscript(transcriptId);
        }
    }

    async function handleRejectTranscript(event) {
        const transcriptId = event.target.dataset.id;
        if (!issuanceContract || !userAddress) { // Actions go through issuanceContract with signer
            showModal("Please ensure your wallet is connected.", true); return;
        }
        
        const reason = prompt("Please provide a reason for rejecting this transcript (this will be stored on-chain):", "");
        if (reason === null) return; // User cancelled prompt
        if (!reason.trim()) {
            showModal("Rejection reason cannot be empty.", true); return;
        }

        // Optional: Add a confirmation modal
        // const confirmed = await showConfirmationModal(`Are you sure you want to reject this transcript with reason: "${reason}"? This action cannot be undone.`);
        // if (!confirmed) return;

        showModal("Processing rejection...", false);
        try {
            const tx = await issuanceContract.rejectTranscript(transcriptId, reason);
            displayMessage(studentTranscriptDetailsArea, "Rejection transaction sent, waiting for confirmation...", false, `Tx: ${tx.hash}`);
            await tx.wait();
            showModal("Transcript rejected successfully!", false);
            viewSpecificOnChainTranscript(transcriptId); // Refresh details
            if(loadMyTranscriptsBtn) loadMyTranscriptsBtn.click(); // Refresh list
        } catch (error) {
            console.error("Error rejecting transcript:", error);
            let errMsg = error.reason || (error.data ? error.data.message : null) || error.message;
            showModal(`Failed to reject transcript: ${errMsg.substring(0,150)}`, true);
            viewSpecificOnChainTranscript(transcriptId);
        }
    }


    // --- EMPLOYER PORTAL ---
    if (verifyTranscriptBtn) {
        verifyTranscriptBtn.addEventListener('click', async () => {
            if (!verificationContract || !provider) { 
                showModal("Blockchain provider not available. Ensure MetaMask is connected or refresh.", true); return;
            }
            const idToVerify = verifyTranscriptIdInput.value.trim();
            if (!idToVerify) {
                verificationResultArea.innerHTML = '<p class="text-orange-600">Please enter a Transcript ID.</p>'; return;
            }
            verificationResultArea.innerHTML = `<p class="text-gray-700">Verifying ID: ${idToVerify}...</p>`;
            try {
                // First, check if the transcript exists to give a clearer "not found" message.
                const exists = await verificationContract.checkTranscriptExistence(idToVerify);
                if (!exists) {
                    verificationResultArea.innerHTML = `<p class="text-red-600 font-bold text-lg">Transcript ID ${idToVerify} NOT FOUND.</p>`; return;
                }

                // If it exists, fetch the full details.
                const transcript = await verificationContract.viewTranscript(idToVerify); 
                const statusString = TranscriptStatus.toString(transcript.status);
                let coursesHtml = transcript.courses.map(c => `<li class="text-sm">${c.name || 'N/A'}: <span class="font-semibold">${c.grade || 'N/A'}</span></li>`).join('');
                if (transcript.courses.length === 0) coursesHtml = '<li>No course data available.</li>';
                const gradDate = new Date(transcript.graduationDate.toNumber() * 1000).toLocaleDateString();
                const issueDate = new Date(transcript.issueTimestamp.toNumber() * 1000).toLocaleString();

                let statusColorClass = "text-yellow-600"; // Default for Pending
                if (transcript.status === TranscriptStatus.AcceptedByStudent) statusColorClass = "text-green-600";
                else if (transcript.status === TranscriptStatus.RejectedByStudent || transcript.status === TranscriptStatus.RevokedByInstitution) statusColorClass = "text-red-600";

                let verificationMessage = `Transcript ID ${idToVerify} is FOUND.`;
                if (transcript.status === TranscriptStatus.AcceptedByStudent) {
                    verificationMessage = `Transcript ID ${idToVerify} is VERIFIED and ACCEPTED by Student.`;
                } else if (transcript.status === TranscriptStatus.RejectedByStudent) {
                    verificationMessage = `Transcript ID ${idToVerify} was REJECTED by Student.`;
                } else if (transcript.status === TranscriptStatus.RevokedByInstitution) {
                    verificationMessage = `Transcript ID ${idToVerify} was REVOKED by Institution.`;
                }


                verificationResultArea.innerHTML = `
                    <p class="font-bold text-lg ${statusColorClass}">
                        ${verificationMessage}
                    </p>
                    <p class="mb-3"><strong>Current Status:</strong> <span class="font-semibold ${statusColorClass}">${statusString}</span></p>
                    <div class="mt-2 text-sm text-gray-700 space-y-1">
                        <p><strong>Student Name:</strong> ${transcript.studentName}</p>
                        <p><strong>Student Ethereum Address:</strong> ${transcript.studentAddress}</p>
                        <p><strong>Student ID (Institution):</strong> ${transcript.studentId}</p>
                        <p><strong>Issuing Institution:</strong> ${transcript.issuingInstitution}</p>
                        <p><strong>Program:</strong> ${transcript.programName}</p>
                        <p><strong>Graduation Date:</strong> ${gradDate}</p>
                        <p><strong>Issued By (Address):</strong> ${transcript.issuerAddress}</p>
                        <p><strong>Issued On:</strong> ${issueDate}</p>
                        <h4 class="text-md font-semibold pt-2">Courses:</h4>
                        <ul class="list-disc pl-5 space-y-px">${coursesHtml}</ul>
                    </div>`;
            } catch (error) {
                console.error(`Error verifying transcript ${idToVerify}:`, error);
                verificationResultArea.innerHTML = `<p class="text-red-600">Error verifying ID: ${error.message}</p>`;
            }
        });
    }

    // --- Footer Year ---
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) {
        currentYearEl.textContent = new Date().getFullYear();
    }
});
