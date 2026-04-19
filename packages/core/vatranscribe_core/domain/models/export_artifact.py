class ExportArtifact:
    id: UUID
    transcript_id: UUID
    format: OutputFormat
    path: str
    size_bytes: int
    created_at: datetime