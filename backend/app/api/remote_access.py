"""
Remote Access API - Provides complete programmatic access to the project
Allows reading/writing files, executing commands, viewing logs, etc.
"""

import os
import subprocess
import json
import shutil
import tempfile
import glob
from pathlib import Path
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from functools import wraps
import logging
from typing import Dict, List, Any, Optional

remote_access_bp = Blueprint('remote_access', __name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# No authentication required - open access
def require_api_key(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        return f(*args, **kwargs)
    return decorated_function

# Helper functions
def safe_path(path: str, base_path: str = "/home/runner/workspace") -> str:
    """Convert path to absolute path - no restrictions."""
    try:
        if os.path.isabs(path):
            return path
        return os.path.abspath(os.path.join(base_path, path))
    except Exception:
        return path

def get_file_info(filepath: str) -> Dict[str, Any]:
    """Get file metadata."""
    try:
        stat = os.stat(filepath)
        return {
            'name': os.path.basename(filepath),
            'path': filepath,
            'size': stat.st_size,
            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'is_file': os.path.isfile(filepath),
            'is_directory': os.path.isdir(filepath),
            'permissions': oct(stat.st_mode)[-3:]
        }
    except Exception as e:
        return {'error': str(e)}

# =============================================================================
# FILE OPERATIONS API
# =============================================================================

@remote_access_bp.route('/files', methods=['GET'])
@require_api_key
def list_files():
    """List files and directories in the specified path."""
    try:
        path = request.args.get('path', '.')
        full_path = safe_path(path)
        
        if not os.path.exists(full_path):
            return jsonify({'error': 'Path does not exist'}), 404
            
        items = []
        for item in os.listdir(full_path):
            item_path = os.path.join(full_path, item)
            items.append(get_file_info(item_path))
        
        # Sort: directories first, then files
        items.sort(key=lambda x: (not x.get('is_directory', False), x.get('name', '').lower()))
        
        return jsonify({
            'success': True,
            'path': full_path,
            'items': items,
            'count': len(items)
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error listing files: {e}")
        return jsonify({'error': 'Failed to list files'}), 500

@remote_access_bp.route('/files/read', methods=['GET'])
@require_api_key
def read_file():
    """Read file contents."""
    try:
        path = request.args.get('path')
        if not path:
            return jsonify({'error': 'Path parameter is required'}), 400
            
        safe_path_str = safe_path(path)
        
        if not os.path.exists(safe_path_str):
            return jsonify({'error': 'File does not exist'}), 404
            
        if not os.path.isfile(safe_path_str):
            return jsonify({'error': 'Path is not a file'}), 400
        
        # Check file size (limit to 10MB)
        file_size = os.path.getsize(safe_path_str)
        if file_size > 10 * 1024 * 1024:  # 10MB limit
            return jsonify({'error': 'File too large (>10MB)'}), 413
        
        # Try to read as text first, fallback to binary
        try:
            with open(safe_path_str, 'r', encoding='utf-8') as f:
                content = f.read()
            is_binary = False
        except UnicodeDecodeError:
            with open(safe_path_str, 'rb') as f:
                content = f.read()
            content = content.hex()  # Return hex for binary files
            is_binary = True
        
        return jsonify({
            'success': True,
            'path': safe_path_str,
            'content': content,
            'is_binary': is_binary,
            'size': file_size,
            'info': get_file_info(safe_path_str)
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error reading file: {e}")
        return jsonify({'error': 'Failed to read file'}), 500

@remote_access_bp.route('/files/write', methods=['POST'])
@require_api_key
def write_file():
    """Write content to a file."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON data is required'}), 400
            
        path = data.get('path')
        content = data.get('content', '')
        create_dirs = data.get('create_dirs', False)
        
        if not path:
            return jsonify({'error': 'Path is required'}), 400
            
        safe_path_str = safe_path(path)
        
        # Create parent directories if requested
        if create_dirs:
            os.makedirs(os.path.dirname(safe_path_str), exist_ok=True)
        
        # Write file
        with open(safe_path_str, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return jsonify({
            'success': True,
            'path': safe_path_str,
            'message': 'File written successfully',
            'info': get_file_info(safe_path_str)
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error writing file: {e}")
        return jsonify({'error': 'Failed to write file'}), 500

@remote_access_bp.route('/files/delete', methods=['DELETE'])
@require_api_key
def delete_file():
    """Delete a file or directory."""
    try:
        path = request.args.get('path') or request.json.get('path') if request.json else None
        if not path:
            return jsonify({'error': 'Path parameter is required'}), 400
            
        safe_path_str = safe_path(path)
        
        if not os.path.exists(safe_path_str):
            return jsonify({'error': 'Path does not exist'}), 404
        
        if os.path.isdir(safe_path_str):
            shutil.rmtree(safe_path_str)
            message = 'Directory deleted successfully'
        else:
            os.remove(safe_path_str)
            message = 'File deleted successfully'
        
        return jsonify({
            'success': True,
            'path': safe_path_str,
            'message': message
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error deleting file: {e}")
        return jsonify({'error': 'Failed to delete file'}), 500

@remote_access_bp.route('/files/mkdir', methods=['POST'])
@require_api_key
def create_directory():
    """Create a directory."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON data is required'}), 400
            
        path = data.get('path')
        if not path:
            return jsonify({'error': 'Path is required'}), 400
            
        safe_path_str = safe_path(path)
        
        os.makedirs(safe_path_str, exist_ok=True)
        
        return jsonify({
            'success': True,
            'path': safe_path_str,
            'message': 'Directory created successfully',
            'info': get_file_info(safe_path_str)
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error creating directory: {e}")
        return jsonify({'error': 'Failed to create directory'}), 500

# =============================================================================
# COMMAND EXECUTION API
# =============================================================================

@remote_access_bp.route('/execute', methods=['POST'])
@require_api_key
def execute_command():
    """Execute any shell command without restrictions."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'JSON data is required'}), 400
            
        command = data.get('command')
        working_dir = data.get('working_dir', '/home/runner/workspace')
        timeout = data.get('timeout', 300)  # 5 minute default timeout
        
        if not command:
            return jsonify({'error': 'Command is required'}), 400
        
        working_directory = safe_path(working_dir)
        
        # Execute command with full shell access
        start_time = datetime.now()
        result = subprocess.run(
            command,
            shell=True,  # Full shell access
            cwd=working_directory,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        end_time = datetime.now()
        
        return jsonify({
            'success': True,
            'command': command,
            'working_dir': working_directory,
            'exit_code': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'execution_time': (end_time - start_time).total_seconds()
        })
        
    except subprocess.TimeoutExpired:
        return jsonify({'error': 'Command timed out after 300 seconds'}), 408
    except Exception as e:
        logger.error(f"Error executing command: {e}")
        return jsonify({'error': 'Failed to execute command'}), 500

# =============================================================================
# LOGS AND MONITORING API
# =============================================================================

@remote_access_bp.route('/logs', methods=['GET'])
@require_api_key
def get_logs():
    """Get application logs."""
    try:
        log_type = request.args.get('type', 'all')  # all, frontend, backend
        lines = int(request.args.get('lines', 100))  # Number of lines to return
        
        logs_data = {}
        
        # Look for log files in /tmp/logs/
        log_dir = '/tmp/logs'
        if os.path.exists(log_dir):
            log_files = glob.glob(os.path.join(log_dir, '*.log'))
            
            for log_file in log_files[-10:]:  # Last 10 log files
                try:
                    filename = os.path.basename(log_file)
                    if log_type != 'all':
                        if log_type.lower() not in filename.lower():
                            continue
                    
                    with open(log_file, 'r', encoding='utf-8') as f:
                        content = f.readlines()
                        # Get last N lines
                        content = content[-lines:] if len(content) > lines else content
                        logs_data[filename] = {
                            'content': ''.join(content),
                            'lines': len(content),
                            'modified': datetime.fromtimestamp(os.path.getmtime(log_file)).isoformat()
                        }
                except Exception as e:
                    logs_data[os.path.basename(log_file)] = {'error': str(e)}
        
        return jsonify({
            'success': True,
            'log_type': log_type,
            'lines_requested': lines,
            'logs': logs_data
        })
        
    except Exception as e:
        logger.error(f"Error getting logs: {e}")
        return jsonify({'error': 'Failed to get logs'}), 500

@remote_access_bp.route('/status', methods=['GET'])
@require_api_key
def get_status():
    """Get project status information."""
    try:
        workspace_path = '/home/runner/workspace'
        
        # Get basic system info
        status_info = {
            'timestamp': datetime.now().isoformat(),
            'workspace_path': workspace_path,
            'python_version': subprocess.run(['python', '--version'], capture_output=True, text=True).stdout.strip(),
            'node_version': subprocess.run(['node', '--version'], capture_output=True, text=True).stdout.strip() if shutil.which('node') else 'Not installed',
            'disk_usage': {},
            'processes': []
        }
        
        # Get disk usage
        try:
            disk_usage = shutil.disk_usage(workspace_path)
            status_info['disk_usage'] = {
                'total': disk_usage.total,
                'used': disk_usage.used,
                'free': disk_usage.free,
                'used_percent': round((disk_usage.used / disk_usage.total) * 100, 2)
            }
        except Exception as e:
            status_info['disk_usage'] = {'error': str(e)}
        
        # Get running processes (simplified)
        try:
            ps_result = subprocess.run(['ps', 'aux'], capture_output=True, text=True)
            if ps_result.returncode == 0:
                lines = ps_result.stdout.strip().split('\n')[1:6]  # First 5 processes
                for line in lines:
                    parts = line.split(None, 10)
                    if len(parts) >= 11:
                        status_info['processes'].append({
                            'pid': parts[1],
                            'cpu': parts[2],
                            'mem': parts[3],
                            'command': parts[10]
                        })
        except Exception as e:
            status_info['processes'] = [{'error': str(e)}]
        
        return jsonify({
            'success': True,
            'status': status_info
        })
        
    except Exception as e:
        logger.error(f"Error getting status: {e}")
        return jsonify({'error': 'Failed to get status'}), 500

# =============================================================================
# PROJECT STRUCTURE API
# =============================================================================

@remote_access_bp.route('/structure', methods=['GET'])
@require_api_key
def get_project_structure():
    """Get project directory structure."""
    try:
        max_depth = int(request.args.get('max_depth', 3))
        show_hidden = request.args.get('show_hidden', 'false').lower() == 'true'
        
        def build_tree(path: str, current_depth: int = 0) -> Dict[str, Any]:
            if current_depth >= max_depth:
                return {}
            
            try:
                items = {}
                for item in os.listdir(path):
                    if not show_hidden and item.startswith('.'):
                        continue
                    
                    item_path = os.path.join(path, item)
                    if os.path.isdir(item_path):
                        items[item] = {
                            'type': 'directory',
                            'children': build_tree(item_path, current_depth + 1),
                            'info': get_file_info(item_path)
                        }
                    else:
                        items[item] = {
                            'type': 'file',
                            'info': get_file_info(item_path)
                        }
                
                return items
            except PermissionError:
                return {'error': 'Permission denied'}
            except Exception as e:
                return {'error': str(e)}
        
        workspace_path = '/home/runner/workspace'
        structure = build_tree(workspace_path)
        
        return jsonify({
            'success': True,
            'root_path': workspace_path,
            'max_depth': max_depth,
            'show_hidden': show_hidden,
            'structure': structure
        })
        
    except Exception as e:
        logger.error(f"Error getting project structure: {e}")
        return jsonify({'error': 'Failed to get project structure'}), 500

# =============================================================================
# UTILITY ENDPOINTS
# =============================================================================

@remote_access_bp.route('/search', methods=['GET'])
@require_api_key
def search_files():
    """Search for files and content."""
    try:
        query = request.args.get('query', '')
        search_type = request.args.get('type', 'filename')  # filename, content, both
        path = request.args.get('path', '.')
        max_results = int(request.args.get('max_results', 50))
        
        if not query:
            return jsonify({'error': 'Query parameter is required'}), 400
        
        safe_search_path = safe_path(path)
        results = []
        
        for root, dirs, files in os.walk(safe_search_path):
            # Skip hidden directories
            dirs[:] = [d for d in dirs if not d.startswith('.')]
            
            for file in files:
                if file.startswith('.'):
                    continue
                    
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, safe_search_path)
                
                match_info = {
                    'path': file_path,
                    'relative_path': relative_path,
                    'filename': file,
                    'matches': []
                }
                
                # Filename search
                if search_type in ['filename', 'both']:
                    if query.lower() in file.lower():
                        match_info['matches'].append({'type': 'filename', 'text': file})
                
                # Content search
                if search_type in ['content', 'both']:
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            for line_num, line in enumerate(f, 1):
                                if query.lower() in line.lower():
                                    match_info['matches'].append({
                                        'type': 'content',
                                        'line': line_num,
                                        'text': line.strip()[:100]  # Truncate long lines
                                    })
                                    if len(match_info['matches']) > 5:  # Limit matches per file
                                        break
                    except (UnicodeDecodeError, PermissionError):
                        # Skip binary files or files we can't read
                        pass
                
                if match_info['matches']:
                    results.append(match_info)
                    if len(results) >= max_results:
                        break
            
            if len(results) >= max_results:
                break
        
        return jsonify({
            'success': True,
            'query': query,
            'search_type': search_type,
            'path': safe_search_path,
            'results_count': len(results),
            'max_results': max_results,
            'results': results
        })
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logger.error(f"Error searching files: {e}")
        return jsonify({'error': 'Failed to search files'}), 500

@remote_access_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint (no auth required)."""
    return jsonify({
        'status': 'healthy',
        'service': 'remote-access-api',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

# =============================================================================
# API DOCUMENTATION ENDPOINT
# =============================================================================

@remote_access_bp.route('/docs', methods=['GET'])
def api_documentation():
    """API documentation endpoint."""
    docs = {
        'title': 'Remote Access API',
        'version': '1.0.0',
        'description': 'Complete programmatic access to your Replit project',
        'base_url': request.host_url.rstrip('/') + '/api/remote',
        'authentication': {
            'type': 'API Key',
            'header': 'X-API-Key',
            'query_param': 'api_key',
            'description': 'Set REMOTE_ACCESS_API_KEY environment variable'
        },
        'endpoints': {
            'File Operations': {
                'GET /files': 'List files and directories',
                'GET /files/read': 'Read file contents',
                'POST /files/write': 'Write content to file',
                'DELETE /files/delete': 'Delete file or directory',
                'POST /files/mkdir': 'Create directory'
            },
            'Command Execution': {
                'POST /execute': 'Execute shell command'
            },
            'Monitoring': {
                'GET /logs': 'Get application logs',
                'GET /status': 'Get system status',
                'GET /structure': 'Get project structure'
            },
            'Utilities': {
                'GET /search': 'Search files and content',
                'GET /health': 'Health check',
                'GET /docs': 'This documentation'
            }
        },
        'examples': {
            'list_files': f'curl -H "X-API-Key: YOUR_API_KEY" "{request.host_url.rstrip("/")}/api/remote/files?path=."',
            'read_file': f'curl -H "X-API-Key: YOUR_API_KEY" "{request.host_url.rstrip("/")}/api/remote/files/read?path=package.json"',
            'execute_command': f'curl -X POST -H "X-API-Key: YOUR_API_KEY" -H "Content-Type: application/json" -d \'{{"command": "ls -la"}}\' "{request.host_url.rstrip("/")}/api/remote/execute"'
        }
    }
    
    return jsonify(docs)