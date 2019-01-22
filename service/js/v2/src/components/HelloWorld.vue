<template>
  <div class="hello">
    <div>
      <img src="../assets/logo.png">
      <h1>{{ msg }}</h1>
    </div>
    <button @click="handleClick">发射</button>
    <!-- <p>{{ message }}</p> -->
    <div id="service-graph">
      <v-chart ref="chart1" :options="graphOptions" :auto-resize="true"></v-chart>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import ECharts from 'vue-echarts'
// import 'echarts/lib/chart/graph'

export default {
  name: 'HelloWorld',
  components: {
    'v-chart': ECharts
  },
  data() {
    return {
      msg: 'Welcome to Istio',
      message: '',
      graphOptions: {},
      response_time: 0,
      serviceCall: {},
      serviceCallMockData: {
        message: 'python v2',
        upstream: [
          {
            message: 'lua v1',
            response_time: 0.1
          },
          {
            message: 'node v2',
            upstream: [
              {
                message: 'go v1',
                response_time: '0.01'
              }
            ],
            response_time: 0.1
          }
        ]
      }
    }
  },
  methods: {
    handleClick() {
      let url = '/env'
      axios.defaults.headers.common['App-Client'] = 'vue'
      let start = Date.now()
      axios
        .get(url, { timeout: 20000 })
        .then(res => {
          this.response_time = ((Date.now() - start) / 1000).toFixed(2)
          this.message = 'vue -----> ' + res.data.message
          this.serviceCall = res.data
          this.setChar()
        })
        .catch(error => {
          console.log(error)
          // this.serviceCall = this.serviceCallMockData
          // this.response_time = ((Date.now() - start) / 1000).toFixed(2)
          // this.setChar()
        })
    },
    parseServiceCall(data, result) {
      if (data.upstream) {
        data.upstream.forEach(upstream => {
          let link = {
            source: data.message,
            target: upstream.message,
            value: upstream.response_time,
            label: { show: true, formatter: '{c}s' }
          }
          // console.log(link)
          result.links = [link, ...result.links]
          this.parseServiceCall(upstream, result)
        })
      }

      let node = { name: data.message }
      // console.log(node)
      result.nodes = [...result.nodes, node]

      return result
    },

    getServiceNodesAndLinks() {
      let result = { nodes: [], links: [] }
      let ret = this.parseServiceCall(this.serviceCall, result)
      let node = { name: 'vue' }
      let link = {
        source: 'vue',
        target: ret.nodes[ret.nodes.length - 1].name,
        value: this.response_time,
        // value: Math.ceil(Math.random()*10),
        label: { show: true, formatter: '{c}s' }
      }
      ret.nodes = [...ret.nodes, node]
      ret.links.push(link)

      console.log(ret)
      return ret
    },

    setChar() {
      let ret = this.getServiceNodesAndLinks()
      this.graphOptions = {
        series: [
          {
            type: 'graph',
            layout: 'circular',
            focusNodeAdjacency: true,
            symbol: 'circle',
            symbolSize: 90,
            roam: false,
            label: {
              show: true,
              textStyle: {
                fontSize: 16,
                fontWeight: 'bolder',
                color: '#2c3e50'
              }
            },
            color: '#4fc08d',
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 15],
            edgeLabel: {
              textStyle: {
                fontSize: 15
              }
            },
            data: ret.nodes,
            links: ret.links,
            lineStyle: {
              opacity: 0.9,
              width: 3,
              curveness: 0
            }
          }
        ]
      }
    }
  },
  mounted() {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1,
h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

#service-graph {
  margin: auto auto;
  padding: auto auto;
}

.echarts {
  width: 100%;
  height: 500px;
}
</style>
