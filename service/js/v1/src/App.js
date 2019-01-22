import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';
import ReactEcharts from 'echarts-for-react';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
      response_time: 0,
      graphOptions: {},
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
    };
    this.handleClick = this.handleClick.bind(this);
    this.parseServiceCall = this.parseServiceCall.bind(this);
    this.getServiceNodesAndLinks = this.getServiceNodesAndLinks.bind(this);
    this.setChar = this.setChar.bind(this);
  }

  handleClick() {
    let url = "/env"
    axios.defaults.headers.common['App-Client'] = "react"
    let start = Date.now()
    axios.get(url, { timeout: 20000 }).then(res => {
      let response_time = ((Date.now() - start) / 1000).toFixed(2)
      this.setState({ 
          message: 'react -----> ' + res.data.message,
          serviceCall: res.data,
          response_time: response_time
      }, () => {
        this.setChar();
      });
    }).catch(error => {
      console.log(error)
      // this.setState({
      //   serviceCall: this.state.serviceCallMockData
      // },() => {
      //   this.setChar();
      // });
    });
  }

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
  }

  getServiceNodesAndLinks() {
    let result = { nodes: [], links: [] }
    let ret = this.parseServiceCall(this.state.serviceCall, result)
    let node = { name: 'react' }
    let link = {
      source: 'react',
      target: ret.nodes[ret.nodes.length-1].name,
      value: this.state.response_time,
      // value: Math.ceil(Math.random()*10),
      label: { show: true, formatter: '{c}s' }
    }
    ret.nodes = [...ret.nodes, node];
    ret.links.push(link);

    console.log(ret)
    return ret
  }

  setChar() {
    let ret = this.getServiceNodesAndLinks()
    let graphOptions = {
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
          color: '#61dafb',
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
    this.setState({ graphOptions: graphOptions }, () => {
      // console.log(this.state.graphOptions)
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to Istio</h1>
        </header>
        <p className="App-intro">
          <button onClick={this.handleClick}>发射</button>
        </p>
        {/* <p>{this.state.message}</p> */}
        <ReactEcharts option={this.state.graphOptions} style={{width: '100%', height: 500}} />
      </div>
    );
  }
}

export default App;
