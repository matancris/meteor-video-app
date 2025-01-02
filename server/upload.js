import { WebApp } from 'meteor/webapp';
import { Videos } from '/imports/api/videos';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Busboy from 'busboy';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Handle file uploads
WebApp.rawConnectHandlers.use('/api/upload', (req, res, next) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Check if it's a POST request
  if (req.method !== 'POST') {
    console.error('Invalid method:', req.method);
    res.writeHead(405);
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  try {
    const busboy = Busboy({ 
      headers: req.headers,
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
        files: 1 // Only allow 1 file
      }
    });

    let fileInfo = null;
    let error = null;

    busboy.on('file', (fieldname, file, info) => {
      if (fieldname !== 'file') {
        error = new Error('Invalid field name');
        file.resume();
        return;
      }

      console.log('Receiving file:', info.filename);

      // Generate unique filename
      const fileId = uuidv4();
      const ext = path.extname(info.filename);
      const newFilename = `${fileId}${ext}`;
      const filepath = path.join(uploadsDir, newFilename);

      fileInfo = {
        url: `/uploads/${newFilename}`,
        thumbnail: '/images/default-thumbnail.png',
        originalName: info.filename
      };

      // Create write stream
      const writeStream = fs.createWriteStream(filepath);
      
      file.on('error', (err) => {
        console.error('File error:', err);
        error = err;
        writeStream.end();
      });

      writeStream.on('error', (err) => {
        console.error('Write stream error:', err);
        error = err;
      });

      file.pipe(writeStream);

      writeStream.on('finish', () => {
        console.log('File saved:', filepath);
      });
    });

    busboy.on('error', (err) => {
      console.error('Busboy error:', err);
      error = err;
    });

    busboy.on('finish', () => {
      if (error) {
        console.error('Upload error:', error);
        res.writeHead(500);
        res.end(JSON.stringify({ error: 'Upload failed: ' + error.message }));
        return;
      }

      if (!fileInfo) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'No file uploaded' }));
        return;
      }

      console.log('Upload complete:', fileInfo);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(fileInfo));
    });

    req.pipe(busboy);

  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end(JSON.stringify({ error: 'Server error: ' + error.message }));
  }
}); 