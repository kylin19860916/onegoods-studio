"""Exercise the internal order flow against a running local Sites preview."""
import http.cookiejar
import io
import json
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

assert request(endpoint, client=anonymous)[0] == 401
assert json.loads(request(endpoint)[1])['test'] is True
colors = {'border': '#f2c879', 'fill': '#efb39e', 'ink': '#fffcf5'}
results = []
for text, tier, amount, other_tier, other_amount in [
    ('玩好物', 'test-a', 299, 'test-b', 399),
    ('好物工作', 'test-b', 399, 'test-a', 299),
]:
    payload = {'requestId': str(uuid.uuid4()), 'text': text, 'font': 'huninn', 'colors': colors}
    assert request(endpoint, 'POST', payload, origin='https://other.example')[0] == 403
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
    assert request(checkout, 'POST', b'ogsCode=WRONG')[0] == 400
    status, page = request(checkout, 'POST', ('ogsCode=' + order['id']).encode())
    assert status == 200
    reference = re.search(rb'TEST-MYSHIP-[A-F0-9]{12}', page).group().decode()
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
        settings = json.loads(project.read('Metadata/project_settings.config'))
        assert settings['filament_colour'] == ['#F2C879', '#EFB39E', '#FFFCF5']
        models = ET.fromstring(project.read('Metadata/model_settings.config'))
        assert [p.attrib['value'] for p in models.findall('.//part/metadata[@key="extruder"]')] == ['1', '1', '2', '3']
    output = os.environ.get('OGS_TEST_EXPORT')
    if output and tier == 'test-b':
        Path(output).write_bytes(file)
    results.append({'order': order['id'], 'tier': tier, 'testPrice': amount, 'simulatedMyShipOrder': reference})

print(json.dumps({'orders': results, 'checks': ['automatic pricing', 'correct checkout', 'order match', 'private 3MF download']}, ensure_ascii=False))
