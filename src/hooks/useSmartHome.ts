/**
 * Smart Home Integration Hook
 * Integrates with voice assistants and home automation systems
 */

import { useState, useEffect, useCallback } from 'react';

interface SmartHomeCommand {
  action: string;
  parameters?: Record<string, any>;
  timestamp: number;
}

interface SmartHomeState {
  isConnected: boolean;
  lastCommand: SmartHomeCommand | null;
  supportedCommands: string[];
  activeIntegrations: string[];
}

export function useSmartHome() {
  const [state, setState] = useState<SmartHomeState>({
    isConnected: false,
    lastCommand: null,
    supportedCommands: [
      'play',
      'pause',
      'next',
      'previous',
      'volume',
      'shuffle',
      'repeat',
      'play_playlist',
      'play_artist',
      'play_album',
      'whats_playing',
      'like_song',
      'sleep_timer',
      'mini_mode',
      'show_lyrics'
    ],
    activeIntegrations: []
  });

  // Voice command patterns
  const voicePatterns = {
    play: /^(play|resume|start)/i,
    pause: /^(pause|stop)/i,
    next: /^(next|skip)/i,
    previous: /^(previous|back|last)/i,
    volume: /^(volume|set volume to) (\d+)/i,
    shuffle: /^(shuffle|mix)/i,
    repeat: /^repeat/i,
    play_playlist: /^play playlist (.+)/i,
    play_artist: /^play (songs by |artist )(.+)/i,
    play_album: /^play album (.+)/i,
    whats_playing: /^(what's playing|what song is this|current song)/i,
    like_song: /^(like|save|favorite) (this song|current song)/i,
    sleep_timer: /^(sleep timer|timer) (\d+) minutes?/i,
    mini_mode: /^(mini mode|compact mode)/i,
    show_lyrics: /^(show lyrics|lyrics)/i
  };

  // Initialize speech recognition if available
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      initializeSpeechRecognition();
    }

    // Check for other smart home integrations
    checkIntegrations();
  }, []);

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      processVoiceCommand(transcript);
    };

    // Store recognition instance for later use
    (window as any).spotifyWidgetRecognition = recognition;
  };

  const processVoiceCommand = (transcript: string) => {
    for (const [command, pattern] of Object.entries(voicePatterns)) {
      const match = transcript.match(pattern);
      if (match) {
        const parameters: Record<string, any> = {};
        
        // Extract parameters based on command
        switch (command) {
          case 'volume':
            parameters.level = parseInt(match[2]);
            break;
          case 'play_playlist':
          case 'play_album':
            parameters.name = match[1];
            break;
          case 'play_artist':
            parameters.name = match[2];
            break;
          case 'sleep_timer':
            parameters.minutes = parseInt(match[2]);
            break;
        }

        executeCommand(command, parameters);
        break;
      }
    }
  };

  const executeCommand = useCallback((action: string, parameters?: Record<string, any>) => {
    const command: SmartHomeCommand = {
      action,
      parameters,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      lastCommand: command
    }));

    // Dispatch custom event for the Player component to handle
    window.dispatchEvent(new CustomEvent('smart-home-command', {
      detail: command
    }));
  }, []);

  const checkIntegrations = async () => {
    const integrations: string[] = [];

    // Check for voice assistants
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      integrations.push('Web Speech API');
    }

    // Check for Web MIDI API (for MIDI controllers)
    if ('requestMIDIAccess' in navigator) {
      try {
        await (navigator as any).requestMIDIAccess();
        integrations.push('MIDI Controllers');
      } catch (error) {
        console.log('MIDI access denied');
      }
    }

    // Check for Gamepad API (for game controllers)
    if ('getGamepads' in navigator) {
      integrations.push('Game Controllers');
    }

    setState(prev => ({
      ...prev,
      activeIntegrations: integrations,
      isConnected: integrations.length > 0
    }));
  };

  const startListening = useCallback(() => {
    const recognition = (window as any).spotifyWidgetRecognition;
    if (recognition) {
      recognition.start();
    }
  }, []);

  const setupMIDIController = useCallback(async () => {
    if (!('requestMIDIAccess' in navigator)) return;

    try {
      const midiAccess = await (navigator as any).requestMIDIAccess();
      
      midiAccess.inputs.forEach((input: any) => {
        input.onmidimessage = (event: any) => {
          const [status, note, velocity] = event.data;
          
          // Map MIDI controls to commands
          if (status === 144 && velocity > 0) { // Note On
            switch (note) {
              case 60: // Middle C
                executeCommand('play');
                break;
              case 62: // D
                executeCommand('pause');
                break;
              case 64: // E
                executeCommand('next');
                break;
              case 65: // F
                executeCommand('previous');
                break;
            }
          } else if (status === 176) { // Control Change
            if (note === 7) { // Volume
              executeCommand('volume', { level: Math.round((velocity / 127) * 100) });
            }
          }
        };
      });
    } catch (error) {
      console.error('Failed to setup MIDI:', error);
    }
  }, [executeCommand]);

  const setupGamepadController = useCallback(() => {
    const pollGamepads = () => {
      const gamepads = navigator.getGamepads();
      
      for (let i = 0; i < gamepads.length; i++) {
        const gamepad = gamepads[i];
        if (!gamepad) continue;

        // Map gamepad buttons to commands
        if (gamepad.buttons[0].pressed) { // A button
          executeCommand('play');
        } else if (gamepad.buttons[1].pressed) { // B button
          executeCommand('pause');
        } else if (gamepad.buttons[14].pressed) { // D-pad left
          executeCommand('previous');
        } else if (gamepad.buttons[15].pressed) { // D-pad right
          executeCommand('next');
        }

        // Use analog stick for volume
        const volumeAxis = gamepad.axes[1]; // Right stick Y
        if (Math.abs(volumeAxis) > 0.5) {
          const volume = Math.round((1 - volumeAxis) * 50);
          executeCommand('volume', { level: volume });
        }
      }

      requestAnimationFrame(pollGamepads);
    };

    window.addEventListener('gamepadconnected', () => {
      pollGamepads();
    });
  }, [executeCommand]);

  return {
    ...state,
    startListening,
    executeCommand,
    setupMIDIController,
    setupGamepadController,
    processVoiceCommand
  };
} 