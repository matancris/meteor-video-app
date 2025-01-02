import { Meteor } from 'meteor/meteor';
import { VideoStates } from '/imports/api/videoState';
import { Videos } from '/imports/api/videos';
import '/imports/api/methods';
import './publications';
import './static-files';
import fs from 'fs';
import path from 'path';

// Default thumbnail SVG content
const defaultThumbnailSVG = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="640" height="360" version="1.1" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg">
 <rect width="640" height="360" fill="#2c3e50"/>
 <g transform="matrix(1.3 0 0 1.3 320 180)">
  <circle cx="0" cy="0" r="100" fill="#34495e"/>
  <path d="m-40-60 100 60-100 60z" fill="#ecf0f1"/>
 </g>
</svg>`;

Meteor.startup(async () => {
  // Create images directory if it doesn't exist
  const imagesDir = path.join(process.cwd(), 'public', 'images');
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  // Create default thumbnail if it doesn't exist
  const defaultThumbnailPath = path.join(imagesDir, 'default-video-thumbnail.svg');
  if (!fs.existsSync(defaultThumbnailPath)) {
    fs.writeFileSync(defaultThumbnailPath, defaultThumbnailSVG);
    console.log('Created default thumbnail at:', defaultThumbnailPath);
  }

  // Initialize video state if it doesn't exist
  const count = await VideoStates.find().countAsync();
  console.log('VideoState count:', count);
  if (count === 0) {
    await VideoStates.insertAsync({
      videoId: 'main',
      isPlaying: false,
      currentTime: 0,
      lastUpdated: new Date(),
    });
  }

  // Initialize sample videos if none exist
  const videoCount = await Videos.find().countAsync();

  if (videoCount === 0) {
    console.log('Inserting sample videos...');
    try {
      // First clear any existing videos
      await Videos.removeAsync({});

      // Define sample videos
      const videos = [
        {
          _id: 'video1',
          title: 'Blue Moon Trailer',
          url: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
          thumbnail: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg',
          description: 'A beautiful surfing documentary trailer'
        },
        {
          _id: 'video2',
          title: 'Big Buck Bunny',
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
          description: 'A classic animated short film about a giant rabbit'
        },
        {
          _id: 'video3',
          title: 'Elephant Dream',
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
          description: 'The first open movie from Blender Foundation'
        },
        {
          _id: 'video4',
          title: 'Sintel',
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
          thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
          description: 'Third open movie created by Blender Foundation'
        },
        {
          _id: 'video5',
          title: 'Tears of Steel',
          url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
          thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
          description: 'Sci-fi short film about robots and love'
        }
      ];

      // Use insertMany through the rawCollection
      const result = await Videos.rawCollection().insertMany(videos);
      console.log('Inserted videos result:', result);

    } catch (error) {
      console.error('Error in video initialization:', error);
    }
  }

  // Log all videos in the collection
  const allVideos = await Videos.find().fetchAsync();
  console.log('All videos in collection:', allVideos);
}); 