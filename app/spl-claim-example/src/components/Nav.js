import React from "react";

import Wallet from './Wallet'

import {
  Nav,
  NavLink,
  NavMenu,
  NavBtn,
} from './NavBarElements';

const NavBar = (props) => {  
  return (
       <Nav className="nav">
       <NavLink to='/' activeStyle>Spl-Claim Example</NavLink>
        <NavBtn>
          <Wallet />
        </NavBtn>
      </Nav>
     )
}

export default NavBar;
