import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';

export const VideoUpload = ({ onUploadComplete }) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) handleFile(file);
  };

  const handleFile = async (file) => {
    if (!file) return;

    // Validate file size (100MB limit)
    if (file.size > 100 * 1024 * 1024) {
      alert('File is too large. Maximum size is 100MB.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Read file as base64
      const reader = new FileReader();
      
      const uploadPromise = new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            setProgress(50);
            const result = await new Promise((resolveUpload, rejectUpload) => {
              Meteor.call('uploadVideo', e.target.result, file.name, (error, result) => {
                if (error) rejectUpload(error);
                else resolveUpload(result);
              });
            });

            await new Promise((resolveInsert, rejectInsert) => {
              Meteor.call('videos.insert', {
                title: file.name,
                url: result.url,
                thumbnail: result.thumbnail,
                description: 'Uploaded video'
              }, (error) => {
                if (error) rejectInsert(error);
                else resolveInsert();
              });
            });

            resolve();
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('File reading failed'));
      });

      reader.readAsDataURL(file);
      await uploadPromise;

      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
        onUploadComplete?.();
      }, 1000);

    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed: ' + error.message);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div 
      className={`upload-container ${dragActive ? 'drag-active' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <div className="upload-content">
        <svg className="upload-icon" viewBox="0 0 24 24">
          <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>
        </svg>
        <div className="upload-text">
          <h3>Upload Video</h3>
          <p>Drag and drop a video file here or click to select</p>
          <p className="file-info">Maximum file size: 100MB</p>
        </div>
        <input
          type="file"
          accept="video/*"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      </div>
      {uploading && (
        <div className="upload-progress-container">
          <div className="upload-progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">{progress}% uploaded</div>
        </div>
      )}
    </div>
  );
}; 