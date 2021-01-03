import React from 'react';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Logo from '../../logo512.png';
import './Navigation.css';

class Navigation extends React.Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }

  adminNavbar(){
    if (this.props.testisadmin){
      return (
        <NavDropdown className="" title="Settings" id="collasible-nav-dropdown">
          <NavDropdown.Item onClick={() => this.props.onRouteChange("Holidays")} /*href="#h"*/>Holidays</NavDropdown.Item>
          <NavDropdown.Item onClick={() => this.props.onRouteChange("Call Types")} /*href="#ct"*/>Call Types</NavDropdown.Item>
          <NavDropdown.Item onClick={() => this.props.onRouteChange("People")} /*href="#pe"*/>People</NavDropdown.Item>
           <NavDropdown.Item onClick={() => this.props.onRouteChange("Entries")} /*href="#e"*/>Entries</NavDropdown.Item>
        </NavDropdown>
      );
    }
  }

  render(){
    const {testisadmin, onRouteChange} = this.props;
    let ad = '';
    if (testisadmin){
      ad = "Admin ";
    }
    return (
      <Navbar id="myNav">
        <Navbar.Brand onClick={() => onRouteChange("Personal Schedule")} /*href="#p"*/ id='navbrand'>
          <img id='brand' alt="logo" src={Logo} width="50" height="50" className="d-inline-block align-top"/>
          <h1 id="brandTitle" className="d-inline-block align-top">MeniSked</h1>
        </Navbar.Brand>
    		<div id="collapser">
      	  <Nav className="">
        		{this.adminNavbar()}
            <NavDropdown className="full-text" title="Schedules" id="collasible-nav-dropdown">
         			<NavDropdown.Item onClick={() => onRouteChange("Personal Schedule")} /*href="#p"*/>Personal</NavDropdown.Item>
          		<NavDropdown.Item onClick={() => onRouteChange("Call Schedule")} /*href="#c"*/>Call</NavDropdown.Item>
         			<NavDropdown.Item onClick={() => onRouteChange("Master Schedule")} /*href="#pu"*/>Master</NavDropdown.Item>
       			</NavDropdown>
            <NavDropdown className="logo" title="Skeds" id="collasible-nav-dropdown">
              <NavDropdown.Item onClick={() => onRouteChange("Personal Schedule")} /*href="#p"*/>Personal</NavDropdown.Item>
              <NavDropdown.Item onClick={() => onRouteChange("Call Schedule")} /*href="#c"*/>Call</NavDropdown.Item>
              <NavDropdown.Item onClick={() => onRouteChange("Master Schedule")} /*href="#pu"*/>Master</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link onClick={() => this.props.onRouteChange(ad+"Messages")} className="full-text linky" /*href="#m"*/>Messages</Nav.Link>
            <img onClick={() => this.props.onRouteChange(ad+"Messages")} alt="Messages" src="https://img.icons8.com/material-rounded/96/000000/important-mail.png" width="30" height="30" className="logo linky"/>
            <Nav.Link onClick={() => onRouteChange("Account Information")} className="full-text linky" /*href="#a"*/>Account</Nav.Link>
            <img onClick={() => onRouteChange("Account Information")} alt="Account" src="https://img.icons8.com/material-rounded/96/000000/user-male-circle.png" width="30" height="30" className="logo linky"/>
      		</Nav>
        </div>
  		</Navbar>
    );
  }
}

export default Navigation;