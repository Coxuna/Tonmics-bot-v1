import { useEffect, useRef, useState, useCallback } from 'react';

export const useSoundManager = () => {
  // We can use localStorage to remember mute state across reloads
  const [isMuted, setIsMuted] = useState(() => {
    const savedState = localStorage.getItem('soundMuted');
    return savedState ? JSON.parse(savedState) : false;
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [currentMusicTrack, setCurrentMusicTrack] = useState('main');
  const userInteractedRef = useRef(false);
  const initialized = useRef(false);
  const fadeTransitionRef = useRef(null);
  const duckingTimeoutRef = useRef(null);
  
  // For random playlist implementation
  const playlistRef = useRef({
    tracks: [], // Will hold the themes to cycle through
    currentIndex: 0,
    isPlaying: false,
    shuffled: true, // Whether to play tracks in random order
  });

  // Create refs for all your sound effects
  const sounds = useRef({
    // Sound effects
    select: null,
    place: null,
    submit: null,
    success: null,
    fail: null,
    levelComplete: null,
    shuffle: null,
    hint: null,
    countdown: null,
    
    // Multiple background music tracks
    music: {
      main: null,
      action: null,
      puzzle: null,
      victory: null,
      tense: null,
      menu: null,
      credits: null,
      // Can add more main themes for playlist below
      mainAlt1: null,
      mainAlt2: null,
      mainAlt3: null,
    }
  });

  // Track loading progress
  const loadingStatus = useRef({
    total: 0,
    loaded: 0,
    failed: 0
  });

  // Save mute state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('soundMuted', JSON.stringify(isMuted));
  }, [isMuted]);

  // Initialize sounds on component mount
  useEffect(() => {
    console.log("Initializing enhanced sound manager with multiple music tracks...");
    
    // Load all sound effects
    const sfx = {
      select: new Audio('/sounds/select.mp3'),
      place: new Audio('/sounds/place.mp3'),
      submit: new Audio('/sounds/submit.mp3'),
      success: new Audio('/sounds/success.mp3'),
      fail: new Audio('/sounds/fail.mp3'),
      levelComplete: new Audio('/sounds/level-complete.mp3'),
      shuffle: new Audio('/sounds/shuffle.mp3'),
      hint: new Audio('/sounds/hint.mp3'),
      countdown: new Audio('/sounds/countdown.mp3'),
        victory: new Audio('/sounds/music/victory.mp3')
    };
    
    // Load all music tracks
    const music = {
      main: new Audio('/sounds/music/main-theme.mp3'),
      mainAlt1: new Audio('/sounds/music/action.mp3'),
      action: new Audio('/sounds/music/action.mp3'),
      puzzle: new Audio('/sounds/music/puzzle-theme.mp3'),
      victory: new Audio('/sounds/music/victory.mp3'),
      tense: new Audio('/sounds/music/count-down.mp3'),
      menu: new Audio('/sounds/music/menu-theme.mp3'),
      credits: new Audio('/sounds/music/credits-theme.mp3'),
    };
    
    // Configure all music tracks to loop individually
    // (We'll handle playlist looping separately)
    Object.values(music).forEach(track => {
      if (track) track.loop = true;
    });
    
    // Combine into one sounds object
    sounds.current = {
      ...sfx,
      music
    };

    // Set initial volume for all sounds
    Object.values(sfx).forEach(sound => {
      if (sound) sound.volume = volume;
    });
    
    Object.values(music).forEach(track => {
      if (track) track.volume = volume;
    });

    // Calculate total sounds to load
    loadingStatus.current.total = Object.keys(sfx).length + Object.keys(music).length;
    
    // Function to update loading counter
    const updateLoadingCounter = (success) => {
      if (success) {
        loadingStatus.current.loaded++;
      } else {
        loadingStatus.current.failed++;
      }
      
      // Check if all sounds have been processed
      if (loadingStatus.current.loaded + loadingStatus.current.failed === loadingStatus.current.total) {
        console.log(`All sounds processed! Loaded: ${loadingStatus.current.loaded}, Failed: ${loadingStatus.current.failed}`);
        setIsLoaded(true);
      }
    };
    
    // Listen for load events on all sound effects
    Object.entries(sfx).forEach(([name, sound]) => {
      if (!sound) return;
      
      console.log(`Loading sound effect: ${name} - ${sound.src}`);
      
      sound.addEventListener('canplaythrough', () => {
        console.log(`Sound effect loaded: ${name}`);
        updateLoadingCounter(true);
      }, { once: true });
      
      sound.addEventListener('error', (e) => {
        console.error(`Error loading sound effect: ${name}`, e);
        updateLoadingCounter(false);
      });

      sound.load();
    });
    
    // Listen for load events on all music tracks
    Object.entries(music).forEach(([trackName, track]) => {
      if (!track) return;
      
      console.log(`Loading music track: ${trackName} - ${track.src}`);
      
      track.addEventListener('canplaythrough', () => {
        console.log(`Music track loaded: ${trackName}`);
        updateLoadingCounter(true);
      }, { once: true });
      
      track.addEventListener('error', (e) => {
        console.error(`Error loading music track: ${trackName}`, e);
        updateLoadingCounter(false);
      });

      // Add ended event listener for playlist functionality
      track.addEventListener('ended', () => {
        // This will be handled by the playlist system
        if (!track.loop && playlistRef.current.isPlaying) {
          // We can't call playNextInPlaylist directly here due to initialization order
          // We'll check this state in the useEffect
          console.log("Track ended, playlist will advance");
        }
      });

      track.load();
    });

    // Initialize main theme playlist
    playlistRef.current.tracks = ['main', 'mainAlt1'];

    // Global user interaction detection
    const markUserInteraction = () => {
      if (userInteractedRef.current) return;
      
      userInteractedRef.current = true;
      console.log("User interaction detected - audio can now play");
      
      // Try to start current background music if it should be playing
      if (isLoaded && !isMuted && !initialized.current) {
        try {
          sounds.current.music[currentMusicTrack].play().then(() => {
            console.log(`Background music (${currentMusicTrack}) started after user interaction`);
            initialized.current = true;
          }).catch(err => {
            console.warn("Could not autoplay background music:", err);
          });
        } catch (err) {
          console.error("Error trying to play background music:", err);
        }
      }
    };
    
    window.addEventListener('click', markUserInteraction);
    window.addEventListener('touchstart', markUserInteraction);
    window.addEventListener('keydown', markUserInteraction);

    // Cleanup function
    return () => {
      console.log("Cleaning up enhanced sound manager...");
      window.removeEventListener('click', markUserInteraction);
      window.removeEventListener('touchstart', markUserInteraction);
      window.removeEventListener('keydown', markUserInteraction);
      
      // Clear any ongoing fade transitions
      if (fadeTransitionRef.current) {
        clearInterval(fadeTransitionRef.current);
      }
      
      // Clear any ducking timeout
      if (duckingTimeoutRef.current) {
        clearTimeout(duckingTimeoutRef.current);
      }
      
      // Stop all playing sounds on unmount
      Object.values(sfx).forEach(sound => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
      
      Object.values(music).forEach(track => {
        if (track) {
          track.pause();
          track.currentTime = 0;
        }
      });
    };
  }, []); // Empty dependency array means this runs once on mount

  // ==========================================
  // DECLARE ALL FUNCTIONS IN THE CORRECT ORDER
  // ==========================================

  // Shuffle array helper function - no dependencies on other functions
  const shuffleArray = useCallback((array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  // IMPORTANT: We need to define these functions in order to avoid the reference error
  // Start with functions that don't call other functions
  
  // 1. Basic music control - no dependencies on other functions
  const switchBackgroundMusic = useCallback((trackName) => {
    if (isMuted || !isLoaded) {
      console.log(`Music not switched (${isMuted ? 'muted' : 'not loaded'}): ${trackName}`);
      return;
    }
    
    if (!sounds.current.music[trackName]) {
      console.error(`Music track not found: ${trackName}`);
      return;
    }
    
    console.log(`Switching music to track: ${trackName}`);
    
    // Stop current music
    Object.entries(sounds.current.music).forEach(([name, track]) => {
      if (track && name !== trackName) {
        track.pause();
        track.currentTime = 0;
      }
    });
    
    // Start new track
    const newTrack = sounds.current.music[trackName];
    newTrack.volume = volume;
    newTrack.currentTime = 0;
    
    newTrack.play().then(() => {
      console.log(`Now playing music track: ${trackName}`);
      setCurrentMusicTrack(trackName);
      initialized.current = true;
    }).catch(error => {
      console.error(`Error playing music track: ${trackName}`, error);
      
      if (error.name === 'NotAllowedError') {
        console.warn('Music blocked - need user interaction first');
        initialized.current = false;
      }
    });
  }, [isMuted, isLoaded, volume]);

  // 2. Start background music safely - uses switchBackgroundMusic
  const playBackgroundMusic = useCallback(() => {
    if (isMuted || !isLoaded) {
      console.log(`Background music not started (${isMuted ? 'muted' : 'not loaded'})`);
      return;
    }
    
    console.log(`Starting background music track: ${currentMusicTrack}`);
    
    userInteractedRef.current = true; // Mark that we've had user interaction
    
    sounds.current.music[currentMusicTrack].play().then(() => {
      console.log(`Background music (${currentMusicTrack}) playing successfully`);
      initialized.current = true;
    }).catch(error => {
      console.error(`Error playing background music (${currentMusicTrack}):`, error);
      
      if (error.name === 'NotAllowedError') {
        console.warn('Background music blocked - need user interaction first');
        initialized.current = false;
      }
    });
  }, [isMuted, isLoaded, currentMusicTrack]);

  // 3. Stop playlist - doesn't call other functions
  const stopPlaylist = useCallback(() => {
    playlistRef.current.isPlaying = false;
    
    // Turn looping back on for current track if it's still playing
    if (sounds.current.music[currentMusicTrack]) {
      sounds.current.music[currentMusicTrack].loop = true;
    }
    
    console.log("Playlist stopped");
  }, [currentMusicTrack]);

  // 4. Stop all background music - now depends on stopPlaylist
  const stopBackgroundMusic = useCallback(() => {
    // Stop playlist if running
    if (playlistRef.current.isPlaying) {
      stopPlaylist();
    }
    
    Object.values(sounds.current.music).forEach(track => {
      if (track) {
        track.pause();
        track.currentTime = 0;
      }
    });
    console.log('All background music stopped');
  }, [stopPlaylist]);

  // 5. Play next track in playlist - depends on switchBackgroundMusic and shuffleArray
  const playNextInPlaylist = useCallback(() => {
    if (!playlistRef.current.isPlaying || isMuted) return;
    
    // Move to next track index
    playlistRef.current.currentIndex++;
    
    // If we reached the end, either stop or loop back to beginning
    if (playlistRef.current.currentIndex >= playlistRef.current.tracks.length) {
      // Reset to beginning
      playlistRef.current.currentIndex = 0;
      
      // Re-shuffle if that option is enabled
      if (playlistRef.current.shuffled) {
        playlistRef.current.tracks = shuffleArray(playlistRef.current.tracks);
        console.log("Playlist reshuffled for next loop");
      }
    }
    
    // Get the next track
    const nextTrack = playlistRef.current.tracks[playlistRef.current.currentIndex];
    
    // Play it and set up ended handler
    const track = sounds.current.music[nextTrack];
    if (track) {
      track.loop = false; // Ensure loop is off so we get ended events
      
      // Using an inline function to avoid initialization order issues
      track.onended = () => {
        if (playlistRef.current.isPlaying) {
          playNextInPlaylist();
        }
      };
      
      switchBackgroundMusic(nextTrack);
      console.log(`Playing playlist track ${playlistRef.current.currentIndex + 1}/${playlistRef.current.tracks.length}: ${nextTrack}`);
    }
  }, [isMuted, shuffleArray, switchBackgroundMusic]);

  // 6. Start playlist playback - depends on multiple functions
  const startPlaylist = useCallback((trackNames = null, shuffled = true) => {
    if (isMuted || !isLoaded) return;
    
    // If tracks provided, update the playlist
    if (trackNames && Array.isArray(trackNames) && trackNames.length > 0) {
      // Validate tracks exist
      const validTracks = trackNames.filter(track => sounds.current.music[track]);
      if (validTracks.length === 0) {
        console.error("No valid tracks provided for playlist");
        return;
      }
      
      playlistRef.current.tracks = validTracks;
    }
    
    // Make sure we have tracks
    if (playlistRef.current.tracks.length === 0) {
      console.error("No tracks in playlist");
      return;
    }
    
    playlistRef.current.shuffled = shuffled;
    
    // If shuffled, randomize the track order
    if (shuffled) {
      playlistRef.current.tracks = shuffleArray(playlistRef.current.tracks);
    }
    
    // Reset index and start playing first track
    playlistRef.current.currentIndex = 0;
    playlistRef.current.isPlaying = true;
    
    // Get first track and start playing
    const firstTrack = playlistRef.current.tracks[0];
    
    // Turn off looping for all playlist tracks so they trigger 'ended' event
    playlistRef.current.tracks.forEach(trackName => {
      if (sounds.current.music[trackName]) {
        sounds.current.music[trackName].loop = false;
      }
    });
    
    switchBackgroundMusic(firstTrack);
    
    console.log(`Started ${shuffled ? 'shuffled' : 'sequential'} playlist with ${playlistRef.current.tracks.length} tracks`);
    
    // Set up ended event handler for the first track
    const currentTrack = sounds.current.music[firstTrack];
    currentTrack.onended = () => {
      if (playlistRef.current.isPlaying) {
        playNextInPlaylist();
      }
    };
  }, [isMuted, isLoaded, shuffleArray, switchBackgroundMusic, playNextInPlaylist]);

  // 7. Fade between two music tracks - uses multiple functions
  const fadeToTrack = useCallback((newTrack, duration = 2000) => {
    if (isMuted || !isLoaded) return;
    if (!sounds.current.music[newTrack]) {
      console.error(`Music track not found: ${newTrack}`);
      return;
    }
    
    // Stop playlist if running
    if (playlistRef.current.isPlaying) {
      stopPlaylist();
    }
    
    const currentTrack = sounds.current.music[currentMusicTrack];
    const nextTrack = sounds.current.music[newTrack];
    
    // Make sure the next track will loop
    nextTrack.loop = true;
    
    // Start the new track at 0 volume
    nextTrack.volume = 0;
    nextTrack.currentTime = 0;
    
    // Play the new track
    nextTrack.play().then(() => {
      console.log(`Started fading to track: ${newTrack}`);
      
      // Clear any existing fade transition
      if (fadeTransitionRef.current) {
        clearInterval(fadeTransitionRef.current);
      }
      
      const startTime = Date.now();
      const initialVolume = volume;
      
      // Start the fade transition
      fadeTransitionRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        
        // Fade out current track
        if (currentTrack) {
          currentTrack.volume = initialVolume * (1 - progress);
        }
        
        // Fade in new track
        nextTrack.volume = initialVolume * progress;
        
        // If fade complete
        if (progress >= 1) {
          clearInterval(fadeTransitionRef.current);
          fadeTransitionRef.current = null;
          
          // Stop the old track
          if (currentTrack) {
            currentTrack.pause();
            currentTrack.currentTime = 0;
          }
          
          // Update current track
          setCurrentMusicTrack(newTrack);
          console.log(`Fade complete, now playing: ${newTrack}`);
        }
      }, 16); // ~60fps
    }).catch(error => {
      console.error(`Error starting new music track: ${newTrack}`, error);
    });
  }, [isMuted, isLoaded, currentMusicTrack, volume, stopPlaylist]);

  // 8. Play a specific sound with volume ducking - depends on other functions
  const playSound = useCallback((soundName, duckMusic = false, duckAmount = 0.7, duckDuration = 1000) => {
    if (isMuted || !isLoaded) {
      console.log(`Sound not played (${isMuted ? 'muted' : 'not loaded'}): ${soundName}`);
      return;
    }
    
    // Check if it's a music track or sound effect
    if (soundName.startsWith('music.')) {
      const trackName = soundName.split('.')[1];
      switchBackgroundMusic(trackName);
      return;
    }
    
    const sound = sounds.current[soundName];
    if (!sound) {
      console.error(`Sound not found: ${soundName}`);
      return;
    }
    
    console.log(`Attempting to play sound: ${soundName}${duckMusic ? ' with music ducking' : ''}`);
    
    // Mark that we've had user interaction (since this is called from click handlers)
    userInteractedRef.current = true;
    
    // Implement volume ducking if requested
    let originalMusicVolume = null;
    if (duckMusic && !isMuted) {
      // Store original music volume and reduce it
      originalMusicVolume = sounds.current.music[currentMusicTrack].volume;
      const duckVolume = originalMusicVolume * (1 - duckAmount);
      
      // Apply ducking to current music track
      sounds.current.music[currentMusicTrack].volume = duckVolume;
      
      // Set timeout to restore volume
      if (duckingTimeoutRef.current) {
        clearTimeout(duckingTimeoutRef.current);
      }
      
      duckingTimeoutRef.current = setTimeout(() => {
        // Only restore if we're still playing the same track
        if (sounds.current.music[currentMusicTrack]) {
          sounds.current.music[currentMusicTrack].volume = originalMusicVolume;
          console.log(`Restored music volume after ducking for: ${soundName}`);
        }
        duckingTimeoutRef.current = null;
      }, duckDuration);
    }
    
    // Reset the sound to the beginning if it's already playing
    sound.currentTime = 0;
    
    sound.play().then(() => {
      console.log(`Successfully playing sound: ${soundName}`);
      initialized.current = true;
    }).catch(error => {
      console.error(`Error playing sound: ${soundName}`, error);
      
      // If ducking was applied but sound failed, restore volume immediately
      if (duckMusic && originalMusicVolume !== null && !isMuted) {
        sounds.current.music[currentMusicTrack].volume = originalMusicVolume;
      }
      
      if (error.name === 'NotAllowedError') {
        console.warn('Sound blocked by browser - requires user interaction first');
        initialized.current = false;
      }
    });
  }, [isMuted, isLoaded, currentMusicTrack, switchBackgroundMusic]);

  // 9. Toggle mute state - uses multiple functions
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuteState = !prev;
      console.log(`Sound ${newMuteState ? 'muted' : 'unmuted'}`);
      
      // Play a test sound when unmuting
      if (!newMuteState && isLoaded) {
        // We need a slight delay to ensure the state update has happened
        setTimeout(() => {
          if (userInteractedRef.current) {
            playBackgroundMusic();
            playSound('select');
          }
        }, 50);
      }
      
      return newMuteState;
    });
  }, [isLoaded, playSound, playBackgroundMusic]);

  // 10. Temporarily duck the background music - no function dependencies
  const duckBackgroundMusic = useCallback((duckAmount = 0.7, duration = 1000) => {
    if (isMuted || !isLoaded || !sounds.current.music[currentMusicTrack]) {
      return;
    }
    
    const track = sounds.current.music[currentMusicTrack];
    const originalVolume = track.volume;
    const targetVolume = originalVolume * (1 - duckAmount);
    
    console.log(`Ducking background music by ${duckAmount * 100}% for ${duration}ms`);
    
    // Apply ducking
    track.volume = targetVolume;
    
    // Set timeout to restore volume
    if (duckingTimeoutRef.current) {
      clearTimeout(duckingTimeoutRef.current);
    }
    
    duckingTimeoutRef.current = setTimeout(() => {
      if (sounds.current.music[currentMusicTrack]) {
        sounds.current.music[currentMusicTrack].volume = originalVolume;
        console.log('Restored music volume after manual ducking');
      }
      duckingTimeoutRef.current = null;
    }, duration);
  }, [isMuted, isLoaded, currentMusicTrack]);

  // 11. Adjust volume - no function dependencies
  const adjustVolume = useCallback((newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    
    // Apply new volume to all sounds if not muted
    if (!isMuted) {
      // Apply to sound effects
      Object.keys(sounds.current).forEach(key => {
        if (key !== 'music' && sounds.current[key]) {
          sounds.current[key].volume = clampedVolume;
        }
      });
      
      // Apply to music tracks
      Object.values(sounds.current.music).forEach(track => {
        if (track) track.volume = clampedVolume;
      });
    }
  }, [isMuted]);

  // 12. Force initialization - depends on playSound and playBackgroundMusic
  const forceInitialize = useCallback(() => {
    if (!isLoaded || isMuted) return;
    
    playSound('select');
    playBackgroundMusic();
  }, [isLoaded, isMuted, playSound, playBackgroundMusic]);

  // 13. Get available music tracks - no function dependencies
  const getAvailableMusicTracks = useCallback(() => {
    return Object.keys(sounds.current.music);
  }, []);

  // 14. Get available main themes for playlist - no function dependencies
  const getAvailableMainThemes = useCallback(() => {
    return Object.keys(sounds.current.music).filter(name => 
      name === 'main' || name.startsWith('mainAlt')
    );
  }, []);

  // Handle toggling sound when isMuted changes
  useEffect(() => {
    if (isLoaded) {
      if (isMuted) {
        // Mute all sound effects
        Object.keys(sounds.current).forEach(key => {
          if (key !== 'music' && sounds.current[key]) {
            sounds.current[key].volume = 0;
          }
        });
        
        // Mute and pause all music tracks
        Object.values(sounds.current.music).forEach(track => {
          if (track) {
            track.volume = 0;
            track.pause();
          }
        });
        
        // Update playlist state
        playlistRef.current.isPlaying = false;
      } else {
        // Unmute all sound effects
        Object.keys(sounds.current).forEach(key => {
          if (key !== 'music' && sounds.current[key]) {
            sounds.current[key].volume = volume;
          }
        });
        
        // Unmute all music tracks
        Object.values(sounds.current.music).forEach(track => {
          if (track) {
            track.volume = volume;
          }
        });
        
        // Try to play current music track (if we've had user interaction)
        if (userInteractedRef.current) {
          try {
            sounds.current.music[currentMusicTrack].play().then(() => {
              console.log(`Background music (${currentMusicTrack}) resumed after unmute`);
              if (playlistRef.current.tracks.includes(currentMusicTrack)) {
                playlistRef.current.isPlaying = true;
              }
            }).catch(err => {
              console.warn("Could not play background music after unmute:", err);
              // If we get here, we need another user interaction
              initialized.current = false;
            });
          } catch (err) {
            console.error("Error trying to play background music:", err);
          }
        }
      }
    }
  }, [isMuted, isLoaded, volume, currentMusicTrack]);

  // Monitor track ended events to advance playlist
  useEffect(() => {
    if (isLoaded && playlistRef.current.isPlaying) {
      const currentTrackName = playlistRef.current.tracks[playlistRef.current.currentIndex];
      const currentTrack = sounds.current.music[currentTrackName];
      
      if (currentTrack) {
        // Set up ended handler for the track
        const handleTrackEnded = () => {
          if (playlistRef.current.isPlaying) {
            playNextInPlaylist();
          }
        };
        
        currentTrack.addEventListener('ended', handleTrackEnded);
        
        return () => {
          currentTrack.removeEventListener('ended', handleTrackEnded);
        };
      }
    }
  }, [isLoaded, playNextInPlaylist, currentMusicTrack]);

  return {
    playSound,
    toggleMute,
    isMuted,
    playBackgroundMusic,
    stopBackgroundMusic,
    switchBackgroundMusic,
    fadeToTrack,
    duckBackgroundMusic,
    currentMusicTrack,
    getAvailableMusicTracks,
    getAvailableMainThemes,
    volume,
    adjustVolume,
    isLoaded,
    forceInitialize,
    // Playlist controls
    startPlaylist,
    stopPlaylist,
    playNextInPlaylist,
  };
};