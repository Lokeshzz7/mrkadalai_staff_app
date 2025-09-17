import React from 'react'

const Card = ({ children, className = '', title, Black = false, ...props }) => {
    const border = Black ? 'border-black' : 'border-gray-300'
    
    return (
        <div 
            className={`bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-6 border ${border} ${className}`} 
            {...props}
        >
            {title && (
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {title}
                    </h3>
                </div>
            )}
            <div>
                {children}
            </div>
        </div>
    )
}

export default Card