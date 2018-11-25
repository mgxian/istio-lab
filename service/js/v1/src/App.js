import React, { Component } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: '',
    };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    let url = "http://istio-test.will/env"
    axios.defaults.headers.common['App-Client'] = "react"
    axios.get(url).then(res => {
      this.setState({
        message: 'react----->' + res.data.message
      });
    }).catch(error => {
      console.log(error)
    })
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
      </div>
    );
  }
}

export default App;
