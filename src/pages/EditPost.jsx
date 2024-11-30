import React, { useEffect, useState } from 'react';
import { Container, PostForm } from '../components';
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';

function EditPost() {
    const [post, setPost] = useState(null);
    const { id } = useParams(); // Changed from $id to id for clarity
    const navigate = useNavigate();
    const userData = useSelector((state) => state.auth.userData);

    useEffect(() => {
        const fetchPost = async () => {
            if (id) {
                try {
                    const post = await appwriteService.getPost(id);
                    if (post) {
                            setPost(post);
                        }
                    else {
                        navigate('/all-posts'); // Redirect if post not found
                    }
                } catch (error) {
                    console.error("Failed to fetch post:", error);
                    navigate('/all-posts'); // Redirect on error
                }
            } else {
                navigate('/all-posts');
            }
        };

        fetchPost();
    }, [id, navigate, userData]);

    return post ? (
        <div className='py-8'>
            <Container>
                <PostForm post={post} />
            </Container>
        </div>
    ) : null;
}

export default EditPost;
