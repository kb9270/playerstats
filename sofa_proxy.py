from http.server import BaseHTTPRequestHandler, HTTPServer
import urllib.parse
import json
from curl_cffi import requests

class ProxyHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_path = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_path.query)
        
        if 'url' not in query_params:
            self.send_response(400)
            self.end_headers()
            self.wfile.write(b"Missing 'url' parameter")
            return
            
        target_url = query_params['url'][0]
        print(f"[Proxy] Fetching: {target_url}")
        
        try:
            # impersonate Chrome to bypass Cloudflare TLS fingerprinting
            resp = requests.get(
                target_url, 
                impersonate="chrome120",
                headers={
                    "Accept": "application/json, text/plain, */*",
                    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
                    "Origin": "https://www.sofascore.com",
                    "Referer": "https://www.sofascore.com/"
                },
                timeout=10
            )
            
            self.send_response(resp.status_code)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(resp.content)
            
        except Exception as e:
            print(f"[Proxy] Error: {e}")
            self.send_response(500)
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

def run(server_class=HTTPServer, handler_class=ProxyHTTPRequestHandler, port=8001):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print(f'[Proxy] Starting SofaScore curl_cffi proxy on port {port}...')
    httpd.serve_forever()

if __name__ == '__main__':
    run()
