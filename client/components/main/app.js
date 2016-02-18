'use strict';
import React, {Component} from 'react';
import socketIO from 'socket.io-client';
import flatten from 'lodash.flatten';
import throttle from 'lodash.throttle';
import data from '../../data';

const socket = socketIO();

const STANDING = 1;
const TAKEN = 2;

export default class App extends Component {
  state = {
    sections: data,
    works: []
  };
  handleClick = throttle((workId, creatorId) => {
    socket.emit('notify', workId, creatorId);
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
    const {sections, works} = this.state;

    return (
      <section className='section'>
        <table className='container table'>
          <thead>
            <tr>
              <td>部門</td>
              <td colSpan='2'>作品</td>
              <td colSpan='3'>制作者</td>
            </tr>
          </thead>

          <tbody>
            {flatten(sections.map(section => {
              const sectionData = works.filter((work) =>
                work.section === section.id
              );

              const creatorTotal = sectionData.reduce((total, {creators}) => {
                return total + creators.length;
              }, 0);

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
                          rowSpan={creatorTotal}>
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
                      <td className='nowrap'>
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
      </section>
    );
  }
}
