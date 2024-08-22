import React, { Component } from 'react'
import "./Footer.css"

type Props = {}

type State = {}

export default class Footer extends Component<Props, State> {
    state = {}

    render() {
        return (
            <div className='footer-container'>
                © 2024 Utah ABA Finder. All Rights Reserved.
            </div>
        )
    }
}