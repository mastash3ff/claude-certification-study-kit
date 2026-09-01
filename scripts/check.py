#!/usr/bin/env python3
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path
from typing import Any


def _load(path: Path) -> Any:
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ValueError(f"Cannot load {path}: {exc}") from exc


def validate_repository(root: Path) -> list[str]:
    errors: list[str] = []
    content = root / "app" / "data"
    try:
        tracks_data = _load(content / "tracks.json")
    except ValueError as exc:
        return [str(exc)]

    tracks = tracks_data.get("tracks", [])
    source_ids = set(tracks_data.get("sources", {}))
    if not isinstance(tracks, list) or not tracks:
        return ["app/data/tracks.json must contain a non-empty tracks array"]

    all_ids: set[str] = set()
    for track in tracks:
        track_id = track.get("id")
        if not isinstance(track_id, str):
            errors.append("Every track requires a string id")
            continue
        domains = track.get("domains", [])
        domain_ids = {domain.get("id") for domain in domains}
        if sum(domain.get("weight", 0) for domain in domains) != 100:
            errors.append(f"{track_id}: domain weights must total 100")
        objective_ids = {
            objective["id"]
            for domain in domains
            for objective in domain.get("objectives", [])
            if isinstance(objective, dict) and "id" in objective
        }

        try:
            question_data = _load(content / f"{track_id}.json")
        except ValueError as exc:
            errors.append(str(exc))
            continue
        questions = question_data.get("questions", [])
        expected = track.get("expectedQuestions")
        if len(questions) != expected:
            errors.append(f"{track_id}: expected {expected} questions, found {len(questions)}")
        seen_objectives: set[str] = set()
        for question in questions:
            qid = question.get("id")
            if not isinstance(qid, str) or not qid:
                errors.append(f"{track_id}: question has no id")
                continue
            if qid in all_ids:
                errors.append(f"duplicate question id: {qid}")
            all_ids.add(qid)
            if question.get("track") != track_id:
                errors.append(f"{qid}: track mismatch")
            if question.get("domain") not in domain_ids:
                errors.append(f"{qid}: unknown domain")
            objective = question.get("objective")
            if objective not in objective_ids:
                errors.append(f"{qid}: unknown objective {objective}")
            if objective in seen_objectives:
                errors.append(f"{track_id}: objective {objective} appears more than once")
            seen_objectives.add(objective)
            options = question.get("options", [])
            option_ids = {option.get("id") for option in options}
            correct = question.get("correct", [])
            if len(options) != 4 or len(option_ids) != 4:
                errors.append(f"{qid}: must have four uniquely identified options")
            if question.get("select") != len(correct) or not set(correct) <= option_ids:
                errors.append(f"{qid}: invalid correct-answer set")
            if any(not option.get("rationale") for option in options):
                errors.append(f"{qid}: every option requires a rationale")
            if not question.get("sources"):
                errors.append(f"{qid}: at least one source is required")
            elif not set(question["sources"]) <= source_ids:
                errors.append(f"{qid}: unknown source id")
            if not question.get("stem"):
                errors.append(f"{qid}: question stem is required")
        missing = objective_ids - seen_objectives
        if missing:
            errors.append(f"{track_id}: objectives without questions: {', '.join(sorted(missing))}")
    return errors


def main() -> int:
    root = Path(__file__).parents[1]
    errors = validate_repository(root)
    if errors:
        for error in errors:
            print(f"CONTENT ERROR: {error}", file=sys.stderr)
        return 1

    commands = [
        ["node", "--test", "tests/core.test.mjs"],
        [sys.executable, "-m", "pytest", "-q", "tests/content_check_test.py"],
    ]
    for command in commands:
        try:
            completed = subprocess.run(command, cwd=root, check=False)
        except FileNotFoundError:
            print(f"CHECK ERROR: required command not found: {command[0]}", file=sys.stderr)
            return 1
        if completed.returncode:
            return completed.returncode
    print("All content and application checks passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
