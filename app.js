const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost/a8', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection
  .once('open', () => console.log('Connected to a8 db'))
  .on('error', (error) => {
    console.log('MongoDB Error: ' + error);
  });

app.use(express.json());

// Define a user schema with the specified validations
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 6, // Minimum length of 6 characters for name
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@northeastern\.edu$/, // Custom email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6, // Minimum length of 6 characters for the password
  },
});

// Create a user model from the schema
const UserModel = mongoose.model('User', userSchema);

// POST endpoint to create a user
app.post('/user/create', async (req, res) => {
  console.log('Inside post function for creating user');

  const { name, email, password } = req.body;

  try {
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters long' });
      return;
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new UserModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.send('User created');
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Name should be atleast 6 characters and email should be neu mailid only or user already exists' });
  }
});










// PUT endpoint to update user details
app.put('/user/edit', async (req, res) => {
  console.log('Inside put function for updating user');

  const { email, name, password } = req.body;

  try {
    // Check if the user exists by verifying the email or full name
    const user = await UserModel.findOne({ $or: [{ email }, { name }] });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (name) {
      if (name.length < 6) {
        res.status(400).json({ error: 'Full name must be at least 6 characters long' });
        return;
      }
      user.name = name;
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters long' });
        return;
      }
      user.password = await bcrypt.hash(password, 10);
    }

    // To ensure email is not updated, check if the email is different and print a message
    if (email && email !== user.email) {
      res.status(400).json({ error: 'User email address cannot be updated' });
      return;
    }

    await user.save();
    res.send('User updated');
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'user name and password should have atleast 6 characters' });
  }
});







// Delete Endpoint to delete users
app.delete('/user/delete', async (req, res) => {
    console.log('Inside delete function for deleting user');
  
    const { email } = req.body;
  
    try {
      // Find and delete the user by email
      const user = await UserModel.findOne({ email });
  
      if (!user) {
        res.status(404).json({ error: 'User not found (enter email address only for deletion)' });
        return;
      }
  
      await UserModel.deleteOne({ _id: user._id });
      res.send('User deleted');
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Please send a valid delete request' });
    }
  });



  //Get Endpoint for retrieving user data
  app.get('/user/getAll', async (req, res) => {
    console.log('Inside GET function for retrieving user data');
  
    try {
      const users = await UserModel.find({}, { name: 1, email: 1, password: 1, _id: 0 });
  
      res.json(users);
    } catch (error) {
      console.error('Error retrieving user data:', error);
      res.status(500).json({ error: 'Please send a valid get request' });
    }
  });
  
  


 app.listen(2222, () => {
  console.log('Listening on port 2222');
 });
