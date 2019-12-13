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
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.buy+=this.transactions[i].quantity;
                console.log(this.transactions[i].quantity+" admin buy:"+(this.transactions[i].quantity*this.transactions[i].price)+"\n");
              
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
              this.ntdoy.sell-=this.transactions[i].quantity;
             // this.ntdoy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.buy-=this.transactions[i].quantity;
                  this.dis.sell-=this.transactions[i].quantity;
                  console.log(this.transactions[i].quantity+" sell:"+(this.transactions[i].quantity*this.transactions[i].price)+"\n");
                //this.dis.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
                
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.buy-=this.transactions[i].quantity;
                  this.sgamy.sell-=this.transactions[i].quantity;
                //this.sgamy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.buy-=this.transactions[i].quantity;
                this.ubsfy.sell-=this.transactions[i].quantity;
               // this.ubsfy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.buy-=this.transactions[i].quantity;
                this.atvi.sell-=this.transactions[i].quantity;
                //this.atvi.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
          else if(this.transactions[i].b_type==="BUY"){

            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.sell+=this.transactions[i].quantity;

              this.ntdoy.totalMoney-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.sell+=this.transactions[i].quantity;
                console.log(this.transactions[i].quantity+" buy:"+(this.transactions[i].quantity*this.transactions[i].price)+"\n");
              
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
      this.atvi.buy-=this.atvi.sell;
      this.dis.buy-=this.dis.sell;
      this.ubsfy.buy-=this.ubsfy.sell;
      this.ntdoy.buy-=this.ntdoy.sell;
      this.sgamy.buy-=this.sgamy.sell;
      this.dis.totalMoney.toFixed(2);
      this.ubsfy.totalMoney.toFixed(2);
      
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
                    <td>{this.ntdoy.buy}</td>
                    <td>{this.ntdoy.sell}</td>
                    <td>{this.prices.quote[0].last}</td>
                    <td>{((this.ntdoy.totalMoney - (this.prices.quote[0].last*this.ntdoy.buy))*-1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>DIS</td>
                    <td>{this.dis.buy}</td>
                    <td>{this.dis.sell}</td>
                    <td>{this.prices.quote[1].last}</td>
                    <td>{((this.dis.totalMoney - (this.prices.quote[1].last*this.dis.buy))*-1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>ATVI</td>
                    <td>{this.atvi.buy}</td>
                    <td>{this.atvi.sell}</td>
                    <td>{this.prices.quote[2].last}</td>
                    <td>{((this.atvi.totalMoney - (this.prices.quote[2].last*this.atvi.buy))*-1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGAMY</td>
                    <td>{this.sgamy.buy}</td>
                    <td>{this.sgamy.sell}</td>
                    <td>{this.prices.quote[3].last}</td>
                    <td>{((this.sgamy.totalMoney - (this.prices.quote[3].last*this.sgamy.buy))*-1).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>UBSFY</td>
                    <td>{this.ubsfy.buy}</td>
                    <td>{this.ubsfy.sell}</td>
                    <td>{this.prices.quote[4].last}</td>
                    <td>{((this.ubsfy.totalMoney - (this.prices.quote[4].last*this.ubsfy.buy))*-1).toFixed(2)}</td>
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
