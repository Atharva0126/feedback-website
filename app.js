const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const path = require('path');


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/feedbackDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB connected")).catch(err => console.log(err));

// Models
const User = require('./models/user');
const Feedback = require('./models/feedback');

// JWT Secret
const JWT_SECRET = "your_jwt_secret";

// Middleware to check authentication
function authenticate(req, res, next) {
    const token = req.cookies.token;
    if (!token) return res.redirect('/login');
    try {
        const user = jwt.verify(token, JWT_SECRET);
        req.user = user;
        next();
    } catch (err) {
        res.clearCookie('token');
        res.redirect('/login');
    }
}

// Routes
app.get('/', (req, res) => res.redirect('/login'));

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (user && bcrypt.compareSync(password, user.password)) {
        const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET);
        
        res.cookie('token', token);
        res.redirect('/dashboard');
    } else {
        res.send("Invalid email or password");
    }
});

app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Validate input fields
        //  if (!username || !email || !password) {
        //     return res.status(400).send("All fields are required.");
        // }
 
        // Check if the username or email already exists
        // const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        // if (existingUser) {
        //     return res.status(400).send("Username or email already in use.");
        // }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save the user
        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
    }
});


app.get('/dashboard', authenticate, async (req, res) => {
    const feedbacks = await Feedback.find({ userId: req.user.id });
    res.render('dashboard', { feedbacks, user: req.user });
});


app.get("/feedback", async (req, res) => {
    try {
        const feedbacks = await Feedback.find(); // Fetch all feedbacks
        res.render("feedback", { feedbacks });
    } catch (error) {
        res.status(500).send("Error fetching feedbacks");
    }
});

app.post("/feedback", async (req, res) => {
    
});




app.post("/edit-feedback", async (req, res) => {
    const { id, feedback } = req.body;
    try {
        await Feedback.findByIdAndUpdate(id, { content: feedback });
        res.redirect("/feedback");
    } catch (error) {
        res.status(500).send("Error updating feedback");
    }
});

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/login');
});

// Start server
app.listen(3000, () => console.log("Server running on http://localhost:3000"));

// Middleware to check if user is an admin
function isAdmin(req, res, next) {
    if (req.user.email === 'admin@gmail.com') { // Replace with your admin email
        return next();
    }
    res.status(403).send("Access Denied: Admins only");
}

// Admin Dashboard - View All Feedback
app.get('/admin', authenticate, isAdmin, async (req, res) => {
    try {
        // Fetch feedbacks and populate userId with user details
        const feedbacks = await Feedback.find().populate('userId', 'email');
        res.render('admin-dashboard', { feedbacks });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});


// Admin Edit Feedback
app.get('/admin/edit/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const feedback = await Feedback.findById(req.params.id);
        if (!feedback) {
            return res.status(404).send("Feedback not found");
        }
        res.render('edit-feedback', { feedback });
    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
});



app.post('/admin/edit/:id', authenticate, isAdmin, async (req, res) => {
    await Feedback.findByIdAndUpdate(req.params.id, { feedback: req.body.feedback });
    res.redirect('/admin');
});

// Admin Delete Feedback
app.post('/admin/delete/:id', authenticate, isAdmin, async (req, res) => {
    await Feedback.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});


