'use strict';
import React, {Component} from 'react';
import socketIO from 'socket.io-client';
import throttle from 'lodash.throttle';

const {workId, creatorId} = window.App;

const socket = socketIO();

const STANDING = 1;
const TAKEN = 2;

export default class App extends Component {
  state = {
    work: {},
    creator: {}
  };
  handleConnect = works => {
    const work = works.find(({_id}) => _id === workId);
    const creator = work.creators.find(({_id}) => _id === creatorId);
    this.setState({work, creator});
  };
  handleClick = throttle(status => {
    // optimistic updates
    const {creator} = this.state;
    creator.status = status;
    this.setState({creator});

    socket.emit('change', workId, creatorId, status);
  }, 1000);
  componentDidMount() {
    socket.on('init', this.handleConnect);
    socket.on('update', this.handleConnect);
  }
  render() {
    const {work, creator} = this.state;

    return (
      <section className='section'>
        <div className='container'>
          <h1 className='title'>{creator.name} さん</h1>
          <h2 className='subtitle'>{work.name}</h2>
          <hr />

          <p className='subtitle'>
            現在
            {' '}
            {(() => {
              switch (creator.status) {
                case STANDING:
                  return <span className='is-green'>待機中</span>;
                case TAKEN:
                  return <span className='is-red'>取込中</span>;
              }
            })()}
            {' '}
            です。
          </p>

          {(() => {
            switch (creator.status) {
              case STANDING:
                return (
                  <p>
                    <button className='button is-success is-large is-disabled'>
                      待機中
                    </button>
                    {' '}
                    <button
                      className='button is-danger is-large'
                      onClick={this.handleClick.bind(this, TAKEN)}>
                      取込中
                    </button>
                  </p>
                );
              case TAKEN:
                return (
                  <p>
                    <button
                      className='button is-success is-large'
                      onClick={this.handleClick.bind(this, STANDING)}>
                      待機中
                    </button>
                    {' '}
                    <button className='button is-danger is-large is-disabled'>
                      取込中
                    </button>
                  </p>
                );
            }
          })()}
        </div>
      </section>
    );
  }
}
