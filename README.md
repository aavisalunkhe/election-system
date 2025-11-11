# Election Management System - DBMS Project

A comprehensive database management system for managing elections, built with Flask and SQLite.
Live: https://election-system-ro2d.onrender.com/

**Team Members:**
- Bhargavi Salunkhe
- Sakshi Patil
- Shivanjali Pawar

## Features

✅ **Complete CRUD Operations** for all entities
- Parties
- Candidates
- Voters
- Elections
- Votes

✅ **Interactive Voting System**
- Real-time vote casting
- Duplicate vote prevention
- Candidate selection by election

✅ **Results & Analytics**
- Vote distribution charts
- Party-wise statistics
- Election turnout analysis
- Results report generation

✅ **Advanced Queries**
- Pre-defined SQL queries
- Party performance analysis
- Voter turnout calculations
- Authority history tracking

✅ **Data Management**
- Search & filter functionality
- JSON export for all tables
- Comprehensive results reports

## Technology Stack

- **Backend:** Flask (Python 3.7+)
- **Database:** SQLite3
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Visualization:** Chart.js
- **Deployment:** Render

## Project Structure

```
election-management-system/
│
├── app.py                  # Flask application (backend)
├── election.db             # SQLite database (auto-generated)
├── requirements.txt        # Python dependencies
│
├── templates/
│   └── index.html         # Main HTML template
│
└── static/
    └── app.js             # Frontend JavaScript
```

## Installation & Setup

### Prerequisites

- Python 3.7 or higher
- pip (Python package manager)

### Step 1: Clone/Download the Project

```bash
git clone https://github.com/yourusername/election-management-system.git
cd election-management-system
```

### Step 2: Create Virtual Environment (Recommended)

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run the Application

```bash
python app.py
```

The application will start on `http://127.0.0.1:5000`

## Database Schema

### Tables

1. **parties** - Political parties
   - id (PK), name, symbol

2. **candidates** - Election candidates
   - id (PK), name, party_id (FK), election_id (FK)

3. **voters** - Registered voters
   - id (PK), name, sex, authority_id (FK), aadhaar

4. **elections** - Election events
   - id (PK), voters, participants, result_date, ruling, authority_id (FK)

5. **votes** - Individual votes
   - id (PK), candidate_id (FK), date, election_id (FK), voter_id (FK)

6. **citizens** - Citizen information
   - aadhaar (PK), name, dob, age, gender

7. **authorities** - Election authorities
   - id (PK), name, chief, experience, established

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Get system statistics

### Parties
- `GET /api/parties` - Get all parties
- `POST /api/parties` - Create party
- `PUT /api/parties/<id>` - Update party
- `DELETE /api/parties/<id>` - Delete party

### Candidates
- `GET /api/candidates` - Get all candidates
- `POST /api/candidates` - Create candidate
- `PUT /api/candidates/<id>` - Update candidate
- `DELETE /api/candidates/<id>` - Delete candidate

### Voters
- `GET /api/voters` - Get all voters
- `POST /api/voters` - Create voter
- `PUT /api/voters/<id>` - Update voter
- `DELETE /api/voters/<id>` - Delete voter

### Elections
- `GET /api/elections` - Get all elections
- `POST /api/elections` - Create election
- `PUT /api/elections/<id>` - Update election
- `DELETE /api/elections/<id>` - Delete election

### Votes
- `GET /api/votes` - Get all votes
- `POST /api/votes` - Cast vote
- `DELETE /api/votes/<id>` - Delete vote

### Queries
- `GET /api/query/<query_num>` - Execute predefined queries (1-6)

### Export
- `GET /api/export/<table_name>` - Export table data as JSON

### Database Persistence

- SQLite database (`election.db`) is created automatically on first run
- Contains sample data for testing
- Database persists between application restarts
- For cloud deployment, consider using environment variables for database path

### Security Considerations

⚠️ **Before production deployment:**

1. Change the secret key in `app.py`:
```python
app.config['SECRET_KEY'] = 'your-random-secret-key-here'
```

2. Set `debug=False` in production:
```python
if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)
```

## Usage Guide

### 1. Dashboard
- View system statistics
- See party-wise candidate distribution chart

### 2. Parties Management
- Add, edit, delete political parties
- View candidate count per party
- Export party data

### 3. Candidates Management
- Add candidates to parties and elections
- Edit candidate information
- Delete candidates

### 4. Voters Management
- Register new voters
- Update voter information
- Track voter-authority relationships

### 5. Elections Management
- Create new elections
- Set result dates and ruling spans
- Assign election authorities

### 6. Results Management
- View all cast votes
- See vote distribution charts
- Add individual vote records
- Generate comprehensive results reports

### 7. Cast Vote Interface
- Select election
- Choose voter ID
- Pick candidate
- Submit vote (prevents duplicate voting)

### 8. Queries
Execute pre-defined analytical queries:
1. Party with most votes (post-1989)
2. Voter change percentage (2010-2015)
3. Election authority activity history
4. Citizens who aren't registered voters
5. Top 3 candidates by vote count
6. Voter turnout by election

## Sample Data

The application comes pre-loaded with sample data:
- 5 Political Parties
- 10 Candidates
- 8 Voters
- 9 Elections
- 8 Cast Votes
- 9 Citizens
- 3 Election Authorities

## Future Enhancements

- User authentication & authorization
- Role-based access control (Admin, Authority, Voter)
- Real-time vote counting
- Email notifications
- Advanced reporting with PDF export
- Multi-language support
- Mobile application
- Blockchain integration for vote verification

**Built with ❤️ by Bhargavi Salunkhe, Sakshi Patil, and Shivanjali Pawar**
