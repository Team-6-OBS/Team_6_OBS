import React from "react";
import {render} from "react-dom";
import ReactDOM from "react-dom";
import axios from "axios";
import {AccountTable} from "./AccountTable";

export class AccountView extends React.Component {
  constructor() {
    super();
    this.state = {
      receivedQuoteInfo: false,
      receivedAccountInfo: false
    }

    //variable to hold json of account info after api request
    this.accounts = null;
    this.quotes = {
      ntdoy: 0.0,
      dis: 0.0,
      atvi: 0.0,
      sgamy: 0.0,
      ubsfy: 0.0
    };

    //bind functions
    this.newAccountCreated = this.newAccountCreated.bind(this);
  }

  componentDidMount(){
    this.getQuotes();
    //TODO axios get account information
    //currently hardcoded to get the format correct
    this.accounts = [{
      name: 'Account1',
      money: 1125.56,
      ntdoy: 1,
      sgamy: 2,
      atvi: 3,
      dis: 4,
      ubsfy: 5
    },
    {
      name: 'Account2',
      money: 2000.75,
      ntdoy: 0,
      sgamy: 0,
      atvi: 3,
      dis: 3,
      ubsfy: 15
    },
      null
    ];

    //set state to render the account info after request complete
    this.setState({receivedAccountInfo: true});
  }

  getQuotes(){
    axios.get("/quotes").then(
      response => {
        //set the quote prices from response
        this.quotes.ntdoy = response.data.quotes.quote[0].last;
        this.quotes.dis = response.data.quotes.quote[1].last;
        this.quotes.atvi = response.data.quotes.quote[2].last;
        this.quotes.sgamy = response.data.quotes.quote[3].last;
        this.quotes.ubsfy = response.data.quotes.quote[4].last;

        this.setState({
          receivedQuoteInfo: true
        });
      },
      error => {
        //could not get quotes
      }
    );
  }

  //this will be called from child component to force an update whenenver a
  //new table need to be rendered
  newAccountCreated(accName){
    //find the first null in accounts array to append new table to
    for(let i = 0; i < 3; i++){
      if(this.accounts[i] === null){
        //TODO add this account to database then update based on response
        this.accounts[i] = {
          name: accName,
          money: 0.0,
          ntdoy: 0,
          sgamy: 0,
          atvi: 0,
          dis: 0,
          ubsfy: 0
        };
        break;
      }
    }
    this.forceUpdate();
  }

  render () {
    if(this.state.receivedAccountInfo === false || this.state.receivedQuoteInfo === false){
      return (
        <></>
      );
    }
    else{
      return(
        <div className="container-fluid">
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[0]} quotes={this.quotes} newAccountCreated={this.newAccountCreated}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[1]} quotes={this.quotes} newAccountCreated={this.newAccountCreated}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[2]} quotes={this.quotes} newAccountCreated={this.newAccountCreated}/>
          </div>
        </div>
      );
    }
  }
}

if(window.document.getElementById("accounts"))
  ReactDOM.render(<AccountView/>, window.document.getElementById("accounts"));
