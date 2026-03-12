import React from 'react';
import './style.css';
import { initializeBlock } from '@airtable/blocks/interface/ui';

function App() {
    return (
        <div className="min-h-screen w-full bg-white dark:bg-gray-950 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    Walmart Connect Release Calendar
                </h1>
                <p className="mt-2 text-gray-500 dark:text-gray-400">
                    Hello, world!
                </p>
            </div>
        </div>
    );
}

initializeBlock({ interface: () => <App /> });
