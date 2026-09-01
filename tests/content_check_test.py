from pathlib import Path

import pytest

from scripts.check import validate_repository


def test_repository_content_is_complete() -> None:
    errors = validate_repository(Path(__file__).parents[1])
    assert errors == []


def test_validator_reports_missing_source(tmp_path: Path) -> None:
    (tmp_path / "app" / "data").mkdir(parents=True)
    (tmp_path / "app" / "data" / "tracks.json").write_text(
        '{"tracks": [{"id": "ccar-f", "domains": [{"id": "f-d1", "weight": 100}], '
        '"expectedQuestions": 1}]}',
        encoding="utf-8",
    )
    (tmp_path / "app" / "data" / "ccar-f.json").write_text(
        '{"questions": [{"id":"f-1","track":"ccar-f","domain":"f-d1",'
        '"objective":"1.1","stem":"Question?","select":1,"correct":["a"],'
        '"options":[{"id":"a","text":"A","rationale":"R"},'
        '{"id":"b","text":"B","rationale":"R"},'
        '{"id":"c","text":"C","rationale":"R"},'
        '{"id":"d","text":"D","rationale":"R"}],"sources":[]}]}',
        encoding="utf-8",
    )

    assert any("source" in error.lower() for error in validate_repository(tmp_path))


def test_validator_reports_unknown_source_id(tmp_path: Path) -> None:
    content = tmp_path / "app" / "data"
    content.mkdir(parents=True)
    (content / "tracks.json").write_text(
        '{"sources":{"official":{"label":"Official","url":"https://example.test"}},'
        '"tracks":[{"id":"ccar-f","domains":[{"id":"f-d1","weight":100,'
        '"objectives":[{"id":"1.1","name":"One"}]}],"expectedQuestions":1}]}',
        encoding="utf-8",
    )
    (content / "ccar-f.json").write_text(
        '{"questions":[{"id":"f-1","track":"ccar-f","domain":"f-d1",'
        '"objective":"1.1","stem":"Question?","select":1,"correct":["a"],'
        '"options":[{"id":"a","text":"A","rationale":"R"},'
        '{"id":"b","text":"B","rationale":"R"},'
        '{"id":"c","text":"C","rationale":"R"},'
        '{"id":"d","text":"D","rationale":"R"}],"sources":["typo"]}]}',
        encoding="utf-8",
    )

    assert any("unknown source" in error.lower() for error in validate_repository(tmp_path))
