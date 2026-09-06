import hashlib
import json
from datetime import datetime


def calculate_hash(
    batch_id: int,
    event_type: str,
    event_data: dict,
    previous_hash: str,
    recorded_at: datetime,
) -> str:
    """
    Generate a deterministic SHA-256 hash for a blockchain record.
    """

    payload = {
        "batch_id": batch_id,
        "event_type": event_type,
        "event_data": event_data,
        "previous_hash": previous_hash,
        "recorded_at": recorded_at.isoformat(),
    }

    encoded_payload = json.dumps(
        payload,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")

    return hashlib.sha256(encoded_payload).hexdigest()


def verify_hash(
    batch_id: int,
    event_type: str,
    event_data: dict,
    previous_hash: str,
    recorded_at: datetime,
    current_hash: str,
) -> bool:
    """
    Verify whether a blockchain record's hash is still valid.
    """

    expected_hash = calculate_hash(
        batch_id=batch_id,
        event_type=event_type,
        event_data=event_data,
        previous_hash=previous_hash,
        recorded_at=recorded_at,
    )

    return expected_hash == current_hash