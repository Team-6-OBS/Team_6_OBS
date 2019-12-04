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
    //get stock prices
    this.getQuotes();
    //get users current accounts
    this.getAccounts();
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

  getAccounts(){
    axios.get("/totals").then(
      response => {
        //set the quote prices from response
        this.accounts = response.data;

        this.setState({
          receivedAccountInfo: true
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
    //post data to signup endpoint using axios
      var form = new FormData();
      form.set('account', accName);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.post('/newacc', form, config)
      .then(
        response => {
          //find the first null in accounts array to append new table to
          for(let i = 0; i < 3; i++){
            if(this.accounts[i] === null){
              //Add this account to the table
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
        },
        error => {
          if(error.response.data === 'Account Already Exists')
            window.alert("User cannot have duplicate account names.");
          else if(error.response.data === 'User Bank Account Limit Reached')
            window.alert("User can only have up to 3 accounts at once.");
          else
            window.alert("An error occurred, please try again later.");
        }
      );
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
