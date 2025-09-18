import './AgainButton.scss'


type ButtonProps = {
  text: string;
  onClick?: () => void;
};

export default function AgainButton({text, onClick }: ButtonProps) {

  
  return (
    <>
    <button className='again-btn' onClick={onClick}>{text}</button>
    </>
  )
}

