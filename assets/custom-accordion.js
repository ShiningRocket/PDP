document.querySelectorAll('.custom_faq-header').forEach((header) => {
    header.addEventListener('click', () => {
        header.classList.toggle('active');

        const content = header.nextElementSibling;
        const symbol = header.querySelector('.symbol-icon');

        if (content.style.display === 'block') {
            content.style.display = 'none';
            symbol.textContent = "+";
        } else {
            content.style.display = 'block';
            symbol.textContent = "-";
        }
    });
});
