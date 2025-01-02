import React, { useEffect, useState } from "react";
import { VideoPlayer } from "../components/VideoPlayer";
import { AppHeader } from "../components/AppHeader";
import { VideoList } from "../components/VideoList";
import { VideoUpload } from '../components/VideoUpload';
import { Modal } from '../components/Modal';

export const VideoPage = () => {
  const [currentVideo, setCurrentVideo] = useState({
    _id: "video1",
    title: "Blue Moon Trailer",
    url: "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4",
    thumbnail:
      "https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg",
    description: "A beautiful surfing documentary trailer",
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    console.log('currentVideo:', currentVideo);
  }, [currentVideo]);

  return (
    <div className="container">
      <AppHeader />
      <div className="main-content">
        <div className="sidebar">
          <div className="upload-button-container">
            <button 
              className="upload-button"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <svg viewBox="0 0 24 24" className="upload-button-icon">
                <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
              </svg>
              Upload Video
            </button>
          </div>
          <VideoList onVideoSelect={setCurrentVideo} />
        </div>
        <VideoPlayer video={currentVideo} />
      </div>

      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)}
      >
        <VideoUpload onUploadComplete={() => setIsUploadModalOpen(false)} />
      </Modal>
    </div>
  );
};
