#!/usr/bin/env python3
import os
import base64
import requests
import json
import sys
from pathlib import Path

# Configuration
GITHUB_TOKEN = os.environ.get('GITHUB_PERSONAL_ACCESS_TOKEN')
REPO_OWNER = 'A-tndn'
REPO_NAME = 'letsgrow-saas-platform'
BASE_URL = f'https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}'

if not GITHUB_TOKEN:
    print("Error: GITHUB_PERSONAL_ACCESS_TOKEN environment variable not found")
    sys.exit(1)

headers = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Content-Type': 'application/json',
    'Accept': 'application/vnd.github.v3+json'
}

def upload_file(file_path, content, message=None):
    """Upload a file to GitHub repository using Contents API"""
    
    # Convert to forward slashes for GitHub
    github_path = str(file_path).replace('\\', '/')
    if github_path.startswith('./'):
        github_path = github_path[2:]
    
    if message is None:
        message = f'Add {github_path}'
    
    # Encode content as base64
    if isinstance(content, str):
        content_encoded = base64.b64encode(content.encode('utf-8')).decode('utf-8')
    else:
        content_encoded = base64.b64encode(content).decode('utf-8')
    
    data = {
        'message': message,
        'content': content_encoded,
        'branch': 'main'
    }
    
    url = f'{BASE_URL}/contents/{github_path}'
    response = requests.put(url, headers=headers, json=data)
    
    if response.status_code in [200, 201]:
        print(f"✅ Uploaded: {github_path}")
        return True
    else:
        print(f"❌ Failed to upload {github_path}: {response.status_code} - {response.text}")
        return False

def get_file_list():
    """Get list of files to upload"""
    exclude_patterns = [
        '.git', '.cache', 'node_modules', '.next', 'venv', '__pycache__',
        '.DS_Store', '*.pyc', '*.log', '.local'
    ]
    
    files = []
    for root, dirs, file_names in os.walk('.'):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if not any(pattern in d for pattern in exclude_patterns)]
        
        for file_name in file_names:
            file_path = os.path.join(root, file_name)
            
            # Skip files matching exclude patterns
            if any(pattern in file_path for pattern in exclude_patterns):
                continue
            
            # Only include source code and config files
            if any(file_path.endswith(ext) for ext in [
                '.py', '.tsx', '.ts', '.js', '.jsx', '.json', '.css', '.scss',
                '.md', '.txt', '.sh', '.html', '.yml', '.yaml', '.toml',
                '.env.example', 'Dockerfile', 'requirements.txt', 'package.json',
                'package-lock.json', 'tsconfig.json', 'next.config.js',
                'tailwind.config.js', '.gitignore'
            ]) or (os.path.basename(file_path) in ['wsgi.py', 'replit.nix', 'startup.sh']):
                files.append(file_path)
    
    return files

def main():
    print(f"🚀 Starting upload to GitHub repository: {REPO_OWNER}/{REPO_NAME}")
    
    files_to_upload = get_file_list()
    print(f"📁 Found {len(files_to_upload)} files to upload")
    
    success_count = 0
    total_count = len(files_to_upload)
    
    for file_path in files_to_upload:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if upload_file(file_path, content):
                success_count += 1
                
        except UnicodeDecodeError:
            # Handle binary files
            try:
                with open(file_path, 'rb') as f:
                    content = f.read()
                
                if upload_file(file_path, content):
                    success_count += 1
                    
            except Exception as e:
                print(f"❌ Error reading {file_path}: {str(e)}")
        except Exception as e:
            print(f"❌ Error processing {file_path}: {str(e)}")
    
    print(f"\n🎉 Upload completed: {success_count}/{total_count} files uploaded successfully")
    
    if success_count == total_count:
        print(f"✅ All files uploaded successfully to: https://github.com/{REPO_OWNER}/{REPO_NAME}")
    else:
        print(f"⚠️  {total_count - success_count} files failed to upload")

if __name__ == "__main__":
    main()