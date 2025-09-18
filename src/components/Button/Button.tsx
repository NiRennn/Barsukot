import './Button.scss'


type ButtonProps = {
  text: string;
  onClick?: () => void;
};

export default function Button({text, onClick }: ButtonProps) {

  
  return (
    <>
    <button className='okak-btn' onClick={onClick}>{text}</button>
    </>
  )
}

