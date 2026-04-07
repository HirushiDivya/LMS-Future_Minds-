
/*import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../API";
// View Course Content
export default function ViewContent() {
    const { id } = useParams();
    const [content, setContent] = useState(null);

    useEffect(() => {
        API.get(`/content/course/${id}`)
            .then(res => setContent(res.data)) 
            .catch(err => console.error(err));
    }, [id]);
 
    if (!content) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px", color: "white", background: "#111", minHeight: "100vh" }}>
            <h2>{content.title}</h2>
            <hr />
            {content.content_type.toUpperCase() === "VIDEO" ? (
                <video width="100%" height="500px" controls>
                    <source src={content.external_link} type="video/mp4" />
                </video>
            ) : content.content_type.toUpperCase() === "PDF" ? (
                <iframe src={content.external_link} width="100%" height="800px" title="PDF"></iframe>
            ) : (
                <a href={content.external_link} target="_blank" rel="noreferrer">Open Link</a>
            )}
        </div>
    );
}
    */


