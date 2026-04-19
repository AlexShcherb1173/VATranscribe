class MediaAsset:
    id: UUID
    user_id: UUID | None
    kind: MediaKind
    original_name: str
    stored_name: str
    mime_type: str
    extension: str
    size_bytes: int
    duration_sec: float | None
    path: str
    checksum_sha256: str | None
    created_at: datetime