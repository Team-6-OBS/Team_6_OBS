import React from "react";
import {render} from "react-dom";
//import axios from "axios";

export class AccountTable extends React.Component {
  constructor(props) {
    super();
  }

  render () {
    if(this.props.accountInfo === null){
      return (
        <div className="col col-md-8 col-md-offset-2">
          <button type="button" className="btn btn-primary">Create New Table</button>
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
                  <button type="button" className="btn btn-primary">Add $$$</button>
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
                <td>{this.props.accountInfo.ntdoy.owned}</td>
                <td>{this.props.accountInfo.ntdoy.value}</td>
                <td>{this.props.accountInfo.ntdoy.owned*this.props.accountInfo.ntdoy.value}</td>
                <td>
                  <button type="button" className="btn btn-primary">Buy</button>
                  <button type="button" className="btn btn-primary">Sell</button>
                </td>
              </tr>
              <tr className="sgamy">
                <td>SGAMY</td>
                <td>{this.props.accountInfo.sgamy.owned}</td>
                <td>{this.props.accountInfo.sgamy.value}</td>
                <td>{this.props.accountInfo.sgamy.owned*this.props.accountInfo.sgamy.value}</td>
                <td>
                  <button type="button" className="btn btn-primary">Buy</button>
                  <button type="button" className="btn btn-primary">Sell</button>
                </td>
              </tr>
              <tr className="atvi">
                <td>ATVI</td>
                <td>{this.props.accountInfo.atvi.owned}</td>
                <td>{this.props.accountInfo.atvi.value}</td>
                <td>{this.props.accountInfo.atvi.owned*this.props.accountInfo.atvi.value}</td>
                <td>
                  <button type="button" className="btn btn-primary">Buy</button>
                  <button type="button" className="btn btn-primary">Sell</button>
                </td>
              </tr>
              <tr className="dis">
                <td>DIS</td>
                <td>{this.props.accountInfo.dis.owned}</td>
                <td>{this.props.accountInfo.dis.value}</td>
                <td>{this.props.accountInfo.dis.owned*this.props.accountInfo.dis.value}</td>
                <td>
                  <button type="button" className="btn btn-primary">Buy</button>
                  <button type="button" className="btn btn-primary">Sell</button>
                </td>
              </tr>
              <tr className="ubsfy">
                <td>UBSFY</td>
                <td>{this.props.accountInfo.ubsfy.owned}</td>
                <td>{this.props.accountInfo.ubsfy.value}</td>
                <td>{this.props.accountInfo.ubsfy.owned*this.props.accountInfo.ubsfy.value}</td>
                <td>
                  <button type="button" className="btn btn-primary">Buy</button>
                  <button type="button" className="btn btn-primary">Sell</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }
}
