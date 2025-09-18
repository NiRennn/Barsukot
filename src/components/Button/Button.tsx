import React from 'react'
import './Button.scss'

function Button({text, onClick }) {
  return (
    <>
    <button className='okak-btn' onClick={onClick}>{text}</button>
    </>
  )
}

export default Button 