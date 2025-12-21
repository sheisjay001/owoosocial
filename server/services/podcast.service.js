const podcastService = {
  uploadEpisode: async (podcast) => {
    console.log(`[Podcast Service] Uploading episode "${podcast.title}"`);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    return `https://storage.cloud.com/podcasts/${Date.now()}.mp3`;
  },

  publishToSpotify: async (podcast) => {
    console.log(`[Spotify API] Publishing episode: ${podcast.title}`);
    return { platformId: `sp_${Date.now()}`, url: `https://open.spotify.com/episode/${Date.now()}` };
  },

  publishToApplePodcasts: async (podcast) => {
    console.log(`[Apple Podcasts API] Publishing episode: ${podcast.title}`);
    return { platformId: `ap_${Date.now()}`, url: `https://podcasts.apple.com/episode/${Date.now()}` };
  },

  publishToYouTube: async (podcast) => {
    console.log(`[YouTube API] Uploading video podcast: ${podcast.title}`);
    return { platformId: `yt_${Date.now()}`, url: `https://youtube.com/watch?v=${Date.now()}` };
  },

  getAnalytics: async (podcastId) => {
    // Mock analytics data
    const downloads = Math.floor(Math.random() * 5000) + 100;
    const listeners = Math.floor(downloads * 0.85);
    const avgTime = Math.floor(Math.random() * 40) + 50; // 50-90%

    // Distribute across platforms
    const spotify = Math.floor(downloads * 0.45);
    const apple = Math.floor(downloads * 0.35);
    const youtube = Math.floor(downloads * 0.15);
    const google = downloads - spotify - apple - youtube;

    return {
      totalDownloads: downloads,
      uniqueListeners: listeners,
      averageListenTime: avgTime,
      platformStats: {
        spotify: { downloads: spotify },
        apple: { downloads: apple },
        youtube: { views: youtube },
        google: { downloads: google }
      }
    };
  }
};

module.exports = podcastService;
