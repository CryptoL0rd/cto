"""Vercel serverless function that exposes a simple health check."""

from __future__ import annotations

import json
from typing import Any, Dict


def handler(request: Dict[str, Any] | None) -> Dict[str, Any]:  # pragma: no cover
  """Return a 200 OK health payload.

  The signature follows the Vercel serverless function contract for Python runtimes.
  """
  payload = {
    "status": "ok",
    "service": "monorepo-api",
  }
  return {
    "statusCode": 200,
    "headers": {"Content-Type": "application/json"},
    "body": json.dumps(payload),
  }
