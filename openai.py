import subprocess
import argparse

# Set up argument parser
parser = argparse.ArgumentParser(description="Auto Git Commit & Push Script")
parser.add_argument('-m', '--message', required=True, help='Commit message')
args = parser.parse_args()

# Global Git configuration
user_name = "sherlockvj"
user_email = "mailmesomyajit@gmail.com"

# Run shell commands using subprocess
def run_command(command, check=True):
    print(f"Running: {command}")
    subprocess.run(command, shell=True, check=check)

# Set Git global user config
run_command(f'git config --global user.name "{user_name}"')
run_command(f'git config --global user.email "{user_email}"')

# Add, Commit, and Push
run_command('git add .')
run_command(f'git commit -m "{args.message}"')
run_command('git push origin master')
