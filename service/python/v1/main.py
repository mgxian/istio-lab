import time
import requests
from functools import partial
from flask import Flask, jsonify, g, request
from multiprocessing.dummy import Pool as ThreadPool


app = Flask(__name__)


def getForwardHeaders(request):
    headers = {}
    incoming_headers = [
        'x-request-id',
        'x-b3-traceid',
        'x-b3-spanid',
        'x-b3-parentspanid',
        'x-b3-sampled',
        'x-b3-flags',
        'x-ot-span-context'
    ]

    for ihdr in incoming_headers:
        val = request.headers.get(ihdr)
        if val is not None:
            headers[ihdr] = val
            # print("incoming: "+ihdr+":"+val)

    return headers


@app.before_request
def before_request():
    g.forwardHeaders = getForwardHeaders(request)


def get_url_response(url, headers={}):
    try:
        start = time.time()
        resp = requests.get(url, headers=headers, timeout=20)
        response_time = round(time.time() - start, 2)
        data = resp.json()
        data['response_time'] = response_time
    except Exception as e:
        print(e)
        data = None
    return data


@app.route("/env")
def env():
    # service_lua_url = 'http://httpbin.org/delay/3'
    # service_node_url = 'http://httpbin.org/delay/4'

    service_lua_url = 'http://' + 'service-lua' + '/env'
    service_node_url = 'http://' + 'service-node' + '/env'

    services_url = [service_lua_url, service_node_url]
    pool = ThreadPool(2)
    wrap_get_url_response = partial(get_url_response, headers=g.forwardHeaders)
    results = pool.map(wrap_get_url_response, services_url)
    upstream = [r for r in results if r]

    return jsonify({
        "message": 'python v1',
        "upstream": upstream
    })


@app.route("/status")
def status():
    return "ok"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
