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
    this.dis={adminStock:0 ,userStock:0,pnl:0}
    this.ntdoy={adminStock:0 ,userStock:0,pnl:0}
    this.sgamy={adminStock:0,userStock:0,pnl:0}
    this.ubsfy={adminStock:0 ,userStock:0,pnl:0}
    this.atvi={adminStock:0 ,userStock:0,pnl:0}
    for(var i=0;i<this.transactions.length;i++)
    {

      if(this.transactions[i].username==="admin"){

        if(this.transactions[i].b_type==="BUY"){
            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.adminStock+=this.transactions[i].quantity;
              this.ntdoy.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
              console.log("this is i="+i+" adminStock Admin current adminStock:" + this.ntdoy.adminStock+ " current userStock " +this.ntdoy.userStock +" current pnl: "+this.ntdoy.pnl);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.adminStock+=this.transactions[i].quantity;
                //console.log(this.transactions[i].quantity+" admin adminStock:"+(this.transactions[i].quantity*this.transactions[i].price)+"\n");
              
                this.dis.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.adminStock+=this.transactions[i].quantity;
                this.sgamy.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.adminStock+=this.transactions[i].quantity;
                this.ubsfy.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.adminStock+=this.transactions[i].quantity;
                this.atvi.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
          else{
            if(this.transactions[i].stocktype==="NTDOY"){
            //  this.ntdoy.adminStock+=this.transactions[i].quantity;
              this.ntdoy.pnl+=(this.transactions[i].quantity*this.transactions[i].price);
              console.log("this is i="+i+" adminStock Admin current adminStock:" + this.ntdoy.adminStock+ " current userStock " +this.ntdoy.userStock +" current pnl: "+this.ntdoy.pnl);
            }
            else if(this.transactions[i].stocktype=== "DIS"){
              //  this.dis.adminStock+=this.transactions[i].quantity;
                //console.log(this.transactions[i].quantity+" admin adminStock:"+(this.transactions[i].quantity*this.transactions[i].price)+"\n");
              
                this.dis.pnl+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
              // this.sgamy.adminStock+=this.transactions[i].quantity;
                this.sgamy.pnl+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="UBSFY"){
              // this.ubsfy.adminStock+=this.transactions[i].quantity;
                this.ubsfy.pnl+=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
              // this.atvi.adminStock+=this.transactions[i].quantity;
                this.atvi.pnl+=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
      }
      else{
        if(this.transactions[i].b_type==="SELL"){
            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.adminStock-=this.transactions[i].quantity;
              this.ntdoy.userStock-=this.transactions[i].quantity;
              
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.adminStock-=this.transactions[i].quantity;
                  this.dis.userStock-=this.transactions[i].quantity;
             
            }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.adminStock-=this.transactions[i].quantity;
                  this.sgamy.userStock-=this.transactions[i].quantity;
                  }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.adminStock-=this.transactions[i].quantity;
                this.ubsfy.userStock-=this.transactions[i].quantity;
               // this.ubsfy.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.adminStock-=this.transactions[i].quantity;
                this.atvi.userStock-=this.transactions[i].quantity;
                //this.atvi.pnl-=(this.transactions[i].quantity*this.transactions[i].price);
            }
          }
          else if(this.transactions[i].b_type==="BUY"){

            if(this.transactions[i].stocktype==="NTDOY"){
              this.ntdoy.userStock+=this.transactions[i].quantity;
            }
            else if(this.transactions[i].stocktype=== "DIS"){
                this.dis.userStock+=this.transactions[i].quantity;
                  }
            else if(this.transactions[i].stocktype==="SGAMY"){
                this.sgamy.userStock+=this.transactions[i].quantity;
   }
            else if(this.transactions[i].stocktype==="UBSFY"){
                this.ubsfy.userStock+=this.transactions[i].quantity;
            }
            else if(this.transactions[i].stocktype==="ATVI"){
                this.atvi.userStock+=this.transactions[i].quantity;
           }
          }
        }
      }
      this.ntdoy.adminStock-=this.ntdoy.userStock;
      this.dis.adminStock-=this.dis.userStock;
      this.atvi.adminStock-=this.atvi.userStock;
      this.sgamy.adminStock-=this.sgamy.userStock;
      this.ubsfy.adminStock-=this.ubsfy.userStock;
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
                    <td>{this.ntdoy.adminStock}</td>
                    <td>{this.ntdoy.userStock}</td>
                    <td>{this.prices.quote[0].last}</td>
                    <td>{((this.ntdoy.pnl - (this.prices.quote[0].last*this.ntdoy.adminStock)))}</td>
                  </tr>
                  <tr>
                    <td>DIS</td>
                    <td>{this.dis.adminStock}</td>
                    <td>{this.dis.userStock}</td>
                    <td>{this.prices.quote[1].last}</td>
                    <td>{((this.dis.pnl - (this.prices.quote[1].last*this.dis.adminStock))).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>ATVI</td>
                    <td>{this.atvi.adminStock}</td>
                    <td>{this.atvi.userStock}</td>
                    <td>{this.prices.quote[2].last}</td>
                    <td>{((this.atvi.pnl - (this.prices.quote[2].last*this.atvi.adminStock))).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>SGAMY</td>
                    <td>{this.sgamy.adminStock}</td>
                    <td>{this.sgamy.userStock}</td>
                    <td>{this.prices.quote[3].last}</td>
                    <td>{((this.sgamy.pnl - (this.prices.quote[3].last*this.sgamy.adminStock))).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td>UBSFY</td>
                    <td>{this.ubsfy.adminStock}</td>
                    <td>{this.ubsfy.userStock}</td>
                    <td>{this.prices.quote[4].last}</td>
                    <td>{((this.ubsfy.pnl - (this.prices.quote[4].last*this.ubsfy.adminStock))*-1).toFixed(2)}</td>
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
