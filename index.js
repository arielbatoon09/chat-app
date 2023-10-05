const express = require('express');
const http = require('http');
const mysql = require('mysql2');
const app = express();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const secretKey = 'YpJ:DgW,InO(rd^';

// Socket
const socketIo = require('socket.io');
const server = http.createServer(app);
const io = socketIo(server);
let socketUserID = null;

// Enable JSON parsing for request bodies
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Create a MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'chatappdb',
});

// Connect to Database
db.connect((err) => {
    if (!err) {
        console.log('Connected to MySQL');
    } else {
        console.error('Error connecting to MySQL: ', err);
        return;
    }
});

// Public Router
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
});
app.get('/register', (req, res) => {
    res.sendFile(__dirname + '/public/register.html');
});
app.get('/home', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});
app.get('/chat', (req, res) => {
    res.sendFile(__dirname + '/public/chat.html');
});

// Socket Connection
server.listen(3000, () => {
    console.log('Server is running on port 3000');
});

io.on('connection', (socket) => {
    const userID = socketUserID;

    console.log('A user connected');

    socket.on("chat message", (message) => {
        io.emit("chat message", { message, userID: userID });
    });

    socket.on("disconnect", () => {
        console.log("disconnected");
    });
});

// User Registration
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const checkAccountQuery = 'SELECT * FROM user WHERE username = ?';

    db.query(checkAccountQuery, [username], (err, result) => {
        if (err) {
            console.error('Error checking username: ', err);
            return res.status(500).json({ message: 'Server error' });
        }

        if (result.length > 0) {
            return res.json({
                status: 'error',
                message: 'Username already exists!',
            });
        }

        // Password Hashing
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password: ', err);
                return res.status(500).json({ message: 'Server error' });
            }

            // Store Data
            const insertUserQuery = 'INSERT INTO user (username, password) VALUES (?, ?)';
            db.query(insertUserQuery, [username, hashedPassword], (err) => {
                if (err) {
                    console.error('Error registering user: ', err);
                    return res.status(500).json({ message: 'Server error' });
                }

                return res.json({
                    status: 'success',
                    message: 'Registered successfully!',
                });
            });
        });
    });
});

// User Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Check if the user exists
    const checkAccountQuery = 'SELECT * FROM user WHERE username = ?';
    db.query(checkAccountQuery, [username], (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (results.length === 0) {
            return res.json({
                status: 'error',
                message: 'Account is not exist!',
            });
        }
        // Compare the provided password with the hashed password
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.json({
                    status: 'error',
                    message: 'Invalid Account!',
                });
            }
            // Generate and send a JWT token
            const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });

            // Set the token in the HTTP-only cookie
            res.cookie('token', token, { httpOnly: true });

            return res.json({
                status: 'success',
                message: 'Login Successfully!',
            });
        });
    });
});

// Middleware function to verify JWT token from the headers
const verifyToken = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication failed' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Authentication failed' });
        }

        req.userId = decoded.userId;
        next();
    });
};

// Protected route
app.get('/api/userInfo', verifyToken, (req, res) => {
    const userId = req.userId;
    socketUserID = req.userId;

    const getUserQuery = 'SELECT * FROM user WHERE id = ?';

    db.query(getUserQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Server error' });
        }

        res.json({
            status: 'success',
            data: results,
        });
    });
});

app.get('/api/logout', verifyToken, (req, res) => {
    res.cookie('token', '', { expires: new Date(0), httpOnly: true });
    res.status(200).json({ message: 'Logged out successfully' });
});


// Protected route that requires token verification
app.get('/api/protected', verifyToken, (req, res) => {
    // If the token is verified, you can access the user's ID via req.userId
    res.status(200).json({ message: 'Protected route accessed', userId: req.userId });
});