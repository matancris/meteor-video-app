import { Meteor } from 'meteor/meteor';
import { VideoStates } from './videoState';
import { Videos } from './videos';
import { Random } from 'meteor/random';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  // Set directory permissions to be readable
  fs.chmodSync(uploadsDir, '755');
}

Meteor.methods({
  async updateVideoState(videoId, isPlaying, currentTime) {
    console.log('Updating video state:', { videoId, isPlaying, currentTime });
    
    await VideoStates.updateAsync(
      { videoId: videoId },
      {
        $set: {
          videoId,
          isPlaying,
          currentTime,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );
  },

  'videos.insert'(videoData) {
    return Videos.insertAsync({
      _id: videoData._id || Random.id(),
      title: videoData.title,
      url: videoData.url,
      thumbnail: videoData.thumbnail,
      description: videoData.description,
      createdAt: new Date()
    });
  },

  'uploadVideo'(fileData, fileName) {
    if (!this.isSimulation) {
      try {
        const fileId = uuidv4();
        const ext = path.extname(fileName).toLowerCase();
        const newFilename = `${fileId}${ext}`;
        const filepath = path.join(uploadsDir, newFilename);

        console.log('Saving file:', {
          filename: newFilename,
          filepath,
          uploadsDir
        });

        // Convert base64 to buffer
        const buffer = Buffer.from(fileData.split(',')[1], 'base64');
        
        // Write file
        fs.writeFileSync(filepath, buffer);
        
        // Set file permissions to be readable
        fs.chmodSync(filepath, '644');
        
        // Verify file was written
        if (!fs.existsSync(filepath)) {
          throw new Error('File was not written successfully');
        }

        const url = `/uploads/${newFilename}`;
        console.log('File saved successfully:', {
          url,
          size: buffer.length,
          exists: fs.existsSync(filepath)
        });

        return {
          url,
          thumbnail: '/images/default-video-thumbnail.svg'
        };
      } catch (error) {
        console.error('Upload error:', error);
        throw new Meteor.Error('upload-failed', error.message);
      }
    }
  },

  async 'videos.remove'(videoId) {
    if (!this.isSimulation) {
      try {
        // Get video info before deletion
        const video = await Videos.findOneAsync(videoId);
        if (!video) {
          throw new Meteor.Error('not-found', 'Video not found');
        }

        // Delete the video file if it's a local file
        if (video.url.startsWith('/uploads/')) {
          const filename = video.url.split('/').pop();
          const filepath = path.join(process.cwd(), 'public', 'uploads', filename);
          
          if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            console.log('Deleted video file:', filepath);
          }
        }

        // Delete from database
        const result = await Videos.removeAsync(videoId);
        
        // Delete associated video state
        await VideoStates.removeAsync({ videoId });

        return result;
      } catch (error) {
        console.error('Error deleting video:', error);
        throw new Meteor.Error('delete-failed', error.message);
      }
    }
  }
}); 