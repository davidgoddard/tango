function switchTheme(theme: string) {
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(theme);

    // Save the user's theme preference in localStorage
    localStorage.setItem('theme', theme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        switchTheme(savedTheme);
    } else {
        // Detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            switchTheme('dark-theme');
        } else {
            switchTheme('light-theme');
        }
    }
}

document.getElementById('light-theme-btn')!.addEventListener('click', () => switchTheme('light-theme'));
document.getElementById('dark-theme-btn')!.addEventListener('click', () => switchTheme('dark-theme'));

window.addEventListener('load', loadTheme);