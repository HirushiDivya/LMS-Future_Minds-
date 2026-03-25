import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const AUpdateQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [quizData, setQuizData] = useState(null);
    const [editQuiz, setEditQuiz] = useState(null);
    const [editQuestion, setEditQuestion] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchFullQuiz = async () => {
        try {
            // ඔබේ API එකෙන් Quiz සහ Questions සියල්ල ලබා ගැනීම
            const res = await axios.get(`http://localhost:5000/api/admin/quiz/${id}`);
            setQuizData(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching quiz data", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFullQuiz();
    }, [id]);

    // Update Quiz Header (Title, Price, Expiry, Time)
    const handleUpdateQuiz = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/update-quiz/${id}`, editQuiz);
            alert("Quiz Updated!");
            setEditQuiz(null);
            fetchFullQuiz();
        } catch (err) {
            alert("Update failed");
        }
    };

    // Update Specific Question (Options + Explanations)
    const handleUpdateQuestion = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:5000/api/admin/update-question/${editQuestion.id}`, editQuestion);
            alert("Question Updated!");
            setEditQuestion(null);
            fetchFullQuiz();
        } catch (err) {
            alert("Update failed");
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await axios.delete(`http://localhost:5000/api/admin/delete-question/${questionId}`);
                alert("Question Deleted Successfully!");
                fetchFullQuiz();
            } catch (err) {
                alert("Failed to delete the question.");
            }
        }
    };

    if (loading) return <div className="students-container"><h2>Loading Data...</h2></div>;
    if (!quizData) return <div className="students-container"><h2>Quiz Not Found</h2></div>;

    return (
        <div className="students-container">
            <h2>Manage Quiz: {quizData.title}</h2>

            {/* Table 1: Quiz Main Details */}
            <div className="table-responsive" style={{ marginBottom: '40px' }}>
                <h3 style={{ color: 'var(--text-bold)', paddingBottom: '10px' }}>Quiz Header Info</h3>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Price</th>
                            <th>Expires At</th>
                            <th>Time (Min)</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td><strong>{quizData.title}</strong></td>
                            <td>Rs. {quizData.price}</td>
                            <td>{quizData.expires_at ? new Date(quizData.expires_at).toLocaleString() : 'N/A'}</td>
                            <td>{quizData.time_limit_minutes} min</td>
                            <td style={{ textAlign: 'center' }}>
                                <button 
                                    className="view-btn edit-btn"
                                    onClick={() => setEditQuiz(quizData)}
                                >
                                    UPDATE
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Table 2: Quiz Questions List */}
            <div className="table-responsive">
                <h3 style={{ color: "var(--text-bold)", paddingBottom: "10px" }}>Questions List</h3>
                <table className="students-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Question</th>
                            <th>Correct</th>
                            <th style={{ textAlign: 'center' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizData.questions && quizData.questions.map((q) => (
                            <tr key={q.id}>
                                <td>{q.id}</td>
                                <td style={{ maxWidth: "300px" }}>{q.question_text}</td>
                                <td style={{ textAlign: "center", color: "#16a34a", fontWeight: "bold" }}>
                                    {q.correct_option}
                                </td>
                                <td style={{ textAlign: "center" }}>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button className="view-btn edit-btn" onClick={() => setEditQuestion(q)}>
                                            EDIT
                                        </button>
                                        <button className="view-btn delete-btn" onClick={() => handleDeleteQuestion(q.id)}>
                                            DELETE
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* --- Quiz Edit Modal --- */}
            {editQuiz && (
                <div className="modal">
                    <div className="glass-effect" style={{ width: '500px' }}>
                        <h3>Update Quiz Info</h3>
                        <form onSubmit={handleUpdateQuiz}>
                            <label style={{ color: 'white', display: 'block', textAlign: 'left', marginBottom: '5px' }}>Title:</label>
                            <input className="search-input" style={{ width: '100%', marginBottom: '15px' }} type="text" value={editQuiz.title} onChange={(e) => setEditQuiz({ ...editQuiz, title: e.target.value })} />
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ color: 'white', display: 'block', textAlign: 'left' }}>Price (Rs):</label>
                                    <input className="search-input" style={{ width: '100%', marginBottom: '15px' }} type="number" value={editQuiz.price} onChange={(e) => setEditQuiz({ ...editQuiz, price: e.target.value })} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ color: 'white', display: 'block', textAlign: 'left' }}>Time (Min):</label>
                                    <input className="search-input" style={{ width: '100%', marginBottom: '15px' }} type="number" value={editQuiz.time_limit_minutes} onChange={(e) => setEditQuiz({ ...editQuiz, time_limit_minutes: e.target.value })} />
                                </div>
                            </div>

                            <label style={{ color: 'white', display: 'block', textAlign: 'left' }}>Expire Date & Time:</label>
                            <input className="search-input" style={{ width: '100%', marginBottom: '15px' }} type="datetime-local" value={editQuiz.expires_at ? editQuiz.expires_at.substring(0, 16) : ''} onChange={(e) => setEditQuiz({ ...editQuiz, expires_at: e.target.value })} />
                            
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="save-btn">SAVE CHANGES</button>
                                <button type="button" className="save-btn delete-btn" onClick={() => setEditQuiz(null)}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- Question Edit Modal --- */}
            {editQuestion && (
                <div className="modal">
                    <div className="glass-effect" style={{ width: '650px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h3>Update Question & Explanations</h3>
                        <form onSubmit={handleUpdateQuestion}>
                            <label style={{ color: 'white', display: 'block', textAlign: 'left' }}>Question Text:</label>
                            <textarea className="search-input" style={{ width: '100%', height: '60px', marginBottom: '15px' }} value={editQuestion.question_text} onChange={(e) => setEditQuestion({ ...editQuestion, question_text: e.target.value })} />
                            
                            {/* Options and Explanations Grid */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', textAlign: 'left' }}>
                                {['a', 'b', 'c', 'd'].map((opt) => (
                                    <div key={opt}>
                                        <label style={{ color: '#ffcc00', fontSize: '0.8rem' }}>Option {opt.toUpperCase()}:</label>
                                        <input className="search-input" style={{ width: '100%', marginBottom: '5px' }} value={editQuestion[`option_${opt}`]} onChange={(e) => setEditQuestion({ ...editQuestion, [`option_${opt}`]: e.target.value })} />
                                        <input className="search-input" placeholder={`Explanation for ${opt.toUpperCase()}`} style={{ width: '100%', fontSize: '0.8rem', opacity: 0.8 }} value={editQuestion[`explanation_${opt}`] || ''} onChange={(e) => setEditQuestion({ ...editQuestion, [`explanation_${opt}`]: e.target.value })} />
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginTop: '15px', textAlign: 'left' }}>
                                <label style={{ color: 'white' }}>Correct Answer:</label>
                                <select className="search-input" style={{ width: '100%', marginTop: '5px' }} value={editQuestion.correct_option} onChange={(e) => setEditQuestion({ ...editQuestion, correct_option: e.target.value })}>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" className="save-btn">UPDATE QUESTION</button>
                                <button type="button" className="save-btn delete-btn" onClick={() => setEditQuestion(null)}>CANCEL</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Floating Back Button */}
            <button className="view-btn" onClick={() => navigate(-1)} style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: '1000', padding: '12px 30px', borderRadius: '30px' }}>
                ← BACK TO LIST
            </button>
        </div>
    );
};

export default AUpdateQuiz;