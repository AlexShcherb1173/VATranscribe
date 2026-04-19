class Segment:
    id: UUID
    transcript_id: UUID
    start_sec: float
    end_sec: float
    text: str
    speaker_label: str | None
    confidence: float | None
    order_index: int