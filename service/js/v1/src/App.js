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
    };
    this.handleClick = this.handleClick.bind(this);
    this.parseServiceCall = this.parseServiceCall.bind(this);
    this.getServiceNodesAndLinks = this.getServiceNodesAndLinks.bind(this);
    this.setChar = this.setChar.bind(this);
  }

  handleClick() {
    let url = "http://istio-test.will/env"
    axios.defaults.headers.common['App-Client'] = "react"
    axios.get(url).then(res => {
      this.setState(() => {
        return { message: 'react----->' + res.data.message }
      });
    }).catch(error => {
      console.log(error)
    });
    this.setChar();
    console.log(this.state.serviceNodes, this.state.serviceLinks)
  }

  parseServiceCall(data) {
    if (data.upstream) {
      data.upstream.forEach(upstream => {
        let message = this.parseServiceCall(upstream)
        let link = { source: data.message, target: message }
        this.setState((state) => {
          return {serviceLinks: [...state.serviceLinks, link]}
        });
        
      })
    }

    let node = { name: data.message }
    // console.log(node)
    this.setState((state) => {
      return {serviceNodes: [...state.serviceNodes, node]}
    });

    return data.message
  }

  getServiceNodesAndLinks() {
    this.setState(() => {
      return {
        serviceNodes: [],
        serviceLinks: []
      }
    });
    let ret = this.parseServiceCall(this.state.serviceCall)
    let node = { name: 'react' }
    let link = {
      source: 'react',
      target: ret
    }
    this.setState((state) => {
      return {
        serviceNodes: [...state.serviceNodes, node],
        serviceLinks: [...state.serviceLinks, link]
      }
    });
  }

  setChar() {
    this.getServiceNodesAndLinks()
    // console.log(this.serviceNodes, this.serviceLinks)
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
          data: this.state.serviceNodes,
          links: this.state.serviceLinks,
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
    this.setState(() => {
      return { graphOptions: graphOptions }
    });
  }
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          <button onClick={this.handleClick}>发射</button>
        </p>
        <p>
          {this.state.message}
        </p>
        <ReactEcharts option={this.state.graphOptions} style={{width: '100%'}} />
      </div>
    );
  }
}

export default App;
