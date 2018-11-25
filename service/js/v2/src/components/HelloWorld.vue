<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <button @click="handleClick">发射</button>
    <p>{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: 'HelloWorld',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      message: ''
    }
  },
  methods: {
    handleClick () {
      let url = 'http://istio-test.will/env'
      axios.defaults.headers.common['App-Client'] = 'vue'
      axios.get(url).then(res => {
        this.message = 'vue----->' + res.data.message
      }).catch(error => {
        console.log(error)
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
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
</style>
