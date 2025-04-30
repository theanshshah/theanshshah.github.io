document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('contactForm');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaInput = document.getElementById('captcha');
    const submitBtn = document.getElementById('submitBtn');
    const thankYouMessage = document.getElementById('thankYouMessage');
    let correctAnswer;

    // Generate dynamic math captcha
    const generateCaptcha = () => {
        const num1 = Math.floor(Math.random() * 20) + 1;
        const num2 = Math.floor(Math.random() * 20) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];

        switch (operator) {
            case '+':
                correctAnswer = num1 + num2;
                break;
            case '-':
                correctAnswer = num1 - num2;
                break;
            case '*':
                correctAnswer = num1 * num2;
                break;
        }

        captchaQuestion.textContent = `${num1} ${operator} ${num2} = ?`;
        captchaInput.value = '';
    };

    // Initialize captcha
    generateCaptcha();

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const company = document.getElementById('company').value;
        const subject = document.getElementById('subject').value;
        const message = document.getElementById('message').value;
        const captchaValue = parseInt(captchaInput.value);

        // Validate form and captcha
        if (name && email && company && subject && message && captchaValue === correctAnswer) {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Sending...';
            submitBtn.style.background = 'linear-gradient(45deg, #48bb78 0%, #81e6d9 100%)';
            submitBtn.disabled = true;

            setTimeout(() => {
                thankYouMessage.style.display = 'flex';
                setTimeout(() => {
                    thankYouMessage.style.display = 'none';
                    form.reset();
                    submitBtn.innerHTML = 'Send Message <i class="fas fa-paper-plane"></i>';
                    submitBtn.style.background = 'linear-gradient(45deg, #ff6b6b 0%, #4facfe 100%)';
                    submitBtn.disabled = false;
                    generateCaptcha();
                }, 3000);
            }, 1000);
        } else {
            alert(captchaValue !== correctAnswer ?
                'Incorrect captcha answer. Please try again.' :
                'Please fill in all required fields.');
            if (captchaValue !== correctAnswer) {
                generateCaptcha();
            }
        }
    });

    // Social icons animation
    const socialIcons = document.querySelectorAll('.social-icons a');
    socialIcons.forEach((icon, index) => {
        setTimeout(() => {
            icon.style.transform = 'translateY(-20px) rotate(5deg)';
            setTimeout(() => {
                icon.style.transform = 'translateY(0)';
            }, 400);
        }, index * 200);
    });

    // Input field animations
    const inputs = document.querySelectorAll('.input-group input, .input-group textarea, .input-group select');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'scale(1.02)';
        });
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'scale(1)';
        });
    });
});