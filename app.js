const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const cors = require("cors");
const verifyToken = require('./middleware/verifyToken'); // Token verification middleware
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/blog')
  .then(async () => {
    console.log('MongoDB connected');
    // Check if admin already exists
    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      // Create admin user if it doesn't exist
      const adminPassword = await bcrypt.hash('adminPassword', 10);
      await User.create({
        username: 'admin',
        password: adminPassword,
        role: 'admin',
        fname: "main",
        lname: "user",
        email: "admin@gmail.com",
        isBlocked: false, // Ensure `isBlocked` field is added to the admin user
      });
      console.log('Admin user created');
    } else {
      console.log('Admin user already exists');
    }
  })
  .catch(err => console.error(err));

// Registration route
app.post('/register', async (req, res) => {
  const { fname, lname, email, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({
    fname,
    lname,
    email,
    username,
    password: hashedPassword,
    isBlocked: false, // By default, new users are not blocked
  });
  await user.save();
  res.status(201).send('User registered successfully');
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) {
    return res.status(404).send('User not found');
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).send('Invalid password');
  }
  const token = jwt.sign({ userId: user._id },  '111222');
  res.json({
    token,
    user: {
      fname: user.fname,
      lname: user.lname,
      email: user.email,
      username: user.username,
    },
  });
});

// Protected route to get posts
app.get('/posts', verifyToken, async (req, res) => {
  try {
    // Check if the user is blocked
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).send('User not found');
    }
    if (user.isBlocked) {
      return res.status(403).send('Access Denied: User is blocked');
    }

    // Fetch posts if user is not blocked
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).send('Error fetching posts');
  }
});

// Start the server
app.listen(3001, () => {
  console.log('Server is running on port 3001');
});
