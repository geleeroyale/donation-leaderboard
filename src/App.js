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
    return fetch(`${etherscanApiLink}`)
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

  processEthList = (ethlist) => {
    const filteredEthList = ethlist
      .map((obj) => {
        obj.value = parseFloat(obj.value); // convert string to float
        return obj;
      })
      .filter((obj) => {return obj.value !== 0})
      .sort((a,b) => {
        return parseFloat(b.value) - parseFloat(a.value);
      })
      .map((obj, index) => {
        obj.rank = index + 1;
        return obj;
      });
    return this.setState({ethlist: filteredEthList});
  }

  componentDidMount = () => {
    this.fetchAddressList().then(() => {
      this.processEthList(this.state.ethlist);
    });
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

        <table>
          <thead>
          <tr>
            <th>Rank</th>
            <th>Address</th>
            <th>Value</th>
            <th>Tx Link</th>
          </tr>
          </thead>
          <tbody>

        {this.state.ethlist.filter(isSearched(this.state.searchTerm)).map(item =>

          <tr  key={item.hash} className="Entry">
            <td>{item.rank} </td>
            <td>{item.from} </td>
            <td>{item.value} ETH</td>
            <td>
              <a  href={'https://rinkeby.etherscan.io/tx/' + item.hash}> See Transaction</a>
            </td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
    );

  // End of render()
  }

// End of class App extends Component
}



export default App;
