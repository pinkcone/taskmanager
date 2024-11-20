import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from '../styles/Register.module.css';

const Register = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: ''
    });

    const [errors, setErrors] = useState([]);
    const navigate = useNavigate();

    const { username, email, password, password2 } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setErrors([]); // Clear previous errors
        if (password !== password2) {
            setErrors(['Passwords do not match']);
        } else {
            const newUser = {
                username,
                email,
                password
            };

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };

                const body = JSON.stringify(newUser);

                const res = await axios.post('/api/auth/register', body, config);
                console.log(res.data);
                navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
            } catch (err) {
                if (err.response && err.response.data && err.response.data.errors) {
                    setErrors(err.response.data.errors.map(error => error.msg));
                } else {
                    setErrors(['Server error']);
                }
            }
        }
    };

    useEffect(() => {

        var c = document.getElementById("c");
        var ctx = c.getContext("2d");

        c.height = window.innerHeight;
        c.width = window.innerWidth;

        var matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}";

        matrix = matrix.split("");

        var font_size = 8;
        var columns = c.width / font_size; 
        var drops = [];

        for (var x = 0; x < columns; x++)
            drops[x] = 1;

        function draw() {

            ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
            ctx.fillRect(0, 0, c.width, c.height);

            ctx.fillStyle = "#006600";//green text
            ctx.font = font_size + "px arial";

            for (var i = 0; i < drops.length; i++) {

                var text = matrix[Math.floor(Math.random() * matrix.length)];

                ctx.fillText(text, i * font_size, drops[i] * font_size);


                if (drops[i] * font_size > c.height && Math.random() > 0.975)
                    drops[i] = 0;

                drops[i]++;
            }
        }

        const intervalId = setInterval(draw, 35);
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className='matrix'>
            <canvas id="c"></canvas>
            <div className={styles.container}>
                <div className={styles.register}>
                    <h1>Rejestracja</h1>
                    <form onSubmit={onSubmit}>
                        <div className={styles['form-group']}>
                            <input
                                type="text"
                                placeholder="Nazwa użytkownika"
                                name="username"
                                value={username}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <input
                                type="password"
                                placeholder="Hasło"
                                name="password"
                                value={password}
                                onChange={onChange}
                                minLength="6"
                                required
                            />
                        </div>
                        <div className={styles['form-group']}>
                            <input
                                type="password"
                                placeholder="Powtórz hasło"
                                name="password2"
                                value={password2}
                                onChange={onChange}
                                minLength="6"
                                required
                            />
                        </div>
                        <input type="submit" className={styles['btn']} value="Zarejestruj się" />
                    </form>
                    {errors.length > 0 && (
                        <div className="alert alert-danger">
                            {errors.map((error, index) => (
                                <p key={index}>{error}</p>
                            ))}
                        </div>
                    )}
                    <div className={styles.mt3}>
                        Masz już konto? <Link to="/login" className={styles.link}>Zaloguj się tutaj!</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
