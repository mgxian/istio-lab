from flask import Flask, jsonify, g, request
import requests
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.DEBUG)


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


@app.route("/env")
def env():
    try:
        service_lua_url = 'http://' + 'service-lua' + '/env'
        resp = requests.get(
            service_lua_url, headers=g.forwardHeaders, timeout=15)
        data_lua = resp.json()
    except Exception as e:
        print(e)
        data_lua = None

    try:
        service_node_url = 'http://' + 'service-node' + '/env'
        resp = requests.get(
            service_node_url, headers=g.forwardHeaders, timeout=15)
        data_node = resp.json()
    except Exception as e:
        print(e)
        data_node = None

    upstream = []
    if data_lua:
        upstream.append(data_lua)
    if data_node:
        upstream.append(data_node)

    return jsonify({
        "message": 'python v1',
        "upstream": upstream
    })


@app.route("/status")
def status():
    return "ok"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
