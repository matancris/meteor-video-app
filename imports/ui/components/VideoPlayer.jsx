import React, { useEffect, useRef } from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import Plyr from 'plyr';
import { VideoStates } from '/imports/api/videoState';

export const VideoPlayer = ({ video }) => {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const syncingRef = useRef(false);
  const containerRef = useRef(null);
  const currentVideoIdRef = useRef(null);

  // Subscribe and get video state
  const { videoState, isLoading } = useTracker(() => {
    if (!video?._id) return { videoState: null, isLoading: true };

    console.log('Subscribing to videoState for:', video._id);
    const handle = Meteor.subscribe('videoState', video._id);
    
    return {
      videoState: VideoStates.findOne({ videoId: video._id }),
      isLoading: !handle.ready()
    };
  }, [video]);

  // Handle state changes from the database
  useEffect(() => {
    if (!playerRef.current || !videoState || syncingRef.current) return;

    // Only apply changes if they're for the current video
    if (videoState.videoId !== currentVideoIdRef.current) return;

    console.log('Received video state update:', videoState);

    // Handle play/pause state
    if (videoState.isPlaying !== undefined) {
      const isCurrentlyPlaying = !playerRef.current.paused;
      if (videoState.isPlaying && !isCurrentlyPlaying) {
        playerRef.current.play().catch(err => console.error('Play failed:', err));
      } else if (!videoState.isPlaying && isCurrentlyPlaying) {
        playerRef.current.pause();
      }
    }

    // Handle time sync
    if (videoState.currentTime !== undefined) {
      const timeDiff = Math.abs(playerRef.current.currentTime - videoState.currentTime);
      if (timeDiff > 1) {
        playerRef.current.currentTime = videoState.currentTime;
      }
    }
  }, [videoState]);

  // Initialize player
  useEffect(() => {
    if (!videoRef.current) return;

    playerRef.current = new Plyr(videoRef.current, {
      controls: [
        'play-large', 'restart', 'rewind', 'play', 'fast-forward',
        'progress', 'current-time', 'duration', 'mute', 'volume',
        'captions', 'settings', 'pip', 'airplay', 'fullscreen'
      ]
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, []);

  // Handle video changes and event listeners
  useEffect(() => {
    if (!playerRef.current || !video?._id) return;

    console.log('Setting up video:', video._id);
    currentVideoIdRef.current = video._id;

    // Update video source
    playerRef.current.source = {
      type: 'video',
      sources: [{ src: video.url, type: 'video/mp4' }]
    };

    // Remove existing event listeners
    playerRef.current.off('play');
    playerRef.current.off('pause');
    playerRef.current.off('seeked');

    const handleStateUpdate = (isPlaying) => {
      if (syncingRef.current) return;
      
      // Only update if this is still the current video
      if (video._id !== currentVideoIdRef.current) {
        console.log('Ignoring state update for old video');
        return;
      }

      syncingRef.current = true;
      console.log('Updating state:', { videoId: currentVideoIdRef.current, isPlaying, time: playerRef.current.currentTime });
      
      Meteor.call('updateVideoState', currentVideoIdRef.current, isPlaying, playerRef.current.currentTime, (error) => {
        if (error) console.error('Error updating state:', error);
        syncingRef.current = false;
      });
    };

    // Add event listeners
    playerRef.current.on('play', () => handleStateUpdate(true));
    playerRef.current.on('pause', () => handleStateUpdate(false));
    playerRef.current.on('seeked', () => handleStateUpdate(playerRef.current.playing));

    // Cleanup function
    return () => {
      console.log('Cleaning up video:', video._id);
      if (playerRef.current) {
        playerRef.current.off('play');
        playerRef.current.off('pause');
        playerRef.current.off('seeked');
      }
    };
  }, [video]);

  return (
    <div className="video-player" ref={containerRef}>
      <video
        ref={videoRef}
        className="plyr-react plyr"
        crossOrigin="anonymous"
        preload="metadata"
        onError={(e) => {
          console.error('Video error:', e.target.error);
        }}
      >
        <source 
          src={video?.url} 
          type="video/mp4"
          onError={(e) => {
            console.error('Source error:', e);
          }}
        />
        <p>Your browser doesn't support HTML5 video.</p>
      </video>
    </div>
  );
}; 