'use strict';
import React, {Component, PropTypes} from 'react';

const wait = (delay = 0) => new Promise(done => setTimeout(done, delay));

const CSRF_TOKEN = document.querySelector('[name="csrf-token"]').content;

export default class New extends Component {
  static defaultProps = {
    sections: []
  };
  static propTypes = {
    sections: PropTypes.array.isRequired
  };
  state = {
    status: null,
    sectionValue: this.props.sections[0].id,
    creators: [
      {
        nameValue: null,
        roleValue: null,
        emailValue: null
      }
    ]
  };
  handleChange = (target, evt) => {
    this.setState({[`${target}Value`]: evt.target.value});
  };
  handleChangeCreator = (target, index, evt) => {
    const {creators} = this.state;
    creators[index][`${target}Value`] = evt.target.value;
    this.setState({creators});
  };
  handleAddCreator = () => {
    const {creators} = this.state;
    creators.push({
      nameValue: null,
      roleValue: null,
      emailValue: null
    });
    this.setState({creators});
  };
  handleDeleteCreator = index => {
    const {creators} = this.state;
    creators.splice(index, 1);
    this.setState({creators});
  };
  handleSubmit = async (evt) => {
    evt.preventDefault();
    const {sectionValue, nameValue, descriptionValue, creators} = this.state;

    const data = {
      name: nameValue,
      description: descriptionValue,
      section: sectionValue,
      creators: creators.map(({nameValue, roleValue, emailValue}) => ({
        name: nameValue,
        role: roleValue,
        email: emailValue
      }))
    };

    this.setState({status: 'sending'});

    await fetch('/admin/new', {
      method: 'post',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'csrf-token': CSRF_TOKEN
      },
      credentials: 'same-origin',
      body: JSON.stringify(data)
    });

    // cancelablePromise

    this.setState({
      status: 'completed',
      sectionValue: this.props.sections[0].id,
      nameValue: null,
      descriptionValue: null,
      creators: [
        {
          nameValue: null,
          roleValue: null,
          emailValue: null
        }
      ]
    });

    await wait(3000);
    this.setState({status: null});
  };
  render() {
    const {sections} = this.props;
    const {status, sectionValue, nameValue, descriptionValue,
      creators} = this.state;
    const isSending = status === 'sending';
    const isCompleted = status === 'completed';

    return (
      <form
        className='columns'
        onSubmit={this.handleSubmit}>
        <div className='column is-half'>
          <h2 className='subtitle'>作品情報</h2>

          <div className='separate'>
            <p className='control'>
              <span className='select'>
                <select
                  value={sectionValue}
                  onChange={this.handleChange.bind(this, 'section')}>
                  {sections.map(({id, name}) =>
                    <option
                      key={id}
                      value={id}>{name}</option>
                  )}
                </select>
              </span>
            </p>

            <p className='control'>
              <input
                className='input'
                type='text'
                value={nameValue}
                placeholder='作品名'
                required
                onChange={this.handleChange.bind(this, 'name')} />
            </p>

            <p className='control'>
              <input
                className='input'
                type='text'
                value={descriptionValue}
                placeholder='作品の説明'
                required
                onChange={this.handleChange.bind(this, 'description')} />
            </p>
          </div>
        </div>

        <div className='column is-half'>
          <h2 className='subtitle'>制作者情報</h2>

          <div className='separate'>
            {creators.map(({nameValue, roleValue, emailValue}, i) =>
              <div key={i}>
                <p className='control'>
                  <input
                    className='input'
                    type='text'
                    value={nameValue}
                    required
                    onChange={this.handleChangeCreator.bind(this, 'name', i)}
                    placeholder='名前' />
                </p>

                <p className='control'>
                  <input
                    className='input'
                    type='text'
                    value={roleValue}
                    required
                    onChange={this.handleChangeCreator.bind(this, 'role', i)}
                    placeholder='担当' />
                </p>

                <p className='control'>
                  <input
                    className='input'
                    type='email'
                    value={emailValue}
                    required
                    onChange={this.handleChangeCreator.bind(this, 'email', i)}
                    placeholder='メールアドレス' />
                </p>

                {creators.length > 1 && (
                  <p className='is-right'>
                    <button
                      className='button is-danger'
                      type='button'
                      onClick={this.handleDeleteCreator.bind(this, i)}>
                      <span className='fa fa-times' />
                      Delete
                    </button>
                  </p>
                )}

                <hr />
              </div>
            )}

            <p className='is-right'>
              <button
                className='button is-info'
                type='button'
                disabled={isSending}
                onClick={this.handleAddCreator}>
                <span className='fa fa-plus' />
                Add
              </button>
            </p>
          </div>

          <p className='is-right'>
            <button
              className='button is-info'
              type='submit'>
              <span className='fa fa-plus' />
              作品情報を追加する
            </button>
          </p>

          {isSending && (
            <div className='notification is-info mt15'>
              送信中
            </div>
          )}

          {isCompleted && (
            <div className='notification is-success mt15'>
              追加しました
            </div>
          )}
        </div>
      </form>
    );
  }
}
