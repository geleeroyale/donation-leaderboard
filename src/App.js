import React, { Component } from 'react';
import './App.css';

// Uncomment THIS for testing with raw data (sample output for etherscan)
// import DATA from './testdata.js'

const address = '0x1D348f7721Ccc4beA2c4292cea27c94B5883EBd3';
const apiKey = '6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';
const etherscanApiLink = 'https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=0x1D348f7721Ccc4beA2c4292cea27c94B5883EBd3&startblock=0&endblock=99999999&sort=asc&apikey=6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';

const isSearched = searchTerm => item =>
item.from.toLowerCase().includes(searchTerm.toLowerCase());

class App extends Component {

    constructor(props)  {
    super(props);

    this.state = {
      ethlist: [],
      searchTerm: '',
    };
  }

  onSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  }

  fetchAddressList = () => {
    fetch(`${etherscanApiLink}`)
    .then((originalResponse) => originalResponse.json())
    .then((responseJson) => {
          this.setState({
            ethlist: responseJson.result,
          })
    })

    .catch((error) => {
      console.error(error);
    });
  }

  processEthList = () => {
  }

  componentDidMount = () => {
    this.fetchAddressList();
    this.processEthList();
  }

  render = () => {
    return  (
      <div  className="App">
        <h1>ETH Leaderboard</h1>
        <form className="Search">
        <input
          type="text"
          onChange={this.onSearchChange}
          placeholder="search for address"
        />
        </form>

        {this.state.ethlist.filter(isSearched(this.state.searchTerm)).map(item =>

          <div  key={item.hash} className="Entry">
            <span>Address {item.from} </span>
            <span>sent {item.value} ETH</span>
            <span>
              <a  href={'https://rinkeby.etherscan.io/tx/' + item.hash}> See Transaction</a>
            </span>
          </div>
        )}

      </div>
    );

  // End of render()
  }

// End of class App extends Component
}



export default App;
