'use strict';
import React, {Component} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import socketIO from 'socket.io-client';
import flatten from 'lodash.flatten';
import throttle from 'lodash.throttle';
import data from '../../data';

const socket = socketIO();

const STANDING = 1;
const TAKEN = 2;

const wait = delay => new Promise(done => setTimeout(done, delay));

export default class App extends Component {
  state = {
    sections: data,
    works: [],
    notifications: []
  };
  handleClick = throttle(async (workId, creatorId) => {
    socket.emit('notify', workId, creatorId);

    // show notification
    let {notifications} = this.state;
    const id = Math.random().toString(28);
    notifications.push({id, workId, creatorId});
    this.setState({notifications});
    await wait(3000);

    // delete shown notification
    notifications = this.state.notifications;
    const index = notifications.findIndex(item => item.id === id);
    notifications.splice(index, 1);
    this.setState({notifications});
  }, 1000);
  getSectionName = id => {
    const {sections} = this.state;
    const {name} = sections.find(section => section.id === id);
    return name;
  };
  componentDidMount() {
    socket.on('init', works => {
      this.setState({works});
    });

    socket.on('update', works => {
      this.setState({works});
    });
  }
  render() {
    const {sections, works, notifications} = this.state;

    return (
      <section className='section'>
        <div className='notification-container'>
          <ReactCSSTransitionGroup
            component='div'
            transitionName='fade'
            transitionEnterTimeout={300}
            transitionLeaveTimeout={300}>
            {notifications.slice().reverse().map(({id, workId, creatorId}) => {
              const {name, creators} = works.find(({_id}) => _id === workId);
              const creator = creators.find(({_id}) => _id === creatorId);

              return (
                <div
                  key={id}
                  className='notification is-success'>
                  {creator.name}さん（{name}）に通知しました。
                </div>
              );
            })}
          </ReactCSSTransitionGroup>
        </div>

        <div className='container is-fluid'>
          <table className='table'>
            <thead>
              <tr>
                <td>部門</td>
                <td colSpan='2'>作品</td>
                <td colSpan='3'>制作者</td>
              </tr>
            </thead>

            <tbody>
              {flatten(sections.map(section => {
                const sectionData = works.filter(
                  work => work.section === section.id
                );

                const creatorLength = sectionData.reduce(
                  (total, {creators}) => total + creators.length, 0
                );

                return sectionData.map((work, workIndex) => {
                  const {creators} = work;
                  const isSectionFirst = workIndex === 0;

                  return creators.map((creator, creatorIndex) => {
                    const isCreatorFirst = creatorIndex === 0;

                    return (
                      <tr key={creator._id}>
                        {isSectionFirst && isCreatorFirst && (
                          <td
                            className='nowrap'
                            rowSpan={creatorLength}>
                            {this.getSectionName(section.id)}
                          </td>
                        )}
                        {isCreatorFirst && [
                          <td
                            key={`${creator._id}-name`}
                            className='nowrap'
                            rowSpan={creators.length}>
                            {work.name}
                          </td>,
                          <td
                            key={`${creator._id}-description`}
                            rowSpan={creators.length}>
                            {work.description}
                          </td>
                        ]}
                        <td className='nowrap'>{creator.name}</td>
                        <td className='nowrap'>{creator.role}</td>
                        <td className='nowrap is-text-centered'>
                          {(() => {
                            switch (creator.status) {
                              case STANDING:
                                return (
                                  <button
                                    className='button is-success'
                                    type='button'
                                    onClick={
                                      this.handleClick.bind(
                                        this, work._id, creator._id
                                      )
                                    }>
                                    通知する
                                  </button>
                                );
                              case TAKEN:
                                return (
                                  <button
                                    className='button is-danger is-disabled'
                                    type='button'>取込中</button>
                                );
                            }
                          })()}
                        </td>
                      </tr>
                    );
                  });
                });
              }))}
            </tbody>
          </table>
        </div>
      </section>
    );
  }
}
