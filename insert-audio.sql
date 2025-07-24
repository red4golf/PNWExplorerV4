-- Insert audio file for Historic Strawberry Fields (Location ID 23)
INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
VALUES (
  'narration-historic-strawberry-fields',
  23,
  decode($audioData$SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjYwLjE2LjEwMAAAAAAAAAAAAAAA//uQxAAD1IGPCAek0cL9s+JBhiapOwmgr6CNA0H$audioData$, 'base64'),
  547571,
  'audio/mpeg',
  NOW()
)
ON CONFLICT (filename, location_id) DO UPDATE SET
  file_data = EXCLUDED.file_data,
  file_size = EXCLUDED.file_size,
  uploaded_at = NOW();