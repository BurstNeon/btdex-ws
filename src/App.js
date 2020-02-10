import React from 'react';
import logo from './logo.svg';
import './App.css';
import {Navbar,Container, Card, Row, Col, Table,
  InputGroup, NavDropdown, Form, Button, FormControl,Spinner, Nav}  from 'react-bootstrap';
import Chart from "react-apexcharts";
import Modal from 'react-responsive-modal';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
//Configuration File
var config = require('./btdex_configuration');
//Read Settings
var apiPoint = config.apiUrl;

class App extends React.Component {
  createNotification = (type) => {
  return () => {
    switch (type) {
      case 'info':
        NotificationManager.info('Info message');
        break;
      case 'success':
        NotificationManager.success('Success message', 'Title here');
        break;
      case 'warning':
        NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
        break;
      case 'error':
        NotificationManager.error('Error message', 'Click me!', 5000, () => {
          alert('callback');
        });
        break;
    }
  };
};
  constructor(props) {
    super(props);
    this.state = {
      reci: "",
      updateDate: "",
      accountTrades: [],
      accountSells: [],
      accountBuys: [],
      accountBalance: 0,
      open: false,
      liked: false,
      error: null,
      isLoaded: false,
      accountStatus: false,
      items: [],
      sellTrans: [],
      buyOrder: [],
      sellOrder: [],
      totalBuy: 0,
      totalSell: 0,
      highBuy: 0,
      hideTag: "",
     options2 : {
       chart: {
               type: 'area',
               zoomType: 'y'
           },
           title: {
               text: 'BURST-TRT Market Depth'
           },
           xAxis: {
               minPadding: 0,
               maxPadding: 0,
               width: '100%',
               plotLines: [{
                   color: '#888',
                   value: 0.1523,
                   width: 1,
                   label: {
                       text: 'Actual price',
                       rotation: 90
                   }
               }],
               title: {
                   text: 'Price'
               }
           },
           yAxis: [{
               lineWidth: 1,
               gridLineWidth: 1,
               title: null,
               tickWidth: 1,
               tickLength: 20,
               tickPosition: 'inside',
               labels: {
                   align: 'left',
                   x: 20
               }
           }, {
               opposite: true,
               linkedTo: 0,
               lineWidth: 1,
               gridLineWidth: 0,
               title: null,
               tickWidth: 1,
               tickLength: 5,
               tickPosition: 'inside',
               labels: {
                   align: 'right',
                   x: -1
               }
           }],
           legend: {
               enabled: false
           },
           plotOptions: {
               area: {
                   fillOpacity: 0.2,
                   lineWidth: 1,
                   step: 'center'
               }
           },
           tooltip: {
               headerFormat: '<span style="font-size=10px;">Price: {point.key}</span><br/>',
               valueDecimals: 2
           },
           series: [{
               name: 'Bids',
               data: [

               ],
               color: '#03a7a8'
           }, {
               name: 'Asks',
               data: [

               ],
               color: '#fc5857'
           }]
},
      options: {
       chart: {
         id: "basic-bar"
       },
       xaxis: {
         categories: []
       }, tooltip: {
                shared: true,
                intersect: false,
                y: {
                  formatter: function (y) {
                    if(typeof y !== "undefined") {
                      return  y.toFixed(2) + " TRT";
                    }
                    return y;
                  }
                }
              }
     },
     series: [
       {
         name: "Bid Order",
         data: []
       }
     ],
     series2: [
       {
         name: "Sell Order",
         data: []
       }
     ]
    };

  }
  onOpenModal = () => {
    this.setState({ open: true });

  };
  onOpenModal2 = () => {
    this.setState({ open2: true });

  };
  onOpenModal3 = () => {
    this.setState({ open3: true });

  };
  onOpenModal4 = () => {
    this.setState({ open4: true });

  };

  onCloseModal = () => {
    this.setState({ open: false });
  };
  onCloseModal2 = () => {
    this.setState({ open2: false });
  };
  onCloseModal3 = () => {
    this.setState({ open3: false });
  };
  onCloseModal4 = () => {
    this.setState({ open4: false });
  };
  //Update Render
  update() {
    setInterval(() => {
    this.forceUpdate();
  }, 30000);
    // Force a render without state change...
  }
  //Execute after DidMount
  componentDidMount() {
    fetch(`${apiPoint}/burst?requestType=getAllTrades`)
      .then(res => res.json())
      .then(
        (result) => {
          this.state.sellTrans = this.getAllTransactionSell(result);
          this.setState({
            isLoaded: true,
            items: result.items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
      //Rest APIS
      this.getAllBidOrder();
      this.getAllAskOrder();
      this.loadReci();
      this.getAllAccountTrades();
      this.getAllAccountSells();
      this.getAllAccountBuys();
      this.getAllAccountBalance();

  }
  componentDidUpdate(prevProps, prevState) {
    this.sortTable();
    this.sortTable2();
  }
 //Get Sell-Orders
 getAllTransactionSell(trans) {
  var transData = [];
  for(var i = 0; i < trans.trades.length; i++) {
    if(trans.trades[i].asset === "12402415494995249540") {
      transData.push(trans.trades[i]);


    }
  }
  return transData;
}
//Get Buy-Orders
getAllBidOrder() {
  fetch(`${apiPoint}/burst?requestType=getAllOpenBidOrders`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.buyOrder = this.convertBidArray(result);
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
}
//Get Account Trades
getAllAccountTrades() {
  if(this.state.reci !== '') {
  fetch(`${apiPoint}/burst?requestType=getTrades&account=${this.state.reci}`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.accountTrades = this.convertAccountTrade(result);
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
    }
}
//Account Sell Orders
getAllAccountSells() {
  if(this.state.reci !== '') {
  fetch(`${apiPoint}/burst?requestType=getTrades&account=${this.state.reci}`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.accountSells = this.convertAccountSells(result);
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
    }
}
//Account Buy Orders
getAllAccountBuys() {
  if(this.state.reci !== '') {
  fetch(`${apiPoint}/burst?requestType=getTrades&account=${this.state.reci}`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.accountBuys = this.convertAccountBuys(result);
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
    }
}
//Account Balance
getAllAccountBalance() {
  if(this.state.reci !== '') {
  fetch(`${apiPoint}/burst?requestType=getAssetAccounts&asset=12402415494995249540`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.accountBalance = this.convertAccountBalance(result, this.state.reci);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
    }
}
//Clear Local Storage
clearLocalStorage() {
   localStorage.clear();
   NotificationManager.success("Local Data cleared");
   NotificationManager.info("Please reload BTDEX");

}
//Convert JSON to Array
convertAccountSells(trans) {
  var total = 0;
  var transData = [];
  for(var i = 0; i < trans.trades.length; i++) {
    if(trans.trades[i].asset == "12402415494995249540" && trans.trades[i].tradeType == "sell") {
              transData.push(trans.trades[i]);

    }

  }

  return transData;
}
//Convert JSON to Array
convertAccountBalance(trans, reci) {
  var total = 0;
  var transData = 0;
  for(var i = 0; i < trans.accountAssets.length; i++) {
    if(trans.accountAssets[i].asset == "12402415494995249540" && trans.accountAssets[i].accountRS == reci) {
        transData = trans.accountAssets[i].quantityQNT;
    }

  }
return transData;
}
//Convert JSON to Array
convertAccountBuys(trans) {
  var total = 0;
  var transData = [];
  for(var i = 0; i < trans.trades.length; i++) {
    if(trans.trades[i].asset == "12402415494995249540" && trans.trades[i].tradeType == "buy") {
              transData.push(trans.trades[i]);

    }

  }
  return transData;
}
//Return API Endpoint
getApiPoint() {
  var api = apiPoint;
    NotificationManager.info(api);
}
convertAccountTrade(trans) {
  var total = 0;
  var transData = [];
  for(var i = 0; i < trans.trades.length; i++) {
    if(trans.trades[i].asset == "12402415494995249540") {
              transData.push(trans.trades[i]);

    }

  }
  return transData;
}
//Remove Wallet
removeReci() {
  document.getElementById("ids").innerHTML = "";
  localStorage.setItem('reci', "");
  document.getElementsByClassName("dropdown nav-item")[0].style.display = "none";
}
//Reci for check my orders selection
setReci() {
  var reci = document.getElementById("reci").value;
  document.getElementById("ids").innerHTML = reci;
  document.getElementsByClassName("dropdown nav-item")[0].style.display = "block";
  document.getElementsByClassName("dropdown nav-item")[0].style.visibility = "visible";

  localStorage.setItem('reci', reci);
  localStorage.setItem('date', new Date());

}
//Check if Account exists
checkAccount() {
  var reci = document.getElementById("reci").value;
  var status = false;
  fetch(`${apiPoint}/burst?requestType=getAccount&account=${reci}`)
    .then(res => res.json())
    .then(
      (result) => {
        if(result.errorCode == 5 || result.errorCode == 3) {
          status = false;
          document.getElementById("accountCheck").disabled = true;
          document.getElementById("reci").style.border = "3px solid #b7637f94"
          NotificationManager.error(`ACCOUNT NOT FOUND`);
        } else {
          status = true;
          document.getElementById("accountCheck").disabled = false;
          document.getElementById("reci").style.border = "3px solid #63b78094"
          document.getElementById("ids").innerHTML = reci;
          document.getElementsByClassName("dropdown nav-item")[0].style.display = "block";
          document.getElementsByClassName("dropdown nav-item")[0].style.visibility = "visible";
          localStorage.setItem('reci', reci);
          localStorage.setItem('date', new Date());
          NotificationManager.success(`ACCOUNT ADDED`);
        }
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
      }
    )
}
//Load latest Wallet
loadReci() {
  var reci = localStorage.getItem('reci') || '';
  if(reci === '') {
    this.state.hideTag = "hidden";
  } else {
    this.state.hideTag = "visible";
  }
  var date = localStorage.getItem('date') || '';
  this.state.reci = reci;
  this.state.updateDate = date;
  return reci;
}
//Get all ask orders
getAllAskOrder() {
  fetch(`${apiPoint}/burst?requestType=getAllOpenAskOrders`)
    .then(res => res.json())
    .then(
      (result) => {
        this.state.sellOrder = this.convertAskArray(result);
      },
      // Note: it's important to handle errors here
      // instead of a catch() block so that we don't swallow
      // exceptions from actual bugs in components.
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
}
//Return ARRAY from JSON
convertBidArray(trans) {
  var total = 0;
  var transData = [];
  for(var i = 0; i < trans.openOrders.length; i++) {
    if(trans.openOrders[i].asset == "12402415494995249540") {
              transData.push(trans.openOrders[i]);
              total = total + parseFloat(trans.openOrders[i].quantityQNT / 10000) *  parseFloat(trans.openOrders[i].priceNQT / 10000);
              this.totalBuy = total.toFixed(2);

                this.state.options2.series[0].data.push([trans.openOrders[i].priceNQT / 10000, trans.openOrders[i].quantityQNT / 10000])
                this.state.options.xaxis.categories.push(trans.openOrders[i].height)
                if(trans.openOrders[i].priceNQT / 10000 > this.state.highBuy) {
                    this.state.highBuy = trans.openOrders[i].priceNQT / 10000;
                }



    }

  }
  return transData;
}
//Return ARRAY from JSON
convertAskArray(trans) {
  var total = 0;
  var transData = [];
  for(var i = 0; i < trans.openOrders.length; i++) {
    if(trans.openOrders[i].asset == "12402415494995249540") {
              transData.push(trans.openOrders[i]);
              total = total + parseFloat(trans.openOrders[i].quantityQNT / 10000) *  parseFloat(trans.openOrders[i].priceNQT / 10000);
              this.totalSell = total.toFixed(2);
              if(trans.openOrders[i].priceNQT / 10000 < this.state.highBuy * 30) {
                      this.state.options2.series[1].data.push([trans.openOrders[i].priceNQT / 10000, trans.openOrders[i].quantityQNT / 10000])
              }
    }

  }
  return transData;
}
//Convert Burst Timestamp
convertTimestamp(timestamp) {
  var time = Date.UTC(2014, 7, 11, 2, 0, 0, 0) + timestamp * 1000;
  time = new Date(time).toGMTString();
  return time;
}
sortTable() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("order");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[1];
      y = rows[i + 1].getElementsByTagName("TD")[1];
      // Check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
sortTable2() {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("order2");
  switching = true;
  /* Make a loop that will continue until
  no switching has been done: */
  while (switching) {
    // Start by saying: no switching is done:
    switching = false;
    rows = table.rows;
    /* Loop through all table rows (except the
    first, which contains table headers): */
    for (i = 1; i < (rows.length - 1); i++) {
      // Start by saying there should be no switching:
      shouldSwitch = false;
      /* Get the two elements you want to compare,
      one from current row and one from the next: */
      x = rows[i].getElementsByTagName("TD")[1];
      y = rows[i + 1].getElementsByTagName("TD")[1];
      // Check if the two rows should switch place:
      if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
        // If so, mark as a switch and break the loop:
        shouldSwitch = true;
        break;
      }
    }
    if (shouldSwitch) {
      /* If a switch has been marked, make the switch
      and mark that a switch has been done: */
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }
}
//Table Filter function
tableFilter() {
   var input, filter, table, tr, td, td2, td3, td4, td5, td6, td7, i, txtValue, txtValue2, txtValue3, txtValue4, txtValue5, txtValue5, txtValue6, txtValue7;
   input = document.getElementById("myInput");
   filter = input.value.toUpperCase();
   table = document.getElementById("exchange");
   tr = table.getElementsByTagName("tr");
   for (i = 0; i < tr.length; i++) {
     td = tr[i].getElementsByTagName("td")[0];
     td2 = tr[i].getElementsByTagName("td")[1];
     td3 = tr[i].getElementsByTagName("td")[2];
     td4 = tr[i].getElementsByTagName("td")[3];
     td5 = tr[i].getElementsByTagName("td")[4];
     td6 = tr[i].getElementsByTagName("td")[5];
     td7 = tr[i].getElementsByTagName("td")[6];

     if (td || td2) {
       txtValue = td.textContent    || td.innerText;
       txtValue2 = td2.textContent  || td2.innerText;
       txtValue3 = td3.textContent   || td3.innerText;
       txtValue4 = td4.textContent  || td4.innerText;
       txtValue5 = td5.textContent   || td5.innerText;
       txtValue6 = td6.textContent  || td6.innerText;
       txtValue7 = td7.textContent  || td7.innerText;
       if (txtValue.toUpperCase().indexOf(filter) > -1 || txtValue2.toUpperCase().indexOf(filter) > -1
       || txtValue3.toUpperCase().indexOf(filter) > -1|| txtValue4.toUpperCase().indexOf(filter) > -1
       || txtValue5.toUpperCase().indexOf(filter) > -1|| txtValue6.toUpperCase().indexOf(filter) > -1
       || txtValue7.toUpperCase().indexOf(filter) > -1) {
         tr[i].style.display = "";
       } else {
         tr[i].style.display = "none";
       }
     }
   }
}
  render() {
     const { open } = this.state;
     const { open2 } = this.state;
     const { open3 } = this.state;
     const { open4 } = this.state;
    return (
      //Render Table BUY /SELL TRT
          this.state.sellTrans.length > 0 && (
            <div>
            <NotificationContainer/>
            <Modal open={open2} onClose={this.onCloseModal2} center>
              <Card id="orders">
              <Card className="text-center">
<Card.Header><b id="acc"> <button id="ac" onClick={this.onCloseModal2}> <img src="https://img.icons8.com/material/25/000000/close-window--v1.png"/> </button></b> <b id="accs"> <img src="https://img.icons8.com/ios/30/000000/blockchain-technology.png"/>  HISTORIC TRADES</b> </Card.Header>
<Card.Body>
<Table id="" striped bordered hover>
<thead>
  <tr>
    <th>Order</th>
    <th>Date</th>
    <th>Price (Burst)</th>
    <th>Amount (TRT)</th>
    <th>Height</th>
    <th>Total Burst</th>
  </tr>
</thead>
<tbody>
{this.state.accountTrades.map(p => (
  <tr>
    <td>{p.tradeType}</td>
    <td>{this.convertTimestamp(p.timestamp)}</td>
    <td>{parseFloat(p.priceNQT / 10000).toFixed(5)}</td>
    <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
    <td>{p.height}</td>
    <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

  </tr>
))}
</tbody>
</Table>
</Card.Body>
<Card.Footer className="text-muted"><Spinner  size="sm" animation="grow" variant="primary" /> {this.state.updateDate !== '' ?  "Last Updated: " + this.state.updateDate : ""}</Card.Footer>
</Card>

              </Card>
            </Modal>
            <Modal open={open3} onClose={this.onCloseModal3} center>
              <Card id="orders">
              <Card className="text-center">
<Card.Header><b id="acc"> <button id="ac" onClick={this.onCloseModal3}> <img src="https://img.icons8.com/material/25/000000/close-window--v1.png"/> </button></b> <b id="accs"> <img src="https://img.icons8.com/ios/30/000000/blockchain-technology.png"/>  SELL ACTIVITY</b> </Card.Header>
<Card.Body>
<Table id="" striped bordered hover>
<thead>
  <tr>
    <th>Buyer</th>
    <th>Date</th>
    <th>Price (Burst)</th>
    <th>Amount (TRT)</th>
    <th>Height</th>
    <th>Total Burst</th>
  </tr>
</thead>
<tbody>
{this.state.accountSells.map(p => (
  <tr>
    <td>{p.buyerRS}</td>
    <td>{this.convertTimestamp(p.timestamp)}</td>
    <td>{parseFloat(p.priceNQT / 10000).toFixed(5)}</td>
    <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
    <td>{p.height}</td>
    <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

  </tr>
))}
</tbody>
</Table>
</Card.Body>
<Card.Footer className="text-muted"><Spinner  size="sm" animation="grow" variant="primary" /> {true ?  "Last Updated: " + new Date(): ""}</Card.Footer>
</Card>

              </Card>
            </Modal>
            <Modal open={open4} onClose={this.onCloseModal4} center>
              <Card id="orders">
              <Card className="text-center">
<Card.Header><b id="acc"> <button id="ac" onClick={this.onCloseModal4}> <img src="https://img.icons8.com/material/25/000000/close-window--v1.png"/> </button></b> <b id="accs"> <img src="https://img.icons8.com/ios/30/000000/blockchain-technology.png"/>  BUY ACTIVITY</b> </Card.Header>
<Card.Body>
<Table id="" striped bordered hover>
<thead>
  <tr>
    <th>Seller</th>
    <th>Date</th>
    <th>Price (Burst)</th>
    <th>Amount (TRT)</th>
    <th>Height</th>
    <th>Total Burst</th>
  </tr>
</thead>
<tbody>
{this.state.accountBuys.map(p => (
  <tr>
    <td>{p.sellerRS}</td>
    <td>{this.convertTimestamp(p.timestamp)}</td>
    <td>{parseFloat(p.priceNQT / 10000).toFixed(5)}</td>
    <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
    <td>{p.height}</td>
    <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

  </tr>
))}
</tbody>
</Table>
</Card.Body>
<Card.Footer className="text-muted"><Spinner  size="sm" animation="grow" variant="primary" /> {true ?  "Last Updated: " + new Date(): ""} </Card.Footer>
</Card>

              </Card>
            </Modal>
                    <Modal open={open} onClose={this.onCloseModal} center>
                      <Card id="orders">
                      <Card className="text-center">
<Card.Header><b id="acc"> <button id="ac" onClick={this.onCloseModal}> <img src="https://img.icons8.com/material/25/000000/close-window--v1.png"/> </button></b> <b id="accs"> <img src="https://img.icons8.com/ios/30/000000/blockchain-technology.png"/>  BTDEX SETTINGS</b> </Card.Header>
  <Card.Body>

    <Table id="settingst">
    <tbody>
    <tr>
    <td>
    Bind Account
    </td>
    <td>

        <InputGroup className="">
          <FormControl id="reci"
            placeholder="Enter Burst-XXXX-XXXX-XXXX-XXXX"
            aria-label="Enter Burst-XXXX-XXXX-XXXX-XXXX"
            aria-describedby="basic-addon2"
          />

          <InputGroup.Append>
            <Button onClick={this.checkAccount} id="accountCheck" variant="outline-secondary">Add Wallet</Button>
          </InputGroup.Append>
        </InputGroup>
    </td>
    </tr>
    <tr>
      <td>  API Endpoint </td>
    <td>    <Button onClick={this.getApiPoint} id="accountCheck" variant="outline-secondary">Check Node</Button></td>
    </tr>
    <tr>
      <td>  Local Storage </td>
    <td>    <Button onClick={this.clearLocalStorage} id="accountCheck" variant="outline-secondary">Clear Data</Button></td>
    </tr>
    </tbody>
    </Table>




  </Card.Body>
  <Card.Footer className="text-muted"><Spinner  size="sm" animation="grow" variant="primary" />Fetch Data from Blockchain {this.state.updateDate !== '' ?  "- Updated: " + this.state.updateDate : ""}</Card.Footer>
</Card>

                      </Card>
                    </Modal>
            <Navbar bg="light" variant="light">
            <img src="https://btdex.trade/assets/images/icon-130x128.png" width="45" height="40" alt="BTDEX"/>
                <Navbar.Brand href=""> <b> &nbsp; BTDEX </b></Navbar.Brand>
              <Nav className="mr-auto" style={{visibility: this.state.hideTag}}>
               <NavDropdown title=<b id="ids" ><img src="https://img.icons8.com/color/25/000000/expeditedssl.png"/>{this.state.reci}</b> id="nav-dropdown">
  <NavDropdown.Item eventKey="4.1"> <b> Balance </b> </NavDropdown.Item>
  <NavDropdown.Item eventKey="4.1"><img id="settBalance" src="https://img.icons8.com/dotty/20/000000/coins.png"/> {this.state.accountBalance} TRT</NavDropdown.Item>
  <NavDropdown.Divider />
  <NavDropdown.Item onClick={this.onOpenModal2} eventKey="4.1">All Trades</NavDropdown.Item>
  <NavDropdown.Item onClick={this.onOpenModal4} eventKey="4.2">All Buy Orders</NavDropdown.Item>
  <NavDropdown.Item onClick={this.onOpenModal3} eventKey="4.3">All Sell Orders</NavDropdown.Item>
  <NavDropdown.Divider />
  <NavDropdown.Item onClick={this.removeReci} ventKey="4.4">Remove Account</NavDropdown.Item>
</NavDropdown>
                </Nav>
                <Nav>
                <NavDropdown title=<b id="ids"><img src="https://img.icons8.com/dotty/25/000000/bank-card-back-side.png"/>TRT/BURST MARKET</b> id="nav-dropdown">
  <NavDropdown.Item eventKey="4.1" disabled>ETC/BURST</NavDropdown.Item>
  <NavDropdown.Item eventKey="4.2" disabled>BTC/BURST</NavDropdown.Item>
  <NavDropdown.Item eventKey="4.1" disabled>LTC/BURST</NavDropdown.Item>
  <NavDropdown.Item eventKey="4.2" disabled>XMR/BURST</NavDropdown.Item>
</NavDropdown>
  <Nav.Link onClick={this.onOpenModal} href="#deets"><img src="https://img.icons8.com/pastel-glyph/20/000000/purchase-order.png"/><b id="sett">BTDEX SETTINGS</b></Nav.Link>

</Nav>
                <Form inline>
                  <FormControl type="text"id="myInput" onChange={this.tableFilter} placeholder="Search for Transaction.." className="mr-sm-2" />
                </Form>

              </Navbar>
<Row>
                      <Col>
                      <Card>
                      <div id="headBuy"> </div>
                      <div className="mixed-chart">
  <HighchartsReact highcharts={Highcharts} options={this.state.options2} />
                        <div>
</div>
                      </div>
                      </Card>
                      </Col>
              </Row>
  <Row>

  <Col ><br></br>
    <Card id="noBorder">
  <div class="ExTit">
      <div class="smallEx">Current Buy Orders</div>
      <div class="info">
                  <div class="desc">
                  </div>
                  <div class="details">
                    <div class="num" id="smallEx">Total <b>{this.totalBuy} </b> Burst</div>
                  </div>
                </div>
  </div>
  <div id="tableDiv">
<Table id="order" striped bordered hover size="sm">
  <thead>
    <tr>
      <th>Order</th>
      <th>Price (Burst)</th>
      <th>Amount (TRT)</th>
      <th>Buyer</th>
      <th>Total Burst</th>
    </tr>
  </thead>
  <tbody>
  {this.state.buyOrder.map(p => (
    <tr>
      <td>{p.order}</td>
      <td>{parseFloat(p.priceNQT / 10000).toFixed(4)}</td>
      <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
      <td>{p.accountRS}</td>
      <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

    </tr>
  ))}
  </tbody>
</Table>
</div>
  </Card>
</Col>
    <Col ><br></br>  <Card id="noBorder">
    <div class="ExTit">
        <div class="smallEx">Current Sell Orders</div>
        <div class="info">
                    <div class="desc">
                    </div>
                    <div class="details">
                      <div class="num" id="smallEx">Total <b>{this.totalSell} </b> Burst</div>
                    </div>
                  </div>
    </div>
      <div id="tableDiv">
  <Table id="order2" striped bordered hover size="sm">
    <thead>
      <tr>
      <th>Order</th>
      <th>Price (Burst)</th>
      <th>Amount (TRT)</th>
      <th>Seller</th>
      <th>Total Burst</th>
      </tr>
    </thead>
    <tbody>
    {this.state.sellOrder.map(p => (
      <tr>
        <td>{p.order}</td>
        <td>{parseFloat(p.priceNQT / 10000).toFixed(4)}</td>
        <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
        <td>{p.accountRS}</td>
        <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

      </tr>
    ))}
    </tbody>
  </Table>
  </div>
  </Card>
  </Col>
  </Row>

            <div class="ExTit">

                <div class="smallEx">HISTORIC BURST / TRT</div>
              </div>
                <div id="tableDiv2">
                  <table id="exchange" class="table" className='table table-sm table-striped table-bordered table-hover'>
                    <thead>
                      <tr>
                      <th class="bg-purple"> Type</th>
                      <th class="bg-blue">Date</th>
                      <th class="bg-blue">Price (Burst)</th>
                      <th class="bg-blue">Amount (TRT)</th>
                      <th class="bg-blue">Seller</th>
                      <th class="bg-blue">Buyer</th>
                      <th class="bg-blue">Total (Burst)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.sellTrans.map(p => (
                        <tr>
                          <td>{p.tradeType}</td>
                          <td>{this.convertTimestamp(p.timestamp)}</td>
                          <td>{parseFloat(p.priceNQT / 10000).toFixed(5)}</td>
                          <td>{parseFloat(p.quantityQNT / 10000).toFixed(2)}</td>
                          <td>{p.sellerRS}</td>
                          <td>{p.buyerRS}</td>
                          <td>{parseFloat((p.quantityQNT /10000 * p.priceNQT)/ 10000).toFixed(2) }</td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                  {/* Site footer */}
 <footer className="site-footer">
   <div className="container">
     <div className="row">
       <div className="col-sm-12 col-md-6">
         <h6>Legal Notice</h6>
         <p className="text-justify">
         This is the web version for the btdex. All information is without guarantee and permanent correctness is not guaranteed. The distribution of the software is under gnu v3 license.
         </p>
       </div>
       <div className="col-xs-6 col-md-3">
         <h6>Downloads</h6>
         <ul className="footer-links">
           <li><a href="https://btdex.trade/BTDEXandTRT.pdf">BTDEX Whitepaper</a></li>
           <li><a href=" https://github.com/btdex/btdex/releases/">BTDEX Desktop Client</a></li>
         </ul>
       </div>
       <div className="col-xs-6 col-md-3">
         <h6>Quick Links</h6>
         <ul className="footer-links">
           <li><a href="https://btdex.trade/">BTDEX Website</a></li>
           <li><a href="https://github.com/btdex/btdex">BTDEX Software</a></li>
         </ul>
       </div>
     </div>
     <hr />
   </div>
   <div className="container">
     <div className="row">
       <div className="col-md-8 col-sm-6 col-xs-12">
         <p className="copyright-text">Copyright © {new Date().getYear() + 1900} All Rights Reserved by
           <a href="https://github.com/BurstNeon"> TWBN</a>.
         </p>
         Support the project with a donation to BURST-2QQ5-6477-ZFK5-BQCH4
       </div>
       <div className="col-md-4 col-sm-6 col-xs-12">
         <ul className="social-icons">
           <li><a className="facebook" href="https://discordapp.com/invite/VQ6sFAY"><i className="fa fa-discord" /></a></li>
           <li><a className="twitter" href="https://twitter.com/btdex_trade"><i className="fa fa-twitter" /></a></li>
         </ul>
       </div>
     </div>
   </div>
 </footer>
     </div>
                )

    		);
  }

}

export default App;
