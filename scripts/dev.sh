#!/usr/bin/env sh
# Altijd dezelfde URL: http://localhost:8000
# Houdt de poort vrij door alles te stoppen wat er nog op luistert (ook vastlopende Vite's).
set -e
PORT="${VITE_DEV_PORT:-8000}"

force_free_port() {
  _round=0
  while [ "$_round" -lt 6 ]; do
    _round=$((_round + 1))
    PIDS=$(lsof -nP -tiTCP:"$PORT" -sTCP:LISTEN 2>/dev/null || true)
    if [ -z "$PIDS" ]; then
      PIDS=$(lsof -nP -ti:"$PORT" 2>/dev/null || true)
    fi
    if [ -z "$PIDS" ]; then
      return 0
    fi
    echo "Poort $PORT is bezig — stoppen: $PIDS"
    for pid in $PIDS; do
      kill -9 "$pid" 2>/dev/null || true
    done
    sleep 0.3
  done
}

force_free_port
exec vite
