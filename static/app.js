 // Global variables
let currentChart = null;
let votesChart = null;
let allData = {
    parties: [],
    candidates: [],
    voters: [],
    elections: [],
    votes: [],
    authorities: []
};

// Utility Functions
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Request failed');
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

function showAlert(elementId, message, type = 'success') {
    const alertDiv = document.getElementById(elementId);
    alertDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => alertDiv.innerHTML = '', 3000);
}

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function searchTable(input, tableId) {
    const filter = input.value.toUpperCase();
    const table = document.getElementById(tableId);
    const tr = table.getElementsByTagName('tr');
    
    for (let i = 1; i < tr.length; i++) {
        const td = tr[i].getElementsByTagName('td');
        let found = false;
        for (let j = 0; j < td.length; j++) {
            if (td[j].textContent.toUpperCase().indexOf(filter) > -1) {
                found = true;
                break;
            }
        }
        tr[i].style.display = found ? '' : 'none';
    }
}

// Load all data
async function loadAllData() {
    try {
        allData.parties = await fetchAPI('/api/parties');
        allData.candidates = await fetchAPI('/api/candidates');
        allData.voters = await fetchAPI('/api/voters');
        allData.elections = await fetchAPI('/api/elections');
        allData.votes = await fetchAPI('/api/votes');
        allData.authorities = await fetchAPI('/api/authorities');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// Helper functions
function getPartyName(partyId) {
    const party = allData.parties.find(p => p.id === partyId);
    return party ? party.name : 'Unknown';
}

function getCandidateName(candidateId) {
    const candidate = allData.candidates.find(c => c.id === candidateId);
    return candidate ? candidate.name : 'Unknown';
}

function getVoterName(voterId) {
    const voter = allData.voters.find(v => v.id === voterId);
    return voter ? voter.name : 'Unknown';
}

function getAuthorityName(authorityId) {
    const authority = allData.authorities.find(a => a.id === authorityId);
    return authority ? authority.name : 'Unknown';
}

// Dashboard
async function renderDashboard() {
    try {
        const data = await fetchAPI('/api/dashboard');
        
        document.getElementById('totalParties').textContent = data.totalParties;
        document.getElementById('totalCandidates').textContent = data.totalCandidates;
        document.getElementById('totalVoters').textContent = data.totalVoters;
        document.getElementById('totalElections').textContent = data.totalElections;

        const ctx = document.getElementById('dashboardChart');
        
        if (currentChart) {
            currentChart.destroy();
        }

        currentChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.chartData.labels,
                datasets: [{
                    label: 'Number of Candidates',
                    data: data.chartData.values,
                    backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b'],
                    borderWidth: 0,
                    borderRadius: 10
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: true, position: 'top' },
                    title: { display: true, text: 'Candidates by Party', font: { size: 18 } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering dashboard:', error);
    }
}

// Parties
async function renderParties() {
    await loadAllData();
    const tbody = document.getElementById('partiesBody');
    tbody.innerHTML = '';
    
    allData.parties.forEach(party => {
        tbody.innerHTML += `
            <tr>
                <td>${party.id}</td>
                <td><strong>${party.name}</strong></td>
                <td>${party.symbol}</td>
                <td><span class="badge badge-primary">${party.candidate_count || 0} Candidates</span></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="editParty(${party.id})">✏️ Edit</button>
                        <button class="icon-btn delete" onclick="deleteParty(${party.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddPartyModal() {
    document.getElementById('partyModalTitle').textContent = 'Add New Party';
    document.getElementById('partyForm').reset();
    document.getElementById('partyId').value = '';
    openModal('partyModal');
}

function editParty(id) {
    const party = allData.parties.find(p => p.id === id);
    if (party) {
        document.getElementById('partyModalTitle').textContent = 'Edit Party';
        document.getElementById('partyId').value = party.id;
        document.getElementById('partyName').value = party.name;
        document.getElementById('partySymbol').value = party.symbol;
        openModal('partyModal');
    }
}

async function saveParty(event) {
    event.preventDefault();
    const id = document.getElementById('partyId').value;
    const name = document.getElementById('partyName').value;
    const symbol = document.getElementById('partySymbol').value;

    try {
        if (id) {
            await fetchAPI(`/api/parties/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, symbol })
            });
            showAlert('partyAlert', 'Party updated successfully!');
        } else {
            await fetchAPI('/api/parties', {
                method: 'POST',
                body: JSON.stringify({ name, symbol })
            });
            showAlert('partyAlert', 'Party added successfully!');
        }

        closeModal('partyModal');
        renderParties();
        renderDashboard();
    } catch (error) {
        showAlert('partyAlert', error.message, 'danger');
    }
}

async function deleteParty(id) {
    if (confirm('Are you sure you want to delete this party?')) {
        try {
            await fetchAPI(`/api/parties/${id}`, { method: 'DELETE' });
            showAlert('partyAlert', 'Party deleted successfully!', 'danger');
            renderParties();
            renderDashboard();
        } catch (error) {
            showAlert('partyAlert', error.message, 'danger');
        }
    }
}

// Candidates
async function renderCandidates() {
    await loadAllData();
    const tbody = document.getElementById('candidatesBody');
    tbody.innerHTML = '';
    
    allData.candidates.forEach(candidate => {
        tbody.innerHTML += `
            <tr>
                <td>${candidate.id}</td>
                <td><strong>${candidate.name}</strong></td>
                <td>${candidate.party_name || getPartyName(candidate.party_id)}</td>
                <td><span class="badge badge-info">Election ${candidate.election_id}</span></td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="editCandidate(${candidate.id})">✏️ Edit</button>
                        <button class="icon-btn delete" onclick="deleteCandidate(${candidate.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddCandidateModal() {
    document.getElementById('candidateModalTitle').textContent = 'Add New Candidate';
    document.getElementById('candidateForm').reset();
    document.getElementById('candidateId').value = '';
    populatePartySelect();
    populateElectionSelect();
    openModal('candidateModal');
}

function populatePartySelect() {
    const select = document.getElementById('candidateParty');
    select.innerHTML = '<option value="">-- Select Party --</option>';
    allData.parties.forEach(party => {
        select.innerHTML += `<option value="${party.id}">${party.name}</option>`;
    });
}

function populateElectionSelect() {
    const selects = ['candidateElection', 'voteElection', 'voteElectionSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">-- Select Election --</option>';
            allData.elections.forEach(election => {
                select.innerHTML += `<option value="${election.id}">Election ${election.id} (${election.result_date})</option>`;
            });
        }
    });
}

function editCandidate(id) {
    const candidate = allData.candidates.find(c => c.id === id);
    if (candidate) {
        document.getElementById('candidateModalTitle').textContent = 'Edit Candidate';
        document.getElementById('candidateId').value = candidate.id;
        document.getElementById('candidateName').value = candidate.name;
        populatePartySelect();
        populateElectionSelect();
        document.getElementById('candidateParty').value = candidate.party_id;
        document.getElementById('candidateElection').value = candidate.election_id;
        openModal('candidateModal');
    }
}

async function saveCandidate(event) {
    event.preventDefault();
    const id = document.getElementById('candidateId').value;
    const name = document.getElementById('candidateName').value;
    const partyId = parseInt(document.getElementById('candidateParty').value);
    const electionId = parseInt(document.getElementById('candidateElection').value);

    try {
        if (id) {
            await fetchAPI(`/api/candidates/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, partyId, electionId })
            });
            showAlert('candidateAlert', 'Candidate updated successfully!');
        } else {
            await fetchAPI('/api/candidates', {
                method: 'POST',
                body: JSON.stringify({ name, partyId, electionId })
            });
            showAlert('candidateAlert', 'Candidate added successfully!');
        }

        closeModal('candidateModal');
        renderCandidates();
        renderDashboard();
    } catch (error) {
        showAlert('candidateAlert', error.message, 'danger');
    }
}

async function deleteCandidate(id) {
    if (confirm('Are you sure you want to delete this candidate?')) {
        try {
            await fetchAPI(`/api/candidates/${id}`, { method: 'DELETE' });
            showAlert('candidateAlert', 'Candidate deleted successfully!', 'danger');
            renderCandidates();
            renderDashboard();
        } catch (error) {
            showAlert('candidateAlert', error.message, 'danger');
        }
    }
}

// Voters
async function renderVoters() {
    await loadAllData();
    const tbody = document.getElementById('votersBody');
    tbody.innerHTML = '';
    
    allData.voters.forEach(voter => {
        tbody.innerHTML += `
            <tr>
                <td>${voter.id}</td>
                <td><strong>${voter.name}</strong></td>
                <td>${voter.sex === 'M' ? 'Male' : 'Female'}</td>
                <td>${voter.authority_id}</td>
                <td>${voter.aadhaar}</td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="editVoter(${voter.id})">✏️ Edit</button>
                        <button class="icon-btn delete" onclick="deleteVoter(${voter.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddVoterModal() {
    document.getElementById('voterModalTitle').textContent = 'Register New Voter';
    document.getElementById('voterForm').reset();
    document.getElementById('voterId').value = '';
    populateAuthoritySelect();
    openModal('voterModal');
}

function populateAuthoritySelect() {
    const selects = ['voterAuthority', 'electionAuthority'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">-- Select Authority --</option>';
            allData.authorities.forEach(auth => {
                select.innerHTML += `<option value="${auth.id}">${auth.name} (${auth.chief})</option>`;
            });
        }
    });
}

function editVoter(id) {
    const voter = allData.voters.find(v => v.id === id);
    if (voter) {
        document.getElementById('voterModalTitle').textContent = 'Edit Voter';
        document.getElementById('voterId').value = voter.id;
        document.getElementById('voterName').value = voter.name;
        document.getElementById('voterGender').value = voter.sex;
        populateAuthoritySelect();
        document.getElementById('voterAuthority').value = voter.authority_id;
        document.getElementById('voterAadhaar').value = voter.aadhaar;
        openModal('voterModal');
    }
}

async function saveVoter(event) {
    event.preventDefault();
    const id = document.getElementById('voterId').value;
    const name = document.getElementById('voterName').value;
    const sex = document.getElementById('voterGender').value;
    const authorityId = parseInt(document.getElementById('voterAuthority').value);
    const aadhaar = parseInt(document.getElementById('voterAadhaar').value);

    try {
        if (id) {
            await fetchAPI(`/api/voters/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ name, sex, authorityId, aadhaar })
            });
            showAlert('voterAlert', 'Voter updated successfully!');
        } else {
            await fetchAPI('/api/voters', {
                method: 'POST',
                body: JSON.stringify({ name, sex, authorityId, aadhaar })
            });
            showAlert('voterAlert', 'Voter registered successfully!');
        }

        closeModal('voterModal');
        renderVoters();
        renderDashboard();
    } catch (error) {
        showAlert('voterAlert', error.message, 'danger');
    }
}

async function deleteVoter(id) {
    if (confirm('Are you sure you want to delete this voter?')) {
        try {
            await fetchAPI(`/api/voters/${id}`, { method: 'DELETE' });
            showAlert('voterAlert', 'Voter deleted successfully!', 'danger');
            renderVoters();
            renderDashboard();
        } catch (error) {
            showAlert('voterAlert', error.message, 'danger');
        }
    }
}

// Elections
async function renderElections() {
    await loadAllData();
    const tbody = document.getElementById('electionsBody');
    tbody.innerHTML = '';
    
    allData.elections.forEach(election => {
        tbody.innerHTML += `
            <tr>
                <td><strong>${election.id}</strong></td>
                <td>${election.voters.toLocaleString()}</td>
                <td>${election.participants}</td>
                <td>${election.result_date}</td>
                <td>${election.ruling} years</td>
                <td>${election.authority_name || getAuthorityName(election.authority_id)}</td>
                <td>
                    <div class="action-icons">
                        <button class="icon-btn edit" onclick="editElection(${election.id})">✏️ Edit</button>
                        <button class="icon-btn delete" onclick="deleteElection(${election.id})">🗑️ Delete</button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function openAddElectionModal() {
    document.getElementById('electionModalTitle').textContent = 'Create New Election';
    document.getElementById('electionForm').reset();
    document.getElementById('electionId').value = '';
    populateAuthoritySelect();
    openModal('electionModal');
}

function editElection(id) {
    const election = allData.elections.find(e => e.id === id);
    if (election) {
        document.getElementById('electionModalTitle').textContent = 'Edit Election';
        document.getElementById('electionId').value = election.id;
        document.getElementById('electionVoters').value = election.voters;
        document.getElementById('electionParticipants').value = election.participants;
        document.getElementById('electionResultDate').value = election.result_date;
        document.getElementById('electionRuling').value = election.ruling;
        populateAuthoritySelect();
        document.getElementById('electionAuthority').value = election.authority_id;
        openModal('electionModal');
    }
}

async function saveElection(event) {
    event.preventDefault();
    const id = document.getElementById('electionId').value;
    const voters = parseInt(document.getElementById('electionVoters').value);
    const participants = parseInt(document.getElementById('electionParticipants').value);
    const resultDate = document.getElementById('electionResultDate').value;
    const ruling = document.getElementById('electionRuling').value;
    const authorityId = parseInt(document.getElementById('electionAuthority').value);

    try {
        if (id) {
            await fetchAPI(`/api/elections/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ voters, participants, resultDate, ruling, authorityId })
            });
            showAlert('electionAlert', 'Election updated successfully!');
        } else {
            await fetchAPI('/api/elections', {
                method: 'POST',
                body: JSON.stringify({ voters, participants, resultDate, ruling, authorityId })
            });
            showAlert('electionAlert', 'Election created successfully!');
        }

        closeModal('electionModal');
        renderElections();
        renderDashboard();
    } catch (error) {
        showAlert('electionAlert', error.message, 'danger');
    }
}

async function deleteElection(id) {
    if (confirm('Are you sure you want to delete this election?')) {
        try {
            await fetchAPI(`/api/elections/${id}`, { method: 'DELETE' });
            showAlert('electionAlert', 'Election deleted successfully!', 'danger');
            renderElections();
            renderDashboard();
        } catch (error) {
            showAlert('electionAlert', error.message, 'danger');
        }
    }
}

// Results/Votes
async function renderResults() {
    await loadAllData();
    const tbody = document.getElementById('votesBody');
    tbody.innerHTML = '';
    
    allData.votes.forEach(vote => {
        tbody.innerHTML += `
            <tr>
                <td>${vote.id}</td>
                <td>${vote.candidate_name || getCandidateName(vote.candidate_id)}</td>
                <td>${vote.date}</td>
                <td><span class="badge badge-info">Election ${vote.election_id}</span></td>
                <td>${vote.voter_name || getVoterName(vote.voter_id)}</td>
                <td>
                    <button class="icon-btn delete" onclick="deleteVote(${vote.id})">🗑️ Delete</button>
                </td>
            </tr>
        `;
    });

    // Render chart
    const ctx = document.getElementById('votesChart');
    const voteCounts = {};
    allData.votes.forEach(v => {
        const candidateName = v.candidate_name || getCandidateName(v.candidate_id);
        voteCounts[candidateName] = (voteCounts[candidateName] || 0) + 1;
    });

    if (votesChart) {
        votesChart.destroy();
    }

    votesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(voteCounts),
            datasets: [{
                label: 'Votes Received',
                data: Object.values(voteCounts),
                backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'right' },
                title: { display: true, text: 'Vote Distribution by Candidate', font: { size: 18 } }
            }
        }
    });
}

function openAddVoteModal() {
    populateCandidateSelect();
    populateElectionSelect();
    populateVoterSelect();
    document.getElementById('voteDate').value = new Date().toISOString().split('T')[0];
    openModal('voteModal');
}

function populateCandidateSelect() {
    const select = document.getElementById('voteCandidate');
    select.innerHTML = '<option value="">-- Select Candidate --</option>';
    allData.candidates.forEach(candidate => {
        select.innerHTML += `<option value="${candidate.id}">${candidate.name} (${getPartyName(candidate.party_id)})</option>`;
    });
}

function populateVoterSelect() {
    const selects = ['voteVoter', 'voteVoterSelect'];
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            select.innerHTML = '<option value="">-- Select Voter --</option>';
            allData.voters.forEach(voter => {
                select.innerHTML += `<option value="${voter.id}">${voter.name} (ID: ${voter.id})</option>`;
            });
        }
    });
}

async function saveVote(event) {
    event.preventDefault();
    const candidateId = parseInt(document.getElementById('voteCandidate').value);
    const date = document.getElementById('voteDate').value;
    const electionId = parseInt(document.getElementById('voteElection').value);
    const voterId = parseInt(document.getElementById('voteVoter').value);

    try {
        await fetchAPI('/api/votes', {
            method: 'POST',
            body: JSON.stringify({ candidateId, date, electionId, voterId })
        });
        showAlert('voteAlert', 'Vote record added successfully!');
        closeModal('voteModal');
        renderResults();
    } catch (error) {
        showAlert('voteAlert', error.message, 'danger');
    }
}

async function deleteVote(id) {
    if (confirm('Are you sure you want to delete this vote?')) {
        try {
            await fetchAPI(`/api/votes/${id}`, { method: 'DELETE' });
            showAlert('voteAlert', 'Vote deleted successfully!', 'danger');
            renderResults();
        } catch (error) {
            showAlert('voteAlert', error.message, 'danger');
        }
    }
}

// Voting Interface
async function loadVotingInterface() {
    await loadAllData();
    populateElectionSelect();
    populateVoterSelect();
}

function loadCandidatesForVoting() {
    const electionId = parseInt(document.getElementById('voteElectionSelect').value);
    const candidatesList = document.getElementById('candidatesVotingList');
    
    if (!electionId) {
        candidatesList.innerHTML = '';
        return;
    }

    const candidates = allData.candidates.filter(c => c.election_id === electionId);
    
    if (candidates.length === 0) {
        candidatesList.innerHTML = '<div class="vote-card"><p>No candidates available for this election.</p></div>';
        return;
    }

    candidatesList.innerHTML = '<div class="vote-card"><h4>Select Candidate</h4>';
    candidates.forEach(candidate => {
        const party = allData.parties.find(p => p.id === candidate.party_id);
        candidatesList.innerHTML += `
            <div style="padding: 10px; margin: 5px 0; border: 2px solid #e0e0e0; border-radius: 5px; cursor: pointer;" 
                 onclick="selectCandidate(${candidate.id})" 
                 id="candidate-${candidate.id}">
                <strong>${candidate.name}</strong> - ${party ? party.name : 'Unknown'} (${party ? party.symbol : ''})
            </div>
        `;
    });
    candidatesList.innerHTML += '</div>';
}

let selectedCandidateId = null;

function selectCandidate(candidateId) {
    document.querySelectorAll('[id^="candidate-"]').forEach(el => {
        el.style.border = '2px solid #e0e0e0';
        el.style.background = 'white';
    });
    
    const selected = document.getElementById(`candidate-${candidateId}`);
    selected.style.border = '2px solid #667eea';
    selected.style.background = '#f0f4ff';
    selectedCandidateId = candidateId;
}

async function submitVote() {
    const electionId = parseInt(document.getElementById('voteElectionSelect').value);
    const voterId = parseInt(document.getElementById('voteVoterSelect').value);
    
    if (!electionId || !voterId || !selectedCandidateId) {
        showAlert('votingAlert', 'Please select election, voter, and candidate!', 'danger');
        return;
    }

    try {
        await fetchAPI('/api/votes', {
            method: 'POST',
            body: JSON.stringify({
                candidateId: selectedCandidateId,
                date: new Date().toISOString().split('T')[0],
                electionId: electionId,
                voterId: voterId
            })
        });

        showAlert('votingAlert', 'Vote cast successfully! 🗳️');
        document.getElementById('voteElectionSelect').value = '';
        document.getElementById('voteVoterSelect').value = '';
        document.getElementById('candidatesVotingList').innerHTML = '';
        selectedCandidateId = null;
        
        await loadAllData();
        renderResults();
    } catch (error) {
        showAlert('votingAlert', error.message, 'danger');
    }
}

// Export Data
async function exportData(type) {
    try {
        const data = await fetchAPI(`/api/export/${type}`);
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${type}_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    } catch (error) {
        console.error('Export error:', error);
    }
}

// Generate Results Report
async function generateResultsReport() {
    await loadAllData();
    const report = {};
    
    allData.elections.forEach(election => {
        const electionVotes = allData.votes.filter(v => v.election_id === election.id);
        const candidateVotes = {};
        
        electionVotes.forEach(vote => {
            const candidate = allData.candidates.find(c => c.id === vote.candidate_id);
            if (candidate) {
                const candidateName = candidate.name;
                candidateVotes[candidateName] = (candidateVotes[candidateName] || 0) + 1;
            }
        });
        
        const winner = Object.entries(candidateVotes).sort((a, b) => b[1] - a[1])[0];
        
        report[`Election ${election.id}`] = {
            totalVotes: electionVotes.length,
            candidateVotes: candidateVotes,
            winner: winner ? `${winner[0]} with ${winner[1]} votes` : 'No votes cast'
        };
    });
    
    const reportStr = JSON.stringify(report, null, 2);
    const reportBlob = new Blob([reportStr], {type: 'application/json'});
    const url = URL.createObjectURL(reportBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `election_results_report_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    showAlert('voteAlert', 'Results report generated and downloaded!');
}

// Query Execution
async function executeQuery(queryNum) {
    const resultsDiv = document.getElementById('queryResults');
    
    try {
        const result = await fetchAPI(`/api/query/${queryNum}`);
        let html = '';

        switch(queryNum) {
            case 1:
                html = `<div class="query-section"><h3>Query 1: Party with Most Votes (After 1989)</h3>
                        <p><strong>Result:</strong> ${result.party} with ${result.count} votes</p></div>`;
                break;

            case 2:
                if (result.error) {
                    html = `<div class="query-section"><h3>Query 2: Voter Change % (2010-2015)</h3>
                            <p>${result.error}</p></div>`;
                } else {
                    html = `<div class="query-section"><h3>Query 2: Voter Change % (2010-2015)</h3>
                            <p><strong>2010 Voters:</strong> ${result.voters_2010}</p>
                            <p><strong>2015 Voters:</strong> ${result.voters_2015}</p>
                            <p><strong>Change:</strong> ${result.change_percent}%</p></div>`;
                }
                break;

            case 3:
                html = '<div class="query-section"><h3>Query 3: Election Authority History</h3><table><tr><th>Authority</th><th>Years Active</th></tr>';
                result.authorities.forEach(auth => {
                    html += `<tr><td>${auth.name}</td><td>${auth.years || 'No records'}</td></tr>`;
                });
                html += '</table></div>';
                break;

            case 4:
                html = `<div class="query-section"><h3>Query 4: Citizens Who Are Not Voters</h3>
                        <p><strong>Total Non-Voters:</strong> ${result.non_voters.length}</p>
                        <p><strong>Names:</strong> ${result.non_voters.map(c => c.name).join(', ') || 'None'}</p></div>`;
                break;

            case 5:
                html = '<div class="query-section"><h3>Query 5: Top 3 Candidates by Votes</h3><table><tr><th>Rank</th><th>Candidate</th><th>Votes</th></tr>';
                result.top_candidates.forEach((c, i) => {
                    html += `<tr><td>${i + 1}</td><td>${c.name}</td><td><span class="badge badge-success">${c.vote_count} votes</span></td></tr>`;
                });
                html += '</table></div>';
                break;

            case 6:
                html = '<div class="query-section"><h3>Query 6: Voter Turnout by Election</h3><table><tr><th>Election ID</th><th>Expected Voters</th><th>Actual Votes</th><th>Turnout %</th></tr>';
                result.turnout.forEach(t => {
                    html += `<tr><td>${t.id}</td><td>${t.expected}</td><td>${t.actual}</td><td><span class="badge badge-${t.turnout > 50 ? 'success' : 'danger'}">${t.turnout}%</span></td></tr>`;
                });
                html += '</table></div>';
                break;
        }

        resultsDiv.innerHTML = html;
    } catch (error) {
        resultsDiv.innerHTML = `<div class="alert alert-danger">Error executing query: ${error.message}</div>`;
    }
}

// Tab Navigation
function showTab(tabName) {
    document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');

    if (tabName === 'dashboard') renderDashboard();
    else if (tabName === 'parties') renderParties();
    else if (tabName === 'candidates') renderCandidates();
    else if (tabName === 'voters') renderVoters();
    else if (tabName === 'elections') renderElections();
    else if (tabName === 'results') renderResults();
    else if (tabName === 'voting') loadVotingInterface();
}

// Initialize on load
window.onload = async () => {
    await loadAllData();
    renderDashboard();
};

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}