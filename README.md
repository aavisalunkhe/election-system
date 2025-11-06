# Election Management System - DBMS Project

A comprehensive database management system for managing elections, built with Flask and SQLite.

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
- **Deployment:** Render / PythonAnywhere / Railway

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

### Step 5: Access the Application

Open your browser and navigate to:
```
http://localhost:5000
```

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

## Deployment Options

### Option 1: Render (Recommended - Free Tier Available)

1. Create `requirements.txt`:
```txt
Flask==2.3.3
Werkzeug==2.3.7
```

2. Create `render.yaml`:
```yaml
services:
  - type: web
    name: election-system
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: python app.py
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
```

3. Steps:
   - Create account on [Render.com](https://render.com)
   - Connect your GitHub repository
   - Create new "Web Service"
   - Select your repository
   - Use these settings:
     - **Build Command:** `pip install -r requirements.txt`
     - **Start Command:** `python app.py`
   - Click "Create Web Service"

### Option 2: PythonAnywhere (Free Tier)

1. Create account on [PythonAnywhere.com](https://www.pythonanywhere.com)
2. Upload your files via "Files" tab
3. Create a new web app (Flask, Python 3.x)
4. Configure WSGI file to point to your app.py
5. Reload the web app

### Option 3: Railway (Free Trial)

1. Create account on [Railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Railway will auto-detect Flask and deploy
5. Click on the deployment to get your URL

### Option 4: Heroku (Paid)

1. Create `Procfile`:
```
web: python app.py
```

2. Deploy:
```bash
heroku login
heroku create your-app-name
git push heroku main
```

## Important Notes

### Why NOT GitHub Pages?

❌ **GitHub Pages does NOT support:**
- Python/Flask applications
- Backend processing
- Database operations
- Server-side code

✅ **GitHub Pages ONLY supports:**
- Static HTML/CSS/JavaScript
- No backend/database

**Solution:** Use Render, PythonAnywhere, or Railway instead.

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

3. Consider adding authentication for sensitive operations

4. Use environment variables for sensitive configuration

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

## Troubleshooting

### Port Already in Use
```bash
# Change port in app.py
app.run(debug=True, host='0.0.0.0', port=5001)
```

### Database Errors
```bash
# Delete and recreate database
rm election.db
python app.py
```

### Module Not Found
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

### Chart Not Displaying
- Check browser console for errors
- Ensure Chart.js CDN is accessible
- Clear browser cache

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

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## License

This project is created for educational purposes as part of a DBMS course project.

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open an issue on GitHub
4. Contact team members

---

**Built with ❤️ by Bhargavi Salunkhe, Sakshi Patil, and Shivanjali Pawar**