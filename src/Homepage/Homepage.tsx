import React, { Component } from 'react'
import Header from '../Header/Header'
import Footer from '../Footer/Footer'

type Props = {}

type State = {}

class Homepage extends Component<Props, State> {
    state = {}

    render() {
        return (
            <div>
                <Header />
                <h1>Homepage</h1>
                <Footer />
            </div>
        )
    }
}

export default Homepage