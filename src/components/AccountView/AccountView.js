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
  }

  componentDidMount(){
    //TODO axios get account information
    //currently hardcoded to get the format correct
    this.accounts = [{
      name: 'Any Account Name',
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
      name: 'Other Account',
      money: 17.12,
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
            <AccountTable accountInfo={this.accounts[0]}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[1]}/>
          </div>
          <div className="row justify-content-center my-4">
            <AccountTable accountInfo={this.accounts[2]}/>
          </div>
        </div>
      );
    }
  }
}

if(window.document.getElementById("accounts"))
  ReactDOM.render(<AccountView/>, window.document.getElementById("accounts"));
