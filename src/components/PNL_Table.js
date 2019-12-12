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
        this.transactions = response.data;
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
