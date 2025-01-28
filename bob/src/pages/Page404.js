import React from 'react';
import DinoGame from '../components/DinoGame/DinoGame';

const Page404 = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-6">
                Y a rien à voir ici.
            </p>
            <p className="text-md text-gray-500">
                What ?? Un golmon ! appuyez sur espace <span className="font-mono font-semibold"></span>
            </p>
            <DinoGame />
        </div>
    );
};

export default Page404;
