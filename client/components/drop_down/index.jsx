import PropTypes from 'prop-types'
import React from 'react'

export default class DropDown extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isActive: props.active || false
    }
  }
  render () {
    const { active, index, onClick, title } = this.props
    return (
      <div className='drop-down'>
        <div className='drop-down__title' onClick={() => onClick(index)} data-active={active}>
          <h1>{title || 'Missing Title'}</h1>
          <div className='icon' />
        </div>
        {active &&
          <div className='drop-down__item'>
            {this.props.children}
          </div>
        }
      </div>
    )
  }
}

DropDown.propTypes = {
  active: PropTypes.bool,
  index: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.any
}