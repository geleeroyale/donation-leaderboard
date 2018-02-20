import React, { Component } from 'react';
import './App.css';

import Web3 from 'web3'

const donationAddress = '0x1D348f7721Ccc4beA2c4292cea27c94B5883EBd3';
const apiKey = '6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';
const etherscanApiLink = 'https://api-rinkeby.etherscan.io/api?module=account&action=txlist&address=0x1D348f7721Ccc4beA2c4292cea27c94B5883EBd3&startblock=0&endblock=99999999&sort=asc&apikey=6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';

const isSearched = searchTerm => item =>
item.from.toLowerCase().includes(searchTerm.toLowerCase());

var myweb3

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

  handleDonate = (event) => {
    event.preventDefault();
    const form = event.target;
    let donateWei = new myweb3.utils.BN(myweb3.utils.toWei(form.elements['amount'].value, 'ether'));
    let remarks = myweb3.utils.toHex(form.elements['remarks'].value);

    myweb3.eth.net.getId()
      .then((netId) => {
        switch (netId) {
          case 1:
            console.log('This is mainnet')
            break
          case 2:
            console.log('This is the deprecated Morden test network.')
            break
          case 3:
            console.log('This is the ropsten test network.')
            break
          case 4:
            console.log('This is the Rinkeby test network.');
            return myweb3.eth.getAccounts().then((accounts) => {
              return myweb3.eth.sendTransaction({
                from: accounts[0],
                to: donationAddress,
                value: donateWei,
                data: remarks
              }).catch((e)=>{
                console.log(e);
              });
            });
            break
          case 42:
            console.log('This is the Kovan test network.')
            break
          default:
            console.log('This is an unknown network.')
        }
      });

      // debugger;


  }

  processEthList = (ethlist) => {
    const filteredEthList = ethlist
      .map((obj) => {
        obj.value = new myweb3.utils.BN(obj.value); // convert string to float
        return obj;
      })
      .filter((obj) => {return obj.value.cmp(new myweb3.utils.BN(0))})
      .sort((a,b) => {
        return b.value.cmp(a.value);
      })
      .map((obj, index) => {
        obj.rank = index + 1;
        return obj;
      });
    return this.setState({ethlist: filteredEthList});
  }

  componentDidMount = () => {

    if(typeof window.web3 !== "undefined" && typeof window.web3.currentProvider !== "undefined") {
      myweb3 = new Web3(window.web3.currentProvider);
      myweb3.eth.defaultAccount = window.web3.eth.defaultAccount;
    } else {
      myweb3 = new Web3();
    }

    this.fetchAddressList().then(() => {
      this.processEthList(this.state.ethlist);
    });
  }

  render = () => {
    return  (
      <div  className="App">
        <h1>ETH Leaderboard</h1>
        <p><strong>Donation address: {donationAddress}</strong></p>
        <p><strong>This application uses the Rinkeby Testnetwork. Do not send real ether</strong></p>

        <form onSubmit={this.handleDonate}>
          <input
            type="text"
            placeholder="amount to donate in ETH"
            name="amount"
          />
          <input
            type="text"
            name="remarks"
            placeholder="remarks"
          />
          <button>Send data!</button>
          </form>

        <table className="table">
          <thead className="table-header">
          <tr  className="table-row">
            <th>Rank</th>
            <th>Address</th>
            <th>Value</th>
            <th>Remarks</th>
            <th>Tx Link</th>
          </tr>
          </thead>
          <tbody>

        {this.state.ethlist.filter(isSearched(this.state.searchTerm)).map(item =>

          <tr  key={item.hash} className="Entry">
            <td>{item.rank} </td>
            <td>{item.from} </td>
            <td>{myweb3.utils.fromWei(item.value)} ETH</td>
            <td>{myweb3.utils.hexToAscii(item.input)}</td>
            <td>
              <a  href={'https://rinkeby.etherscan.io/tx/' + item.hash}> See Transaction</a>
            </td>
          </tr>
        )}
        </tbody>
      </table>

      <form className="Search">
      <input
        type="text"
        onChange={this.onSearchChange}
        placeholder="search leaderboard"
      />
      </form>

    </div>
    );

  // End of render()
  }

// End of class App extends Component
}



export default App;
