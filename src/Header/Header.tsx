import React, { Component } from 'react'
import Logo from '../Assets/Logo.png'
import Menu from '../Assets/menu-icon.png'
import "./Header.css"

type Props = {}

type State = {}

export default class Header extends Component<Props, State> {
    state = {}

    render() {
        return (
            <div className='Header'>
                <img src={Logo} alt="main-logo" className="main-logo" />
                <img src={Menu} alt="menu" className="menu" />
            </div>
        )
    }
}