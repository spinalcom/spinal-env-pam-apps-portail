fetch('/apps')
    .then(res => res.json())
    .then(apps => {
        const container = document.getElementById('appsList');
        apps.forEach(app => {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = app;
            checkbox.name = 'apps';
            container.appendChild(checkbox);
            container.appendChild(document.createTextNode(app));
            container.appendChild(document.createElement('br'));
        });
    });

document.getElementById('buildForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const checkboxes = document.querySelectorAll('input[name="apps"]:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);

    const res = await fetch('/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apps: selected })
    });

    if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'dist.zip';
        document.body.appendChild(a);
        a.click();
        a.remove();
    } else {
        alert('Erreur pendant le build');
    }
});
