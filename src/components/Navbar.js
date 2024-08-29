import React, { Component } from "react";
import "./NavbarStyle.css";
import { MenuItems } from "./MenuItems";
import { Link } from "react-router-dom";

class Navbar extends Component {
  render() {
    return (
      <nav className="NavbarItems">
        <h1 className="navbar-logo">INDfund</h1>
        <ul className="nav-menu">
          {MenuItems.map((item, index) => (
            <li key={index}>
              <Link className={item.cName} to={item.url}>
                <i className={item.icon}></i>
                {item.title}
              </Link>
            </li>
          ))}
          <button>Sign Up</button>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
