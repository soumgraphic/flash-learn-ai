"""Centralized Rate Limiter setup using SlowAPI.

Educational Notes for Students:
------------------------------
1. Rate Limiting protects endpoints from Denial-of-Service (DoS) and brute force attacks.
2. `get_remote_address` extracts the client's IP from the HTTP request.
3. In production behind reverse proxies (like Cloud Run or Cloudflare),
   ensure the proxy forwards the client IP in `X-Forwarded-For`.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

# Default limiter key based on remote client IP address
limiter = Limiter(key_func=get_remote_address)
