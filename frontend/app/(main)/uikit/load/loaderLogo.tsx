import React from 'react';
import './loader.css'
import logotipo from '../../../public/assets/ucm_logo.svg'
type Props = {
    size?: number;
    text?: string | null;
    variant?: 'ring' | 'bars' | 'shimmer';
};
const LoaderLogo: React.FC<Props> = () => {
    return (
      <div className="containerLoaderLogo">
      <div className="spinnerBase"></div>
      <div className="spinnerSweep"></div>
      <img src={logotipo} alt="logo" className="logoLoader" />
    </div>
  );
};


export default LoaderLogo;