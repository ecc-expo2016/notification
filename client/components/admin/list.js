'use strict';
import React, {Component, PropTypes} from 'react';

const CSRF_TOKEN = document.querySelector('[name="csrf-token"]').content;

const STANDING = 1;
const TAKEN = 2;

export default class List extends Component {
  static defaultProps = {
    sections: []
  };
  static propTypes = {
    sections: PropTypes.array.isRequired
  };
  state = {
    works: []
  };
  getSectionName = id => {
    const {sections} = this.props;
    const {name} = sections.find(section => section.id === id);
    return name;
  };
  handleClick = async (id) => {
    // optimistic updates
    const {works} = this.state;
    const index = works.findIndex(({_id}) => _id === id);
    works.splice(index, 1);
    this.setState({works});

    await fetch(`/admin/${id}`, {
      method: 'delete',
      headers: {
        'csrf-token': CSRF_TOKEN
      },
      credentials: 'same-origin'
    });

    await this.loadData();
  };
  loadData = async () => {
    const resp = await fetch('/admin/all', {credentials: 'same-origin'});
    const works = await resp.json();
    this.setState({works});
  };
  componentDidMount() {
    this.loadData();
  }
  render() {
    const {sections} = this.props;
    const {works} = this.state;

    return (
      <table className='table'>
        <thead>
          <tr>
            <th className='nowrap'>部門</th>
            <th className='nowrap'>作品名</th>
            <th className='nowrap'>説明文</th>
            <th className='nowrap'>名前</th>
            <th className='nowrap'>担当</th>
            <th className='nowrap'>メール</th>
            <th className='nowrap'>状態</th>
            <th className='nowrap'>削除</th>
          </tr>
        </thead>

        <tbody>
          {works.map(work => {
            const {creators} = work;

            return creators.map((creator, i) =>
              <tr key={creator._id}>
                {i === 0 && [
                  <td
                    key={`${creator._id}-section`}
                    className='nowrap'
                    rowSpan={creators.length}>
                    {this.getSectionName(work.section)}
                  </td>,
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
                <td className='nowrap'>{creator.email}</td>
                <td className='nowrap'>
                  <a href={`/user/${work._id}/${creator._id}`}>
                    {(() => {
                      switch (creator.status) {
                        case STANDING:
                          return '待機中';
                        case TAKEN:
                          return '取込中';
                      }
                    })()}
                  </a>
                </td>
                {i === 0 && [
                  <td
                    key={`${creator._id}-delete`}
                    className='nowrap'
                    rowSpan={creators.length}>
                    <button
                      className='button is-danger'
                      type='button'
                      onClick={this.handleClick.bind(this, work._id)}>
                      <span className='fa fa-times' />
                    </button>
                  </td>
                ]}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
}
