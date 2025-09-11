import fetch from 'node-fetch';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
}

interface AudioGenerationRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface SoundEffectRequest {
  text: string;
  duration_seconds?: number;
  prompt_influence?: number;
}

interface AudioSegment {
  type: 'narration' | 'sound_effect' | 'pause';
  content: string;
  duration?: number; // for sound effects and pauses
}

class AudioService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor() {
    this.apiKey = process.env.ELEVENLABS_API_KEY || '';
    if (!this.apiKey) {
      console.warn('⚠️  ELEVENLABS_API_KEY not found. Audio features will be disabled.');
    }
  }

  async getAvailableVoices(): Promise<ElevenLabsVoice[]> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/voices`, {
        headers: {
          'Xi-Api-Key': this.apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }

      const data = await response.json() as { voices: ElevenLabsVoice[] };
      return data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  }

  async generateSpeech(request: AudioGenerationRequest): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Default to Rachel voice (good for narration)
    const voiceId = request.voice_id || '21m00Tcm4TlvDq8ikWAM';
    
    const payload = {
      text: request.text,
      model_id: request.model_id || 'eleven_monolingual_v1',
      voice_settings: request.voice_settings || {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    };

    try {
      const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'Xi-Api-Key': this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs TTS error: ${response.status} - ${await response.text()}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  }

  async generateSoundEffect(request: SoundEffectRequest): Promise<Buffer> {
    if (!this.apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    const payload = {
      text: request.text,
      duration_seconds: request.duration_seconds || 5,
      prompt_influence: request.prompt_influence || 0.3,
      model_id: 'eleven_text_to_sound_v2',
      output_format: 'mp3_44100_128'
    };

    try {
      const response = await fetch(`${this.baseUrl}/sound-effects`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs Sound Effects error: ${response.status} - ${await response.text()}`);
      }

      return Buffer.from(await response.arrayBuffer());
    } catch (error) {
      console.error('Error generating sound effect:', error);
      throw error;
    }
  }

  async generateNarrationWithEffects(segments: AudioSegment[]): Promise<Buffer> {
    console.log('🎵 Generating narration with integrated sound effects...');
    
    const audioBuffers: Buffer[] = [];
    
    for (const segment of segments) {
      console.log(`📝 Processing segment: ${segment.type} - "${segment.content.substring(0, 50)}..."`);
      
      switch (segment.type) {
        case 'narration':
          const narrationBuffer = await this.generateSpeech({
            text: segment.content,
            voice_settings: {
              stability: 0.6,
              similarity_boost: 0.8,
              style: 0.3, // More dramatic for immersive storytelling
              use_speaker_boost: true
            }
          });
          audioBuffers.push(narrationBuffer);
          break;
          
        case 'sound_effect':
          const sfxBuffer = await this.generateSoundEffect({
            text: segment.content,
            duration_seconds: segment.duration || 3,
            prompt_influence: 0.4
          });
          audioBuffers.push(sfxBuffer);
          break;
          
        case 'pause':
          // Generate brief silence (ElevenLabs will handle this as a short pause)
          const pauseBuffer = await this.generateSpeech({
            text: '...',
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.5
            }
          });
          audioBuffers.push(pauseBuffer);
          break;
      }
      
      // Brief pause between segments for natural flow
      if (segment.type !== 'pause') {
        const briefPause = await this.generateSpeech({
          text: '.',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        });
        audioBuffers.push(briefPause);
      }
    }
    
    // For now, concatenate buffers - in production this could use audio mixing libraries
    console.log('🎶 Combining audio segments...');
    return Buffer.concat(audioBuffers);
  }

  async generateHistoricalNarration(locationName: string, content: string): Promise<Buffer> {
    // Extract first few paragraphs for a 2-3 minute narration
    const narrationText = this.createNarrationScript(locationName, content);
    
    return this.generateSpeech({
      text: narrationText,
      voice_settings: {
        stability: 0.6, // Slightly more stable for educational content
        similarity_boost: 0.8,
        style: 0.2, // Slight dramatic flair for historical storytelling
        use_speaker_boost: true
      }
    });
  }

  private createNarrationScript(locationName: string, content: string): string {
    // Clean markdown and extract key content
    let text = content.replace(/#{1,6}\s+/g, ''); // Remove markdown headers
    text = text.replace(/\*\*(.*?)\*\*/g, '$1'); // Remove bold markers
    text = text.replace(/\*(.*?)\*/g, '$1'); // Remove italic markers
    text = text.replace(/\[.*?\]\(.*?\)/g, ''); // Remove links
    
    // Split into paragraphs and take first 3-4 for narration
    const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
    const selectedParagraphs = paragraphs.slice(0, 4);
    
    // Create engaging opening
    const openingLine = `Welcome to ${locationName}. `;
    
    // Join paragraphs with natural pauses
    const narration = selectedParagraphs.join('\n\n');
    
    // Limit to approximately 500 words (2-3 minutes of speech)
    const words = narration.split(' ');
    const truncatedNarration = words.slice(0, 500).join(' ');
    
    return openingLine + truncatedNarration;
  }
}

export const audioService = new AudioService();