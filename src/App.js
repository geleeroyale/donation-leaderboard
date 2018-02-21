import React, { Component } from 'react';
import './App.css';

import Web3 from 'web3'


const startblock = 1619115;
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


getTransactionsByAccount = (myaccount, startBlockNumber, endBlockNumber) => {
  if (endBlockNumber == null) {
    endBlockNumber = myweb3.eth.blockNumber;
    console.log("Using endBlockNumber: " + endBlockNumber);
  }
  if (startBlockNumber == null) {
    startBlockNumber = endBlockNumber - 1000;
    console.log("Using startBlockNumber: " + startBlockNumber);
  }
  console.log("Searching for transactions to/from account \"" + myaccount + "\" within blocks "  + startBlockNumber + " and " + endBlockNumber);

  let txs = [];
  for (var i = startBlockNumber; i <= endBlockNumber; i++) {
    if (i % 1000 == 0) {
      console.log("Searching block " + i);
    }
    var block = myweb3.eth.getBlock(i, true);
    if (block != null && block.transactions != null) {
      block.transactions.forEach( function(e) {
        if (myaccount == "*" || myaccount == e.from || myaccount == e.to) {
          txs.push(e);
        }
      })
    }
  }

  return txs;


}


  fetchAddressList = () => {

    return myweb3.eth.getBlockNumber().then((endblock)=>{
      debugger;
      let txs = this.getTransactionsByAccount(address,startblock,endblock);
      this.setState({
        ethlist: txs,
      })


    // return fetch(`${etherscanApiLink}`)
    // .then((originalResponse) => originalResponse.json())
    // .then((responseJson) => {
    //       return responseJson.result;
    // })

    // .catch((error) => {
    //   console.error(error);

    });
  }

  handleDonate = (event) => {
    event.preventDefault();
    const form = event.target;
    let donateWei = new myweb3.utils.BN(myweb3.utils.toWei(form.elements['amount'].value, 'ether'));
    let remarks = myweb3.utils.toHex(form.elements['remarks'].value);
    let extraGas = form.elements['remarks'].value.length * 68;

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
                gas : 21000 + extraGas,
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
  }

  processEthList = (ethlist) => {
    let filteredEthList = ethlist
      .map((obj) => {
        obj.value = new myweb3.utils.BN(obj.value); // convert string to BigNumber
        return obj;
      })
      .filter((obj) => {return obj.value.cmp(new myweb3.utils.BN(0))}) // filter out zero-value transactions
      .reduce((acc, cur) => { // group by address and sum tx value
        if(typeof acc[cur.from] === 'undefined') {
          acc[cur.from] = {from: cur.from,
            value: new myweb3.utils.BN(0),
            input: cur.input,
            hash: []};
        }
        acc[cur.from].value = cur.value.add(acc[cur.from].value);
        acc[cur.from].input = cur.input !== '0x' && cur.input !== '0x00' ? cur.input : acc[cur.from].input;
        acc[cur.from].hash.push(cur.hash);
        return acc;
      }, {});
      filteredEthList = Object.keys(filteredEthList).map((val) => filteredEthList[val])
      .sort((a,b) => { // sort greatest to least
        return b.value.cmp(a.value);
      })
      .map((obj, index) => { // add rank
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

    this.fetchAddressList().then((res) => {
      this.processEthList(res);
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
          <thead>
          <tr>
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
              {item.hash.map((txHash, index) =>
                <a key={index} href={'https://rinkeby.etherscan.io/tx/' + txHash}>[{index + 1}]</a>
              )}
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
