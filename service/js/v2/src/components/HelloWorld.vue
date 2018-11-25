<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
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
      msg: 'Welcome to Your Vue.js App',
      message: '',
      graphOptions: {},
      serviceNodes: [],
      serviceLinks: [],
      serviceCall: {
        message: 'python-python',
        upstream: [
          {
            message: 'lua'
          },
          {
            message: 'node',
            upstream: [
              {
                message: 'go'
              }
            ]
          }
        ]
      },
    }
  },
  methods: {
    handleClick() {
      let url = 'http://istio-test.will/env'
      axios.defaults.headers.common['App-Client'] = 'vue'
      axios
        .get(url)
        .then(res => {
          this.message = 'vue -----> ' + res.data.message
          this.serviceCall = res.data
          this.setChar()
        })
        .catch(error => {
          console.log(error)
        })
      // this.setChar()
    },
    parseServiceCall(data) {
      if (data.upstream) {
        data.upstream.forEach(upstream => {
          let message = this.parseServiceCall(upstream)
          let link = { source: data.message, target: message }
          this.serviceLinks.push(link)
        })
      }

      let node = { name: data.message }
      this.serviceNodes.push(node)

      return data.message
    },
    getServiceNodesAndLinks() {
      this.serviceNodes = []
      this.serviceLinks = []
      let ret = this.parseServiceCall(this.serviceCall)
      let node = { name: 'vue' }
      let link = {
        source: 'vue',
        target: ret
      }
      this.serviceNodes.push(node)
      this.serviceLinks.push(link)
    },
    setChar() {
      this.getServiceNodesAndLinks()
      // console.log(this.serviceNodes, this.serviceLinks)
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
              normal: {
                show: true,
                textStyle: {
                  fontSize: 16
                }
              }
            },
            color: '#41B783',
            edgeSymbol: ['circle', 'arrow'],
            edgeSymbolSize: [4, 15],
            edgeLabel: {
              normal: {
                textStyle: {
                  fontSize: 15
                }
              }
            },
            data: this.serviceNodes,
            links: this.serviceLinks,
            lineStyle: {
              normal: {
                opacity: 0.9,
                width: 3,
                curveness: 0
              }
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
}
</style>
