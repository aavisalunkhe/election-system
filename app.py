from flask import Flask, render_template, request, jsonify, send_file
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here-change-in-production'

# Database initialization
def init_db():
    conn = sqlite3.connect('election.db')
    c = conn.cursor()
    
    # Create tables
    c.execute('''CREATE TABLE IF NOT EXISTS parties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS elections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voters INTEGER NOT NULL,
        participants INTEGER NOT NULL,
        result_date TEXT NOT NULL,
        ruling TEXT NOT NULL,
        authority_id INTEGER NOT NULL
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS candidates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        party_id INTEGER NOT NULL,
        election_id INTEGER NOT NULL,
        FOREIGN KEY (party_id) REFERENCES parties(id),
        FOREIGN KEY (election_id) REFERENCES elections(id)
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS voters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        sex TEXT NOT NULL,
        authority_id INTEGER NOT NULL,
        aadhaar INTEGER NOT NULL
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS votes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        candidate_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        election_id INTEGER NOT NULL,
        voter_id INTEGER NOT NULL,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id),
        FOREIGN KEY (election_id) REFERENCES elections(id),
        FOREIGN KEY (voter_id) REFERENCES voters(id)
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS citizens (
        aadhaar INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dob TEXT NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL
    )''')
    
    c.execute('''CREATE TABLE IF NOT EXISTS authorities (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        chief TEXT NOT NULL,
        experience TEXT NOT NULL,
        established TEXT NOT NULL
    )''')
    
    # Insert sample data if tables are empty
    c.execute('SELECT COUNT(*) FROM parties')
    if c.fetchone()[0] == 0:
        sample_data = [
            # Parties
            ("INSERT INTO parties (id, name, symbol) VALUES (?, ?, ?)", [
                (1, 'BJP', 'Lotus'),
                (3, 'Congress', 'Hand'),
                (4, 'AAP', 'Broom'),
                (5, 'YCP', 'Fan'),
                (6, 'TDP', 'Plough')
            ]),
            # Authorities
            ("INSERT INTO authorities (id, name, chief, experience, established) VALUES (?, ?, ?, ?, ?)", [
                (10, 'IEC', 'Birla', 'Y', '1998-08-15'),
                (20, 'MCC', 'Sitaraman', 'Y', '1989-08-15'),
                (30, 'AEC', 'Chidambram', 'N', '1998-08-15')
            ]),
            # Elections
            ("INSERT INTO elections (id, voters, participants, result_date, ruling, authority_id) VALUES (?, ?, ?, ?, ?, ?)", [
                (101, 1000, 6, '2019-03-22', '5', 10),
                (102, 1100, 7, '2017-01-01', '6', 20),
                (103, 5000, 8, '2016-05-03', '5', 30),
                (104, 7000, 5, '2013-02-07', '5', 10),
                (105, 8000, 3, '1946-01-06', '6', 20),
                (106, 9000, 2, '1991-05-07', '4', 30),
                (107, 3000, 7, '1997-01-08', '4', 10),
                (108, 9500, 9, '1947-02-10', '5', 20),
                (109, 8500, 8, '1949-06-11', '5', 30)
            ]),
            # Candidates
            ("INSERT INTO candidates (id, name, party_id, election_id) VALUES (?, ?, ?, ?)", [
                (1, 'Bhargavi', 4, 103),
                (2, 'Sakshi', 3, 105),
                (3, 'Shivanjali', 4, 107),
                (4, 'Akshay', 6, 109),
                (5, 'Guru', 3, 101),
                (6, 'Ram', 1, 109),
                (7, 'Vikram', 1, 101),
                (8, 'Hitender', 4, 104),
                (9, 'Shanu', 5, 108),
                (10, 'Vishnu', 1, 109)
            ]),
            # Voters
            ("INSERT INTO voters (id, name, sex, authority_id, aadhaar) VALUES (?, ?, ?, ?, ?)", [
                (1, 'Bhargavi', 'F', 10, 1412),
                (2, 'Ram', 'M', 20, 1734),
                (9, 'Sita', 'F', 20, 1812),
                (10, 'Siva', 'M', 30, 1914),
                (11, 'Gopi', 'F', 30, 1617),
                (12, 'Govind', 'M', 20, 1373),
                (19, 'Krish', 'M', 10, 1472),
                (20, 'Mothra', 'F', 10, 1893)
            ]),
            # Citizens
            ("INSERT INTO citizens (aadhaar, name, dob, age, gender) VALUES (?, ?, ?, ?, ?)", [
                (1412, 'Bhargavi', '2000-06-08', 24, 'F'),
                (1493, 'Bala', '1989-06-07', 35, 'M'),
                (1734, 'Ram', '1948-11-10', 76, 'M'),
                (1812, 'Sita', '1895-06-05', 129, 'F'),
                (1914, 'Siva', '1993-07-06', 31, 'M'),
                (1617, 'Gopal', '1991-08-06', 33, 'M'),
                (1373, 'Govind', '1982-05-07', 42, 'M'),
                (1472, 'Krish', '1990-01-08', 34, 'M'),
                (1893, 'Mothra', '1998-02-07', 26, 'F')
            ]),
            # Votes
            ("INSERT INTO votes (id, candidate_id, date, election_id, voter_id) VALUES (?, ?, ?, ?, ?)", [
                (11, 1, '1990-01-26', 103, 1),
                (12, 2, '1995-01-26', 106, 2),
                (19, 3, '2000-01-26', 101, 9),
                (110, 5, '2005-01-26', 102, 10),
                (111, 6, '2010-01-26', 104, 11),
                (112, 8, '2015-01-26', 108, 12),
                (119, 9, '2020-01-26', 107, 19),
                (120, 7, '2005-01-26', 107, 20)
            ])
        ]
        
        for query, data in sample_data:
            c.executemany(query, data)
    
    conn.commit()
    conn.close()

def get_db():
    conn = sqlite3.connect('election.db')
    conn.row_factory = sqlite3.Row
    return conn

# Routes
@app.route('/')
def index():
    return render_template('index.html')

# API Routes
@app.route('/api/dashboard')
def dashboard():
    conn = get_db()
    c = conn.cursor()
    
    stats = {
        'totalParties': c.execute('SELECT COUNT(*) FROM parties').fetchone()[0],
        'totalCandidates': c.execute('SELECT COUNT(*) FROM candidates').fetchone()[0],
        'totalVoters': c.execute('SELECT COUNT(*) FROM voters').fetchone()[0],
        'totalElections': c.execute('SELECT COUNT(*) FROM elections').fetchone()[0]
    }
    
    # Get party candidate counts for chart
    party_data = c.execute('''
        SELECT p.name, COUNT(c.id) as count
        FROM parties p
        LEFT JOIN candidates c ON p.id = c.party_id
        GROUP BY p.id, p.name
    ''').fetchall()
    
    stats['chartData'] = {
        'labels': [row['name'] for row in party_data],
        'values': [row['count'] for row in party_data]
    }
    
    conn.close()
    return jsonify(stats)

@app.route('/api/parties', methods=['GET', 'POST'])
def parties():
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        parties = c.execute('''
            SELECT p.*, COUNT(c.id) as candidate_count
            FROM parties p
            LEFT JOIN candidates c ON p.id = c.party_id
            GROUP BY p.id
        ''').fetchall()
        conn.close()
        return jsonify([dict(row) for row in parties])
    
    elif request.method == 'POST':
        data = request.json
        c.execute('INSERT INTO parties (name, symbol) VALUES (?, ?)',
                 (data['name'], data['symbol']))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Party added successfully'})

@app.route('/api/parties/<int:id>', methods=['PUT', 'DELETE'])
def party_detail(id):
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        c.execute('UPDATE parties SET name=?, symbol=? WHERE id=?',
                 (data['name'], data['symbol'], id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Party updated successfully'})
    
    elif request.method == 'DELETE':
        c.execute('DELETE FROM parties WHERE id=?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Party deleted successfully'})

@app.route('/api/candidates', methods=['GET', 'POST'])
def candidates():
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        candidates = c.execute('''
            SELECT c.*, p.name as party_name
            FROM candidates c
            LEFT JOIN parties p ON c.party_id = p.id
        ''').fetchall()
        conn.close()
        return jsonify([dict(row) for row in candidates])
    
    elif request.method == 'POST':
        data = request.json
        c.execute('INSERT INTO candidates (name, party_id, election_id) VALUES (?, ?, ?)',
                 (data['name'], data['partyId'], data['electionId']))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Candidate added successfully'})

@app.route('/api/candidates/<int:id>', methods=['PUT', 'DELETE'])
def candidate_detail(id):
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        c.execute('UPDATE candidates SET name=?, party_id=?, election_id=? WHERE id=?',
                 (data['name'], data['partyId'], data['electionId'], id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Candidate updated successfully'})
    
    elif request.method == 'DELETE':
        c.execute('DELETE FROM candidates WHERE id=?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Candidate deleted successfully'})

@app.route('/api/voters', methods=['GET', 'POST'])
def voters():
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        voters = c.execute('SELECT * FROM voters').fetchall()
        conn.close()
        return jsonify([dict(row) for row in voters])
    
    elif request.method == 'POST':
        data = request.json
        c.execute('INSERT INTO voters (name, sex, authority_id, aadhaar) VALUES (?, ?, ?, ?)',
                 (data['name'], data['sex'], data['authorityId'], data['aadhaar']))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Voter registered successfully'})

@app.route('/api/voters/<int:id>', methods=['PUT', 'DELETE'])
def voter_detail(id):
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        c.execute('UPDATE voters SET name=?, sex=?, authority_id=?, aadhaar=? WHERE id=?',
                 (data['name'], data['sex'], data['authorityId'], data['aadhaar'], id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Voter updated successfully'})
    
    elif request.method == 'DELETE':
        c.execute('DELETE FROM voters WHERE id=?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Voter deleted successfully'})

@app.route('/api/elections', methods=['GET', 'POST'])
def elections():
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        elections = c.execute('''
            SELECT e.*, a.name as authority_name
            FROM elections e
            LEFT JOIN authorities a ON e.authority_id = a.id
        ''').fetchall()
        conn.close()
        return jsonify([dict(row) for row in elections])
    
    elif request.method == 'POST':
        data = request.json
        c.execute('INSERT INTO elections (voters, participants, result_date, ruling, authority_id) VALUES (?, ?, ?, ?, ?)',
                 (data['voters'], data['participants'], data['resultDate'], data['ruling'], data['authorityId']))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Election created successfully'})

@app.route('/api/elections/<int:id>', methods=['PUT', 'DELETE'])
def election_detail(id):
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        c.execute('UPDATE elections SET voters=?, participants=?, result_date=?, ruling=?, authority_id=? WHERE id=?',
                 (data['voters'], data['participants'], data['resultDate'], data['ruling'], data['authorityId'], id))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Election updated successfully'})
    
    elif request.method == 'DELETE':
        c.execute('DELETE FROM elections WHERE id=?', (id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Election deleted successfully'})

@app.route('/api/votes', methods=['GET', 'POST'])
def votes():
    conn = get_db()
    c = conn.cursor()
    
    if request.method == 'GET':
        votes = c.execute('''
            SELECT v.*, c.name as candidate_name, vo.name as voter_name
            FROM votes v
            LEFT JOIN candidates c ON v.candidate_id = c.id
            LEFT JOIN voters vo ON v.voter_id = vo.id
        ''').fetchall()
        conn.close()
        return jsonify([dict(row) for row in votes])
    
    elif request.method == 'POST':
        data = request.json
        
        # Check if voter already voted in this election
        existing = c.execute('SELECT id FROM votes WHERE voter_id=? AND election_id=?',
                           (data['voterId'], data['electionId'])).fetchone()
        
        if existing:
            conn.close()
            return jsonify({'error': 'Voter has already voted in this election'}), 400
        
        c.execute('INSERT INTO votes (candidate_id, date, election_id, voter_id) VALUES (?, ?, ?, ?)',
                 (data['candidateId'], data['date'], data['electionId'], data['voterId']))
        conn.commit()
        new_id = c.lastrowid
        conn.close()
        return jsonify({'id': new_id, 'message': 'Vote recorded successfully'})

@app.route('/api/votes/<int:id>', methods=['DELETE'])
def vote_detail(id):
    conn = get_db()
    c = conn.cursor()
    c.execute('DELETE FROM votes WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Vote deleted successfully'})

@app.route('/api/authorities')
def authorities():
    conn = get_db()
    c = conn.cursor()
    authorities = c.execute('SELECT * FROM authorities').fetchall()
    conn.close()
    return jsonify([dict(row) for row in authorities])

@app.route('/api/query/<int:query_num>')
def execute_query(query_num):
    conn = get_db()
    c = conn.cursor()
    result = {}
    
    if query_num == 1:
        # Party with most candidates after 1989
        data = c.execute('''
            SELECT p.name, COUNT(v.id) as vote_count
            FROM parties p
            JOIN candidates c ON p.id = c.party_id
            JOIN votes v ON c.id = v.candidate_id
            WHERE v.date >= '1989-01-01'
            GROUP BY p.id, p.name
            ORDER BY vote_count DESC
            LIMIT 1
        ''').fetchone()
        result = {'party': data['name'] if data else 'No data', 
                 'count': data['vote_count'] if data else 0}
    
    elif query_num == 2:
        # Voter change percentage 2010-2015
        data = c.execute('''
            SELECT 
                (SELECT voters FROM elections e JOIN votes v ON e.id = v.election_id 
                 WHERE v.date LIKE '2010%' LIMIT 1) as voters_2010,
                (SELECT voters FROM elections e JOIN votes v ON e.id = v.election_id 
                 WHERE v.date LIKE '2015%' LIMIT 1) as voters_2015
        ''').fetchone()
        
        if data and data['voters_2010'] and data['voters_2015']:
            change = ((data['voters_2015'] - data['voters_2010']) / data['voters_2010']) * 100
            result = {
                'voters_2010': data['voters_2010'],
                'voters_2015': data['voters_2015'],
                'change_percent': round(change, 2)
            }
        else:
            result = {'error': 'Data not available'}
    
    elif query_num == 3:
        # Election authority history
        data = c.execute('''
            SELECT a.name, GROUP_CONCAT(DISTINCT strftime('%Y', v.date)) as years
            FROM authorities a
            JOIN voters vo ON a.id = vo.authority_id
            JOIN votes v ON vo.id = v.voter_id
            GROUP BY a.id, a.name
        ''').fetchall()
        result = {'authorities': [dict(row) for row in data]}
    
    elif query_num == 4:
        # Non-voter citizens
        data = c.execute('''
            SELECT c.name, c.aadhaar
            FROM citizens c
            WHERE c.aadhaar NOT IN (SELECT aadhaar FROM voters)
        ''').fetchall()
        result = {'non_voters': [dict(row) for row in data]}
    
    elif query_num == 5:
        # Top 3 candidates by votes
        data = c.execute('''
            SELECT c.name, COUNT(v.id) as vote_count
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            GROUP BY c.id, c.name
            ORDER BY vote_count DESC
            LIMIT 3
        ''').fetchall()
        result = {'top_candidates': [dict(row) for row in data]}
    
    elif query_num == 6:
        # Voter turnout by election
        data = c.execute('''
            SELECT e.id, e.voters as expected, COUNT(v.id) as actual,
                   ROUND(COUNT(v.id) * 100.0 / e.voters, 2) as turnout
            FROM elections e
            LEFT JOIN votes v ON e.id = v.election_id
            GROUP BY e.id, e.voters
        ''').fetchall()
        result = {'turnout': [dict(row) for row in data]}
    
    conn.close()
    return jsonify(result)

@app.route('/api/export/<table_name>')
def export_data(table_name):
    conn = get_db()
    c = conn.cursor()
    
    valid_tables = ['parties', 'candidates', 'voters', 'elections', 'votes']
    if table_name not in valid_tables:
        return jsonify({'error': 'Invalid table name'}), 400
    
    data = c.execute(f'SELECT * FROM {table_name}').fetchall()
    conn.close()
    
    return jsonify([dict(row) for row in data])

if __name__ == '__main__':
    if not os.path.exists('election.db'):
        init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)