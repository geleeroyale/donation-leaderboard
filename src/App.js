import React, { Component } from 'react';
import './App.css';

import Web3 from 'web3'

const donationAddress = '0x9cb8921aa376219950ba134c15d8f5ee2769c599';
const apiKey = '6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';
const etherscanApiLink = 'https://api.etherscan.io/api?module=account&action=txlist&address=0x9cb8921aa376219950ba134c15d8f5ee2769c599&startblock=0&endblock=99999999&sort=asc&apikey=6DIUB7X6S92YJR6KXKF8V8ZU55IXT5PN2S';

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
          return responseJson.result;
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
            console.log('This is mainnet');
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
          case 2:
            console.log('This is the deprecated Morden test network.')
            break
          case 3:
            console.log('This is the ropsten test network.')
            break
          case 4:
            console.log('This is the Rinkeby test network.')
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
      <div  className="App container-fluid">
        <img src="/img/sn-type.svg" className="typelogo"/>
      <div className="row">
        <div className="col">
          <p>Web3 Foundation and Giveth are hosting an in-person gathering on scaling solutions on <strong>March 5th & 6th in Barcelona</strong>. This application acts as donation gateway and attendee list. </p>
          <p>March 5 is an invite-only for select devs working on immediate scaling solutions to share their insights amongst one another.</p>
          <p>March 6 is open to DApp developers who submit a (super quick and easy) application on what they are building.</p>
          <p>To help the organizers cover food and facilities cost donations are accepted.</p>
        </div>
        <div className="col blue-bg">
          <h3>Ways to donate</h3>
          <h6>Send a transaction via Metamask</h6>
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
            <button className="btn btn-primary">Send</button>
            </form>
            <h6>Send directly to donation address</h6>
            <p><strong>{donationAddress}</strong></p>
          </div>
        </div>
        <div className="flex-row">
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
                  <a key={index} href={'https://etherscan.io/tx/' + txHash}>[{index + 1}]</a>
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
          placeholder="filter leaderboard"
        />
        </form>

      </div>
    </div>
    );


  } // End of render()


} // End of class App extends Component



export default App;
