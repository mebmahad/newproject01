import React from 'react';

function Logo({ width = '30px' }) {
    return (
        <div>
            <img
                src="https://public-library.safetyculture.io/media/1123b6af-dcfb-4c73-b2c0-d31bf35928a5" // Replace with your actual image URL
                alt="Maintenance Building"
                style={{ width, height: 'auto' }} // Set width and keep height auto for aspect ratio
                className="rounded-lg"
            />
        </div>
    );
}

export default Logo;
