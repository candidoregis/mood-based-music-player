/**
 * YouTube Player Service
 * This service manages the YouTube IFrame API integration
 * and provides functions to control the player
 */

let player = null;
let isApiReady = false;
let videoQueue = [];
let currentVideoIndex = 0;
let onPlayerReadyCallback = null;

/**
 * Initialize the YouTube IFrame API
 * @param {string} containerId - The ID of the container element for the player
 * @param {Function} onReady - Callback function to execute when the player is ready
 */
function initPlayer(containerId, onReady) {
  // Save the callback for later
  onPlayerReadyCallback = onReady;
  
  // If the API is already loaded, create the player immediately
  if (window.YT && window.YT.Player) {
    createPlayer(containerId);
    return;
  }
  
  // Load the YouTube IFrame API if it's not already loaded
  if (!document.getElementById('youtube-api')) {
    loadYouTubeAPI().then(() => {
      createPlayer(containerId);
    }).catch((error) => {
      console.error('Error loading YouTube IFrame API:', error);
    });
  }
}

// Load the YouTube API script
function loadYouTubeAPI() {
  return new Promise((resolve, reject) => {
    // Create a script element for the YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Define the onYouTubeIframeAPIReady callback
    window.onYouTubeIframeAPIReady = function() {
      console.log('YouTube IFrame API ready');
      resolve();
    };

    // Set a timeout to detect if the API doesn't load within a reasonable time
    const timeoutId = setTimeout(() => {
      reject(new Error('YouTube IFrame API load timed out after 10 seconds'));
    }, 10000);

    // Handle errors
    tag.onerror = function() {
      clearTimeout(timeoutId);
      reject(new Error('Failed to load YouTube IFrame API'));
    };
  });
}

/**
 * Create the YouTube player
 * @param {string} containerId - The ID of the container element for the player
 */
function createPlayer(containerId) {
  // Create a div element for the player if it doesn't exist
  let playerContainer = document.getElementById('youtube-player-container');
  if (!playerContainer) {
    playerContainer = document.createElement('div');
    playerContainer.id = 'youtube-player-container';
    document.getElementById(containerId).appendChild(playerContainer);
  }
  
  // Create the player
  player = new window.YT.Player('youtube-player-container', {
    height: '270',
    width: '480',
    playerVars: {
      'playsinline': 1,
      'controls': 1,
      'autoplay': 0,
      'rel': 0,
      'modestbranding': 1
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

/**
 * Handle the player ready event
 * @param {Object} event - The event object
 */
function onPlayerReady(event) {
  console.log('YouTube player is ready');
  
  // If we have videos in the queue, load the first one
  if (videoQueue.length > 0) {
    loadVideo(videoQueue[currentVideoIndex].id);
  }
  
  // Call the callback if it exists
  if (onPlayerReadyCallback) {
    onPlayerReadyCallback();
  }
}

/**
 * Handle the player state change event
 * @param {Object} event - The event object
 */
function onPlayerStateChange(event) {
  // If the video ends, play the next one in the queue
  if (event.data === window.YT.PlayerState.ENDED) {
    playNextVideo();
  }
}

/**
 * Load a video into the player
 * @param {string} videoId - The YouTube video ID
 */
function loadVideo(videoId) {
  if (player && player.loadVideoById) {
    player.loadVideoById(videoId);
  }
}

/**
 * Play the current video
 */
function playVideo() {
  if (player && player.playVideo) {
    player.playVideo();
  }
}

/**
 * Pause the current video
 */
function pauseVideo() {
  if (player && player.pauseVideo) {
    player.pauseVideo();
  }
}

/**
 * Play the next video in the queue
 */
function playNextVideo() {
  if (videoQueue.length === 0) {
    return;
  }
  
  currentVideoIndex = (currentVideoIndex + 1) % videoQueue.length;
  loadVideo(videoQueue[currentVideoIndex].id);
  
  // Update the active class on playlist items
  updateActivePlaylistItem();
}

/**
 * Play the previous video in the queue
 */
function playPreviousVideo() {
  if (videoQueue.length === 0) {
    return;
  }
  
  currentVideoIndex = (currentVideoIndex - 1 + videoQueue.length) % videoQueue.length;
  loadVideo(videoQueue[currentVideoIndex].id);
  
  // Update the active class on playlist items
  updateActivePlaylistItem();
}

/**
 * Play a specific video in the queue
 * @param {number} index - The index of the video to play
 */
function playVideoAt(index) {
  if (index >= 0 && index < videoQueue.length) {
    currentVideoIndex = index;
    loadVideo(videoQueue[currentVideoIndex].id);
    
    // Update the active class on playlist items
    updateActivePlaylistItem();
  }
}

/**
 * Set the playlist
 * @param {Array<Object>} videos - An array of video objects with id, title, and artist properties
 */
function setPlaylist(videos) {
  videoQueue = videos;
  currentVideoIndex = 0;
  
  // If the player is ready, load the first video
  if (player && player.loadVideoById) {
    loadVideo(videoQueue[currentVideoIndex].id);
  }
  
  // Update the playlist UI
  renderPlaylist();
}

/**
 * Render the playlist UI
 */
function renderPlaylist() {
  // Get the playlist container
  const playlistContainer = document.getElementById('youtube-playlist');
  if (!playlistContainer) {
    return;
  }
  
  // Clear the container
  playlistContainer.innerHTML = '';
  
  // Create the playlist items
  videoQueue.forEach((video, index) => {
    const item = document.createElement('div');
    item.className = `playlist-item ${index === currentVideoIndex ? 'active' : ''}`;
    item.dataset.index = index;
    
    const title = document.createElement('div');
    title.className = 'playlist-title';
    title.textContent = `${video.title} - ${video.artist}`;
    
    item.appendChild(title);
    item.addEventListener('click', () => playVideoAt(index));
    
    playlistContainer.appendChild(item);
  });
}

/**
 * Update the active class on playlist items
 */
function updateActivePlaylistItem() {
  const playlistItems = document.querySelectorAll('#youtube-playlist .playlist-item');
  playlistItems.forEach((item, index) => {
    if (index === currentVideoIndex) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

export default {
  initPlayer,
  playVideo,
  pauseVideo,
  playNextVideo,
  playPreviousVideo,
  playVideoAt,
  setPlaylist
};
