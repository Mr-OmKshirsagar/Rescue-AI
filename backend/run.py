#!/usr/bin/env python
"""Simple runner for the Emergency Response Platform backend."""
import sys
import subprocess

if __name__ == "__main__":
    try:
        # Try running with uvicorn module
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app",
            "--reload",
            "--host", "127.0.0.1",
            "--port", "8000"
        ])
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)
