from apistar import App, Route, http
import requests


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


def env(request: http.Request):
    forwardHeaders = getForwardHeaders(request)

    try:
        service_lua_url = 'http://' + 'service-lua' + '/env'
        resp = requests.get(
            service_lua_url, headers=forwardHeaders, timeout=15)
        data_lua = resp.json()
    except Exception as e:
        print(e)
        data_lua = None

    try:
        service_node_url = 'http://' + 'service-node' + '/env'
        resp = requests.get(
            service_node_url, headers=forwardHeaders, timeout=15)
        data_node = resp.json()
    except Exception as e:
        print(e)
        data_node = None

    upstream = []
    if data_lua:
        upstream.append(data_lua)
    if data_node:
        upstream.append(data_node)

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
