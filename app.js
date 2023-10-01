// app.js

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB (you'll need to replace 'your_db_url' with your actual MongoDB URL)
mongoose.connect('mongodb+srv://bernar:12345@hng5.jebucrl.mongodb.net/HNG_5?retryWrites=true&w=majority', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to db'))
  .catch((err) => console.log(err))


// Create a video model
const Video = mongoose.model('Video', {
  title: String,
  filename: String,
});

// Set up Multer for file uploads
const storage = multer.diskStorage({
  destination: './uploads',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Serve static files from the 'uploads' directory
app.use(express.static('uploads'));

app.use(express.json());

// Create an endpoint to upload a video
app.post('/upload', upload.single('video'), async (req, res) => {
  const { title } = req.body;
  const filename = req.file.filename;

  // Save the video information to the database
  const video = new Video({ title, filename });
  await video.save();

  res.status(201).json({ message: 'Video uploaded successfully' });
});

// Create an endpoint to play a video

// app.get('/play/:url', async (req, res) => {
//   const { url } = req.params;

//   try {
//     // Find the video in the 'uploads' directory based on the URL
//     const videoFiles = fs.readdirSync('./uploads');
//     const matchingFile = videoFiles.find(file => path.basename(file, path.extname(file)) === url);

//     if (!matchingFile) {
//       return res.status(404).json({ message: 'Video not found' });
//     }

//     const videoPath = path.join(__dirname, 'uploads', matchingFile);
//     res.sendFile(videoPath);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// });



app.get('/play/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const videoPath = path.join(__dirname, 'uploads', video.filename);
    res.sendFile(videoPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
