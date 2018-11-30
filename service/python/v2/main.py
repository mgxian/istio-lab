import time
import requests
from functools import partial
from apistar import App, Route, http
from multiprocessing.dummy import Pool as ThreadPool


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


def get_url_response(url, headers={}):
    try:
        start = time.time()
        resp = requests.get(url, headers=headers, timeout=20)
        response_time = round(time.time() - start, 1)
        data = resp.json()
        data['response_time'] = response_time
    except Exception as e:
        print(e)
        data = None
    return data


def env(request: http.Request):
    forwardHeaders = getForwardHeaders(request)

    # service_lua_url = 'http://' + 'service-lua' + '/env'
    # service_node_url = 'http://' + 'service-node' + '/env'

    service_lua_url = 'http://httpbin.org/delay/3'
    service_node_url = 'http://httpbin.org/delay/4'

    services_url = [service_lua_url, service_node_url]
    pool = ThreadPool(2)
    wrap_get_url_response = partial(get_url_response, headers=forwardHeaders)
    results = pool.map(wrap_get_url_response, services_url)
    upstream = [r for r in results if r]

    return {
        "message": 'python v2',
        "upstream": upstream
    }


def status():
    return 'ok'


routes = [
    Route('/env', method='GET', handler=env),
    Route('/status', method='GET', handler=status),
]

app = App(routes=routes)
if __name__ == '__main__':
    app.serve('0.0.0.0', 80, debug=False)
