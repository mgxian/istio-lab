from flask import Flask, jsonify, g, request
import platform
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
    service_lua_url = 'http://' + 'service-lua' + '/env'
    resp = requests.get(service_lua_url, headers=g.forwardHeaders)
    data_lua = resp.json()

    service_node_url = 'http://' + 'service-node' + '/env'
    resp = requests.get(service_node_url, headers=g.forwardHeaders)
    data_node = resp.json()

    return jsonify({
        "message": 'Python' + platform.python_version(),
        "upstream": [data_lua, data_node]
    })


@app.route("/status")
def status():
    return "ok"


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
