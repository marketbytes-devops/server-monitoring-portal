import time
import subprocess
import os
import sys

def run_agent():
    print("MarketBytes Pulse Agent Initialized. Monitoring active perimeters...")
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    
    while True:
        try:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Executing pulse synchronization...")
            # Use 'python' or 'python3' based on environment
            cmd = [sys.executable, "manage.py", "check_websites"]
            subprocess.run(cmd, cwd=backend_dir)
        except Exception as e:
            print(f"Agent Execution Error: {e}")
        
        # Run every 60 seconds
        time.sleep(60)

if __name__ == "__main__":
    run_agent()
