from pathlib import Path

from report.loader import load_events

SAMPLES = Path(__file__).resolve().parent.parent / "sample"


def test_load_ms_format():
    events = load_events(SAMPLES / "events.csv")
    assert len(events) == 6
    assert events[0].duration_ms == 1200


def test_load_seconds_format():
    events = load_events(SAMPLES / "events_v2.csv")
    assert [e.user for e in events] == ["alice", "bob", "alice"]
    assert [e.ok for e in events] == [True, True, False]
