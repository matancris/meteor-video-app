import { WebApp } from 'meteor/webapp';
import fs from 'fs';
import path from 'path';

// Serve video files with proper headers
WebApp.connectHandlers.use('/uploads', (req, res, next) => {
  // Get the filename from the URL
  const filename = path.basename(req.url);
  // Construct the correct file path
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
  
  console.log('Requested video file:', {
    requestUrl: req.url,
    resolvedPath: filePath,
    exists: fs.existsSync(filePath)
  });

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    res.writeHead(404);
    res.end();
    return;
  }

  const stat = fs.statSync(filePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = (end - start) + 1;
    const file = fs.createReadStream(filePath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };

    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
    };

    res.writeHead(200, head);
    fs.createReadStream(filePath).pipe(res);
  }

  // Handle stream errors
  res.on('error', (error) => {
    console.error('Response stream error:', error);
    if (!res.headersSent) {
      res.writeHead(500);
      res.end();
    }
  });
});

// Log the uploads directory on startup
Meteor.startup(() => {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  console.log('Uploads directory:', {
    path: uploadsDir,
    exists: fs.existsSync(uploadsDir),
    contents: fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []
  });
}); 