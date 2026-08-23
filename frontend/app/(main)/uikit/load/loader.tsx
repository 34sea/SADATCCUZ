import React from 'react';
import './loader.css'
type Props = {
    size?: number;
    text?: string | null;
    variant?: 'ring' | 'bars' | 'shimmer';
};
const Loader: React.FC<Props> = () => {
    return (
        <div className="containerLoader">
            <div className="loader"></div>
        </div>
    )
};


export default Loader;