import React from "react";
import {render} from "react-dom";
import ReactDOM from "react-dom";
import axios from "axios";
import {AccountTable} from "./AccountTable";

export class AccountView extends React.Component {
  constructor() {
    super();
    this.state = {
      receivedAccountInfo: false
    }

    //variable to hold json of account info after api request
    this.accounts = null;

    //bind functions
    this.newAccountCreated = this.newAccountCreated.bind(this);
  }

  componentDidMount(){
    //TODO axios get account information
    //currently hardcoded to get the format correct
    this.accounts = [{
      name: 'Account1',
      money: 1125.56,
      ntdoy: {
        owned: 1,
        value: 10.1
      },
      sgamy: {
        owned: 2,
        value: 20.2
      },
      atvi: {
        owned: 3,
        value: 30.3
      },
      dis: {
        owned: 4,
        value: 40.4
      },
      ubsfy: {
        owned: 5,
        value: 50.5
      }
    },
    {
      name: 'Account2',
      money: 2000.75,
      ntdoy: {
        owned: 0,
        value: 10.1
      },
      sgamy: {
        owned: 0,
        value: 20.2
      },
      atvi: {
        owned: 7,
        value: 30.3
      },
      dis: {
        owned: 2,
        value: 40.4
      },
      ubsfy: {
        owned: 0,
        value: 50.5
      }
    },
      null
    ];

    //set state to render the account info after request complete
    this.setState({receivedAccountInfo: true});
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
          ntdoy: {
            owned: 0,
            value: 10.1
          },
          sgamy: {
            owned: 0,
            value: 20.2
          },
          atvi: {
            owned: 0,
            value: 30.3
          },
          dis: {
            owned: 0,
            value: 40.4
          },
          ubsfy: {
            owned: 0,
            value: 50.5
          }
        };
        break;
      }
    }
    this.forceUpdate();
  }

  render () {
    if(this.state.receivedAccountInfo === false){
      return (
        <></>
      );
    }
    else{
      return(
        <div className="container-fluid">
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[0]} newAccountCreated={this.newAccountCreated}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[1]} newAccountCreated={this.newAccountCreated}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[2]} newAccountCreated={this.newAccountCreated}/>
          </div>
        </div>
      );
    }
  }
}

if(window.document.getElementById("accounts"))
  ReactDOM.render(<AccountView/>, window.document.getElementById("accounts"));
