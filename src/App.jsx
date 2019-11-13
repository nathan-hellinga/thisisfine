import React from 'react';
import './App.css';
import Select from "react-dropdown-select";
import NumberFormat from 'react-number-format';

class App extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      loading: true,
      companies: [],
      filteredCompanies: [],
      selectedCompany: [],
      companyDetails: null,
      input: "",
      numberValue: null
    };
    this.loadData();
  }

  loadData = () => {
    fetch("https://financialmodelingprep.com/api/v3/company/stock/list")
      .then((response) => {
        if(response.ok)
          this.setState({loading: false});
        return response.json();
    }).then(MyJson => {
      console.log(MyJson);
      this.setState({companies: MyJson.symbolsList})
    })
  };

  getCompanyInfo = (ticker) => {
    fetch("https://financialmodelingprep.com/api/v3/financials/income-statement/" + ticker)
      .then((response) => {
        if(response.ok){
          return response.json();
        }else{
          return null;
        }
      }).then(MyJson => {
        if (MyJson !== null){
          console.log(MyJson);
          this.setState({companyDetails: MyJson.financials[0]})
        }
    })
  };

  setValues = (values) => {
    this.setState({selectedCompany: values});
    this.getCompanyInfo(values[0].symbol)
  };

  inputNumber = (values) => {
    this.setState({numberValue: values.value});
  };

  searchOverride = (input) => {
    let maxLength = 50;
    input = input.state.search;
    let searchedArray = this.state.companies.filter((item) => {
      return item.name.toLowerCase().includes(input.toLowerCase())
    });
    return searchedArray.slice(0, maxLength);
    // return this.state.companies.filter((item) => item.name.toLowerCase().contains(input.toLowerCase())).slice(0, maxLength);
  };

  calculateRelativeCost = () => {
    if(this.state.companyDetails === null || this.state.numberValue === null){
      return null
    }
    return (50000 * this.state.numberValue / this.state.companyDetails.Revenue);
  };

  render() {
    return(
      <div className="App">
        <h1 style={{marginBottom: "1px"}}>Choose a company & input an amount</h1>
        <h3 className={"subtitle"}>reveal the amount relative to the mean American household income</h3>
        <Select
          style={{maxWidth: "90vw", width: "500px"}}
          onChange={(values) => this.setValues(values)}
          options={this.state.filteredCompanies}
          placeholder="Select company"
          loading={this.state.loading}
          multi={false}
          labelField={"name"}
          valueField={"symbol"}
          noDataLabel="No matches found"
          searchFn={this.searchOverride}
          dropdownHeight={"35vh"}
        />

        <NumberFormat placeholder={"Input amount"} className={"inputty"} onValueChange={this.inputNumber} value={this.state.numberValue} thousandSeparator={true} prefix={'$'} />
        {this.calculateRelativeCost() !== null && (
          <div className={"boxy"}>
            <h3>
              Them paying:
            </h3>
            <h1><NumberFormat value={this.state.numberValue} displayType={'text'} thousandSeparator={true} prefix={'$'} decimalScale={2}/></h1>
            <h3>
              is equivalent to you paying:
            </h3>
            <h1><NumberFormat
              value={this.calculateRelativeCost() < 0.01 ? 0.01 : this.calculateRelativeCost()}
              displayType={'text'}
              thousandSeparator={true}
              prefix={this.calculateRelativeCost() < 0.01 ? "< $" : "$"}
              decimalScale={2}
            /></h1>
          </div>
        )}

      </div>
    )
  }
}


export default App;
