"""Exercise the internal order flow against a running local Sites preview."""
import http.cookiejar
import io
import json
import math
import os
import re
from pathlib import Path
import urllib.error
import urllib.parse
import urllib.request
import uuid
import xml.etree.ElementTree as ET
import zipfile

base = os.environ.get('OGS_TEST_BASE', 'http://127.0.0.1:5173').rstrip('/')
assert urllib.parse.urlparse(base).hostname in {'127.0.0.1', 'localhost'}
anonymous = urllib.request.build_opener()
owner = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
owner.open(base + '/signin-with-chatgpt?return_to=%2Fadmin').close()
endpoint = '/api/clicker-orders/test'

def request(path, method='GET', body=None, client=owner, origin=base):
    headers = {'Origin': origin}
    if isinstance(body, dict):
        headers['Content-Type'] = 'application/json'
        body = json.dumps(body).encode()
    elif body is not None:
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
    req = urllib.request.Request(base + path, data=body, method=method, headers=headers)
    try:
        with client.open(req, timeout=30) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, error.read()

def check_cap_socket(model, namespace):
    # Slice through the projecting boss. The ring must be solid in every
    # direction and the female cross must be open at the center and arm tips.
    cap = model.find('.//m:object[@name="Moving cap"]/m:mesh', namespace)
    vertices = [tuple(float(v.attrib[axis]) for axis in 'xyz') for v in cap.findall('m:vertices/m:vertex', namespace)]
    triangles = [tuple(int(t.attrib[f'v{i}']) for i in range(1, 4)) for t in cap.findall('m:triangles/m:triangle', namespace)]
    for z in (0.58, 1.39, 3.62):
        segments = []
        for triangle in triangles:
            points = [vertices[index] for index in triangle]
            section = []
            for a, b in zip(points, points[1:] + points[:1]):
                if (a[2] > z) != (b[2] > z):
                    k = (z - a[2]) / (b[2] - a[2])
                    section.append(tuple(a[i] + k * (b[i] - a[i]) for i in (0, 1)))
            if len(section) == 2:
                segments.append(section)

        def inside(x, y):
            hits = sum((a[1] > y) != (b[1] > y) and
                       x < a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1])
                       for a, b in segments)
            return bool(hits % 2)

        for degrees in range(0, 360, 5):
            angle = math.radians(degrees)
            assert all(inside(radius * math.cos(angle), 39 + radius * math.sin(angle)) for radius in (2.35, 3.32))
            assert not inside(3.63 * math.cos(angle), 39 + 3.63 * math.sin(angle))
        for x, y in ((0, 0), (1.93, 0), (-1.93, 0), (0, 1.93), (0, -1.93)):
            assert not inside(x, 39 + y)
        for x, y in ((1, 1), (-1, -1), (-1, 1), (1, -1)):
            assert inside(x, 39 + y)

assert request(endpoint, client=anonymous)[0] == 401
assert json.loads(request(endpoint)[1])['test'] is True
colors = {'border': '#f2c879', 'fill': '#efb39e', 'ink': '#fffcf5'}
results = []
for text, tier, amount, other_tier, other_amount in [
    ('玩好物', 'test-a', 299, 'test-b', 399),
    ('玩好物工作', 'test-b', 399, 'test-a', 299),
    ('Brittany', 'test-b', 399, 'test-a', 299),
]:
    payload = {'requestId': str(uuid.uuid4()), 'text': text, 'font': 'huninn', 'colors': colors}
    assert request(endpoint, 'POST', payload, origin='https://other.example')[0] == 403
    for over_limit in ['玩好物工作室', 'ABCDEFGHI', '玩好物工ABC']:
        assert request(endpoint, 'POST', {**payload, 'text': over_limit})[0] == 400
    # An old client or a forged request cannot override the server-calculated tier or amount.
    status, raw = request(endpoint, 'POST', {**payload, 'tier': other_tier, 'amount': 1})
    assert status == 201, raw
    order = json.loads(raw)
    assert order['amount'] == amount and order['tier'] == tier and order['id'].startswith('OGS-T-')
    retry_status, retry = request(endpoint, 'POST', payload)
    assert retry_status == 200 and json.loads(retry) == order
    assert request(endpoint, 'POST', {**payload, 'text': 'OGS'})[0] == 409
    checkout = order['checkoutUrl']
    assert checkout.endswith('/checkout/' + tier)
    assert request(checkout.rsplit('/', 1)[0] + '/' + other_tier)[0] == 404
    assert request(checkout.rsplit('/', 1)[0])[0] == 200  # Legacy link.
    status, page = request(checkout)
    assert status == 200 and f'NT${amount}'.encode() in page
    assert f'{tier[-1].upper()} 檔'.encode() in page
    assert order['id'].encode() in page
    assert b'name="ogsCode"' not in page and b'id="copy-code"' not in page
    assert b'TEST-MYSHIP-' not in page  # Opening checkout does not place an order.
    assert request(checkout, 'POST', b'', origin='https://other.example')[0] == 403
    status, page = request(checkout, 'POST', b'')
    assert status == 200 and order['id'].encode() in page
    reference = re.search(rb'TEST-MYSHIP-[A-F0-9]{12}', page).group().decode()
    status, retry_page = request(checkout, 'POST', b'ogsCode=WRONG')
    assert status == 200 and reference.encode() in retry_page  # Resubmission keeps the same reference.
    list_path = '/api/admin/clicker-orders?q=' + order['id']
    items = json.loads(request(list_path)[1])['items']
    assert len(items) == 1 and items[0]['design']['text'] == text
    assert items[0]['design']['colors'] == colors and items[0]['matchedReference'] is None
    assert items[0]['amount'] == amount and items[0]['tier'] == tier
    record = '/api/admin/clicker-orders/' + order['id']
    assert request(record + '/match', 'PUT', {'reference': 'WRONG', 'amount': amount})[0] == 409
    assert request(record + '/match', 'PUT', {'reference': reference, 'amount': other_amount})[0] == 409
    assert request(record + '/match', 'PUT', {'reference': reference, 'amount': amount})[0] == 200
    assert json.loads(request(list_path)[1])['items'][0]['matchedReference'] == reference
    assert request(record + '/3mf', client=anonymous)[0] == 401
    status, file = request(record + '/3mf')
    assert status == 200
    with zipfile.ZipFile(io.BytesIO(file)) as project:
        namespace = {'m': 'http://schemas.microsoft.com/3dmanufacturing/core/2015/02'}
        model = ET.fromstring(project.read('3D/3dmodel.model'))
        assert model.attrib['unit'] == 'millimeter'
        assert len(model.findall('.//m:mesh', namespace)) == 4
        check_cap_socket(model, namespace)
        settings = json.loads(project.read('Metadata/project_settings.config'))
        assert settings['filament_colour'] == ['#F2C879', '#EFB39E', '#FFFCF5']
        models = ET.fromstring(project.read('Metadata/model_settings.config'))
        assert [p.attrib['value'] for p in models.findall('.//part/metadata[@key="extruder"]')] == ['1', '1', '2', '3']
    output = os.environ.get('OGS_TEST_EXPORT')
    if output and text == '玩好物工作':
        Path(output).write_bytes(file)
    results.append({'order': order['id'], 'tier': tier, 'testPrice': amount, 'simulatedMyShipOrder': reference})

print(json.dumps({'orders': results, 'checks': ['automatic pricing', 'correct checkout', 'order match', 'private 3MF download', 'continuous circular MX socket']}, ensure_ascii=False))
