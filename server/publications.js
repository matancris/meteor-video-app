import { Meteor } from 'meteor/meteor';
import { VideoStates } from '/imports/api/videoState';
import { Videos } from '/imports/api/videos';

Meteor.publish('videos', function() {
  console.log('Videos publication called');
  
  // Return the cursor directly, don't fetch
  const videosCursor = Videos.find();
  
  // Log the actual documents for debugging
  videosCursor.forEach(doc => {
    console.log('Publishing video:', doc);
  });
  
  return videosCursor;
});

Meteor.publish('videoState', function(videoId) {
  console.log('Publishing videoState for:', videoId);
  return VideoStates.find({ videoId: videoId });
}); 