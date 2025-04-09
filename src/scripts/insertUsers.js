import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js'; // Adjust the path based on your project structure
import bcrypt from 'bcrypt';

dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Failed:', err);
    process.exit(1);
  }
};

// Generate a hashed password for local users
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// Sample Users Data
const users = [
  {
    username: 'john_doe',
    email: 'john.doe@example.com',
    password: await hashPassword('password123'),
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    bio: 'Love coding and coffee!',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    password: await hashPassword('password456'),
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    bio: 'Frontend enthusiast!',
    isVerified: false,
    role: 'user',
    Provider: 'google',
  },
  {
    username: 'admin_user',
    email: 'admin@example.com',
    password: await hashPassword('adminpass'),
    firstName: 'Admin',
    lastName: 'User',
    isVerified: true,
    role: 'admin',
    Provider: 'local',
  },
  {
    username: 'moderator_01',
    email: 'moderator@example.com',
    password: await hashPassword('moderatorpass'),
    firstName: 'Mod',
    lastName: 'One',
    isVerified: true,
    role: 'moderator',
    Provider: 'local',
  },
  {
    username: 'random_guy',
    email: 'random.guy@example.com',
    password: await hashPassword('randompass'),
    firstName: 'Random',
    lastName: 'Guy',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    bio: 'Just here to explore!',
    isVerified: true,
    role: 'user',
    Provider: 'google',
  },
  {
    username: 'dev_master',
    email: 'dev.master@example.com',
    password: await hashPassword('devpassword'),
    firstName: 'Dev',
    lastName: 'Master',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Building cool stuff!',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'cat_lover',
    email: 'cat.lover@example.com',
    password: await hashPassword('catsrule'),
    firstName: 'Catherine',
    lastName: 'Lover',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
    bio: 'Cats are life!',
    isVerified: false,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'travel_fanatic',
    email: 'travel.fan@example.com',
    password: await hashPassword('travelmore'),
    firstName: 'Mike',
    lastName: 'Traveler',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
    bio: 'Wanderlust!',
    isVerified: true,
    role: 'user',
    Provider: 'google',
  },
  {
    username: 'coder_girl',
    email: 'coder.girl@example.com',
    password: await hashPassword('codinglife'),
    firstName: 'Samantha',
    lastName: 'Code',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
    bio: 'JavaScript all the way!',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'meme_master',
    email: 'meme.master@example.com',
    password: await hashPassword('memesforlife'),
    firstName: 'Mark',
    lastName: 'Meme',
    avatar: 'https://randomuser.me/api/portraits/men/8.jpg',
    bio: 'Meme collector',
    isVerified: false,
    role: 'user',
    Provider: 'google',
  },
  {
    username: 'nature_lover',
    email: 'nature.lover@example.com',
    password: await hashPassword('naturelife'),
    firstName: 'Nate',
    lastName: 'Green',
    avatar: 'https://randomuser.me/api/portraits/men/9.jpg',
    bio: 'Nature is my happy place.',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'fitness_guru',
    email: 'fitness.guru@example.com',
    password: await hashPassword('fitforlife'),
    firstName: 'Chris',
    lastName: 'Fit',
    avatar: 'https://randomuser.me/api/portraits/men/10.jpg',
    bio: 'Health and fitness enthusiast!',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'music_lover',
    email: 'music.lover@example.com',
    password: await hashPassword('ilovemusic'),
    firstName: 'Melody',
    lastName: 'Tunes',
    avatar: 'https://randomuser.me/api/portraits/women/11.jpg',
    bio: 'Can’t live without music.',
    isVerified: false,
    role: 'user',
    Provider: 'google',
  },
  {
    username: 'foodie_explorer',
    email: 'foodie.explorer@example.com',
    password: await hashPassword('foodforever'),
    firstName: 'Tina',
    lastName: 'Tasty',
    avatar: 'https://randomuser.me/api/portraits/women/12.jpg',
    bio: 'Food adventures are the best!',
    isVerified: true,
    role: 'user',
    Provider: 'local',
  },
  {
    username: 'tech_enthusiast',
    email: 'tech.enthusiast@example.com',
    password: await hashPassword('techlife'),
    firstName: 'Liam',
    lastName: 'Techie',
    avatar: 'https://randomuser.me/api/portraits/men/13.jpg',
    bio: 'Building the future with tech!',
    isVerified: true,
    role: 'user',
    Provider: 'google',
  },
];

// Insert Users into MongoDB
const insertUsers = async () => {
  try {
    await connectDB();
    await User.deleteMany(); // Remove existing users
    await User.insertMany(users);
    console.log(`Users Inserted Successfully!${users.length}`);
    process.exit();
  } catch (error) {
    console.error('Error Inserting Users:', error);
    process.exit(1);
  }
};

// Run the script
insertUsers();
