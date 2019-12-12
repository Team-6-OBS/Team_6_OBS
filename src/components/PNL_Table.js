import React from "react";
import {render} from "react-dom";
import ReactDOM from "react-dom";
import axios from "axios";

export class PNL_Table extends React.Component {
  constructor() {
    super();
    this.state = {
      transactions: false,
      prices: false
    }

    this.transactions = null;
    this.prices = null;
    this.dis = null;
    this.ntdoy = null;
    this.sgamy = null;
    this.ubsfy = null;
    this.atvi = null;
  }
 
  //get all the logs
  componentDidMount(){
    axios.get('/getpnl').then(
      response => {
        this.transactions = response.data.transactions;
        this.getPNL();
        this.setState({
          transactions: true
        });
      },
      error => {
        window.alert(error.response.data);
      }
    )

    axios.get('/quotes').then(
      response => {
        this.prices = response.data.quotes;
        this.setState({
          prices: true
        });
      },
      error => {
        window.alert(error.response.data);
      }
    )
  }
  
  getPNL(){
    console.log(this.transactions);
    this.dis={buy:0 ,sell:0,totalMoney:0}
    this.ntdoy={buy:0 ,sell:0,totalMoney:0}
    this.sgamy={buy:0,sell:0,totalMoney:0}
    this.ubsfy={buy:0 ,sell:0,totalMoney:0}
    this.atvi={buy:0 ,sell:0,totalMoney:0}
    for(var i=0;i<this.transactions.length;i++)
    {
      
      if(this.transactions[i].username==="admin"){
        
        if(this.transactions[i].b_type==="BUY"){
            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.buy+=this.transactions[i].quantity;
              this.ntdoy.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
              console.log(this.ntdoy.buy+"\n");
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.buy+=this.transactions[i].quantity;
                this.dis.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.buy+=this.transactions[i].quantity;
                this.sgamy.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.buy+=this.transactions[i].quantity;
                this.ubsfy.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.buy+=this.transactions[i].quantity;
                this.atvi.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
      }
      else{  
        if(this.transactions[i].b_type==="SELL"){
            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.buy-=this.transactions[i].quantity;
              this.ntdoy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.buy-=this.transactions[i].quantity;
                this.dis.totalMoney+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.buy-=this.transactions[i].quantity;
                this.sgamy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.buy-=this.transactions[i].quantity;
                this.ubsfy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.buy-=this.transactions[i].quantity;
                this.atvi.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
         if(this.transactions[i].b_type==="BUY"){

            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.sell+=this.transactions[i].quantity;
              this.ntdoy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.sell+=this.transactions[i].quantity;
                this.dis.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.sell+=this.transactions[i].quantity;
                this.sgamy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.sell+=this.transactions[i].quantity;
                this.ubsfy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.sell+=this.transactions[i].quantity;
                this.atvi.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
           }
          }
        }
      }
      console.log(this.dis.totalMoney+" sell:" + this.dis.sell+" buy:" +this.dis.buy);

    }

  render () {
    if(this.state.transactions === false || this.state.prices === false){
      return (
        <h3>loading...</h3>
      );
    }
    else{
      return(
        <div className="container">
          <div className="row justify-content-center">
            <div className="col col-md-8 col-md-offset-1">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Stock Type</th>
                    <th>Owned By OBS</th>
                    <th>Owned By Users</th>
                    <th>Current Price</th>
                    <th>PNL</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>NTDOY</td>
                    <td></td>
                    <td></td>
                    <td>{this.prices.quote[0].last}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>DIS</td>
                    <td></td>
                    <td></td>
                    <td>{this.prices.quote[1].last}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>ATVI</td>
                    <td></td>
                    <td></td>
                    <td>{this.prices.quote[2].last}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>SGAMY</td>
                    <td></td>
                    <td></td>
                    <td>{this.prices.quote[3].last}</td>
                    <td></td>
                  </tr>
                  <tr>
                    <td>UBSFY</td>
                    <td></td>
                    <td></td>
                    <td>{this.prices.quote[4].last}</td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
  }
}

if(window.document.getElementById("pnl"))
  ReactDOM.render(<PNL_Table/>, window.document.getElementById("pnl"));
