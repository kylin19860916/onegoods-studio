"""Serve a static OGS build and public catalog fixtures for read-only comparison."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument('public', type=Path)
    parser.add_argument('fixtures', type=Path)
    parser.add_argument('--port', type=int, default=5175)
    return parser.parse_args()

def file_response(handler, path, mimetype):
    if not path.is_file():
        handler.send_error(404)
        return
    data = path.read_bytes()
    handler.send_response(200)
    handler.send_header('Content-Type', mimetype)
    handler.send_header('Content-Length', str(len(data)))
    handler.end_headers()
    handler.wfile.write(data)

class Preview(SimpleHTTPRequestHandler):
    def __init__(self, *args, directory, fixtures, **kwargs):
        self.fixtures = fixtures
        super().__init__(*args, directory=directory, **kwargs)

    def do_GET(self):
        path = urlsplit(self.path).path
        config = {'/api/catalog':'catalog.json', '/api/store-payment/config':'config.json'}.get(path)
        if config:
            file_response(self,self.fixtures / config,'application/json')
        elif path.startswith('/media/'):
            file_response(self,self.fixtures / 'media' / Path(path).name,'image/jpeg')
        else:
            if not path.endswith('/') and not Path(path).suffix:
                self.path = path + '.html'
            super().do_GET()

if __name__ == '__main__':
    options = parse_arguments()
    server = ThreadingHTTPServer(('127.0.0.1',options.port),
        partial(Preview,directory=options.public,fixtures=options.fixtures))
    server.serve_forever()
