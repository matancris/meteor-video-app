import React, { useState } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Videos } from '/imports/api/videos';
import { Dialog } from './Dialog';

const DEFAULT_THUMBNAIL = '/images/default-video-thumbnail.svg';

export const VideoList = ({ onVideoSelect, currentVideoId }) => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    videoId: null,
    error: null
  });

  const { videos, isLoading } = useTracker(() => {
    const handle = Meteor.subscribe('videos');
    return {
      videos: Videos.find().fetch(),
      isLoading: !handle.ready()
    };
  });

  const handleDelete = (videoId) => {
    setDialogState({
      isOpen: true,
      videoId,
      error: null
    });
  };

  const confirmDelete = () => {
    Meteor.call('videos.remove', dialogState.videoId, (error) => {
      if (error) {
        setDialogState(prev => ({
          ...prev,
          error: error.message
        }));
      } else {
        setDialogState({ isOpen: false, videoId: null, error: null });
      }
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="video-list">
      <h2>Videos</h2>
      {videos.map(video => (
        <div
          key={video._id}
          className={`video-item ${video._id === currentVideoId ? 'active' : ''}`}
        >
          <div className="video-item-content" onClick={() => onVideoSelect(video)}>
            <img
              src={video.thumbnail || DEFAULT_THUMBNAIL}
              alt={video.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = DEFAULT_THUMBNAIL;
              }}
            />
            <div className="video-info">
              <h3>{video.title}</h3>
              {video.description && <p>{video.description}</p>}
            </div>
          </div>
          <button 
            className="delete-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(video._id);
            }}
            title="Delete video"
          >
            <svg viewBox="0 0 24 24">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      ))}

      <Dialog
        isOpen={dialogState.isOpen}
        title={dialogState.error ? "Error" : "Confirm Delete"}
        message={dialogState.error || "Are you sure you want to delete this video?"}
        onConfirm={dialogState.error ? 
          () => setDialogState({ isOpen: false, videoId: null, error: null }) : 
          confirmDelete}
        onCancel={() => setDialogState({ isOpen: false, videoId: null, error: null })}
      />
    </div>
  );
}; 
