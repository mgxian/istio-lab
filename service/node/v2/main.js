const Koa = require('koa');
const Router = require('koa-router');
const axios = require('axios')
const app = new Koa();
const router = new Router();


function getForwardHeaders(request) {
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

    for (idx in incoming_headers) {
        ihdr = incoming_headers[idx]
        val = request.headers[ihdr]
        if (val !== undefined && val !== '') {
            headers[ihdr] = val
            console.log("incoming: " + ihdr + ":" + val)
        }
    }
    return headers
}



router.get('/status', async (ctx, next) => {
    ctx.body = 'ok';
})

router.get('/env', async (ctx, next) => {
    forwardHeaders = getForwardHeaders(ctx.request)
    // service_go_url = 'http://httpbin.org/delay/10'
    service_go_url = 'http://' + 'service-go' + '/env'
    upstream_ret = null
    try {
        // console.log(forwardHeaders)
        // upstream_ret = JSON.parse('{"message": "go v1"}')
        let start = Date.now()
        const response = await axios.get(service_go_url, {
            headers: forwardHeaders,
            timeout: 20000
        });
        response_time = ((Date.now() - start) / 1000).toFixed(2)
        upstream_ret = response.data
        upstream_ret.response_time = response_time
    } catch (error) {
        console.error('error');
    }
    if (upstream_ret) {
        // console.log(upstream_ret);
        ctx.body = {
            'message': 'node v2',
            'upstream': [upstream_ret]
        };
    } else {
        ctx.body = {
            'message': 'node v2',
            'upstream': []
        }
    }
})

app.use(router.routes()).use(router.allowedMethods());
app.listen(80);