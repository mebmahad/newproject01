import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, PostCard } from '../components';
import service from '../appwrite/config';

function Home() {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        service.getPosts().then((posts) => {
            if (posts) {
                setPosts(posts.documents);
            }
        });
    }, []);

    const handleNavigate = () => {
        navigate('/all-posts');
    };

    return (
        <div className='w-full py-8'>
            <Container>
                <div className="text-center mb-8">
                    <img
                        src="https://public-library.safetyculture.io/media/1123b6af-dcfb-4c73-b2c0-d31bf35928a5" // Replace with your actual image URL
                        alt="Maintenance Building"
                        style={{ width: '120px', height: 'auto' }} // Set fixed width and auto height for aspect ratio
                        className="mx-auto rounded-lg"
                    />
                    <h1 className="text-3xl font-bold mt-4">Welcome to Our Complaint Management App</h1>
                    <p className="mt-2 text-lg">
                        This app helps you manage and track complaints effectively.
                        You can view, create, edit, and delete complaints with ease.
                        Join us in improving our services by submitting your concerns.
                    </p>
                    <button
                        onClick={handleNavigate}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        View All Complaints
                    </button>
                </div>


            </Container>
        </div>
    );
}

export default Home;
