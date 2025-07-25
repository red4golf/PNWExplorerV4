// Enhanced audio serving routes for Florida app
// Apply the same audio corruption fixes and validation

export function addEnhancedAudioRoutes(app: any, storage: any) {
  // Get audio narration for a location with enhanced validation
  app.get("/api/locations/:id/audio", async (req: any, res: any) => {
    try {
      const locationId = parseInt(req.params.id);
      const audioBuffer = await storage.getLocationAudio(locationId);
      
      if (!audioBuffer) {
        console.log(`🎵 No audio found for location ${locationId}`);
        return res.status(404).json({ message: "Audio narration temporarily unavailable" });
      }

      // Verify audio is valid MP3
      const headerBytes = audioBuffer.slice(0, 4);
      const isValidMP3 = (headerBytes[0] === 0xFF && (headerBytes[1] & 0xE0) === 0xE0) || 
                        headerBytes.toString().startsWith('ID3');
      
      if (!isValidMP3) {
        console.log(`🔧 Invalid audio format for location ${locationId}`);
        return res.status(404).json({ message: "Audio narration temporarily unavailable" });
      }

      const range = req.headers.range;
      const fileSize = audioBuffer.length;

      if (range) {
        // Handle range requests for audio streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const chunk = audioBuffer.slice(start, end + 1);

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type'
        });
        res.end(chunk);
      } else {
        // Normal full file response
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type'
        });
        
        res.send(audioBuffer);
      }
    } catch (error) {
      console.error("Error serving audio:", error);
      res.status(500).json({ message: "Audio narration temporarily unavailable" });
    }
  });
}