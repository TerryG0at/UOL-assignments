// FAQ click trigger function
document.querySelectorAll('.faq-item .arrow').forEach(arrow => {
    arrow.addEventListener('click', event => {
        const faqItem = event.target.closest('.faq-item');
        const answer = faqItem.querySelector('.answer');
        answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
        event.target.textContent = event.target.textContent === '▼' ? '▲' : '▼';
    });
});

// Stat counter to display as animation
function animateCounters() {
    const counters = document.querySelectorAll('.counter');
    counters.forEach(counter => {
        const updateCount = () => {
            // the number to be showed as final
            const target = +counter.getAttribute('data-target'); 
            const count = +counter.innerText; 
            const increment = target / 500;

            // to keep increaseing and conditional statement to stop when reach target
            if (count < target) {
                counter.innerText = Math.ceil(count + increment);
                setTimeout(updateCount, 50);
            } else {
                counter.innerText = target;
            }
        };
        updateCount();
    });
}

// to activate when user is in stats section
function handleCounterScroll() {
    const statSection = document.querySelector('.stats');
    const sectionTop = statSection.getBoundingClientRect().top;
    const windowHeight = window.innerHeight;

    if (sectionTop < windowHeight - 100) {
        animateCounters();
        window.removeEventListener('scroll', handleCounterScroll);
    }
}

window.addEventListener('scroll', handleCounterScroll);
