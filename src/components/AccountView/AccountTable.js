import React from "react";
import {render} from "react-dom";
import axios from "axios";

export class AccountTable extends React.Component {
  constructor(props) {
    super();

    //bind onClick functions
    this.createNewAccount = this.createNewAccount.bind(this);
    this.addFunds = this.addFunds.bind(this);

    this.buyStock = this.buyStock.bind(this);
    this.sellStock = this.sellStock.bind(this);
  }

  //this function create a prompt menu for the user to enter a name for a new account
  createNewAccount(){
    var accName = prompt("Enter new account name.", "New Account Name");

    if(accName !== null && accName !== ""){
      //create new account with this name for the currently logged in user
      this.props.newAccountCreated(accName);
      this.forceUpdate();
    }
  }

  //this function will prompt the user to add money to the account
  addFunds(){
    var addMoney = prompt("Enter ammount to add to " + this.props.accountInfo.name + ".", "0.0");
    addMoney = this.TryParseDouble(addMoney);
    addMoney = addMoney.toFixed(2);
    addMoney = this.TryParseDouble(addMoney);
    if(addMoney > 0){
      //call api to add money in database
      var form = new FormData();
      form.set('account', this.props.accountInfo.name);
      form.set('money', addMoney);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.post('/add', form, config)
      .then(
        response => {
          //find the first null in accounts array to append new table to
          this.props.accountInfo.money += addMoney;
          this.props.accountInfo.money = this.TryParseDouble(this.props.accountInfo.money.toFixed(2));
          this.forceUpdate();
        },
        error => {
          window.alert("An error occurred, please try again later.");
        }
      );
    }
  }

  //attempts to buy stock entered in prompt
  buyStock(e){
    e.stopPropagation();

    var symbol = "";
    var currentStockPrice = 0.0;
    var ammountToBuy = 0;

    //get which type to buy and current price to check if they have enough $
    if(e.target.className.includes("ntdoy")){
      symbol = "ntdoy";
      currentStockPrice = this.props.quotes.ntdoy;
    }
    else if(e.target.className.includes("sgamy")){
      symbol = "sgamy";
      currentStockPrice = this.props.quotes.sgamy;
    }
    else if(e.target.className.includes("dis")){
      symbol = "dis";
      currentStockPrice = this.props.quotes.dis;
    }
    else if(e.target.className.includes("atvi")){
      symbol = "atvi";
      currentStockPrice = this.props.quotes.atvi;
    }
    else if(e.target.className.includes("ubsfy")){
      symbol = "ubsfy";
      currentStockPrice = this.props.quotes.ubsfy;
    }

    //get amount to buy from user
    ammountToBuy = prompt("Enter ammount of " + symbol + " to purchase.", "0");
    ammountToBuy = this.TryParseInt(ammountToBuy);
    //attempt to buy the stock
    if(ammountToBuy > 0 && ammountToBuy*currentStockPrice <= this.props.accountInfo.money){
      //call api route to buy stcok into this account then update based on response
      var form = new FormData();
      form.set('account', this.props.accountInfo.name);
      form.set('symbol', symbol.toUpperCase());
      form.set('quantity', ammountToBuy);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.post('/buy', form, config)
      .then(
        response => {
          this.props.accountInfo.money -= ammountToBuy*currentStockPrice;
          this.props.accountInfo.money = this.TryParseDouble(this.props.accountInfo.money.toFixed(2));

          if(symbol === "ntdoy"){
            this.props.accountInfo.ntdoy += ammountToBuy;
          }
          else if(symbol === "sgamy") {
            this.props.accountInfo.sgamy += ammountToBuy;
          }
          else if(symbol === "dis") {
            this.props.accountInfo.dis += ammountToBuy;
          }
          else if(symbol === "atvi") {
            this.props.accountInfo.atvi += ammountToBuy;
          }
          else if(symbol === "ubsfy") {
            this.props.accountInfo.ubsfy += ammountToBuy;
          }
          this.forceUpdate();
        },
        error => {
          window.alert("An error occured. Please check that you have enough money in your account to make this purchase.");
        }
      );

    }
  }

  //attempts to sell stock entered in prompt
  sellStock(e){
    e.stopPropagation();

    var symbol = "";
    var currentStockPrice = 0.0;
    var ammountToSell = 0;
    var currentOwned = 0;

    //get which type to buy and current price to check if they have enough $
    if(e.target.className.includes("ntdoy")){
      symbol = "ntdoy";
      currentStockPrice = this.props.quotes.ntdoy;
      currentOwned = this.props.accountInfo.ntdoy;
    }
    else if(e.target.className.includes("sgamy")){
      symbol = "sgamy";
      currentStockPrice = this.props.quotes.sgamy;
      currentOwned = this.props.accountInfo.sgamy;
    }
    else if(e.target.className.includes("dis")){
      symbol = "dis";
      currentStockPrice = this.props.quotes.dis;
      currentOwned = this.props.accountInfo.dis;
    }
    else if(e.target.className.includes("atvi")){
      symbol = "atvi";
      currentStockPrice = this.props.quotes.atvi;
      currentOwned = this.props.accountInfo.atvi;
    }
    else if(e.target.className.includes("ubsfy")){
      symbol = "ubsfy";
      currentStockPrice = this.props.quotes.ubsfy;
      currentOwned = this.props.accountInfo.ubsfy;
    }

    //get amount to buy from user
    ammountToSell = prompt("Enter ammount of " + symbol + " to sell.", "0");
    ammountToSell = this.TryParseInt(ammountToSell);
    //attempt to buy the stock
    if(ammountToSell > 0 && ammountToSell <= currentOwned){
      //TODO call api route to sell stcok from this account then update based on response
      var form = new FormData();
      form.set('account', this.props.accountInfo.name);
      form.set('symbol', symbol.toUpperCase());
      form.set('quantity', ammountToSell);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      axios.post('/sell', form, config)
      .then(
        response => {
          this.props.accountInfo.money += ammountToSell*currentStockPrice;
          this.props.accountInfo.money = this.TryParseDouble(this.props.accountInfo.money.toFixed(2));

          if(symbol === "ntdoy"){
            this.props.accountInfo.ntdoy -= ammountToSell;
          }
          else if(symbol === "sgamy") {
            this.props.accountInfo.sgamy -= ammountToSell;
          }
          else if(symbol === "dis") {
            this.props.accountInfo.dis -= ammountToSell;
          }
          else if(symbol === "atvi") {
            this.props.accountInfo.atvi -= ammountToSell;
          }
          else if(symbol === "ubsfy") {
            this.props.accountInfo.ubsfy -= ammountToSell;
          }
          this.forceUpdate();
        },
        error => {
          if(error.response.data === 'User Inventory does not have enough shares to sell the requested amount')
            window.alert("You do not enough stocks to sell.");
          else
            window.alert("Something went wrong. Please try again later.");
        }
      );

    }
  }

  //trys to turn a string into a double, returns 0.0 if it fails
  TryParseDouble(str){
    var ret = 0.0;

    if(str !== null && str.length > 0 && !isNaN(str))
      ret = parseFloat(str);

    return ret;
  }

  TryParseInt(str){
    var ret = 0;

    if(str !== null && str.length > 0 && !isNaN(str))
      ret = parseInt(str);

    return ret;
  }

  render () {
    if(this.props.accountInfo === null){
      return (
        <div className="col col-md-8 col-md-offset-6 justify-content-center">
          <button type="button" className="btn btn-primary" onClick={this.createNewAccount}>Create New Table</button>
        </div>
      );
    }
    else{
      return(
        <div className="col col-md-8 col-md-offset-2">
          <table className="table table-striped">
            <thead>
              <tr>
                <th colSpan="2">{this.props.accountInfo.name}</th>
                <th colSpan="2">{this.props.accountInfo.money}</th>
                <th>
                  <button type="button" className="btn btn-primary" onClick={this.addFunds}>Add $$$</button>
                </th>
              </tr>
              <tr>
                <th>Stock Title</th>
                <th>Owned</th>
                <th>Value</th>
                <th>Total</th>
                <th>Buy/Sell</th>
              </tr>
            </thead>
            <tbody>
              <tr className="ntdoy">
                <td>NTDOY</td>
                <td>{this.props.accountInfo.ntdoy}</td>
                <td>{this.props.quotes.ntdoy}</td>
                <td>{(this.props.accountInfo.ntdoy*this.props.quotes.ntdoy).toFixed(2)}</td>
                <td>
                  <button type="button" className="btn btn-primary ntdoy buy" onClick={this.buyStock}>Buy</button>
                  <button type="button" className="btn btn-primary ntdoy sell" onClick={this.sellStock}>Sell</button>
                </td>
              </tr>
              <tr className="sgamy">
                <td>SGAMY</td>
                <td>{this.props.accountInfo.sgamy}</td>
                <td>{this.props.quotes.sgamy}</td>
                <td>{(this.props.accountInfo.sgamy*this.props.quotes.sgamy).toFixed(2)}</td>
                <td>
                  <button type="button" className="btn btn-primary sgamy buy" onClick={this.buyStock}>Buy</button>
                  <button type="button" className="btn btn-primary sgamy sell" onClick={this.sellStock}>Sell</button>
                </td>
              </tr>
              <tr className="atvi">
                <td>ATVI</td>
                <td>{this.props.accountInfo.atvi}</td>
                <td>{this.props.quotes.atvi}</td>
                <td>{(this.props.accountInfo.atvi*this.props.quotes.atvi).toFixed(2)}</td>
                <td>
                  <button type="button" className="btn btn-primary atvi buy" onClick={this.buyStock}>Buy</button>
                  <button type="button" className="btn btn-primary atvi sell" onClick={this.sellStock}>Sell</button>
                </td>
              </tr>
              <tr className="dis">
                <td>DIS</td>
                <td>{this.props.accountInfo.dis}</td>
                <td>{this.props.quotes.dis}</td>
                <td>{(this.props.accountInfo.dis*this.props.quotes.dis).toFixed(2)}</td>
                <td>
                  <button type="button" className="btn btn-primary dis buy" onClick={this.buyStock}>Buy</button>
                  <button type="button" className="btn btn-primary dis sell" onClick={this.sellStock}>Sell</button>
                </td>
              </tr>
              <tr className="ubsfy">
                <td>UBSFY</td>
                <td>{this.props.accountInfo.ubsfy}</td>
                <td>{this.props.quotes.ubsfy}</td>
                <td>{(this.props.accountInfo.ubsfy*this.props.quotes.ubsfy).toFixed(2)}</td>
                <td>
                  <button type="button" className="btn btn-primary ubsfy buy" onClick={this.buyStock}>Buy</button>
                  <button type="button" className="btn btn-primary ubsfy sell" onClick={this.sellStock}>Sell</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }
}
